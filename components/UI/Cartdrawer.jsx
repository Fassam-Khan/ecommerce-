"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  closeCart,
  decreaseQty,
  increaseQty,
  removeFromCart,
  selectCartItems,
  selectCartOpen,
  selectCartTotal,
} from "@/app/redux/cartSlice";

const money = (n) => `Rs. ${Number(n).toLocaleString("en-PK")}`;

export default function CartDrawer() {
  const dispatch = useDispatch();
  const open = useSelector(selectCartOpen);
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  const close = () => dispatch(closeCart());

  // Escape se band + background scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && dispatch(closeCart());
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button onClick={close} aria-label="Close cart" className="p-1 text-2xl leading-none">
            &times;
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-medium">Your cart is empty</p>
            <button onClick={close} className="text-sm underline">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-4">
              {items.map((item) => (
                <li key={item._id} className="flex gap-3 py-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{money(item.price)}</p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded border">
                        <button
                          onClick={() => dispatch(decreaseQty(item._id))}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="px-2.5 py-1 disabled:text-gray-300"
                        >
                          &minus;
                        </button>
                        <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(increaseQty(item._id))}
                          disabled={typeof item.stock === "number" && item.quantity >= item.stock}
                          aria-label="Increase quantity"
                          className="px-2.5 py-1 disabled:text-gray-300"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="text-sm text-gray-500 underline hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t p-4">
              <div className="mb-3 flex items-center justify-between font-semibold">
                <span>Subtotal</span>
                <span>{money(total)}</span>
              </div>
              <p className="mb-3 text-xs text-gray-500">Shipping is calculated at checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full rounded bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
              >
                Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}