import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const userAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(userAxios);

export default userAxios;
