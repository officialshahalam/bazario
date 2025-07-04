import authAxios from "./instances/auth";
import productAxios from "./instances/product";
import paymentAxios from "./instances/payment";
import orderAxios from "./instances/order";

type ServiceName = "auth" | "product" | "payment" | "order";

export const getAxiosInstance = (service: ServiceName) => {
  switch (service) {
    case "auth":
      return authAxios;
    case "product":
      return productAxios;
    case "payment":
      return paymentAxios;
    case "order":
      return orderAxios;
    default:
      throw new Error("Unknown service name");
  }
};
