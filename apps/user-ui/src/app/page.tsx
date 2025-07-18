"use client";
import React from "react";
import Hero from "../shared/modules/Hero";
import SectionTitle from "../shared/components/section/SectionTitle";
import { useQuery } from "@tanstack/react-query";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import ProductCard from "../shared/components/cards/ProductCard";

const Home = () => {
  const {
    data: products,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get(
        "/get-all-products?page=1&limit=10"
      );
      return res.data?.products;
    },
    staleTime: 1000 * 60 * 2,
  });
  const { data: latestProducts } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get(
        "/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data?.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}
        {
          !isLoading && !isError &&(
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-5">
              {
                products?.map((product:any)=>(
                  <ProductCard key={product.id} product={product}/>
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Home;
