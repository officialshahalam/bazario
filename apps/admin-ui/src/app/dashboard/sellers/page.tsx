"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, Download, Ban } from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import BreadCrumbs from "apps/admin-ui/src/shared/components/breadCrumbs/BreadCrumbs";
import Image from "next/image";
import Link from "next/link";

// Types
type Seller = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  shop: {
    name: string;
    avatar: string;
    address: string;
  };
};

type SellerResponse = {
  data: Seller[];
  meta: {
    totalSellers: number;
    currentPage: number;
    totalPages: number;
  };
};

const SellersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Seller | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data }: UseQueryResult<SellerResponse, Error> = useQuery({
    queryKey: ["sellers-list", page],
    queryFn: async () => {
      const res = await getAxiosInstance("admin").get(
        `/get-all-sellers?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await getAxiosInstance("admin").put(`/ban-seller/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers-list"] });
      setIsModalOpen(false);
      setSelectedUser(null);
    },
  });

  const allSellers = data?.data || [];
  const totalPages = Math.ceil((data?.meta?.totalSellers ?? 0) / limit);

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          return (
            <Image
              src={
                row.original.shop?.avatars[0]?.url ||
                "https://ik.imagekit.io/aalam855/bazario/assets/seller-avatar.avif?updatedAt=1753593579816"
              }
              alt={row.original.shop?.name}
              width={40}
              height={40}
              className="w-12 h-12 rounded-full object-cover"
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
          <Link
            href={`${process.env.NEXT_PUBLIC_SELLER_UI_LINK}/shop/${row?.original?.id}`}
          >
            <span className="text-blue-500 hover:underline cursor-pointer">
              {row.original.shop.name}
            </span>
          </Link>
        ),
      },
      {
        accessorKey: "shop.address",
        header: "Address",
        cell: ({ row }: any) => (
          <span className="text-purple-400 cursor-pointer">
            {row.original.shop.address}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }: any) => (
          <span className="text-gray-400">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: allSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = allSellers.map(
      (seller) =>
        `${seller.name},${seller.email},${seller.shop?.name || "N/A"},${
          seller.shop?.address || "N/A"
        },${new Date(seller.createdAt).toLocaleDateString()}`
    );
    const blob = new Blob(
      [`Name,Email,Shop Name,Shop Address,Joined Date\n${csvData.join("\n")}`],
      { type: "text/csv;charset=utf-8" }
    );
    saveAs(blob, `sellers-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold tracking-wide">All Users</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4">
        <BreadCrumbs title="All Users" />
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="border border-gray-800 rounded-md">
        <table className="w-full">
          <thead className="bg-gray-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 text-left">
                    {flexRender(
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page == 1}
        >
          Previous
        </button>

        <span className="text-gray-300">
          Page {page} of {totalPages || 1}
        </span>

        <button
          className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Ban Confirmation Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-[#1e293b] rounded-2xl shadow-lg w-[90%] max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">Ban User</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-semibold">
                  ▲ Important:{" "}
                </span>
                Are you sure you want to ban{" "}
                <span className="text-red-400 font-medium">
                  {selectedUser.name}
                </span>
                ? This action can be reverted later.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 flex items-center justify-center gap-2 rounded-sm bg-gray-700 hover:bg-gray-600 text-sm text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => banUserMutation.mutate(selectedUser.id)}
                className="px-2 py-1 flex items-center justify-center gap-2 rounded-sm bg-red-600 hover:bg-red-700 text-sm text-white"
              >
                <Ban size={16} /> Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersPage;
