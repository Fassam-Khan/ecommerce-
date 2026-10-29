import { configureStore } from "@reduxjs/toolkit";
import authReducer from '@/app/redux/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});