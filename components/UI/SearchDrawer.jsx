"use client";

import { useState, useEffect } from "react";
import { Drawer, Box, Typography, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MyDrawer() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = searchTerm.trim();

    if (!term) {
      setProducts([]);
      return;
    }

    const controller = new AbortController();

    console.log(products)

    // debounce: wait 400ms after the user stops typing
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchTerm: term }),
          signal: controller.signal,
        });
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    // cleanup cancels old timers/requests when the term changes
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Search className="hover:text-[var(--brand-red)] cursor-pointer" />
      </button>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 350,
              borderRight: "1px solid #334155",
              fontFamily: '"Poppins", sans-serif',
            },
          },
        }}
      >
        <Box>
          <Box
            className="px-2"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography className="text-sm">SEARCH OUR SITE</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          <Box className="mt-5 px-2 py-3">
            <input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg outline outline-gray-300 w-full px-3 py-1"
            />
          </Box>
          <Divider />

          {searchTerm.trim() && (
            <>
              <Box className="mt-4 px-3 mb-6">
                <h4 className="text-xl font-semibold">Products</h4>
              </Box>
              <Divider />

              {loading && <p className="px-3 mt-6">Searching...</p>}

              {!loading && products.length === 0 && (
                <p className="px-3 mt-6 text-gray-500">No products found.</p>
              )}

              {products.map((p) => (
                <Box key={p._id} className="flex gap-2 px-3 mt-6 group">
                  <Link href={`/products/${p.slug}`}>
                  <div className="border w-28 h-35 flex justify-center items-center group-hover:bg-gray-200">
                    <Image
                      src={p?.img_url[0]?.file || "/imageholder.png"}
                      alt={p.title}
                      width={80}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                  </Link>
                  <div className="w-[60%]">
                    <Link href={`/products/${p.slug}`}>
                    <p className="font-semibold hover:text-[var(--brand-red)] cursor-pointer transition-all">{p.title.slice(0, 36)}{p.title.length > 36 ? "..." :""}</p>
                    </Link>
                    <p>Rs {p.price}</p>
                  </div>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}