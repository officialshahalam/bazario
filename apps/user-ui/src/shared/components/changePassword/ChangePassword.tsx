import { getAxiosInstance } from "packages/utills/axios/getAxios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (data: any) => {
    setError("");
    setMessage("");
    try {
      await getAxiosInstance("auth").put("/change-password", {
        currentPassword: data?.currentPassword,
        newPassword: data?.newPassword,
        confirmPassword: data?.confirmPassword,
      });
      setMessage("Password Updated Successfully");
      reset();
    } catch (error: any) {
      setError(error?.response?.data?.message);
    }
  };
  return (
    <div className="w-10/12 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Current Passowrd
          </label>
          <input
            className="form-input"
            placeholder="Enter current password"
            type="password"
            {...register("currentPassword", {
              required: "Current password is required",
              minLength: {
                value: 8,
                message: "Must be at least 8 charecters",
              },
            })}
          />
          {errors?.currentPassowrd?.message && (
            <p className="text-xs mt-1 text-red-500">
              {String(errors?.currentPassowrd?.message)}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            New Passowrd
          </label>
          <input
            className="form-input"
            placeholder="Enter new password"
            type="password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Must be at least 8 charecters",
              },
              validate: {
                hasLower: (value) =>
                  /[a-z]/.test(value) || "Must include a lowercase letter",
                hasUpper: (value) =>
                  /[A-Z]/.test(value) || "Must include an uppercase letter",
                hasNumber: (value) =>
                  /\d/.test(value) || "Must include a number",
              },
            })}
          />
          {errors?.newPassowrd?.message && (
            <p className="text-xs mt-1 text-red-500">
              {String(errors?.newPassowrd?.message)}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Confirm Passowrd
          </label>
          <input
            className="form-input"
            placeholder="Re-Enter new password"
            type="password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              minLength: {
                value: 8,
                message: "Must be at least 8 charecters",
              },
              validate: (value) =>
                value === watch("newPassword") || "Password do not match",
            })}
          />
          {errors?.confirmPassword?.message && (
            <p className="text-xs mt-1 text-red-500">
              {String(errors?.confirmPassword?.message)}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          {isSubmitting ? "Updating" : "Update Password"}
        </button>
      </form>
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      {message && <p className="text-xs mt-1 text-green-500">{message}</p>}
    </div>
  );
};

export default ChangePassword;
