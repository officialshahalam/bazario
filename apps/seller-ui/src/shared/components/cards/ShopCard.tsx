import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: [];
    rating?: number;
    category?: string;
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="w-full rounded-md bg-white border border-gray-200 cursor-pointer shadow-md overflow-hidden transition-all">
      {/* Cover Banner */}
      <div className="w-full h-[120px] relative">
        <Image
          src={
            shop?.coverBanner ||
            "https://ik.imagekit.io/shahriarbecodemy/cover/3_vC8riiU8W.png"
          }
          alt="Shop Cover"
          fill
          className="object-cover w-full h-full"
        />
      </div>
      <div className="relative flex justify-center -mt-8">
        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
          <Image
            src={
              shop?.avatar ||
              "https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_hybrid&w=740"
            }
            alt={shop?.name || "Shop Avatar"}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>
      {/* Info */}
      <div className="px-4 pb-4 pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800">{shop?.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} Followers
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          {shop?.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star
              size={16}
              className="h-4 w-4 text-yellow-400 fill-yellow-400"
            />
            {shop?.rating ?? "N/A"}
          </span>
        </div>
        {/* Category */}
        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium capitalize">
              {shop.category}
            </span>
          </div>
        )}
        {/* Visit Button */}
        <div className="mt-4">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center text-sm ❑text-blue-600 font-medium hover:underline hover:text-blue-700 transition-all"
          >
            Visit Shop
            <ArrowUpRight className="w-4 h-4 m1-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
