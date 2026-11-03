"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/app/redux/cartSlice";

export default function ClearCart() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);
  return null;
}