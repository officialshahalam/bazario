"use client";
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import ImagePlaceholder from "apps/seller-ui/src/shared/components/imagePlaceholder";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import { ChevronRight, Wand, X } from "lucide-react";
import Link from "next/link";
import ColorSelector from "packages/components/colorSelector";
import CustomProperties from "packages/components/customProperties";
import CustomSpecifications from "packages/components/customSpecifications";
import Input from "packages/components/input";
import dynamic from "next/dynamic";
import SizeSelector from "packages/components/sizeSelector";
import Image from "next/image";
import { enhancements } from "packages/utills/AIEnhancements";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BreadCrumbs from "apps/seller-ui/src/shared/components/breadCrumbs/BreadCrumbs";
const RichTextEditor = dynamic(
  () => import("packages/components/richTextEditor"),
  {
    ssr: false,
  }
);

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const CreateProducts = () => {
  const [openImageModel, setOpenImageModel] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [pictureUploading, setPictureUploading] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const router = useRouter();
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await getAxiosInstance("product").get("/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes, isLoading: disCountLoading } = useQuery({
    queryKey: ["shop-discount"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get("/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await getAxiosInstance("product").post("/create-product", data);
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    try {
      setPictureUploading(true);
      const fileName = await convertFileToBase64(file);
      const response = await getAxiosInstance("product").post(
        "upload-product-image",
        { fileName }
      );
      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };
      const updateImages = [...images];
      updateImages[index] = uploadedImage;
      if (index === images.length - 1 && images.length < 8) {
        updateImages.push(null);
      }
      setImages(updateImages);
      setValue("images", updateImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        //delete our picture
        await getAxiosInstance("product").delete("delete-product-image", {
          data: {
            fileId: imageToDelete.fileId!,
          },
        });
      }
      updatedImages.splice(index, 1);
      // null place holder
      if (updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);
    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log("Error while applying transformation", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = () => {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    >
      <h2 className="text-2xl text-white font-Poppings font-semibold py-2">
        Create Product
      </h2>
      <BreadCrumbs title="create product" />

      {/* content Layout */}
      <div className="w-full py-4 flex gap-6">
        {/* left side i.e image upload section */}
        <div className="md:w-[35%]">
          {images.length > 0 && (
            <ImagePlaceholder
              setOpenImageModel={setOpenImageModel}
              size="765 x 850"
              images={images}
              small={false}
              index={0}
              pictureUploading={pictureUploading}
              setSelectedImage={setSelectedImage}
              onImageChange={handleImageChange}
              onRemove={handleRemove}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                key={index}
                setOpenImageModel={setOpenImageModel}
                size="765 x 850"
                images={images}
                small
                index={index + 1}
                pictureUploading={pictureUploading}
                setSelectedImage={setSelectedImage}
                onImageChange={handleImageChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>

        {/* Right side form input */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* product title input */}
            <div className="w-1/2">
              <div>
                <Input
                  label="Product Title"
                  placeholder="Enter Product Title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.title.message as string}
                  </p>
                )}
              </div>
              {/* description */}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words"
                  placeholder="Entr product description for quick view"
                  {...register("short_description", {
                    required: "Title is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current : ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.short_description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>
              {/* tags */}
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apply,flagship"
                  {...register("tags", {
                    required: "Seperate related products tags with a coma,",
                  })}
                />
                {errors.tags && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>
              {/* warrenty */}
              <div className="mt-2">
                <Input
                  label="Warrenty *"
                  placeholder="1 Year / No warrenty"
                  {...register("warrenty", {
                    required: "Warrenty is required",
                  })}
                />
                {errors.warrenty && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.warrenty.message as string}
                  </p>
                )}
              </div>
              {/* Slags */}
              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product-slug"
                  {...register("slug", {
                    required: "Slug is required",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Invalid Slug formate! use only lowercase letters,numbers",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must me at least 3 character long",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug can not be longer than 50 character",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>
              {/* brand */}
              <div className="mt-2">
                <Input
                  label="Brand *"
                  placeholder="apply"
                  {...register("brand", {
                    required: "Brand is required",
                  })}
                />
                {errors.brand && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>
              {/* color plate */}
              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full border border-gray-700 outline-none bg-transparent py-2 px-1 rounded-lg"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors?.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="w-1/2">
              <label className="block font-semibold text-gray-300">
                Category *
              </label>
              <div>
                {isLoading ? (
                  <p className="text-gray-400">Loging categories...</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load category!</p>
                ) : (
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full border border-gray-700 outline-none bg-transparent py-2 rounded-lg mt-1 "
                      >
                        {" "}
                        <option value="" className="bg-black py-1">
                          Select Category
                        </option>
                        {categories?.map((category: string, index: number) => (
                          <option
                            value={category}
                            key={index}
                            className="bg-black py-1"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.category.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300">
                  Subcategory *
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "Sub Category is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border border-gray-700 outline-none bg-transparent py-2 rounded-lg mt-1 "
                    >
                      {" "}
                      <option value="" className="bg-black py-1">
                        Select Subcategory
                      </option>
                      {subCategories?.map(
                        (subCategory: string, index: number) => (
                          <option
                            value={subCategory}
                            key={index}
                            className="bg-black py-1"
                          >
                            {subCategory}
                          </option>
                        )
                      )}
                    </select>
                  )}
                />
                {errors.sub_category && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.sub_category.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 20 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed Description is required",
                    validate: (value) => {
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 20 ||
                        "Desctiption must be at least 20 words"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Video URL"
                  placeholder="https://www.youtube.com/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value: /^https:\/\/(www\.)?youtube\.com\/.+$/,
                      message:
                        "Invalid YouTube embed URL! Use format: https://www.youtube.com/embed/xyz123",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.video_url.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="20$"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Price must be at least 1",
                    },
                    validate: (value) =>
                      !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price"
                  placeholder="15$"
                  {...register("sale_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Price must be at least 1",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice) {
                        return "Sales Price must be less than Regular Price";
                      }
                      return true;
                    },
                  })}
                />
                {errors.regular_price && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required!",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Stock must be at least 1",
                    },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed!";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number!";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>

              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Code (Optional)
                </label>
                {disCountLoading ? (
                  <p className="text-gray-400">Loading Discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any, index: number) => (
                      <button
                        key={index}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          watch("discountCodes")?.includes(code.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-700"
                        }`}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];
                          const updateSelection = currentSelection?.includes(
                            code.id
                          )
                            ? currentSelection?.filter(
                                (id: string) => id !== code.id
                              )
                            : [...currentSelection, code.id];
                          setValue("discountCodes", updateSelection);
                        }}
                      >
                        {code?.public_name} ({code?.discountValue}{" "}
                        {code.discountType === "percentage" ? "%" : "$"})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        {openImageModel && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-[450px] text-white">
              <div className="flex justify-between items-center pb-3 mb-4">
                <h2 className="text-lg font-semibold">Enhance Product Image</h2>
                <X
                  size={22}
                  className="cursor-pointer"
                  onClick={() => setOpenImageModel(!openImageModel)}
                />
              </div>
              <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
                <Image src={selectedImage} alt="preview" layout="fill" />
              </div>
              {selectedImage && (
                <div className="mt-4 space-y-2">
                  <h2 className="text-white text-sm font-semibold">
                    AI Enhancements
                  </h2>
                  <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
                    {enhancements.map(({ label, effect }, index) => (
                      <button
                        key={index}
                        className={`p-2 rounded-md flex items-center ${
                          activeEffect === effect
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => applyTransformation(effect)}
                        disabled={processing}
                      >
                        <Wand size={18} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            Save Draft
          </button>
        )}
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          type="submit"
        >
          {loading ? "Creating" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CreateProducts;
