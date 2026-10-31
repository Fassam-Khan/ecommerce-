"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "./ProductCard";
import "swiper/css";

export default function NewArrivalSlider({ products }) {
  const swiperRef = useRef(null);

  return (
    <Swiper
      className="mt-8 "
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      spaceBetween={18}
      slidesPerView={2}
      breakpoints={{
        480: { slidesPerView: 2 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 4 },
        1280: { slidesPerView: 4 },
      }}
    >
      {products.map((product) => (
        <SwiperSlide key={product._id}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
