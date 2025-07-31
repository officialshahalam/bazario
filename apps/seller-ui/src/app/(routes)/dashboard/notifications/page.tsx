"use client";
import { useQuery } from "@tanstack/react-query";
import BreadCrumbs from "apps/seller-ui/src/shared/components/breadCrumbs/BreadCrumbs";

import Link from "next/link";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React from "react";

const Page = () => {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getAxiosInstance("notification").get(
        "/seller-notifications"
      );
      return res?.data?.notifications;
    },
  });

  const markAsReadHandle = async (notificationId: string) => {
    await getAxiosInstance("notification").put("/mark-notification-as-read", {
      notificationId,
    });
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      {/* Header */}
      <h2 className="text-2xl text-white font-semibold mb--2 tracking-wide">
        Notifications
      </h2>
      <BreadCrumbs title="Notifications" />

      {isLoading ? (
        <p>Loading...</p>
      ) : notifications?.length === 0 ? (
        <p className="text-center pt-24 text-white text-sm font-Poppins">
          No Notifications available yet!
        </p>
      ) : (
        <div className="md:w-[80%] py-6 rounded-lg divide-y divide-gray-800 bg-black/40 backdrop-blur-lg shadow-sm">
          {notifications?.map((notification: any) => (
            <Link
              key={notification?.id}
              href={`${notification?.redirect_link}`}
              className={`block px-5 py-4 transition-all ${
                notification?.status === "Read"
                  ? "hover:bg-gray-800/40"
                  : "bg-gray-800/50 hover:bg-gray-800/70"
              }`}
              onClick={() => markAsReadHandle(notification?.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <span className="text-white font-medium">
                    {notification?.title}
                  </span>
                  <span className="text-gray-300 text-sm">
                    {notification?.message}
                  </span>
                  <span className="text-gray-500 text-xs mt-1">
                    {new Date(notification?.createdAt).toLocaleDateString(
                      "en-UK",
                      {
                        dateStyle: "medium",
                      }
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
