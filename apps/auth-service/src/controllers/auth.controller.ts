import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  traceOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.hepler";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookies";
import Stripe from "stripe";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// resigter a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User already exist with this email"));
    }
    await checkOtpRestrictions(email, next);
    await traceOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");
    return res.status(200).json({
      message: "OTP sent to email ! please Verify your account",
    });
  } catch (e) {
    return next(e);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return next(new ValidationError("All field are required!"));
    }
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new ValidationError("User already exist with this email"));
    }
    await verifyOtp(email, otp, next);
    const hashPassword = await bcrypt.hash(password, 10);
    const avatars = [
      {
        file_id: randomUUID(),
        url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name
        )}`,
      },
    ];
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        avatars: {
          create: avatars.map((avatar: any) => ({
            file_id: avatar?.file_id,
            url: avatar?.url,
          })),
        },
      },
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (e) {
    return next(e);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("email and passward are required"));
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { avatars: true },
    });
    if (!user) {
      return next(
        new AuthError("User does'not Exist !Please register first then login")
      );
    }

    const ismatch = await bcrypt.compare(password, user.password!);
    if (!ismatch) {
      return next(new AuthError("Invalid email or password"));
    }

    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

    const accessToken = await jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "365d" }
    );

    const refreshToken = await jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "365d" }
    );

    // store the access and referesh token in httpOnly secure cookie
    setCookie("access_token", accessToken, res);
    setCookie("refresh_token", refreshToken, res);

    res.status(200).json({
      success: true,
      message: "User LogedIn Successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (e) {
    return next(e);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  try {
    await handleForgotPassword(email, req, res, next, "user");
  } catch (e) {
    return next(e);
  }
};

export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    await verifyForgotPasswordOtp(email, otp, req, res, next);
  } catch (error) {
    return next(error);
  }
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError("Email and New Passwor dare required"));
    }
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return next(new ValidationError("User not Found!"));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "new password can not be the same as the old password"
        )
      );
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashPassword },
    });
    return res.status(200).json({
      success: true,
      message: "Password reset Successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;
    const existingSeller = await prisma.seller.findUnique({
      where: { email: email },
    });
    if (existingSeller) {
      throw new ValidationError("Seller Already exist with this email!");
    }
    await checkOtpRestrictions(email, next);
    await traceOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation");
    return res.status(200).json({
      message: "OTP sent to email ! please Verify your account",
    });
  } catch (error) {
    return next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, otp, password, phone_number, country } = req.body;
    if (!name || !email || !otp || !password || !phone_number || !country) {
      return next(new ValidationError("All fields are required"));
    }
    const existingSeller = await prisma.seller.findUnique({
      where: { email: email },
    });
    if (existingSeller) {
      throw new ValidationError("Seller Already exist with this email!");
    }
    const avatar = {
      file_id: randomUUID(),
      url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        name
      )}`,
    };
    await verifyOtp(email, otp, next);

    const hashPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.seller.create({
      data: {
        name,
        email,
        password: hashPassword,
        country,
        phone_number,
        avatars: {
          create: {
            file_id: avatar?.file_id,
            url: avatar?.url,
          },
        },
      },
    });
    res.status(201).json({
      success: true,
      seller,
      message: "Seller registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError("All fields are required!!!!"));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shop.create({ data: shopData });

    return res
      .status(201)
      .json({ success: true, message: "Shop created", shop });
  } catch (error) {
    return next(error);
  }
};

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // actual code
    {
      const { sellerId } = req.body;
      if (!sellerId) {
        return next(new ValidationError("Seller ID is required"));
      }
      const seller = await prisma.seller.findUnique({
        where: { id: sellerId },
      });

      if (!seller) {
        return next(
          new ValidationError("Seller is not available with this ID!")
        );
      }
      const account = await stripe.accounts.create({
        type: "express",
        email: seller?.email,
        country: "GB",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      console.log("account is", account);
      await prisma.seller.update({
        where: { id: sellerId },
        data: {
          stripeId: account.id,
        },
      });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `http://localhost:3001/login`,
        return_url: `http://localhost:3001/login`,
        type: "account_onboarding",
      });
      res.json({ url: accountLink.url });
    }
  } catch (error) {
    return next(error);
  }
};

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("email and passward are required"));
    }
    const seller = await prisma.seller.findUnique({ where: { email } });
    if (!seller) {
      return next(
        new AuthError("User does'not Exist !Please register first then login")
      );
    }

    const ismatch = await bcrypt.compare(password, seller.password!);
    if (!ismatch) {
      return next(new AuthError("Invalid email or password"));
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const accessToken = await jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "365d" }
    );

    const refreshToken = await jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "365d" }
    );

    // store the access and referesh token in httpOnly secure cookie
    setCookie("seller-access-token", accessToken, res);
    setCookie("seller-refresh-token", refreshToken, res);

    res.status(200).json({
      success: true,
      message: "Seller LogedIn Successfully",
      seller: {
        id: seller.id,
        email: seller.email,
        name: seller.name,
      },
    });
  } catch (e) {
    return next(e);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {};

export const loginAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("email and passward are required"));
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { avatars: true },
    });
    if (!user) {
      return next(
        new AuthError("Admin does'not Exist !Please register first then login")
      );
    }

    const ismatch = await bcrypt.compare(password, user.password!);
    if (!ismatch) {
      return next(new AuthError("Invalid email or password"));
    }

    const isAdmin = user.role === "admin";

    if (!isAdmin) {
      // sendLog({
      //   type: "error",
      //   message: `admin login failed form${email} - not an admin`,
      //   source: "auth-service",
      // });
      return next(new AuthError("Invalid Access!"));
    }

    // sendLog({
    //   type: "success",
    //   message: `admin login successfully`,
    //   source: "auth-service",
    // });

    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

    const accessToken = await jwt.sign(
      { id: user.id, role: "admin" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "45m" }
    );

    const refreshToken = await jwt.sign(
      { id: user.id, role: "admin" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    // store the access and referesh token in httpOnly secure cookie
    setCookie("access_token", accessToken, res);
    setCookie("refresh_token", refreshToken, res);

    res.status(200).json({
      success: true,
      message: "User LogedIn Successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    return next(e);
  }
};

export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    const admin = req.user;
    res.status(201).json({
      success: true,
      admin,
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {};

export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req?.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError("all fields are required"));
    }
    if (newPassword !== confirmPassword) {
      return next(new ValidationError("new password do not match"));
    }
    if (newPassword === currentPassword) {
      return next(
        new ValidationError("New password can not be the same as previous")
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user?.password) {
      return next(new ValidationError("user not found or password not set"));
    }
    const isPassowrdMatch = await bcrypt.compare(
      currentPassword,
      user?.password
    );

    if (!isPassowrdMatch) {
      return next(new AuthError("Incorrect current password"));
    }
    const hashPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashPassword,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Password update successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refresh-token"] ||
      req.cookies["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];
    if (!refreshToken) {
      return new ValidationError("Unauthorized! No refresh token");
    }
    const decoded = (await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    )) as { id: string; role: string };

    if (!decoded || !decoded.id || decoded.role) {
      return new JsonWebTokenError("Forbidden! invalid refresh token");
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.user.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.seller.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthError("Forbidden! User/seller not found");
    }

    const newAccessToken = await jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    if (decoded.role === "user") {
      setCookie("access_token", newAccessToken, res);
    } else if (decoded.role === "seller") {
      setCookie("seller-access-token", newAccessToken, res);
    }
    req.role = decoded.role;

    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    return next(e);
  }
};
