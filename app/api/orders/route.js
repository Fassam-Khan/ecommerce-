import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product"; // needs: title, slug, image, price, stock
import { DISCOUNTS, PAYMENT_METHODS, SHIPPING_METHODS } from "@/lib/Checkoutconfig";
import Counter from "@/models/Counter";

/* ---------- helpers ---------- */
class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}


async function makeOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orderNumber" },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return counter.sequence;
}

const str = (v) => (typeof v === "string" ? v.trim() : "");



function validateBody(body) {
  const customer = {
    email: str(body?.customer?.email).toLowerCase(),
    firstName: str(body?.customer?.firstName),
    lastName: str(body?.customer?.lastName),
    phone: str(body?.customer?.phone),
    newsletter: !!body?.customer?.newsletter,
  };
  const shippingAddress = {
    country: str(body?.shippingAddress?.country),
    address: str(body?.shippingAddress?.address),
    apartment: str(body?.shippingAddress?.apartment),
    city: str(body?.shippingAddress?.city),
    postalCode: str(body?.shippingAddress?.postalCode),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) throw new OrderError("Enter a valid email");
  if (!customer.firstName) throw new OrderError("Enter a first name");
  if (!customer.lastName) throw new OrderError("Enter a last name");
  if (shippingAddress.address.length < 5) throw new OrderError("Enter a complete address");
  if (!shippingAddress.city) throw new OrderError("Enter a city");
  if (!/^\+?\d{10,14}$/.test(customer.phone.replace(/[\s()-]/g, ""))) throw new OrderError("Enter a valid phone number");

  const shippingMethod = SHIPPING_METHODS[body?.shippingMethod];
  if (!shippingMethod) throw new OrderError("Select a shipping method");

  const paymentMethod = body?.paymentMethod;
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new OrderError("Select a payment method");

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (rawItems.length === 0) throw new OrderError("Your cart is empty");
  if (rawItems.length > 50) throw new OrderError("Too many items in one order");

  // merge duplicates, sanitise quantities
  const qtyById = new Map();
  for (const it of rawItems) {
    if (!mongoose.isValidObjectId(it?._id)) throw new OrderError("Invalid item in cart");
    const q = Math.floor(Number(it.quantity));
    if (!Number.isFinite(q) || q < 1 || q > 99) throw new OrderError("Invalid item quantity");
    qtyById.set(String(it._id), (qtyById.get(String(it._id)) || 0) + q);
  }

  return {
    customer,
    shippingAddress,
    shippingMethodId: body.shippingMethod,
    shippingMethod,
    paymentMethod,
    discountCode: str(body?.discountCode).toUpperCase() || null,
    qtyById,
  };
}

/* ---------- POST /api/orders ---------- */
export async function POST(req) {
  const reserved = []; // stock we've already taken, for rollback

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      throw new OrderError("Invalid request");
    }

    const v = validateBody(body);
    await connectDB();

    // 1) Load real products + prices from the database (never trust the browser)
    const ids = [...v.qtyById.keys()];
    const products = await Product.find({ _id: { $in: ids } }).lean();
    if (products.length !== ids.length) {
      throw new OrderError("Some items in your cart are no longer available. Please review your cart.", 409);
    }

    const lines = products.map((p) => ({
      product: p._id,
      title: p.title,
      slug: p.slug,
      image: p.image,
      price: p.price,
      stock: p.stock,
      quantity: v.qtyById.get(String(p._id)),
    }));

    // 2) Check stock
    for (const l of lines) {
      if (typeof l.stock === "number" && l.quantity > l.stock) {
        throw new OrderError(
          l.stock === 0 ? `${l.title} is out of stock.` : `Only ${l.stock} of ${l.title} left in stock.`,
          409
        );
      }
    }

    // 3) Recalculate totals on the server
    const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
    let discount = 0;
    if (v.discountCode) {
      const rate = DISCOUNTS[v.discountCode];
      if (!rate) throw new OrderError("Enter a valid discount code");
      discount = Math.round(subtotal * rate);
    }
    const shipping = v.shippingMethod.price;
    const total = subtotal - discount + shipping;

    // 4) Reserve stock atomically (the stock >= qty filter prevents overselling)
    for (const l of lines) {
      if (typeof l.stock !== "number") continue; // stock not tracked for this product
      const r = await Product.updateOne(
        { _id: l.product, stock: { $gte: l.quantity } },
        { $inc: { stock: -l.quantity } }
      );
      if (r.modifiedCount === 0) {
        throw new OrderError(`${l.title} just sold out. Please update your cart.`, 409);
      }
      reserved.push(l);
    }

    const orderNumber = await makeOrderNumber();

    // 5) Save the order
    const order = await Order.create({
      orderNumber,
      customer: v.customer,
      shippingAddress: v.shippingAddress,
      items: lines.map(({ stock, ...rest }) => rest), // drop stock from the snapshot
      shippingMethod: v.shippingMethodId,
      paymentMethod: v.paymentMethod,
      paymentStatus: "unpaid",
      status: "pending",
      discountCode: v.discountCode,
      subtotal,
      discount,
      shipping,
      total,
    });

    return NextResponse.json({ orderId: order.orderNumber, total }, { status: 201 });
  } catch (err) {
    // put reserved stock back if anything failed after reserving
    await Promise.all(
      reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.quantity } }).catch(() => {}))
    );

    if (err instanceof OrderError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("POST /api/orders failed:", err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}