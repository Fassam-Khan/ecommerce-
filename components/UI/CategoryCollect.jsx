
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
        {collections.map((item) => (
          <SwiperSlide key={item.id}>
            <Link
              href={`/collections/${item.slug}`}
              className="group block"
            >
              <div className="overflow-hidden rounded-full ">
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
