import Link from "next/link";
import { notFound } from "next/navigation";
import Order from "@/models/Order";
import ClearCart from "./ClearCart";
import connectDB from "@/lib/mongodb";

export const metadata = { title: "Order confirmed" };
export const dynamic = "force-dynamic";

const money = (n) => `Rs ${Number(n).toLocaleString("en-PK")}`;

export default async function SuccessPage({ searchParams }) {
  const { order: orderNumber, t: token } = await searchParams;

  // The token stops people from opening other customers' orders by guessing 1001, 1002...
  const num = Number(orderNumber);
  if (!Number.isInteger(num) || typeof token !== "string" || !token) notFound();

  await connectDB();
  const order = await Order.findOne({ orderNumber: num, accessToken: token }).lean();
  if (!order) notFound();

  const a = order.shippingAddress;
  const c = order.customer;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <ClearCart />

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-600 text-green-600">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
          <h1 className="text-2xl font-semibold">Thank you, {c.firstName}!</h1>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-300 p-5">
        <h2 className="text-lg font-semibold">Your order is confirmed</h2>
        <p className="mt-1 text-sm text-gray-600">
          We've received your order and will contact you on {c.phone} if we need anything. A confirmation will be sent to {c.email}.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-gray-300 p-5">
        <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-4">
          {order.items.map((i) => (
            <li key={String(i.product)} className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 rounded-lg border border-black/10 bg-white">
                {i.image ? (
                  <img src={i.image} alt={i.title} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <div className="h-full w-full rounded-lg bg-gray-200" />
                )}
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-600/90 px-1.5 text-xs text-white">
                  {i.quantity}
                </span>
              </div>
              <p className="flex-1 text-sm font-medium">{i.title}</p>
              <p className="text-sm">{money(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><dt>Discount ({order.discountCode})</dt><dd>−{money(order.discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{money(order.shipping)}</dd></div>
          <div className="mt-2 flex items-baseline justify-between text-lg font-semibold">
            <dt>Total</dt>
            <dd><span className="mr-2 text-xs font-normal text-gray-500">PKR</span>{money(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 grid gap-4 rounded-lg border border-gray-300 p-5 text-sm sm:grid-cols-2">
        <div>
          <h3 className="mb-1 font-semibold">Shipping address</h3>
          <p>{c.firstName} {c.lastName}</p>
          <p>{a.address}{a.apartment ? `, ${a.apartment}` : ""}</p>
          <p>{a.city}{a.postalCode ? ` ${a.postalCode}` : ""}</p>
          <p>{a.country}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold">Payment</h3>
          <p>
            {order.paymentMethod === "cod"
              ? `Cash on delivery. Please keep ${money(order.total)} ready.`
              : "Card payment"}
          </p>
          <h3 className="mb-1 mt-4 font-semibold">Shipping method</h3>
          <p className="capitalize">{order.shippingMethod}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">Need help? Contact us and mention order #{order.orderNumber}.</p>
        <Link href="/" className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}