import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],        // [{ _id, title, price, image, slug, stock, quantity }]
  isOpen: false,    // cart drawer open/close
  hydrated: false,  // localStorage se load hone ke baad true
};

const clamp = (qty, stock) => {
  const q = Math.max(1, Math.floor(qty) || 1);
  return typeof stock === "number" && stock > 0 ? Math.min(q, stock) : q;
};

export const selectCartHydrated = (s) => s.cart.hydrated;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.hydrated = true;
    },

    // payload: { _id, title, price, image, slug, stock, quantity? }
    addToCart(state, action) {
      const { quantity = 1, ...item } = action.payload;
      const existing = state.items.find((i) => i._id === item._id);
      if (existing) {
        existing.quantity = clamp(existing.quantity + quantity, existing.stock);
      } else {
        state.items.push({ ...item, quantity: clamp(quantity, item.stock) });
      }
    },

    increaseQty(state, action) {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) item.quantity = clamp(item.quantity + 1, item.stock);
    },

    decreaseQty(state, action) {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) item.quantity = Math.max(1, item.quantity - 1);
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
    },

    clearCart(state) {
      state.items = [];
    },

    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
  openCart,
  closeCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotal = (s) => s.cart.items.reduce((n, i) => n + i.price * i.quantity, 0);
export const selectCartOpen = (s) => s.cart.isOpen;

export default cartSlice.reducer;