"use client";
import React, { useDeferredValue, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { Search, Eye, Star, ChevronRight, Download } from "lucide-react";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { saveAs } from "file-saver";

const AllProducts = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredFilter = useDeferredValue(globalFilter);
  const [page, setPage] = useState(1);
  const limit = 10;

  const exportCSV = () => {
    const csvData = filteredProducts.map(
      (p: any) =>
        `${p.title},${p.sale_price},${p.stock},${p.category},${p.ratings},${p.shop.name}`
    );
    const blob = new Blob(
      [`Title,Price,Stock,Category,Ratings,Shop\n${csvData.join("\n")}`],
      { type: "text/csv;charset=utf-8" }
    );
    saveAs(blob, `product-page-${page}.csv`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["all-products", page],
    queryFn: async () => {
      const res = await getAxiosInstance("admin").get(
        `/get-all-products?page=${page}&limit=${limit}`
      );
      return res?.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
  const allProducts = data?.data || [];
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: any) =>
      Object.values(product)
        .join(" ")
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
    );
  }, [allProducts, deferredFilter]);

  const totalPage = Math.ceil((data?.meta?.totalProducts ?? 0) / limit);

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.url}
              width={40}
              height={40}
              className="w-10 h-10 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }: any) => {
          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {row?.original?.title}
            </Link>
          );
        },
      },
      {
        accessorKey: "sale_price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />{" "}
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        accessorKey: "shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-purple-400">{row.original.shop.name}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: any) =>
          new Date(row?.original?.createdAt).toLocaleDateString(),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <Link
            href={`http://localhost:3000/product/${row.original.slug}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: allProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mt-1">
        <h2 className="text-2xl text-white font-semibold ">All Products</h2>
        <button
          onClick={exportCSV}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Download size={16} /> Export SVG
        </button>
      </div>
      <div className="flex items-center mb-4">
        <Link href={"/dashboard"} className="text-[#80deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8] text-gray-200" />
        <span className="text-white">Create Product</span>
      </div>
      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {page} of {totalPage || 1}
          </span>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
            disabled={page === totalPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
