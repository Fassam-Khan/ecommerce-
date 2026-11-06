import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import Order from '@/models/Order'
import Counter from '@/models/Counter'

const SHIPPING = 350
const FIRST_ORDER_NUMBER = 1001
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

class OrderError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

// Atomically gets the next order number: 1001, 1002, 1003, ...
async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'order' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  return FIRST_ORDER_NUMBER - 1 + counter.seq
}

// Puts stock back for lines that were already decremented.
async function restoreStock(reserved) {
  await Promise.all(
    reserved.map((line) =>
      Product.updateOne({ _id: line.product }, { $inc: { stock: line.quantity } })
    )
  )
}

export async function POST(req) {
  const reserved = [] // lines whose stock we've already reduced

  try {
    await connectDB()
    const body = await req.json()

    // ---- 1. Validate customer fields ----
    const str = (v) => (typeof v === 'string' ? v.trim() : '')
    const customer = {
      email: str(body.email).toLowerCase(),
      country: str(body.country) || 'pakistan',
      firstName: str(body.firstName),
      lastName: str(body.lastName),
      address: str(body.address),
      apartment: str(body.apartment),
      city: str(body.city),
      postalCode: str(body.postalCode),
      phone: str(body.phone),
      payment: str(body.payment),
    }

    if (!EMAIL_REGEX.test(customer.email)) throw new OrderError('Please enter a valid email')
    for (const [field, label] of [
      ['firstName', 'first name'],
      ['lastName', 'last name'],
      ['address', 'address'],
      ['city', 'city'],
      ['phone', 'phone number'],
      ['payment', 'payment method'],
    ]) {
      if (!customer[field]) throw new OrderError(`Please enter your ${label}`)
    }

    // ---- 2. Validate cart lines (merge duplicates) ----
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new OrderError('Your cart is empty')
    }

    const wanted = new Map() // productId -> quantity
    for (const item of body.items) {
      const id = String(item?._id)
      const qty = Number(item?.quantity)
      if (!mongoose.isValidObjectId(id)) throw new OrderError('Invalid product in cart')
      if (!Number.isInteger(qty) || qty < 1) throw new OrderError('Invalid quantity in cart')
      wanted.set(id, (wanted.get(id) || 0) + qty)
    }

    // ---- 3. Load real products so price comes from the DB, not the browser ----
    const products = await Product.find({ _id: { $in: [...wanted.keys()] } })
    if (products.length !== wanted.size) {
      throw new OrderError('Some products in your cart are no longer available', 404)
    }

    const lines = products.map((p) => ({
      product: p._id,
      title: p.title,
      price: p.price,
      image: p.image?.file || '',
      quantity: wanted.get(String(p._id)),
    }))

    // ---- 4. Reduce stock atomically, one product at a time ----
    // The filter `stock: { $gte: quantity }` means two shoppers can never
    // buy the last item at the same time, and stock can never go negative.
    for (const line of lines) {
      const updated = await Product.findOneAndUpdate(
        { _id: line.product, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } },
        { new: true }
      )
      if (!updated) {
        throw new OrderError(
          `Sorry, "${line.title}" doesn't have ${line.quantity} left in stock. Please lower the quantity.`,
          409
        )
      }
      reserved.push(line)
    }

    // ---- 5. Create the order ----
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
    const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0)
    const orderNumber = await getNextOrderNumber()

    const order = await Order.create({
      orderNumber,
      ...customer,
      items: lines,
      totalItems,
      subtotal,
      shippingCharges: SHIPPING,
      total: subtotal + SHIPPING,
    })

    return NextResponse.json(
      {
        message: 'Order created',
        order: { orderNumber: order.orderNumber, total: order.total, totalItems: order.totalItems },
      },
      { status: 201 }
    )
  } catch (error) {
    // If anything failed after stock was reduced, put it back.
    if (reserved.length) {
      try {
        await restoreStock(reserved)
      } catch (rollbackError) {
        console.error('Stock rollback failed:', rollbackError)
      }
    }

    if (error instanceof OrderError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    console.error('Order error:', error)
    return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}




const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
 
// GET /api/admin/orders?q=&status=&page=1&limit=20
export async function GET(req) {
 
 
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
 
    const q = (searchParams.get('q') || '').trim()
    const status = searchParams.get('status') || ''
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')) || 20))
 
    const filter = {}
    if (STATUSES.includes(status)) filter.status = status
 
    if (q) {
      const cleaned = q.replace('#', '')
      if (/^\d+$/.test(cleaned)) {
        filter.orderNumber = Number(cleaned)
      } else {
        const rx = new RegExp(escapeRegex(q), 'i')
        filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { phone: rx }, { city: rx }]
      }
    }
 
    const [orders, total, grouped] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter),
      // Stats ignore search/filter so the cards always show the whole store
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
    ])
 
    const stats = { all: 0, revenue: 0 }
    STATUSES.forEach((s) => (stats[s] = 0))
    for (const g of grouped) {
      stats[g._id] = g.count
      stats.all += g.count
      if (g._id !== 'cancelled') stats.revenue += g.revenue
    }
 
    return NextResponse.json({
      orders,
      stats,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
    })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ message: 'Could not load orders' }, { status: 500 })
  }
}