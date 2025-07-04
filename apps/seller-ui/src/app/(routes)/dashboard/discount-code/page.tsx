"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DeleteDiscountCodeModal from "apps/seller-ui/src/shared/components/modals/deleteDiscountCodeModal";
import { AxiosError } from "axios";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import Input from "packages/components/input";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const DiscountCode = () => {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();

  const { data: discountCodes, isLoading } = useQuery({
    queryKey: ["shop-discount"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get("/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: 10,
      discountCode: "",
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await getAxiosInstance("product").post("/create-discount-code", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discount"] });
      reset();
      setShowModal(false);
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
      await getAxiosInstance("product").delete(
        `/delete-discount-code/${discountId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discount"] });
      setShowDeleteModal(false);
    },
  });

  const handleDeleteClick = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create 8 discount codes");
      return;
    }
    createDiscountCodeMutation.mutate(data);
  };
  return (
    <div className="w-full min-h-screen p-8">
      <div>
        <div className="flex justify-between ite mb-1">
          <h2 className="text-white text-2xl font-semibold">Discount</h2>
          <button
            className="bg-blue-600 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} /> Create Discount
          </button>
        </div>
        <div className="flex items-center text-white">
          <Link href={"/dashboard"} className="text-[#80deea] cursor-pointer">
            Dashboard
          </Link>
          <ChevronRight size={20} className="opacity-[.8]" />
          <span>Discount Code</span>
        </div>
        <div className="bg-gray-900 mt-8 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg text-white font-semibold mb-4">
            Your Discount codes
          </h3>
          {isLoading ? (
            <p className="text-gray-400">Loging Discount codes...</p>
          ) : (
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((discount: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-gray-800 transition-all"
                  >
                    <td className="p-3">{discount?.public_name}</td>
                    <td className="p-3 capitalize">
                      {discount?.discountType === "percentage"
                        ? "Percentage (%)"
                        : "Flat ($)"}
                    </td>
                    <td className="p-3">
                      {discount?.discountType === "percentage"
                        ? `${discount?.discountValue}%`
                        : `$${discount?.discountValue}`}
                    </td>
                    <td className="p-3">{discount?.discountCode}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteClick(discount)}
                        className="text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && discountCodes?.length === 0 && (
            <p className="text-gray-400 text-center block w-full pt-4">
              No Discount Code Available!
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Create discound code</h3>
              <button
                className="text-white"
                onClick={() => setShowModal(false)}
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4">
                <Input
                  label="Title (Public Name)"
                  {...register("public_name", {
                    required: "title is required",
                  })}
                />
                {errors.public_name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.public_name.message as string}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 outline-none bg-transparent py-2 text-white font-semibold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount ($)</option>
                    </select>
                  )}
                />
              </div>

              <div className="mt-3">
                <Input
                  label="Discount Value"
                  type="number"
                  {...register("discountValue", {
                    required: "discount value is required",
                    min: 1,
                  })}
                />
                {errors.discountValue && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.discountValue.message as string}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <Input
                  label="Discount Code"
                  {...register("discountCode", {
                    required: "discount Code is required",
                  })}
                />
                {errors.discountCode && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.discountCode.message as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createDiscountCodeMutation.isPending}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={18} />{" "}
                {createDiscountCodeMutation.isPending
                  ? "Creating..."
                  : "Create"}
              </button>
              {createDiscountCodeMutation.isError && (
                <p className="text-xs text-red-500 mt-1">
                  {(
                    createDiscountCodeMutation.error as AxiosError<{
                      message: string;
                    }>
                  )?.response?.data?.message ||
                    "Something went wrong while creating discount code"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() =>
            deleteDiscountCodeMutation.mutate(selectedDiscount?.id)
          }
        />
      )}
    </div>
  );
};

export default DiscountCode;
