
"use client";

import { useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProductCard from "./ProductCard";
import "swiper/css";

const collections = [
  {
    id: 1,
    title: "Art Supplies",
    image: "/acrylicpaint.avif",
    slug: "art-supplies",
  },
  {
    id: 2,
    title: "Brushes",
    image: "/brush.avif",
    slug: "brushes",
  },
  {
    id: 3,
    title: "Sketch Books",
    image: "/sketchbooks.avif",
    slug: "paint-brushes",
  },
  {
    id: 4,
    title: "Canvases",
    image: "/canvas.avif",
    slug: "sketchbooks",
  },
  {
    id: 5,
    title: "Mediums",
    image: "/mediums.avif",
    slug: "canvases",
  },
  {
    id: 6,
    title: "School Supplies",
    image: "/school.avif",
    slug: "school-supplies",
  },
  {
    id: 7,
    title: "Office Supplies",
    image: "/office.avif",
    slug: "office-supplies",
  },
];

export default function NewArrival() {
  const swiperRef = useRef(null);

  return (
    <section className=""> 
      {/* Heading */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold md:text-3xl ">
          New In Store
        </h2>

       
      </div>

      {/* Swiper */}
      <Swiper  className="mt-8"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={18}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
      >
        <ProductCard/>
      </Swiper>
    </section>
  );
}
