"use client";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { countries } from "../../../configs/constants";
import Link from "next/link";
import CreateShop from "../../../shared/modules/auth/CreateShop";
import StripeLogo from "../../../assets/svgs/StripeLogo";
import { getAxiosInstance } from "packages/utills/axios/getAxios";

const SignUp = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);
  const [sellerId, setSellerId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRef.current.length - 1) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await getAxiosInstance("auth").post(
        "/seller-registration",
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setServerError(null);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid Data";
      setServerError(errorMessage);
    },
  });

  const onSubmit = async (data: any) => {
    signupMutation.mutate(data);
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) {
        return;
      }
      const response = await getAxiosInstance("auth").post("/verify-seller", {
        ...sellerData,
        otp: otp.join(""),
      });
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid Data";
      setServerError(errorMessage);
    },
  });

  const resendOTP = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  const connectStripe = async () => {
    try {
      const response = await getAxiosInstance("auth").post(
        "/create-stripe-link",
        { sellerId }
      );
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.log("Stripe connection error", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-10">
      {/* steper */}
      <div className="md:w-1/2 flex justify-between items-center relative">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                step <= activeStep ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            <span className="ml-[-15px]">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>

      {/* steps content */}
      <div className="md:w-[480px] p-8 bg-white shadow mt-10 rounded-lgx">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-2xl font-Poppins font-semibold text-black text-center">
                  Create Account
                </h1>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Mohd shahalam"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("name", {
                    required: "Name is required",
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {String(errors.name.message)}
                  </p>
                )}
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="help658523@gmail.com"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {String(errors.email.message)}
                  </p>
                )}
                <label className="block text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="9735658275"
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("phone_number", {
                    required: "Phone Number is required",
                    pattern: {
                      value: /^\+?[1-9]\d{1,3}[-\s]?\d{6,14}$/,
                      message: "Invalid Phone Number",
                    },
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 digits",
                    },
                    maxLength: {
                      value: 15,
                      message: "Phone number can not exceed 15 digits",
                    },
                  })}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">
                    {String(errors.phone_number.message)}
                  </p>
                )}
                <label className="block text-gray-700 mb-1">Country List</label>
                <select
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("country", {
                    required: "Country is required",
                  })}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm">
                    {String(errors.country.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Min . 6 characters"
                    className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 Characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  >
                    {passwordVisible ? <Eye /> : <EyeOff />}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {String(errors.password.message)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full text-lg mt-4 cursor-pointer bg-black text-white py-2 rounded-lg"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Signing up ..." : "Signup"}
                </button>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
                <p className="text-center text-gray-500 my-4">
                  Already have an account?{" "}
                  <Link href={"/login"} className="text-blue-500">
                    Login
                  </Link>
                </p>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-center mb-4">
                  Enter OTP
                </h3>
                <div className="flex justify-center gap-6">
                  {otp?.map((digit, index) => (
                    <input
                      type="text"
                      key={index}
                      ref={(el) => {
                        if (el) inputRef.current[index] = el;
                      }}
                      maxLength={1}
                      className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    />
                  ))}
                </div>
                <button
                  className="w-full mt-4 text-lg cursor-pointer  bg-blue-500 text-white py-2 rounded-lg"
                  disabled={verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate()}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>
                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <button
                      onClick={resendOTP}
                      className="text-blue-500 cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resent OTP in ${timer}s`
                  )}
                </p>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2">{serverError}</p>
                )}
              </div>
            )}
          </>
        )}

        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}

        {activeStep === 3 && (
          <div className="text-center ">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <br />
            <button
              className="w-full m-auto flex justify-center items-center gap-3 text-lg text-white bg-[#334155] py-2 rounded-lg"
              onClick={connectStripe}
            >
              Connect Stripe <StripeLogo />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
