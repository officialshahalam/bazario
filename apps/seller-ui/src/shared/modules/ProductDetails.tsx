"use client";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  WalletMinimal,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import Ratings from "../components/ratings/Ratings";
import Link from "next/link";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const discountPercentage = Math.round(
    ((productDetails?.regular_price - productDetails?.sale_price) /
      productDetails?.regular_price) *
      100
  );

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(productDetails?.images[currentIndex - 1]);
    }
  };

  const nextImage = () => {
    if (currentIndex < productDetails?.images?.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(productDetails?.images[currentIndex + 1]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black py-5">
      <div className="w-[90%] lg:w-[80%] mx-auto overflow-hidden my-5">
        <h1 className="text-4xl text-gray-100 font-semibold">Product Details</h1>
      </div>
      <div className="w-[90%] bg-gray-900 lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        {/* left */}
        <div className="p-4">
          <div className="relative w-full">
            <Image
              src={currentImage}
              alt="Product image"
              width={1200}
              height={1200}
            />
          </div>
          {/* Thumbnail image array */}
          <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 bg-black text-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto">
              {productDetails?.images?.map((img: any, index: number) => (
                <Image
                  key={index}
                  src={
                    img?.url ||
                    "https://ik.imagekit.io/aalam855/bazario/product/product-1751475309070_ctmAGJ1zO.jpg?updatedAt=1751475311344"
                  }
                  alt="Thumbnail"
                  width={60}
                  height={60}
                  className={`cursor-pointer border rounded-lg p-1 ${
                    img === currentImage ? "border-blue-500" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 bg-black text-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentIndex === productDetails?.images?.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
        {/* middle */}
        <div className="p-4">
          <h1 className="text-xl text-gray-100 mb-2 font-medium">{productDetails?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings
                rating={
                  productDetails?.ratings !== 0 ? productDetails?.ratings : 4.5
                }
              />
              <Link href={"#reviews"} className="text-blue-500 hover:underline">
                (0 Reviews)
              </Link>
            </div>
          </div>
          <div className="py-2 border-b border-gray-600">
            <span className="text-gray-400">
              Brand:{" "}
              <span className="text-blue-500">
                {productDetails?.brand || "No Brand"}
              </span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">
              ${productDetails?.sale_price}
            </span>
            <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-600">
              <span className="text-gray-400 line-through">
                ${productDetails?.regular_price}
              </span>
              <span className="text-gray-500">{discountPercentage}%</span>
            </div>
            <div className="mt-2">
              <div className="flex flex-col text-gray-100 md:flex-row items-end gap-5 mt-4">
                {/* color options */}
                {productDetails?.colors?.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.colors?.map(
                        (color: string, index: number) => {
                          return (
                            <button
                              key={index}
                              className={`w-8 h-8 cursor-pointer rounded-full border-2 border-gray-300 transition-all scale-110 shadow-md`}
                              style={{ backgroundColor: color }}
                            />
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Size options */}
                {productDetails?.sizes?.length > 0 && (
                  <div>
                    <strong>Sizes:</strong>
                    <div className="flex gap-2 mt-1">
                      {productDetails?.sizes?.map(
                        (size: string, index: number) => {
                          return (
                            <button
                              key={index}
                              className={`w-8 h-8 cursor-pointer rounded-md transition-all bg-gray-500 text-white`}
                              style={{ backgroundColor: size }}
                            >
                              {size}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
                {/* stock */}
                {productDetails?.stock > 0 ? (
                  <span className="text-green-600 text-xl font-semibold">
                    In Stock{" "}
                    <span className="text-gray-500 font-medium">
                      (Stock {productDetails?.stock})
                    </span>
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* right */}
        <div className="bg-gray-950 -mt-6">
          <div className="mb-1 p-3 border-b border-b-gray-600">
            <span className="text-sm text-gray-300">Delivery Option</span>
            <div className="flex items-center text-gray-300 gap-1">
              <MapPin size={18} className="ml-[-5px]" />
              <span className="text-lg font-normal">
                Chandigarh, India
                {/* {location?.city + ", " + location?.country} */}
              </span>
            </div>
          </div>
          <div className="mb-1 px-3 pb-1 border-b border-b-gray-600">
            <span className="text-sm text-gray-300">Return & Warranty</span>
            <div className="flex items-center text-gray-300 gap-1 mt-1">
              <Package size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">7 Days Returns</span>
            </div>
            <div className="flex items-center py-2 text-gray-300 gap-1">
              <WalletMinimal size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">
                Warranty not available
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 px-3 mb-2">
              <div>
                <p className="text-[12px] text-gray-300">
                  Positive Seller Ratings
                </p>
                <p className="text-lg text-gray-400 font-semibold">88%</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-500">Ship on Time</p>
                <p className="text-lg text-gray-400 font-semibold">100%</p>
              </div>
              <div>
                <p className="text-[12px] text-gray-300">Chat Response Rate</p>
                <p className="text-lg text-gray-400 font-semibold">95%</p>
              </div>
            </div>
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-5">
        <div className="bg-gray-900 h-full p-5">
          <h3 className="text-lg text-gray-100 font-semibold">
            Product details of {productDetails?.title}
          </h3>
          <div
            className="prose prose-sm text-gray-400 max-w-none"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailed_description,
            }}
          />
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="bg-gray-900 h-full mt-5 p-5 rounded-lg shadow-sm">
          <h3 className="text-lg text-gray-100 font-semibold mb-6">
            Ratings & Reviews of {productDetails?.title}
          </h3>
          <p className="text-gray-300">No reviews yet!</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
