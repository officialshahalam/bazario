import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const sellerAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SELLER_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(sellerAxios);

export default sellerAxios;