// Single source of truth for the server. Keep the client (checkout page) in sync with these values.
export const SHIPPING_METHODS = {
    standard: { label: "Standard", price: 350 },
  };
  
  export const PAYMENT_METHODS = ["cod", "card"];
  
  // Discount codes: fraction off the subtotal
  export const DISCOUNTS = {
    WELCOME10: 0.1,
  };