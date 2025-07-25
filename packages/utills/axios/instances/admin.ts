import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const adminAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(adminAxios);

export default adminAxios;
