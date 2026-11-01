"use client";

import { useDispatch } from "react-redux";
import { addToCart, openCart } from "@/app/redux/cartSlice";

// Product ki pehli image nikalne ka helper. Apne schema ke hisaab se change karo.
const getImage = (p) => {
  const first = p.images?.[0];
  return (typeof first === "string" ? first : first?.url) || p.image || "";
};

export default function AddToCartButton({ product, quantity = 1, className = "" }) {
  const dispatch = useDispatch();

  // NOTE: "stock" field ka naam apne schema ke hisaab se badlo
  const soldOut = typeof product?.stock === "number" && product?.stock <= 0;

  const handleClick = (e) => {
    // Agar button ProductCard ke <Link> ke andar hai to navigation na ho
    e.preventDefault();
    e.stopPropagation();

    dispatch(
      addToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        image: getImage(product),
        slug: product.slug,
        stock: product.stock,
        quantity,
      })
    );
    dispatch(openCart());
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      className={`w-full rounded bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 ${className}`}
    >
      {soldOut ? "Sold out" : "Add to cart"}
    </button>
  );
}