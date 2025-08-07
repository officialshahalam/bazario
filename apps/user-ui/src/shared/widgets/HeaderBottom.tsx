"use client";
import {
  AlignLeft,
  ChevronDown,
  ChevronRight,
  Heart,
  ShoppingCart,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { navItem } from "../../configs/constants";
import Link from "next/link";
import useUser from "../../hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../store";
import { getAxiosInstance } from "packages/utills/axios/getAxios";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("");
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const { user, isLoading } = useUser();
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getAxiosInstance("product").get("/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });
  //track scrole position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/* all dropdown */}
        <div
          className={`w-[260px] ${
            isSticky && "-mb-0"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Department</span>
          </div>
          <ChevronDown color="white" />
        </div>
        {/* Dropdown menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } w-[260px] h-[300px] overflow-y-auto bg-[#d0d0d0] z-10`}
          >
            {data?.categories?.length > 0 ? (
              data.categories?.map((cat: string, i: number) => {
                const hasSub = data.subCategories?.[cat]?.length > 0;
                const isExpanded = expandedCategory === cat;

                return (
                  <div key={i} className="relative">
                    <button
                      onClick={() => {
                        if (hasSub) {
                          setExpandedCategory((prev) =>
                            prev === cat ? null : cat
                          );
                        } else {
                          setShow(false);
                          window.location.href = `/products/category=${encodeURIComponent(
                            cat
                          )}`;
                        }
                      }}
                      className="w-full flex justify-between items-center px-4 py-2"
                    >
                      <span>{cat}</span>
                      {hasSub &&
                        (isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        ))}
                    </button>
                    {isExpanded && hasSub && (
                      <div className="pl-4 bg-[#d0d0d0] border-t">
                        {data.subCategories[cat].map(
                          (sub: string, j: number) => (
                            <Link
                              key={j}
                              href={`/products?category=${encodeURIComponent(
                                cat
                              )}`}
                              className="block px-4 py-2 text-sm text-gray-500"
                              onClick={()=>setShow(false)}
                            >{sub}</Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="px-5 py-4 text-sm text-gray-500">
                No category Found
              </p>
            )}
          </div>
        )}
        {/* navigation links */}
        <div className="flex items-center">
          {navItem.map((i: NavItemTypes, index: number) => (
            <Link
              href={i.href}
              key={index}
              className="px-5 font-medium text-lg"
            >
              {i.title}
            </Link>
          ))}
        </div>
        <div>
          {isSticky && (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                {!isLoading && user ? (
                  <>
                    <Link
                      href={"/profile"}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    >
                      <User />
                    </Link>
                    <Link href={"/profile"}>
                      <span className="block font-medium">Hello,</span>
                      <span className="font-semibold">
                        {user?.name?.split(" ")[0]}
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={"/login"}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    >
                      <User />
                    </Link>
                    <Link href={"/login"}>
                      <span className="block font-medium">Hello,</span>
                      <span className="font-semibold">
                        {isLoading ? "..." : "Sign In"}
                      </span>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-5">
                <Link href={"/wishlist"} className="relative">
                  <Heart />
                  <div className="h-6 w-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] ">
                    <span className="text-white font-medium text-sm">
                      {wishlist?.length}
                    </span>
                  </div>
                </Link>
                <Link href={"/cart"} className="relative">
                  <ShoppingCart />
                  <div className="h-6 w-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">
                      {cart?.length}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
