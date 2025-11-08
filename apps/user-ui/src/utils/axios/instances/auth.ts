import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";


const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(authAxios);

export default authAxios;
