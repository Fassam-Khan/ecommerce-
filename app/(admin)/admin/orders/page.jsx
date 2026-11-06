"use client"

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-700',
}

const rs = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`
const fmtDate = (d) =>
  new Date(d).toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${BADGE[status]}`}>
    {status}
  </span>
)

const StatusSelect = ({ order, onChange, disabled }) => (
  <select
    value={order.status}
    disabled={disabled || order.status === 'cancelled'}
    onChange={(e) => onChange(order, e.target.value)}
    onClick={(e) => e.stopPropagation()}
    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm capitalize disabled:bg-gray-100"
    aria-label={`Status for order ${order.orderNumber}`}
  >
    {STATUSES.map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
)

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [q, setQ] = useState('') // debounced
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [selected, setSelected] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get('/api/orders', { params: { q, status, page, limit: 20 } })
      setOrders(data.orders)
      setStats(data.stats)
      setPages(data.pages)
      setTotal(data.total)
    } catch (err) {
      setError(err.response?.status === 401 ? 'You are not signed in as admin.' : 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }, [q, status, page])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (order, next) => {
    if (next === 'cancelled' && !window.confirm(`Cancel order #${order.orderNumber}? Its items go back into stock.`)) return
    setUpdatingId(order._id)
    try {
      await axios.patch(`/api/orders/${order._id}`, { status: next })
      toast.success(`Order #${order.orderNumber} is now ${next}`)
      setSelected((s) => (s && s._id === order._id ? { ...s, status: next } : s))
      await load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the order')
    } finally {
      setUpdatingId(null)
    }
  }

  const statCards = stats && [
    { label: 'All orders', value: stats.all },
    { label: 'Pending', value: stats.pending },
    { label: 'Shipped', value: stats.shipped },
    { label: 'Delivered', value: stats.delivered },
    { label: 'Revenue', value: rs(stats.revenue) },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>

      {/* Stats */}
      {statCards && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((c) => (
            <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number, name, email, phone or city"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:max-w-md"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm capitalize sm:w-48"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o._id}
                onClick={() => setSelected(o)}
                className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">#{o.orderNumber}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{fmtDate(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="text-gray-900">{o.firstName} {o.lastName}</p>
                  <p className="text-xs text-gray-500">{o.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{o.city}</td>
                <td className="px-4 py-3 text-gray-600">{o.totalItems}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900">{rs(o.total)}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{o.payment}</td>
                <td className="px-4 py-3">
                  <StatusSelect order={o} onChange={changeStatus} disabled={updatingId === o._id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {orders.map((o) => (
          <div
            key={o._id}
            onClick={() => setSelected(o)}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">#{o.orderNumber}</p>
              <StatusBadge status={o.status} />
            </div>
            <p className="mt-1 text-sm text-gray-900">{o.firstName} {o.lastName} · {o.city}</p>
            <p className="text-xs text-gray-500">{fmtDate(o.createdAt)}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-700">{o.totalItems} items · {rs(o.total)}</p>
              <StatusSelect order={o} onChange={changeStatus} disabled={updatingId === o._id} />
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="mt-6 text-center text-sm text-gray-500">Loading orders…</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-6 text-center text-sm text-gray-500">No orders match your search.</p>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <p className="text-gray-600">{total} orders · Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelected(null)}>
          <aside
            role="dialog"
            aria-label={`Order ${selected.orderNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order #{selected.orderNumber}</h2>
                <p className="text-sm text-gray-500">{fmtDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                Close
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <StatusBadge status={selected.status} />
              <StatusSelect order={selected} onChange={changeStatus} disabled={updatingId === selected._id} />
            </div>

            <h3 className="mt-6 text-sm font-semibold text-gray-900">Customer</h3>
            <div className="mt-1 text-sm text-gray-700">
              <p>{selected.firstName} {selected.lastName}</p>
              <p>{selected.email}</p>
              <p>{selected.phone}</p>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-gray-900">Delivery address</h3>
            <div className="mt-1 text-sm capitalize text-gray-700">
              <p>{selected.address}</p>
              {selected.apartment && <p>{selected.apartment}</p>}
              <p>{selected.city} {selected.postalCode}</p>
              <p>{selected.country}</p>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-gray-900">Items</h3>
            <ul className="mt-2 flex flex-col gap-3">
              {selected.items.map((it) => (
                <li key={String(it.product)} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-900">{it.title} <span className="text-gray-500">× {it.quantity}</span></span>
                  <span className="whitespace-nowrap text-gray-700">{rs(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-1 border-t border-gray-200 pt-4 text-sm text-gray-700">
              <div className="flex justify-between"><span>Subtotal</span><span>{rs(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{rs(selected.shippingCharges)}</span></div>
              <div className="flex justify-between text-base font-semibold text-gray-900"><span>Total</span><span>{rs(selected.total)}</span></div>
              <p className="mt-2 capitalize">Payment: {selected.payment}</p>
            </div>
          </aside>
        </div>
      )}

      <ToastContainer position="top-center" />
    </div>
  )
}