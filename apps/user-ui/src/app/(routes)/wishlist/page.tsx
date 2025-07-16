"use client";

import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const WishList = () => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);


  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };
  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity < 10
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    }));
  };

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Breadcrumb */}
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-4 font-jost">
            Wishlist
          </h1>
          <Link href={"/"} className="text-[#55585b] hover:underline]">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">Wishlist</span>
        </div>

        <div>
          {wishlist.length === 0 ? (
            <div className="text-center text-gray-600 text-lg">
              Your Wishlist is empty! start adding product
            </div>
          ) : (
            <div className="flex flex-c gap-10">
              {/* Wishlist Items Table */}
              <table className="w-full border-collapse">
                <thead className="bg-[#f1f3f4]">
                  <tr>
                    <th className="py-3 text-left pl-4">Product</th>
                    <th className="py-3 text-left">Price</th>
                    <th className="py-3 text-left">Quantity</th>
                    <th className="py-3 text-left">Action</th>
                    <th className="py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {wishlist?.map((item: any) => (
                    <tr
                      key={item?.id}
                      className="border-b border-b-[#0000000e]"
                    >
                      <td className="flex items-center gap-3 p-4">
                        <Image
                          src={item?.images[0]?.url}
                          alt={item?.title}
                          width={80}
                          height={80}
                          className="rounded"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </td>
                      <td className="text-lg">
                        ${item?.sale_price?.toFixed(2)}
                      </td>
                      <td>
                        <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
                          <button
                            className="text-black cursor-pointer text-xl"
                            onClick={() => decreaseQuantity(item.id)}
                          >
                            -
                          </button>
                          <span className="px-4">{item?.quantity}</span>
                          <button
                            className="text-black cursor-pointer text-xl"
                            onClick={() => increaseQuantity(item.id)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            addToCart(item, user, location, deviceInfo)
                          }
                          className="bg-[#2295ff] hover:bg-[#007bff] cursor-pointer text-white px-5 py-2 rounded-md transition-all"
                        >
                          Add to Cart
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            removeFromWishlist(
                              item?.id,
                              user,
                              location,
                              deviceInfo
                            )
                          }
                          className="text-[#818487] hover:text-[#ff1826] cursor-pointer transition-all duration-200"
                        >
                          ⛌ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishList;
