"use client";

import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  Star,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ProductCard from "../cards/ProductCard";
import { getAxiosInstance } from "packages/utills/axios/getAxios";

const TABS = ["Products", "Offers", "Reviews"];

const SellerProfile = ({
  shop,
  followersCount,
}: {
  shop: any;
  followersCount: number;
}) => {
  const [activeTab, setActiveTab] = useState("Products");
  const [isLoading, setIsLoading] = useState(false);
  const [isEventsLoading, SetIsEventsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  console.log('product',products)
  console.log('events',events)

  const fetchProducts = async (shopId: string) => {
    try {
      setIsLoading(true);
      const res = await getAxiosInstance("seller").get(
        `/get-shop-products/${shopId}?page=1&limit=10`
      );
      setProducts(res?.data?.products);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchEvents = async (shopId: string) => {
    try {
      SetIsEventsLoading(true);
      const res = await getAxiosInstance("seller").get(
        `/get-shop-events/${shopId}?page=1&limit=10`
      );
      setEvents(res?.data?.events);
    } catch (error) {
      console.log(error);
    } finally {
      SetIsEventsLoading(false);
    }
  };

  useEffect(() => {
    if (shop?.id) {
      fetchProducts(shop?.id);
      fetchEvents(shop?.id);
    }
  }, [shop?.id]);

  return (
    <div>
      {/* Cover Image */}
      <div className="relative w-full flex justify-center">
        <Image
          src={
            shop?.coverBanner ||
            "https://ik.imagekit.io/aalam855/bazario/assets/hero-bg.avif?updatedAt=1751187560434"
          }
          alt="Seller Cover"
          className="w-full h-[400px] object-cover"
          width={1200}
          height={300}
        />
      </div>

      {/* Seller Info Section */}
      <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex gap-5">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-1">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-[100px] h-[100px] rounded-full border-4">
              <Image
                src={
                  shop?.avatar ||
                  "https://ik.imagekit.io/aalam855/bazario/assets/seller-avatar.avif?updatedAt=1753593579816"
                }
                alt="Seller Avatar"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>

            <div className="flex-1 w-full">
              <h1 className="text-2xl font-semibold text-gray-50">
                {shop?.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {shop?.bio || "No bio available."}
              </p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-blue-400 gap-1">
                  <Star fill="#60a5fa" size={18} />{" "}
                  <span>{shop?.ratings || 4.5}</span>
                </div>
                <div className="flex items-center text-gray-400 gap-1">
                  <Users size={18} /> <span>{followersCount} Followers</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-gray-400">
                <Clock size={18} />
                <span>{shop?.opening_hours || "Mon - Sat: 9 AM - 6 PM"}</span>
              </div>

              <div className="flex items-center gap-2 mt-3 text-gray-400">
                <MapPin size={18} />
                <span>{shop?.address || "No address provided"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
          <h2 className="text-xl font-semibold text-slate-100">Shop Details</h2>

          <div className="flex items-center gap-3 mt-3 text-slate-400">
            <Calendar size={18} />
            <span>
              Joined At:{" "}
              {new Intl.DateTimeFormat("en-GB").format(
                new Date(shop?.createdAt)
              )}
            </span>
          </div>

          {shop?.website && (
            <div className="flex items-center gap-3 mt-3 text-slate-400">
              <Globe size={18} />

              <Link
                href={shop?.website}
                className="hover:underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shop?.website}
              </Link>
            </div>
          )}

          {shop?.socialLinks && shop?.socialLinks.length > 0 && (
            <div className="mt-3">
              <h3 className="text-slate-400 text-lg font-medium">Follow Us:</h3>
              <div className="flex gap-3 mt-2">
                {shop?.socialLinks?.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-[.9]"
                  >
                    {link.type === "youtube" && <Youtube />}
                    {link.type === "x" && <Twitter />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-600">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-lg font-semibold ${
                activeTab === tab
                  ? "text-slate-500 border-b-2 border-blue-600"
                  : "text-slate-200"
              } transition`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg my-4 text-slate-400">
          {activeTab === "Products" && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {isLoading && (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[250px] bg-gray-600 animate-pulse rounded-xl"
                    ></div>
                  ))}
                </>
              )}
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products?.length === 0 && (
                <p className="py-2">No products available yet!</p>
              )}
            </div>
          )}

          {activeTab === "Offers" && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {isEventsLoading && (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[250px] bg-gray-600 animate-pulse rounded-xl"
                    ></div>
                  ))}
                </>
              )}
              {events?.map((product: any) => (
                <ProductCard
                  isEvent={true}
                  key={product.id}
                  product={product}
                />
              ))}
              {products?.length === 0 && (
                <p className="py-2">No offers available yet!</p>
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div>
              <p className="text-center py-5">No Reviews available yet!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
