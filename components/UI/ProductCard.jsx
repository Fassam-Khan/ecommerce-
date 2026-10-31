import Image from "next/image";
import React from "react";
import AddCart from "./AddCart";
import Link from "next/link";

const ProductCard = ({ product }) => {
  const imageUrl = product?.img_url?.[0]?.file;
  const title = product?.title || "";

  return (
    
    <div className="w-full h-[370px] rounded-2xl border border-gray-300 overflow-hidden flex flex-col">
        <Link href={`/products/${product.slug}`}></Link>
      {/* Image */}
      <div className="relative w-full h-[200px] bg-gray-100">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover"
          />
        )}
      </div>
      </Link>

      {/* Info */}
      <div className="px-3 mt-3 flex flex-col flex-1 pb-3">
        <p className="text-sm font-bold">
          {title.length > 30 ? `${title.slice(0, 25)}...` : title}
        </p>
        <p className="mt-2">Rs {product?.price}</p>

        <div className="mt-auto">
          <AddCart />
        </div>
      </div>
    </div>


  );
};

export default ProductCard;