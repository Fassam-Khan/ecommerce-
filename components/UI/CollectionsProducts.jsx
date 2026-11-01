"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "@/components/UI/ProductCard";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title-asc", label: "Name: A to Z" },
];

const DEFAULT_FILTERS = {
  sort: "newest",
  inStock: false,
  minPrice: "",
  maxPrice: "",
  brands: [],
};

function buildQuery(filters, page, limit) {
  const p = new URLSearchParams({ page, limit, sort: filters.sort });
  if (filters.inStock) p.set("inStock", "1");
  if (filters.minPrice !== "") p.set("minPrice", filters.minPrice);
  if (filters.maxPrice !== "") p.set("maxPrice", filters.maxPrice);
  if (filters.brands.length) p.set("brands", filters.brands.join(","));
  return p.toString();
}

/* ---------- Filter panel (desktop sidebar + mobile drawer dono mein use hota hai) ---------- */
function FilterPanel({ filters, setFilters, facets }) {
  const [minDraft, setMinDraft] = useState(filters.minPrice);
  const [maxDraft, setMaxDraft] = useState(filters.maxPrice);

  // "Clear all" par drafts bhi reset ho jayen
  useEffect(() => {
    setMinDraft(filters.minPrice);
    setMaxDraft(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const toggleBrand = (b) =>
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(b) ? f.brands.filter((x) => x !== b) : [...f.brands, b],
    }));

  const applyPrice = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, minPrice: minDraft, maxPrice: maxDraft }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={filters.inStock}
            onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))}
          />
          In stock only
        </label>
      </div>

      <form onSubmit={applyPrice} className="border-t pt-5">
        <h3 className="mb-3 text-sm font-semibold">Price (Rs.)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={facets ? String(Math.floor(facets.minPrice)) : "Min"}
            value={minDraft}
            onChange={(e) => setMinDraft(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
            aria-label="Minimum price"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={facets ? String(Math.ceil(facets.maxPrice)) : "Max"}
            value={maxDraft}
            onChange={(e) => setMaxDraft(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
            aria-label="Maximum price"
          />
        </div>
        <button
          type="submit"
          className="mt-3 w-full rounded bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Apply price
        </button>
      </form>

      {facets?.brands?.length > 0 && (
        <div className="border-t pt-5">
          <h3 className="mb-3 text-sm font-semibold">Brand</h3>
          <ul className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {facets.brands.map((b) => (
              <li key={b}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={filters.brands.includes(b)}
                    onChange={() => toggleBrand(b)}
                  />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Skeletons({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="animate-pulse" aria-hidden="true">
      <div className="aspect-square rounded bg-gray-200" />
      <div className="mt-3 h-3 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
    </div>
  ));
}

/* ---------- Main component ---------- */
export default function CollectionProducts({ slug, initialData, pageSize = 12 }) {
  const [products, setProducts] = useState(initialData.products);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [total, setTotal] = useState(initialData.total);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const facets = initialData.facets;
  const reqId = useRef(0);
  const sentinelRef = useRef(null);
  const firstRender = useRef(true);

  const load = useCallback(
    async (nextPage, f, replace) => {
      const id = ++reqId.current; // purani requests ka result ignore karne ke liye
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/collections/${slug}/products?${buildQuery(f, nextPage, pageSize)}`
        );
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        if (id !== reqId.current) return;

        setProducts((prev) =>
          replace
            ? data.products
            : [...prev, ...data.products.filter((n) => !prev.some((p) => p._id === n._id))]
        );
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch {
        if (id === reqId.current) setError(true);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [slug, pageSize]
  );

  // Filters / sort change -> page 1 se dobara
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    load(1, filters, true);
  }, [filters, load]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !error && page < totalPages) {
          load(page + 1, filters, false);
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [page, totalPages, loading, error, filters, load]);

  // Mobile drawer open ho to background scroll band
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const activeCount =
    (filters.inStock ? 1 : 0) +
    (filters.minPrice !== "" || filters.maxPrice !== "" ? 1 : 0) +
    filters.brands.length;

  const clearAll = () => setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }));

  const hasMore = page < totalPages;

  return (
    <div className="mt-6 lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-sm text-gray-500 underline hover:text-black">
                Clear all
              </button>
            )}
          </div>
          <FilterPanel filters={filters} setFilters={setFilters} facets={facets} />
        </div>
      </aside>

      <div>
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium lg:hidden"
          >
            Filters{activeCount > 0 && ` (${activeCount})`}
          </button>

          <p className="hidden text-sm text-gray-600 sm:block" aria-live="polite">
            {total} {total === 1 ? "product" : "products"}
          </p>

          <label className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden text-gray-600 sm:inline">Sort by</span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="rounded border px-2 py-2 text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {filters.inStock && (
              <Chip onRemove={() => setFilters((f) => ({ ...f, inStock: false }))}>In stock</Chip>
            )}
            {(filters.minPrice !== "" || filters.maxPrice !== "") && (
              <Chip onRemove={() => setFilters((f) => ({ ...f, minPrice: "", maxPrice: "" }))}>
                Rs. {filters.minPrice || 0} - {filters.maxPrice || "any"}
              </Chip>
            )}
            {filters.brands.map((b) => (
              <Chip
                key={b}
                onRemove={() =>
                  setFilters((f) => ({ ...f, brands: f.brands.filter((x) => x !== b) }))
                }
              >
                {b}
              </Chip>
            ))}
            <button onClick={clearAll} className="text-sm text-gray-500 underline hover:text-black">
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {loading && <Skeletons count={products.length === 0 || page === 1 ? 8 : 4} />}
        </div>

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-medium">No products match these filters.</p>
            <button onClick={clearAll} className="mt-3 text-sm underline">
              Clear all filters
            </button>
          </div>
        )}

        {/* Error + retry */}
        {error && (
          <div className="py-8 text-center">
            <p className="text-sm text-red-600">Could not load products.</p>
            <button
              onClick={() => load(hasMore && products.length ? page + 1 : 1, filters, products.length === 0)}
              className="mt-2 rounded border px-4 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={sentinelRef} className="h-px" />

        {!hasMore && products.length > 0 && !loading && (
          <p className="py-8 text-center text-sm text-gray-500">You have seen all {total} products.</p>
        )}
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold">Filters</h2>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="p-1 text-xl leading-none">
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel filters={filters} setFilters={setFilters} facets={facets} />
            </div>
            <div className="flex gap-3 border-t p-4">
              <button onClick={clearAll} className="flex-1 rounded border px-3 py-2 text-sm">
                Clear all
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 rounded bg-black px-3 py-2 text-sm font-medium text-white"
              >
                Show {total} items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
      {children}
      <button onClick={onRemove} aria-label="Remove filter" className="ml-1 text-gray-500 hover:text-black">
        &times;
      </button>
    </span>
  );
}