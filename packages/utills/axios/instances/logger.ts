import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const loggerAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LOGGER_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(loggerAxios);

export default loggerAxios;
