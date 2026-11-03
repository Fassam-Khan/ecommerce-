"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import InfoInput from "@/components/InfoInput";
import { clearCart, selectCartItems, selectCartTotal } from "@/app/redux/cartSlice";
import axios from "axios";

/* ---------------- config ---------------- */
const money = (n) => `Rs ${Number(n).toLocaleString("en-PK")}`;

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard", note: "3–5 business days", price: 350 },
];
const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery (COD)", note: "Pay in cash when your order arrives." },
  { id: "card", label: "Bank Transfer", note: "Card details are entered after you continue." },
];
const DISCOUNTS = { WELCOME10: 0.1 }; // demo only, validate on the server in production
const COUNTRIES = ["Pakistan", "United Arab Emirates", "United Kingdom", "United States"];

/* ---------------- validation (Shopify-style messages) ---------------- */
const RULES = {
  email: (v) => {
    if (!v.trim()) return "Enter an email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return "Enter a valid email";
    return "";
  },
  firstName: (v) => (v.trim() ? "" : "Enter a first name"),
  lastName: (v) => (v.trim() ? "" : "Enter a last name"),
  address: (v) => {
    if (!v.trim()) return "Enter an address";
    if (v.trim().length < 5) return "Enter a complete address";
    return "";
  },
  city: (v) => (v.trim() ? "" : "Enter a city"),
  postalCode: (v) => (v && !/^[A-Za-z0-9\s-]{3,10}$/.test(v.trim()) ? "Enter a valid postal code" : ""),
  phone: (v) => {
    const digits = v.replace(/[\s()-]/g, "");
    if (!digits) return "Enter a phone number";
    if (!/^\+?\d{10,14}$/.test(digits)) return "Enter a valid phone number";
    return "";
  },
};
const FIELD_ORDER = ["email", "firstName", "lastName", "address", "city", "postalCode", "phone"];

