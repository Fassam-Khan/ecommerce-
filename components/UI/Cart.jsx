"use client";

import { useDispatch, useSelector } from "react-redux";
import { openCart , selectCartCount} from "@/app/redux/cartSlice";

// Header mein lagao. Click par cart drawer khulta hai.
export default function CartIcon() {
  const dispatch = useDispatch();
  const count = useSelector(selectCartCount);

  return (
    <button
      type="button"
      onClick={() => dispatch(openCart())}
      aria-label={`Open cart, ${count} items`}
      className="relative p-2"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 7h12l-1 12H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}