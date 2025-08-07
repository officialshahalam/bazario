"use server";

import ProductDetails from "apps/seller-ui/src/shared/modules/ProductDetails";
import { Metadata } from "next";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React from "react";

async function fetchProductDetails(slug: string) {
  const response = await getAxiosInstance("product").get(
    `/get-product/${slug}`
  );
  return response.data.product;
}

export async function generateMetaData({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductDetails(params?.slug);
  return {
    title: `${product?.title} | Bazario Marketplace`,
    description:
      product?.short_description ||
      "Discover high-quality products on Bazario Marketplace",
    openGraph: {
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
    },
  };
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params?.slug);
  return <ProductDetails productDetails={productDetails} />;
};

export default Page;
