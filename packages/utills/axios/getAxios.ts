import authAxios from "./instances/auth";
import productAxios from "./instances/product";
import userAxios from "./instances/user";
import orderAxios from "./instances/order";
import sellerAxios from "./instances/seller";

type ServiceName = "auth" | "user" | "seller" | "product" | "order";

export const getAxiosInstance = (service: ServiceName) => {
  switch (service) {
    case "auth":
      return authAxios;
    case "user":
      return userAxios;
    case "seller":
      return sellerAxios
    case "product":
      return productAxios;
    case "order":
      return orderAxios;
    default:
      throw new Error("Unknown service name");
  }
};
