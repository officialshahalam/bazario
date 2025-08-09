import { useMutation } from "@tanstack/react-query";
import { shopCategories } from "../../../configs/constants";
import React from "react";
import { useForm } from "react-hook-form";
import { getAxiosInstance } from "packages/utills/axios/getAxios";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await getAxiosInstance("auth").post(
        "/create-shop",
        data
      );

      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    await shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-2xl font-Poppins font-semibold text-black text-center">
          Create New Shop
        </h1>
        <label className="block text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          placeholder="shop name"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("name", {
            required: "Name is required",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}
        <label className="block text-gray-700 mb-1">
          Bio (Max 100 words) *
        </label>
        <textarea
          cols={10}
          rows={3}
          placeholder="shop bio"
          className="w-full p-2 border border-gray-300 outline-0 !rounded-[4px] mb-1"
          {...register("bio", {
            required: "Shop bio is required",
            validate: (value) =>
              countWords(value) <= 100 || "Bio can not exceed 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}
        <label className="block text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          placeholder="Shop location"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("address", {
            required: "Shop address is required",
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <input
          type="text"
          placeholder="eg., Mon-Fri 9AM-6PM"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("opening_hours", {
            required: "Opening hours are required",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Website</label>
        <input
          type="text"
          placeholder="eg.,http://shahalam-portfolio.vercel.app"
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("website", {
            pattern: {
              value:
                /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-z]{2,}([\/\w .-]*)*\/?$/,
              message: "Invalid url",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Category</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
          {...register("category", {
            required: "Category is required",
          })}
        >
          <option value="">Select your country</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}
        <button
          type="submit"
          className="w-full text-lg mt-4 cursor-pointer bg-blue-600 text-white py-2 rounded-lg"
          disabled={shopCreateMutation.isPending}
        >
          {shopCreateMutation.isPending ? "Creating ..." : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
