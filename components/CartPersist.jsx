"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hydrateCart } from "@/app/redux/cartSlice";

const STORAGE_KEY = "cart_items";

export default function CartPersist() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const hydrated = useSelector((s) => s.cart.hydrated);

  // 1) Mount par localStorage se load karo
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      dispatch(hydrateCart(saved ? JSON.parse(saved) : []));
    } catch {
      dispatch(hydrateCart([]));
    }
  }, [dispatch]);

  // 2) Har change par save karo (hydrate ke baad hi)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  // 3) Doosre tab mein cart change ho to sync karo
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          dispatch(hydrateCart(e.newValue ? JSON.parse(e.newValue) : []));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);

  return null;
}