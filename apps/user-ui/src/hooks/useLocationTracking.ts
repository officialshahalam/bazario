"use client";
import { useState, useEffect } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = () => {
  if (typeof window === "undefined") return null; // SSR safety

  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!storedData) return null;

  const parsedData = JSON.parse(storedData);
  const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const isExpired = Date.now() - parsedData.timestamp > expiryTime;
  return isExpired ? null : parsedData;
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    country: string;
    city: string;
    timestamp: number;
  } | null>(getStoredLocation());

  useEffect(() => {
    if (location) return;

    fetch("http://ip-api.com/json/")
      .then((res) => res.json())
      .then((data) => {
        const newLocation = {
          country: data?.country,
          city: data?.city,
          timestamp: Date.now(),
        };
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        setLocation(newLocation);
      })
      .catch((e) => console.log("Failed to get location", e));
  }, [location]);

  return location;
};

export default useLocationTracking;
