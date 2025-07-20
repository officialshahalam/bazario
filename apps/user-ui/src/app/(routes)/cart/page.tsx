"use client";
import { useQuery } from "@tanstack/react-query";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React, { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);

  const [loading, setLoading] = useState<boolean>(false);
  const [discountedProductId, setDiscountedProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };
  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity < 10
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    }));
  };

  const subTotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.sale_price,
    0
  );

  const { data: addresses = [] } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await getAxiosInstance("user").get("/shipping-addresses");
      return res?.data?.addresses;
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr?.id);
      }
    }
  }, []);

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Breadcrumb */}
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-4 font-jost">
            Shopping Cart
          </h1>
          <Link href={"/"} className="text-[#55585b] hover:underline]">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">Cart</span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your Cart is empty! start adding product
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-collapse">
              <thead className="bg-[#f1f3f4] rounded">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {cart?.map((item: any) => (
                  <tr key={item?.id} className="border-b border-b-[#0000000e]">
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
                        {item?.selectedOptions && (
                          <div className="text-sm text-gray-500 flex gap-2">
                            {item?.selectedOptions.color && (
                              <div className="flex items-center justify-center gap-1">
                                Color:
                                <span
                                  style={{
                                    backgroundColor:
                                      item?.selectedOptions?.color,
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "100%",
                                    display: "inline-block",
                                  }}
                                />
                              </div>
                            )}
                            {item?.selectedOptions?.size && (
                              <span className="ml-2">
                                Size: {item?.selectedOptions?.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="text-lg">
                      {item?.id === discountedProductId ? (
                        <div className="flex flex-col items-start">
                          <span className="line-through text-sm text-gray-500">
                            ${item.sale_price.toFixed(2)}
                          </span>{" "}
                          <span className="text-green-600 font-semibold">
                            $
                            {(
                              (item?.sale_price * (100 - discountPercent)) /
                              100
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-green-700 bg-green-100 px-1 rounded-sm">
                            Discount Applied
                          </span>
                        </div>
                      ) : (
                        <span>${item.sale_price.toFixed(2)}</span>
                      )}
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

                    <td className="text-center">
                      <button
                        className="text-[#818487] hover:text-[#ff1826] cursor-pointer transition-all duration-200"
                        onClick={() =>
                          removeFromCart(item?.id, user, location, deviceInfo)
                        }
                      >
                        ⛌ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#010f1c] text-base font-medium pb-1">
                  <span className="font-jost">
                    Discount ({discountPercent}%)
                  </span>
                  <span className="text-gray-600">
                    - ${discountAmount.toFixed(2)}%
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3">
                <span>Subtotal</span>
                <span>${(subTotal - discountAmount).toFixed(2)}</span>
              </div>
              <hr className="my-4 text-slate-200" />
              <div className="mb-4">
                <h4 className="mb-2 font-[500] text-base">Have a coupon?</h4>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e: any) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon code"
                    className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500"
                  />
                  <button
                    className="bg-blue-500 cursor-pointer text-white px-4 rounded-r-md hover:bg-blue-600 transition-all"
                    // onClick={() => couponCodeApply}
                  >
                    Apply
                  </button>
                  {/* {error && (
                    <p className="text-sm pt-2 text-red-500">{error}</p>
                  )} */}
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-2 text-base font-medium">
                    Select Shipping Address
                  </h4>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {addresses?.length > 0 &&
                      addresses.map((address: any) => (
                        <option key={address?.id} value={address?.id}>
                          {address?.label} - {address?.street} - {address?.city}{" "}
                          - {address?.country}
                        </option>
                      ))}
                  </select>
                  {addresses?.length === 0 && (
                    <p className="text-sm text-slate-800">
                      Please Add an address from profile to create order
                    </p>
                  )}
                </div>

                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-2 text-base font-medium">
                    Select Payment Method
                  </h4>
                  <select className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-blue-500">
                    <option value="credit_card">Online Payment</option>
                    <option value="cash_on_delivery">Cash On Delivery</option>
                  </select>
                </div>

                <hr className="my-4 text-slate-200" />
                <div className="flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3">
                  <span className="font-jost">Total</span>
                  <span>${(subTotal - discountAmount).toFixed(2)}</span>
                </div>
                <button
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989ff] duration-200 transition-all rounded-lg"
                >
                  {loading && <Loader2 className="animate-spin w-5 h-5" />}
                  {loading ? "Redirecting..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
