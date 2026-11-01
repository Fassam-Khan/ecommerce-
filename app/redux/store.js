"use client"
import { configureStore } from "@reduxjs/toolkit";
import authReducer from '@/app/redux/authSlice'
import cartReducer from "@/app/redux/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});