/* ---------------- small UI pieces ---------------- */
function Radio({ name, checked, onChange, label, note, right }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm
        ${checked ? "bg-blue-50 ring-1 ring-inset ring-blue-600" : "bg-white"}`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`h-[18px] w-[18px] shrink-0 rounded-full border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600
          ${checked ? "border-[5px] border-blue-600" : "border-gray-300"}`}
      />
      <span className="flex flex-1 flex-col">
        <span>{label}</span>
        {note && checked && <span className="text-xs text-gray-500">{note}</span>}
      </span>
      {right && <span className="font-medium">{right}</span>}
    </label>
  );
}

function Summary({ items, subtotal, discount, shipping, total, code, setCode, codeError, appliedCode, onApply }) {
  return (
    <div>
      <ul className="mb-5 flex flex-col gap-4">
        {items.map((i) => (
          <li key={i._id} className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 rounded-lg border border-black/10 bg-white">
              {i.image ? (
                <img src={i.image.file} alt={i.title} className="h-full w-full rounded-lg object-cover" />
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

      <div className="flex gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Discount code"
          aria-label="Discount code"
          className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
        <button
          type="button"
          onClick={onApply}
          disabled={!code.trim()}
          className="h-11 rounded-md bg-gray-200 px-5 text-sm font-medium text-gray-800 enabled:hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Apply
        </button>
      </div>
      {codeError && <p className="mt-1 text-xs text-red-600">{codeError}</p>}
      {appliedCode && <p className="mt-1 text-xs text-green-700">Code {appliedCode} applied</p>}

      <dl className="mt-5 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium">{money(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd className="font-medium">−{money(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className="font-medium">{money(shipping)}</dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between text-lg font-semibold">
          <dt>Total</dt>
          <dd className="text-2xl">
            <span className="mr-2 text-xs font-normal text-gray-500">PKR</span>
            {money(total)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function CheckoutPage() {

  const router = useRouter();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const hydrated = useSelector((s) => s.cart.hydrated);

 

  const [form, setForm] = useState({
    email: "",
    newsletter: true,
    country: "Pakistan",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
    saveInfo: false,
    shipping: "standard",
    payment: "cod",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const formRef = useRef(null);

  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === form.shipping);
  const discount = appliedCode ? Math.round(subtotal * DISCOUNTS[appliedCode]) : 0;
  const shipping = shippingMethod.price;
  const total = subtotal - discount + shipping;

  /* field helpers: validate on blur, re-validate while typing once an error is showing */
  const fieldProps = (name) => ({
    name,
    value: form[name],
    error: errors[name],
    onChange: (e) => {
      const v = e.target.value;
      setForm((f) => ({ ...f, [name]: v }));
      if (errors[name]) setErrors((er) => ({ ...er, [name]: RULES[name]?.(v) || "" }));
    },
    onBlur: (e) => {
      if (RULES[name]) setErrors((er) => ({ ...er, [name]: RULES[name](e.target.value) }));
    },
  });

  const applyCode = () => {
    const c = code.trim().toUpperCase();
    if (DISCOUNTS[c]) {
      setAppliedCode(c);
      setCodeError("");
      setCode("");
    } else {
      setAppliedCode("");
      setCodeError("Enter a valid discount code");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const next = {};
    FIELD_ORDER.forEach((k) => {
      const msg = RULES[k](form[k]);
      if (msg) next[k] = msg;
    });
    setErrors(next);

    const firstBad = FIELD_ORDER.find((k) => next[k]);
    if (firstBad) {
      formRef.current?.querySelector(`[name="${firstBad}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    try {

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: form.email.trim(),
            newsletter: form.newsletter,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
          },
          shippingAddress: {
            country: form.country,
            address: form.address.trim(),
            apartment: form.apartment.trim(),
            city: form.city.trim(),
            postalCode: form.postalCode.trim(),
          },
          shippingMethod: form.shipping,
          paymentMethod: form.payment,
          discountCode: appliedCode || null,
          items: items.map((i) => ({ _id: i._id, quantity: i.quantity })), // server recalculates prices
        }),

        // End 
      });
      const data = await res.json().catch(() => ({}));

     
      if (!res.ok) throw new Error(data.message || "We couldn't place your order. Try again.");
      dispatch(clearCart());
      router.push(`/checkout/success?order=${data.orderId ?? ""}`);
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Loading…</div>;
  if (!items.length)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Link href="/" className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          Continue shopping
        </Link>
      </div>
    );

  const summaryProps = { items, subtotal, discount, shipping, total, code, setCode, codeError, appliedCode, onApply: applyCode };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile summary (top) */}
      <div className="border-b bg-[#F5F5F5] px-4 py-5 md:hidden">
        <details>
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-blue-600">
            <span>Show order summary</span>
            <strong className="text-base text-gray-900">{money(total)}</strong>
          </summary>
          <div className="pt-4">
            <Summary {...summaryProps} />
          </div>
        </details>
      </div>

      {/* ---------- Left: form ---------- */}
      <main className="flex justify-end px-4 py-8 md:w-1/2 md:px-10">
        <form ref={formRef} onSubmit={onSubmit} noValidate className="w-full max-w-[580px]">
          {/* Contact */}
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Contact</h2>
              <Link href="/login" className="text-sm text-blue-600 underline">Sign in</Link>
            </div>
            <InfoInput placeholder="Email" type="email" autoComplete="email" {...fieldProps("email")} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.newsletter}
                onChange={(e) => setForm((f) => ({ ...f, newsletter: e.target.checked }))}
                className="h-4 w-4 accent-blue-600"
              />
              Email me with news and offers
            </label>
          </section>

          {/* Delivery */}
          <section className="mt-8 flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Delivery</h2>

            <div className="relative">
              <select
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                autoComplete="country-name"
                aria-label="Country/Region"
                className="h-[52px] w-full appearance-none rounded-md border border-gray-300 bg-white px-3 pb-1 pt-5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-3 top-[14px] -translate-y-1/2 text-xs text-gray-500">
                Country/Region
              </span>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
                <path d="M1 1l5 5 5-5" fill="none" stroke="#707070" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="flex w-full gap-2">
              <InfoInput placeholder="First name" autoComplete="given-name" {...fieldProps("firstName")} />
              <InfoInput placeholder="Last name" autoComplete="family-name" {...fieldProps("lastName")} />
            </div>

            <InfoInput placeholder="Address" autoComplete="address-line1" {...fieldProps("address")} />
            <InfoInput
              placeholder="Apartment, suite, etc. (optional)"
              name="apartment"
              autoComplete="address-line2"
              value={form.apartment}
              onChange={(e) => setForm((f) => ({ ...f, apartment: e.target.value }))}
            />

            <div className="flex w-full gap-2">
              <InfoInput placeholder="City" autoComplete="address-level2" {...fieldProps("city")} />
              <InfoInput placeholder="Postal code (optional)" autoComplete="postal-code" {...fieldProps("postalCode")} />
            </div>

            <InfoInput placeholder="Phone" type="tel" inputMode="tel" autoComplete="tel" {...fieldProps("phone")} />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.saveInfo}
                onChange={(e) => setForm((f) => ({ ...f, saveInfo: e.target.checked }))}
                className="h-4 w-4 accent-blue-600"
              />
              Save this information for next time
            </label>
          </section>

          {/* Shipping method */}
          <section className="mt-8 flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Shipping method</h2>
            <div className="divide-y divide-gray-300 overflow-hidden rounded-md border border-gray-300">
              {SHIPPING_METHODS.map((m) => (
                <Radio
                  key={m.id}
                  name="shipping"
                  checked={form.shipping === m.id}
                  onChange={() => setForm((f) => ({ ...f, shipping: m.id }))}
                  label={`${m.label} (${m.note})`}
                  right={money(m.price)}
                />
              ))}
            </div>
          </section>

          {/* Payment */}
          <section className="mt-8 flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-semibold">Payment</h2>
              <p className="text-sm text-gray-400">All transactions are secure and encrypted.</p>
            </div>
            <div className="divide-y divide-gray-300 overflow-hidden rounded-md border border-gray-300">
              {PAYMENT_METHODS.map((m) => (
                <Radio
                  key={m.id}
                  name="payment"
                  checked={form.payment === m.id}
                  onChange={() => setForm((f) => ({ ...f, payment: m.id }))}
                  label={m.label}
                  note={m.note}
                />
              ))}
            </div>
          </section>

          {serverError && (
            <div role="alert" className="mt-6 rounded-md border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse items-stretch gap-4 text-center sm:flex-row sm:items-center sm:justify-between">
            <Link href="/cart" className="text-sm text-blue-600 hover:underline">‹ Return to cart</Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-8 py-4 text-[15px] font-medium text-white transition hover:bg-blue-700 disabled:cursor-progress disabled:opacity-60"
            >
              {submitting ? "Placing order…" : form.payment === "cod" ? "Complete order" : "Pay now"}
            </button>
          </div>

          <footer className="mt-8 flex gap-4 border-t pt-4 text-xs text-blue-600">
            <Link href="/policies/refund">Refund policy</Link>
            <Link href="/policies/shipping">Shipping policy</Link>
            <Link href="/policies/privacy">Privacy policy</Link>
          </footer>
        </form>
      </main>

      {/* ---------- Right: summary (desktop) ---------- */}
      <aside className="hidden border-l border-gray-200 bg-[#F5F5F5] px-10 py-8 md:block md:w-1/2">
        <div className="sticky top-8 w-full max-w-[440px]">
          <Summary {...summaryProps} />
        </div>
      </aside>
    </div>
  );
}