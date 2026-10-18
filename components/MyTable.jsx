
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import DeleteModal from "./DeleteModal";
import axios from "axios";

const MyTable = () => {
    const [Data, setData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Fetch collections
    const getCollections = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `/api/categories?page=${page}&limit=${limit}`
            );

            setData(res.data.data || []);

            // Adjust this field to match your GET API response
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error("Fetch collections error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCollections();
    }, [page, limit]);

    // Select or deselect one collection
    const toggle = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    // Select or deselect all collections on this page
    const toggleAll = () => {
        const pageIds = Data.map((item) => item._id);

        const allSelected =
            pageIds.length > 0 &&
            pageIds.every((id) => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds((prev) =>
                prev.filter((id) => !pageIds.includes(id))
            );
        } else {
            setSelectedIds((prev) =>
                [...new Set([...prev, ...pageIds])]
            );
        }
    };

    // Remove deleted rows from the table
    const handleDeleted = (deletedId) => {
        const ids = Array.isArray(deletedId)
            ? deletedId
            : [deletedId];

        setData((prev) =>
            prev.filter((item) => !ids.includes(item._id))
        );

        setSelectedIds((prev) =>
            prev.filter((id) => !ids.includes(id))
        );
    };

    const allSelected =
        Data.length > 0 &&
        Data.every((item) => selectedIds.includes(item._id));

    return (
        <div className="w-full">
            <table className="w-full mt-6 border-separate border-spacing-y-2">
                <thead>
                    <tr className="bg-[#F7F7F7]">
                        <th className="text-left text-sm px-2 py-2 w-[5%]">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                            />
                        </th>

                        <th className="text-left text-sm px-2 py-2 w-[8%]">
                            Image
                        </th>

                        <th className="text-left text-sm px-2 py-2 w-[35%]">
                            Title
                        </th>

                        <th className="text-left text-sm px-2 py-2 w-[20%]">
                            Products
                        </th>

                        <th className="text-left text-sm px-2 py-2 w-[25%]">
                            Sales Channel
                        </th>
                    </tr>

                    {selectedIds.length > 0 && (
                        <tr>
                            <td colSpan={5} className="px-2 py-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">
                                        {selectedIds.length} selected
                                    </span>

                                    <DeleteModal
                                        id={selectedIds}
                                        onDeleted={handleDeleted}
                                    />
                                </div>
                            </td>
                        </tr>
                    )}
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="text-center py-8"
                            >
                                Loading collections...
                            </td>
                        </tr>
                    ) : Data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="text-center py-8 text-gray-500"
                            >
                                No collections found.
                            </td>
                        </tr>
                    ) : (
                        Data.map((item) => (
                            <tr
                                key={item._id}
                                className="hover:bg-[#F7F7F7]"
                            >
                                <td className="text-sm px-2 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(
                                            item._id
                                        )}
                                        onChange={() =>
                                            toggle(item._id)
                                        }
                                    />
                                </td>

                                <td className="px-2 py-2">
                                    <div className="border border-gray-300 w-[40px] h-[40px] rounded-lg overflow-hidden">
                                        <img
                                            src={
                                                item.file ||
                                                "/imageholder.png"
                                            }
                                            width={40}
                                            height={40}
                                            alt={item.title || "Collection"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </td>

                                <td className="text-sm font-semibold px-2 py-2">
                                    <Link
                                        href={`/admin/collections/${item._id}`}
                                        className="hover:underline"
                                    >
                                        {item.title}
                                    </Link>
                                </td>

                                <td className="text-sm px-2 py-2">
                                    -
                                </td>

                                <td className="text-sm px-2 py-2">
                                    -
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="limit">Rows per page:</label>

                    <select
                        id="limit"
                        value={limit}
                        onChange={(e) => {
                            setPage(1);
                            setLimit(Number(e.target.value));
                            setSelectedIds([]);
                        }}
                        className="border rounded px-2 py-1"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((prev) => prev - 1)}
                        className="border rounded px-3 py-1 disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="text-sm">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="border rounded px-3 py-1 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyTable;
