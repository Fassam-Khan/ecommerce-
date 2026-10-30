
"use client";

import { useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";

const collections = [
  {
    id: 1,
    title: "Art Supplies",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500",
    slug: "art-supplies",
  },
  {
    id: 2,
    title: "Acrylic Paints",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500",
    slug: "acrylic-paints",
  },
  {
    id: 3,
    title: "Paint Brushes",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500",
    slug: "paint-brushes",
  },
  {
    id: 4,
    title: "Sketchbooks",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500",
    slug: "sketchbooks",
  },
  {
    id: 5,
    title: "Canvases",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500",
    slug: "canvases",
  },
  {
    id: 6,
    title: "School Supplies",
    image: "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=500",
    slug: "school-supplies",
  },
  {
    id: 7,
    title: "Office Supplies",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500",
    slug: "office-supplies",
  },
];

export default function ExploreCollections() {
  const swiperRef = useRef(null);

  return (
    <section className=""> 
      {/* Heading */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold md:text-3xl ">
          Explore Our Collections
        </h2>

        {/* Custom arrows */}
        <div className="flex gap-2 ">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous collections"
            className="flex h-10 w-10 items-center justify-center
            rounded-full border border-gray-300
            transition hover:bg-black hover:text-white"
          >
            <ChevronLeft size={21} />
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next collections"
            className="flex h-10 w-10 items-center justify-center
            rounded-full border border-gray-300
            transition hover:bg-black hover:text-white"
          >
            <ChevronRight size={21} />
          </button>
        </div>
      </div>

      {/* Swiper */}
      <Swiper 
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
        {collections.map((item) => (
          <SwiperSlide key={item.id}>
            <Link
              href={`/collections/${item.slug}`}
              className="group block"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover
                  transition duration-500 group-hover:scale-105"
                />
              </div>

              <h3 className="mt-3 text-center text-sm font-medium
              transition group-hover:text-red-600 md:text-base">
                {item.title}
              </h3>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
