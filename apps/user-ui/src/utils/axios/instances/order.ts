import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const orderAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ORDER_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(orderAxios);

export default orderAxios;
