import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

// PATCH /api/admin/orders/:id   body: { status }
export async function PATCH(req, { params }) {


  try {
    await connectDB()
    const { id } = await params // works whether params is a Promise (Next 15) or not

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid order id' }, { status: 400 })
    }

    const { status } = await req.json()
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
    }

    const order = await Order.findById(id)
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })

    if (order.status === status) {
      return NextResponse.json({ order })
    }
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { message: 'A cancelled order cannot be reopened. Ask the customer to place a new order.' },
        { status: 409 }
      )
    }

    // Atomic guard: only flip to cancelled once, so stock is restored once.
    const updated = await Order.findOneAndUpdate(
      { _id: id, status: order.status },
      { $set: { status } },
      { new: true }
    )
    if (!updated) {
      return NextResponse.json({ message: 'Order was changed by someone else. Refresh and try again.' }, { status: 409 })
    }

    if (status === 'cancelled') {
      await Promise.all(
        updated.items.map((line) =>
          Product.updateOne({ _id: line.product }, { $inc: { stock: line.quantity } })
        )
      )
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ message: 'Could not update order' }, { status: 500 })
  }
}