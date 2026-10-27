"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";   // NEW

import axios from "axios";

const LIMIT = 50

const TableMy = () => {

  const searchParams = useSearchParams();             // NEW
  const search = searchParams.get("search") || "";    // NEW
  const status = searchParams.get("status") || "all";


  const [page, setPage] = useState(1);
  const [Data, setData] = useState([])
  const [totalPro, settotalPro] = useState(0)
  // Records displayed per page


  const getProducts = async () => {
    try {
      const res = await axios.get("/api/products", {
        params: { page, limit: LIMIT, search, status },
      });
      setData(res.data.data);
      settotalPro(res.data.total);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    getProducts();
  }, [page, search, status]);


  // Example: total products in your database
  const totalPages = Math.ceil(totalPro / LIMIT);
  const initial = (page - 1) * LIMIT + 1;
  const final = Math.min(page * LIMIT, totalPro);

  const increment = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const decrement = () => {
    if (page > 1) setPage((prev) => prev - 1);
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
          {Data.map((e) => {
            return <tr className="border-b" key={e._id}>
              <td className="px-3 py-2">
                <input type="checkbox" />
              </td>

              <td className="px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center border">
                  <Image
                    src={e?.img_url[0]?.file || "/imageholder.png"}
                    alt="Product"
                    width={40}
                    height={40}
                  />
                </div>
              </td>

              <td className="px-3 py-2">
                <Link href={`/admin/products/${e._id}`}>
                  <p className="text-sm font-semibold">{e.title}</p>
                </Link>
              </td>

              <td className="px-3 py-2">
                <span className={`rounded px-2 py-1 text-xs capitalize ${e.status === "active" ? "bg-green-500"
                    : e.status === "draft" ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}>
                  {e.status}
                </span>
              </td>

              <td className="px-3 py-2">
                <p className="text-sm font-semibold">{e.stock || "-"}</p>
              </td>

              <td className="px-3 py-2">
                <p className="text-sm font-semibold">Nazar Brothers</p>
              </td>

              <td className="px-3 py-2">
                <Link href={`/products/${e?.slug}`}>View</Link>
              </td>
            </tr>
          })}

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
            {totalPro === 0 ? 0 : initial}-{final} of {totalPro}
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