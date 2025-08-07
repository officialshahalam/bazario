"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import DeleteConfirmationModal from "apps/seller-ui/src/shared/components/modals/DeleteConfirmationModal";

const AllProducts = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get("/get-shop-products");
      return res?.data?.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await getAxiosInstance("product").delete(`/delete-product/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });
  const restoreMutation = useMutation({
    mutationFn: async (productId: string) => {
      await getAxiosInstance("product").put(`/restore-product/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          return (
            <Image
              src={row.original.images[0]?.url}
              width={200}
              height={200}
              alt={row.original.images[0]?.url}
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;
          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
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
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link
              href={`/product/${row.original.slug}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/product/edit/${row.original.id}`}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <Pencil size={18} />
            </Link>
            <button className="text-green-400 hover:text-green-300 transition">
              <BarChart size={18} />
            </button>
            <button
              className="text-red-400 hover:text-red-300 transition"
              onClick={() => openDeleteModel(row.original)}
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const openDeleteModel = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const table = useReactTable({
    data: products,
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
        <Link
          href={"/dashboard/create-product"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Product
        </Link>
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
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
        />
      )}
    </div>
  );
};

export default AllProducts;
