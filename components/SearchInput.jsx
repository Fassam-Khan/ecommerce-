"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SearchInput = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  // Debounce: update URL 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");

      if (status !== "all") params.set("status", status);
      else params.delete("status");

      const next = params.toString();
      const current = searchParams.toString();

      // Skip if nothing changed (avoids a useless navigation on mount)
      if (next === current) return;

      router.replace(next ? `${pathname}?${next}` : pathname);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex w-full items-center rounded-2xl px-3 py-1 text-[12px] outline outline-gray-300">
      <div className="rounded-2xl bg-gray-300 px-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="cursor-pointer bg-transparent text-[12px] outline-none"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <Search className="ml-3 h-4 w-4 shrink-0 text-gray-500" />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="ml-2 w-full bg-transparent text-[12px] outline-none"
        placeholder="Search and filter"
      />
    </div>
  );
};

export default SearchInput;