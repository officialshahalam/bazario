"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React, { useEffect, useState } from "react";
import { shopCategories, countries } from "apps/user-ui/src/configs/constants";
import ShopCard from "apps/user-ui/src/shared/components/cards/ShopCard";

const Page = () => {
  const router = useRouter();

  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }
    if (selectedCountries.length > 0) {
      params.set("countries", selectedCountries.join(","));
    }
    params.set("page", page.toString());
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }
      if (selectedCountries.length > 0) {
        query.set("countries", selectedCountries.join(","));
      }
      query.set("page", page.toString());
      query.set("limit", "12");
      const res = await getAxiosInstance("product").get(
        `/get-filtered-shops?${query.toString()}`
      );
      setShops(res?.data?.shops);
      setTotalPages(res?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Failed to fetch filtered products:", error);
    } finally {
      setIsShopLoading(false);
    }
  };

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleCountry = (label: string) => {
    setSelectedCountries((prev) =>
      prev.includes(label)
        ? prev.filter((cou) => cou !== label)
        : [...prev, label]
    );
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [selectedCategories, page]);

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-[50px]">
          <h1 className="md:pt-10 font-medium text-4xl leading-[4px] mb-4 font-jost">
            All Shops
          </h1>
          <Link href={"/"} className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full" />
          <span className="text-[#55585b]">All Shops</span>
        </div>
        <div className="w-full flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow">
            {/* category filetr */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-state-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 my-3">
              {shopCategories?.map((category: any) => (
                <li
                  key={category?.value}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className="accent-blue-600"
                    />
                    {category.label}
                  </label>
                </li>
              ))}
            </ul>
            {/* countries filter */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-state-300 pb-1">
              Countries
            </h3>
            <ul className="space-y-2 my-3">
              {countries?.map((country: any) => (
                <li
                  key={country?.code}
                  className="flex items-center justify-between"
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country.name)}
                      onChange={() => toggleCountry(country.name)}
                      className="accent-blue-600"
                    />
                    {country.name}
                  </label>
                </li>
              ))}
            </ul>
          </aside>
          {/* Shop grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isShopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p>No Shop found!</p>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 !rounded border border-gray-200 text-sm ${
                      page === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
