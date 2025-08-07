"use client";
import React, { useEffect, useState } from "react";
import useSeller from "../hooks/useSeller";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import { ArrowLeft, Loader2 } from "lucide-react";
import SellerProfile from "../shared/components/sellerProfile";
import Link from "next/link";

const Home = () => {
  const { seller } = useSeller();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const res = await getAxiosInstance("seller").get(
        `get-shop/${seller?.shop?.id}`
      );
      setData(res?.data);
    } catch (error) {
      console.log("error while fetching Shop data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seller) {
      fetchShopDetails();
    }
  }, [seller]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center text-sm text-red-500">Shop not found!</p>;
  }
  return (
    <div className="relative bg-gray-900 text-gray-100 pb-10">
      <Link href={'/dashboard'} className="flex w-fit gap-2 justify-start px-2 py-1 items-center">
        <ArrowLeft size={18}/>
        <span>Back to Dashboard</span>
      </Link>
      <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
  );
};

export default Home;
