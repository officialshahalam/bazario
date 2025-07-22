"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Search, ShoppingCart, User, Heart } from "lucide-react";
import HeaderBottom from "./HeaderBottom";
import useUser from "../../hooks/useUser";
import { useStore } from "../../store";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import Image from "next/image";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleSearchClik = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSuggestions(true);
    try {
      const res = await getAxiosInstance("product").get(
        `/search-product?=${encodeURIComponent(searchQuery)}`
      );
      setSuggestions(res.data.product.slice(0, 10));
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex justify-between items-center">
        <div>
          <Link href={"/"}>
            <span className="text-3xl font-semibold">Bazario</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489ff] outline-none h-[55px]"
          />
          <div
            onClick={handleSearchClik}
            className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489ff] absolute top-0 right-0"
          >
            <Search color="#fff" />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div >
            {isLoading ? (
              <div className="spinner"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={"/profile"}
                  className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                >
                  <Image
                    src={user?.avatars[0]?.url}
                    alt={"User"}
                    height={50}
                    width={50}
                    style={{ borderRadius: "100%" }}
                  />
                </Link>
                <Link href={"/profile"}>
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Link href={"/wishlist"} className="relative">
              <Heart />
              <div className="h-6 w-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] ">
                <span className="text-white font-medium text-sm">
                  {wishlist.length}
                </span>
              </div>
            </Link>
            <Link href={"/cart"} className="relative">
              <ShoppingCart />
              <div className="h-6 w-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">
                  {cart.length}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938]" />
      <HeaderBottom />
    </div>
  );
};

export default Header;
