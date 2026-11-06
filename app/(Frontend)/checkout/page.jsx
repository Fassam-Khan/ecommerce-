"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import CheckBox1 from '@/components/CheckBox1'
import InputFields from '@/components/checkout/InputFields'
import Radio from '@/components/checkout/Radio'
import { selectCartCount, selectCartItems, selectCartTotal, clearCart } from '@/app/redux/cartSlice'

const SHIPPING = 350
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialForm = {
  email: "",
  country: "pakistan",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  postalCode: "",
  phone: "",
  payment: "",
}

const rs = (n) => `Rs ${Number(n).toLocaleString('en-PK')}`

// ---------- Order summary (shared by mobile + desktop) ----------
const OrderSummary = ({ items, count, total }) => (
  <div className="flex flex-col gap-4">
    {items.map((item) => (
      <div key={item._id} className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 rounded-lg border border-gray-300 bg-white">
          <Image
            src={item.image?.file || "/imageholder.png"}
            alt={item.title}
            fill
            sizes="64px"
            className="rounded-lg object-cover"
          />
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-700 px-1 text-xs text-white">
            {item.quantity}
          </span>
        </div>
        <p className="flex-1 text-sm font-medium text-gray-900">{item.title}</p>
        <p className="text-sm text-gray-900">{rs(item.price * item.quantity)}</p>
      </div>
    ))}

    <div className="mt-2 flex flex-col gap-2 text-sm text-gray-700">
      <div className="flex justify-between">
        <span>Subtotal · {count} {count === 1 ? 'item' : 'items'}</span>
        <span className="text-gray-900">{rs(total)}</span>
      </div>
      <div className="flex justify-between">
        <span>Shipping</span>
        <span className="text-gray-900">{rs(SHIPPING)}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between text-gray-900">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-semibold">
          <span className="mr-2 text-xs font-normal text-gray-500">PKR</span>
          {rs(total + SHIPPING)}
        </span>
      </div>
    </div>
  </div>
)

const Checkout = () => {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const cartCount = useSelector(selectCartCount)
  const cartTotal = useSelector(selectCartTotal)

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  const changeHandler = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!items.length) return "Your cart is empty"
    if (!form.email.trim()) return "Please enter your email"
    if (!EMAIL_REGEX.test(form.email)) return "Please enter a valid email"
    if (!form.firstName.trim()) return "Please enter your first name"
    if (!form.lastName.trim()) return "Please enter your last name"
    if (!form.address.trim()) return "Please enter your address"
    if (!form.city.trim()) return "Please enter your city"
    if (!form.phone.trim()) return "Please enter your phone number"
    if (!form.payment.trim()) return "Please select a payment method"
    return null
  }

  const submitHandler = async () => {
    if (loading) return
    const problem = validate()
    if (problem) return toast.warning(problem)

    setLoading(true)
    try {
      // Only send product ids + quantities. The server looks up the real
      // prices and stock, so the client can't tamper with the total.
      const payload = {
        ...form,
        items: items.map((i) => ({ _id: i._id, quantity: i.quantity })),
      }
      const { data } = await axios.post("/api/orders", payload)

      setPlacedOrder(data.order)
      setForm(initialForm)
      dispatch(clearCart())
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place your order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ---------- Confirmation ----------
  if (placedOrder) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Thank you, your order is placed</h1>
        <p className="text-gray-600">
          Order <span className="font-semibold text-gray-900">#{placedOrder.orderNumber}</span> is confirmed.
          We&apos;ll contact you on the phone number you gave to arrange delivery.
        </p>
        <p className="text-sm text-gray-600">Total to pay: {rs(placedOrder.total)}</p>
        <Link href="/" className="mt-4 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Continue shopping
        </Link>
        <ToastContainer />
      </div>
    )
  }

  // ---------- Empty cart ----------
  if (!items.length) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-600">Add something to your cart before checking out.</p>
        <Link href="/" className="mt-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Browse products
        </Link>
        <ToastContainer />
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ===== Mobile order summary toggle (hidden on desktop) ===== */}
      <div className="border-b border-gray-300 bg-[#F5F5F5] lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between px-4 py-4 text-sm text-blue-600"
        >
          <span>{summaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
          <span className="text-base font-semibold text-gray-900">{rs(cartTotal + SHIPPING)}</span>
        </button>
        {summaryOpen && (
          <div className="px-4 pb-6">
            <OrderSummary items={items} count={cartCount} total={cartTotal} />
          </div>
        )}
      </div>

      {/* ===== Left: form ===== */}
      <div className="px-4 py-6 sm:px-8 lg:flex lg:justify-end lg:px-12 lg:py-12">
        <div className="w-full max-w-[560px]">
          {/* Contact */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contact</h2>
              <Link href="/" className="text-sm text-blue-600 underline">Sign in</Link>
            </div>
            <InputFields placeholder="Email" name="email" value={form.email} handler={changeHandler} type="email" />
            <div className="flex items-center gap-2 text-sm">
              <CheckBox1 id="news" />
              <label htmlFor="news">Email me with news and offers</label>
            </div>
          </section>

          {/* Delivery */}
          <section className="mt-8 flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Delivery</h2>

            <select
              name="country"
              value={form.country}
              onChange={changeHandler}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm"
            >
              <option value="pakistan">Pakistan</option>
            </select>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputFields placeholder="First name" name="firstName" value={form.firstName} handler={changeHandler} type="text" />
              <InputFields placeholder="Last name" name="lastName" value={form.lastName} handler={changeHandler} type="text" />
            </div>

            <InputFields placeholder="Address" name="address" value={form.address} handler={changeHandler} type="text" />
            <InputFields placeholder="Apartment, suite, etc. (optional)" name="apartment" value={form.apartment} handler={changeHandler} type="text" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputFields placeholder="City" name="city" value={form.city} handler={changeHandler} type="text" />
              <InputFields placeholder="Postal code (optional)" name="postalCode" value={form.postalCode} handler={changeHandler} type="text" />
            </div>

            <InputFields placeholder="Phone" name="phone" value={form.phone} handler={changeHandler} type="tel" />

            <div className="flex items-center gap-2 text-sm">
              <CheckBox1 id="save-info" />
              <label htmlFor="save-info">Save this information for next time</label>
            </div>
          </section>

          {/* Shipping method */}
          <section className="mt-8 flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Shipping method</h2>
            <div className="flex items-center justify-between rounded-md border border-blue-600 bg-blue-50 px-4 py-3 text-sm">
              <span>Standard</span>
              <span className="font-medium">{rs(SHIPPING)}</span>
            </div>
          </section>

          {/* Payment */}
          <section className="mt-8 flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Payment</h2>
            <Radio handler={changeHandler} name="payment" value={form.payment} />
          </section>

          <button
            type="button"
            onClick={submitHandler}
            disabled={loading}
            className="mt-8 w-full rounded-md bg-blue-600 px-4 py-4 text-base font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Placing order…' : 'Complete order'}
          </button>
        </div>
      </div>

      {/* ===== Right: summary (desktop only) ===== */}
      <aside className="hidden border-l border-gray-300 bg-[#F5F5F5] lg:block">
        <div className="sticky top-0 max-w-[460px] px-12 py-12">
          <OrderSummary items={items} count={cartCount} total={cartTotal} />
        </div>
      </aside>

      <ToastContainer position="top-center" />
    </div>
  )
}

export default Checkout