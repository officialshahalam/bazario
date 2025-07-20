import authAxios from "./instances/auth";
import productAxios from "./instances/product";
import userAxios from "./instances/user";
import orderAxios from "./instances/order";

type ServiceName = "auth" | "product" | "user" | "order";

export const getAxiosInstance = (service: ServiceName) => {
  switch (service) {
    case "auth":
      return authAxios;
    case "product":
      return productAxios;
    case "user":
      return userAxios;
    case "order":
      return orderAxios;
    default:
      throw new Error("Unknown service name");
  }
};
