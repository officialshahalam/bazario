"use client";
import React from "react";
import Hero from "../shared/modules/Hero";
import SectionTitle from "../shared/components/section/SectionTitle";
import { useQuery } from "@tanstack/react-query";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import ProductCard from "../shared/components/cards/ProductCard";
import ShopCard from "../shared/components/cards/ShopCard";

const Home = () => {
  const { data: products, isLoading: productLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get(
        "/get-all-products?page=1&limit=10"
      );
      return res.data?.products;
    },
    staleTime: 1000 * 60 * 2,
  });
  const { data: latestProducts, isLoading: latestProductLoading } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get(
        "/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data?.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get("/top-shops");
      return res.data?.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get(
        "/get-all-events?page=1&limit=10"
      );
      return res.data?.events;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] py-14 m-auto">
        {/* *************************Top Offers********************** */}
        <div className="my-8 block">
          <SectionTitle title="Top Offers" />
        </div>
        {offersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : offers?.length === 0 ? (
          <p className="text-center">No Offers Available Yet!</p>
        ) : (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {offers?.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={true} />
            ))}
          </div>
        )}
        {/* *************************Suggested Products********************** */}
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {productLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : products?.length === 0 ? (
          <p className="text-center">No Products Available Yet!</p>
        ) : (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* *************************Latest Products********************** */}
        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>
        {latestProductLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : latestProducts?.length === 0 ? (
          <p className="text-center">No Latest Products Available Yet!</p>
        ) : (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* *************************Top Shops********************** */}
        <div className="my-8 block">
          <SectionTitle title="Top Shops" />
        </div>
        {shopLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : shops?.length === 0 ? (
          <p className="text-center">No Shops Available Yet!</p>
        ) : (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {shops?.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
