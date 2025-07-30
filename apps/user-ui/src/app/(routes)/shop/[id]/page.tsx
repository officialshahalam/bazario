import SellerProfile from "apps/user-ui/src/shared/components/sellerProfile";
import axios from "axios";
import { Metadata } from "next";
import React from "react";

async function fetchSellerDetails(id: string) {
  const res = await axios.get(
    `http://localhost:4000/seller/api/get-shop/${id}`
  );
  return res?.data;
}

export async function generateMetaData({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await fetchSellerDetails(params?.id);
  return {
    title: `${data?.shop?.name} | Bazario Marketplace`,
    description:
      data?.shop?.bio ||
      "Explore product and service from trusted seller on Bazario",
    openGraph: {
      title: `${data?.shop?.name} | Bazario Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore product and service from trusted seller on Bazario",
      type: "website",
      images: [
        {
          url:
            data?.shop?.avatar ||
            "https://ik.imagekit.io/aalam855/bazario/assets/hero-bg.avif?updatedAt=1751187560434",
          height: 600,
          width: 800,
          alt: data?.shop?.name || "shop Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data?.shop?.name} | Bazario Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore product and service from trusted seller on Bazario",
    },
  };
}

const Page = async ({ params }: { params: { id: string } }) => {
  const data = await fetchSellerDetails(params?.id);
  

  return (
    <div>
      <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
  );
};

export default Page;
