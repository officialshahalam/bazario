import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const notificationAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NOTIFICATION_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(notificationAxios);

export default notificationAxios;
