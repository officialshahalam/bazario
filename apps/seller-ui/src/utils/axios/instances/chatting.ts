import axios from "axios";
import { setupInterceptors } from "../setupInterceptors";

const chattingAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CHATTING_SERVER_URL,
  withCredentials: true,
});

setupInterceptors(chattingAxios);

export default chattingAxios;
