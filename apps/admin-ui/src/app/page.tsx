"use client";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Input from "packages/components/input";
import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};

const Page = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await getAxiosInstance("auth").post(
        "/login-admin",
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      router.push("/dashboard");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid Credentioals";
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="md:w-[450px] pb-8 bg-slate-800 rounded-md shadow">
        <form className="p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-Poppins">
            Welcome Admin
          </h1>
          <Input
            label="Email"
            placeholder="help658523@gmail.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Min . 6 characters"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 Characters",
                },
              })}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-5 text-xl flex justify-center font-semibold font-Poppins cursor-pointer bg-blue-600 hover:bg-blue-500 transition-all duration-200 text-white py-2 rounded-lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <div className="h-6 w-6 border-2 border-gray-100 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </button>
          {serverError && (
            <p className="text-red-500 text-sm mt-2">{serverError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Page;
