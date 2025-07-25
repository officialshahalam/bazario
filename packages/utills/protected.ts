import { CustomAxiosRequestConfig } from "./axios/axios.types";

export const isProtected: CustomAxiosRequestConfig = {
  requireAuth: true,
};
