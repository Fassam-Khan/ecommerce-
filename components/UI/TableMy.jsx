"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TableMy = () => {
  const [page, setPage] = useState(1);

  // Records displayed per page
  const limit = 50;

  // Example: total products in your database
  const totalProducts = 200;

  const totalPages = Math.ceil(totalProducts / limit);

  const initial = (page - 1) * limit + 1;
  const final = Math.min(page * limit, totalProducts);

  const increment = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const decrement = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full">
      <table className="w-full rounded-2xl">
        <thead className="bg-[#D1D5DC]">
          <tr>
            <th className="px-3 py-2 text-left">
              <input type="checkbox" />
            </th>
            <th className="px-3 py-2 text-left">Images</th>
            <th className="px-3 py-2 text-left">Products</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Inventory</th>
            <th className="px-3 py-2 text-left">Brand</th>
            <th className="px-3 py-2 text-left"></th>
          </tr>
        </thead>

        <tbody>
          {/* Example row — replace with your mapped product data */}
          <tr className="border-b">
            <td className="px-3 py-2">
              <input type="checkbox" />
            </td>

            <td className="px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center border">
                <Image
                  src="/imageholder.png"
                  alt="Product"
                  width={40}
                  height={40}
                />
              </div>
            </td>

            <td className="px-3 py-2">
              <Link href="/admin/products">
                <p className="text-sm font-semibold">Acryjsh hshv</p>
              </Link>
            </td>

            <td className="px-3 py-2">
              <span className="rounded bg-green-500 px-2 py-1 text-xs">
                Active
              </span>
            </td>

            <td className="px-3 py-2">
              <p className="text-sm font-semibold">In stock</p>
            </td>

            <td className="px-3 py-2">
              <p className="text-sm font-semibold">Keep SMiling</p>
            </td>

            <td className="px-3 py-2">
              <Link href="/admin/products">View</Link>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Pagination footer */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 rounded-xl border bg-white p-2 shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={decrement}
            disabled={page === 1}
            className="flex cursor-pointer items-center justify-center rounded-full p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <p className="whitespace-nowrap text-xs font-semibold">
            {totalProducts === 0 ? 0 : initial}-{final} of {totalProducts}
          </p>

          <button
            onClick={increment}
            disabled={page === totalPages || totalPages === 0}
            className="flex cursor-pointer items-center justify-center rounded-full p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableMy;