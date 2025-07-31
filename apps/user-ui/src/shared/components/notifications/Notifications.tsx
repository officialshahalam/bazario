"use client";
import { useQuery } from "@tanstack/react-query";

import Link from "next/link";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React from "react";

const Notifications = () => {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getAxiosInstance("notification").get(
        "/user-notifications"
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
    <div className="space-y-4 text-sm text-gray-700">
      {isLoading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No Notifications available yet!</p>
      ) : (
        <div className="my-6 rounded-lg divide-y divide-gray-300 shadow-sm">
          {notifications?.map((notification: any) => (
            <Link
              key={notification?.id}
              href={`${notification?.redirect_link}`}
              className={`block px-5 py-4 transition-all ${
                notification?.status !== "Read"
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => markAsReadHandle(notification?.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium">
                    {notification?.title}
                  </span>
                  <span className="text-gray-700 text-sm">
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

export default Notifications;
