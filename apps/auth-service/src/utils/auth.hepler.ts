import crypto from "crypto";
import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/radis";
import { sendEmail } from "./sendMail";
import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, phone_number, country } = data;
  if (
    !name ||
    !email ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields!`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email formate`);
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      "Account is lock due to multiple failed attempts ! try after 30 minutes"
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError("Too many otp request! Please try after 1 hour");
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      "Please wait 1 minuts before requesting the new otp"
    );
  }
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify Your Email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

export const traceOtpRequests = async (email: string, next: NextFunction) => {
  let otpRequests = parseInt(
    (await redis.get(`otp_request_count:${email}`)) || "0"
  );
  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
    throw new ValidationError("Too Many OTP request! please wait 1 hour");
  }
  await redis.set(`otp_request_count:${email}`, otpRequests + 1, "EX", 3600);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("Invalid or Expired OTP");
  }
  const failedAttempt = parseInt(
    (await redis.get(`otp_attempts:${email}`)) || "0"
  );

  if (storedOtp !== otp) {
    if (failedAttempt >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
      await redis.del(`otp:${email}`, `otp_attempts:${email}`);
      throw new ValidationError(
        "Too many Failed Attempts, your accounts is locked for 30 mints"
      );
    }
    await redis.set(`otp_attempts:${email}`, failedAttempt + 1, "EX", 300);
    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttempt} attempts left.`
    );
  }
  await redis.del(`otp:${email}`, `otp_attempts:${email}`);
};

export const handleForgotPassword = async (
  email: any,
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    if (!email) {
      throw new ValidationError("Email is required");
    }
    const user =
      userType === "user"
        ? await prisma.users.findUnique({ where: { email: email } })
        : await prisma.sellers.findUnique({ where: { email: email } });

    if (!user) {
      throw new ValidationError(`${userType} not found`);
    }

    await checkOtpRestrictions(email, next);
    await traceOtpRequests(email, next);
    await sendOtp(
      user.name,
      email,
      userType === "user"
        ? "forgot-password-user-mail"
        : "forgot-password-seller-mail"
    );
    res.status(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  email: string,
  otp: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!email || !otp) {
      throw new ValidationError("Email ans OTP are required!");
    }
    await verifyOtp(email, otp, next);
    res.status(200).json({
      message: "OTP verified ! You can reset your password",
    });
  } catch (error) {
    next(error);
  }
};
