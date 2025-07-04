import axios from "axios";
import { getAxiosInstance } from "./getAxios";

export const setupInterceptors = (axiosInstance: any) => {
  let isRefreshing = false;
  let refreshSubscribers: (() => void)[] = [];

  const handleLogout = () => {
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
  };

  const onRefreshSuccess = () => {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
  };

  axiosInstance.interceptors.response.use(
    (res: any) => res,
    async (error: any) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh(() =>
              resolve(axiosInstance(originalRequest))
            );
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await getAxiosInstance("auth").post("/refresh-token", {});
          isRefreshing = false;
          onRefreshSuccess();
          return axiosInstance(originalRequest);
        } catch (err) {
          isRefreshing = false;
          refreshSubscribers = [];
          handleLogout();
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};
