import { runRedirectToLogin } from "../redirect";
import { getAxiosInstance } from "./getAxios";

export const setupInterceptors = (axiosInstance: any) => {
  let isRefreshing = false;
  let refreshSubscribers: (() => void)[] = [];

  const handleLogout = () => {
    const publicPaths = ["/login", "/signip", "/forgot-password"];
    const currentPath = window.location.pathname;
    if (!publicPaths.includes(currentPath)) {
      runRedirectToLogin();
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
      const is401 = error?.response?.status === 401;
      const isRetry = originalRequest?._retry;
      const isAuthRequired = originalRequest?.requireAuth === true;

      if (is401 && !isRetry && isAuthRequired) {
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
          await getAxiosInstance("auth").post(
            "/refresh-token",
            {},
            { withCredentials: true }
          );
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
