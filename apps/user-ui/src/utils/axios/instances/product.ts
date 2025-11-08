import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const productAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRODUCT_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(productAxios);

export default productAxios;
