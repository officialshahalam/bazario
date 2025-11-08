import authAxios from "./instances/auth";
import productAxios from "./instances/product";
import userAxios from "./instances/user";
import orderAxios from "./instances/order";
import sellerAxios from "./instances/seller";
import adminAxios from "./instances/admin";
import chattingAxios from "./instances/chatting";
import notificationAxios from "./instances/notification";
import loggerAxios from "./instances/logger";

type ServiceName =
  | "auth"
  | "admin"
  | "user"
  | "seller"
  | "product"
  | "order"
  | "notification"
  | "logger"
  | "chatting"

export const getAxiosInstance = (service: ServiceName) => {
  switch (service) {
    case "auth":
      return authAxios;
    case "admin":
      return adminAxios;
    case "seller":
      return sellerAxios;
    case "user":
      return userAxios;
    case "product":
      return productAxios;
    case "order":
      return orderAxios;
    case "notification":
      return notificationAxios;
    case "logger":
      return loggerAxios;
    case "chatting":
      return chattingAxios;
    default:
      throw new Error("Unknown service name");
  }
};
