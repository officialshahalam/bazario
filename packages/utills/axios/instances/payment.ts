import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const paymentAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PAYMENT_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(paymentAxios);

export default paymentAxios;
