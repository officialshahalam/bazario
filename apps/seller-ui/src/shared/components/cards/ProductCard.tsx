import Link from "next/link";
import React, { useEffect, useState } from "react";
import Ratings from "../ratings/Ratings";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  
  const [timeLeft, setTimeLeft] = useState("calculating...");

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }
        const day = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mints = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${day}d ${hours}h ${mints}m left with this price`);
      }, 1000);
      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.ending_date]);

  return (
    <div className="w-full min-h-[350px] pb-8 h-max bg-gray-700 rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md uppercase animate-bounce">
          Offer
        </div>
      )}
      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          Limited Stock
        </div>
      )}
      {isEvent && timeLeft && (
        <div className="absolute left-2 bottom-2">
          <span className="inline-block text-xs bg-orange-100 text-orange-500 px-2 py-[2px]">
            {timeLeft}
          </span>
        </div>
      )}
      <Link href={`/product/${product?.slug}`}>
        <img
          src={product?.images[0]?.url || ""}
          alt={product.title}
          width={300}
          height={300}
          className="w-full  h-[200px] object-cover mx-auto rounded-t-md"
        />
      </Link>
      <Link
        href={`/shop/${product?.shop?.id}`}
        className="block text-blue-500 text-sm font-medium my-2 px-2"
      >
        {product?.shop?.name}
      </Link>
      <Link href={`/shop/${product?.slug}`}>
        <h1 className="text-base font-semibold px-2 text-gray-100 w-48 truncate">
          {product?.title}
        </h1>
      </Link>
      <div className="mt-2 px-2">
        <Ratings rating={product?.ratings !== 0 ? product?.ratings : 4.5} />
      </div>
      <div className="mt-3 flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-100">
            ${product?.sale_price}
          </span>
          <span className="text-sm line-through text-gray-950">
            ${product?.regular_price}
          </span>
        </div>
        <span className="text-green-500 text-sm font-medium">
          {product?.totalSales || 37} sold
        </span>
      </div>

      
    </div>
  );
};

export default ProductCard;
