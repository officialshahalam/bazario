"use client";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  ShoppingCart,
  WalletMinimal,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Ratings from "../components/ratings/Ratings";
import Link from "next/link";
import { useStore } from "../../store";
import useUser from "../../hooks/useUser";
import useLocationTracking from "../../hooks/useLocationTracking";
import useDeviceTracking from "../../hooks/useDeviceTracking";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import ProductCard from "../components/cards/ProductCard";
import { useRouter } from "next/navigation";
import { isProtected } from "packages/utills/protected";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || ""
  );
  const [isSizeSelected, setIsSizeSelected] = useState(
    productDetails?.sizes?.[0] || ""
  );

  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([
    productDetails?.sale_price,
    1199,
  ]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails.id
  );

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const router = useRouter();

  const discountPercentage = Math.round(
    ((productDetails?.regular_price - productDetails?.sale_price) /
      productDetails?.regular_price) *
      100
  );

  const fetchFilterProduct = async () => {
    try {
      const query = new URLSearchParams();
      query.set("priceRange", priceRange.join(","));
      query.set("page", "1");
      query.set("limit", "5");
      const res = await getAxiosInstance("product").get(
        `get-filtered-products?${query.toString()}`
      );
      setRecommendedProducts(res?.data?.products);
    } catch (error) {
      console.log("Failed to fetch filtered products");
    }
  };

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

  const handleChat = async () => {
    if (isLoading) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await getAxiosInstance("chatting").post(
        "/create-user-conversation-group",
        { sellerId: productDetails?.shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res?.data?.conversation?.id}`);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterProduct();
  }, [priceRange]);

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
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
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
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
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
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
          <h1 className="text-xl mb-2 font-medium">{productDetails?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={productDetails?.rating} />
              <Link href={"#reviews"} className="text-blue-500 hover:underline">
                (0 Reviews)
              </Link>
            </div>
            <div>
              <Heart
                size={25}
                fill={isWishlisted ? "red" : "transparent"}
                color={isWishlisted ? "transparent" : "#777"}
                onClick={() =>
                  isWishlisted
                    ? removeFromWishlist(
                        productDetails?.id,
                        user,
                        location,
                        deviceInfo
                      )
                    : addToWishlist(
                        {
                          ...productDetails,
                          quantity,
                          selectedOptions: {
                            color: isSelected,
                            size: isSizeSelected,
                          },
                        },
                        user,
                        location,
                        deviceInfo
                      )
                }
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500">
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
            <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-200">
              <span className="text-gray-400 line-through">
                ${productDetails?.regular_price}
              </span>
              <span className="text-gray-500">{discountPercentage}%</span>
            </div>
            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
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
                              className={`w-8 h-8 cursor-pointer rounded-full border-2 border-gray-300 transition-all ${
                                isSelected === color
                                  ? "border-blue-500 scale-110 shadow-md"
                                  : ""
                              }`}
                              onClick={() => setIsSelected(color)}
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
                              className={`w-8 h-8 cursor-pointer rounded-md transition-all ${
                                isSizeSelected === size
                                  ? "bg-gray-800 text-white"
                                  : "bg-gray-300 text-black"
                              }`}
                              onClick={() => setIsSizeSelected(size)}
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
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md">
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 rounded-l-lg"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 bg-gray-100 py-1">{quantity}</span>
                  <button
                    className="px-3 py-1 cursor-pointer bg-gray-300 hover:bg-gray-400 rounded-r-lg"
                    onClick={() =>
                      setQuantity((prev) => Math.min(10, prev + 1))
                    }
                  >
                    +
                  </button>
                </div>
                {productDetails?.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
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
              <button
                disabled={isInCart}
                onClick={() => {
                  addToCart(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: isSelected,
                        size: isSizeSelected,
                      },
                    },
                    user,
                    location,
                    deviceInfo
                  );
                }}
                className={`flex items-center mt-6 gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition-all ${
                  isInCart ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <ShoppingCart size={18} />
                Add to cart
              </button>
            </div>
          </div>
        </div>
        {/* right */}
        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-3 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Delivery Option</span>
            <div className="flex items-center text-gray-600 gap-1">
              <MapPin size={18} className="ml-[-5px]" />
              <span className="text-lg font-normal">
                Chandigarh, India
                {/* {location?.city + ", " + location?.country} */}
              </span>
            </div>
          </div>
          <div className="mb-1 px-3 pb-1 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Return & Warranty</span>

            <div className="flex items-center text-gray-600 gap-1 mt-1">
              <Package size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">7 Days Returns</span>
            </div>

            <div className="flex items-center py-2 text-gray-600 gap-1">
              <WalletMinimal size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">
                Warranty not available
              </span>
            </div>
          </div>

          <div className="px-3 py-1">
            <div className="w-[85%] rounded-lg">
              {/* Sold by section */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600 font-light">
                    Sold by
                  </span>
                  <span className="block max-w-[150px] truncate font-medium text-lg">
                    {productDetails?.shops?.name}
                  </span>
                </div>
                <Link
                  href={`#`}
                  onClick={() => handleChat()}
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <MessageSquareText size={20} />
                  Chat Now
                </Link>
              </div>
              {/* Seller performance stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-t-gray-200 mt-8 pt-4">
                <div>
                  <p className="text-[12px] text-gray-500">
                    Positive Seller Ratings
                  </p>
                  <p className="text-lg font-semibold">88%</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Ship on Time</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">
                    Chat Response Rate
                  </p>
                  <p className="text-lg font-semibold">95%</p>
                </div>
              </div>
              {/* Go to Store */}
              <div className="text-center mt-4 border-t border-t-gray-200 pt-2">
                <Link
                  href={`/shop/${productDetails?.shops?.id}`}
                  className="text-blue-500 font-medium text-sm hover:underline"
                >
                  GO TO STORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Product details of {productDetails?.title}
          </h3>
          <div
            className="prose prose-sm text-slate-700 max-w-none"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailed_description,
            }}
          />
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="bg-white min-h-[50vh] h-full mt-5 p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">
            Ratings & Reviews of {productDetails?.title}
          </h3>
          <div className="flex flex-col items-center justify-center h-[30vh]">
            <p className="text-gray-500 text-center">
              No reviews available yet!
            </p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Be the first to review
            </button>
          </div>
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="w-full h-full my-5 p-5 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">You may also like</h3>
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recommendedProducts?.map((i: any) => (
              <ProductCard key={i.id} product={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
