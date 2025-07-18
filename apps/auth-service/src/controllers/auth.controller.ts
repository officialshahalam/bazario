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

// resigter a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;
    const existingUser = await prisma.users.findUnique({ where: { email } });
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
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User already exist with this email"));
    }
    await verifyOtp(email, otp, next);
    const hashPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, password: hashPassword },
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
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(
        new AuthError("User does'not Exist !Please register first then login")
      );
    }

    const ismatch = await bcrypt.compare(password, user.password!);
    if (!ismatch) {
      return next(new AuthError("Invalid email or password"));
    }

    res.clearCookie('seller-access-token');
    res.clearCookie('seller-refresh-token');

    const accessToken = await jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = await jwt.sign(
      { id: user.id, role: "user" },
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
        email: user.email,
        name: user.name,
      },
    });
  } catch (e) {
    return next(e);
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
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
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
    if(decoded.role==='user'){
      setCookie("access_token", newAccessToken, res);
    }else if(decoded.role==='seller'){
      setCookie("seller-access-token", newAccessToken, res);
    }
    req.role=decoded.role;

    return res.status(200).json({
      success: true,
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

// user forgot password
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

//verify forget password OTP
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

// reset user password
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
    const user = await prisma.users.findUnique({ where: { email: email } });
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
    await prisma.users.update({
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
    const existingSeller = await prisma.sellers.findUnique({
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
    const existingSeller = await prisma.sellers.findUnique({
      where: { email: email },
    });
    if (existingSeller) {
      throw new ValidationError("Seller Already exist with this email!");
    }
    await verifyOtp(email, otp, next);

    const hashPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: { name, email, password: hashPassword, country, phone_number },
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

    const shop = await prisma.shops.create({ data: shopData });

    return res
      .status(201)
      .json({ success: true, message: "Shop created", shop });
  } catch (error) {
    return next(error);
  }
};

// create stripe connect account link
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // actual code
    // {
    //   const { sellerId } = req.body;
    //   if (!sellerId) {
    //     return next(new ValidationError("Seller ID is required"));
    //   }
    //   const seller = await prisma.sellers.findUnique({
    //     where: { id: sellerId },
    //   });

    //   if (!seller) {
    //     return next(
    //       new ValidationError("Seller is not available with this ID!")
    //     );
    //   }
    //   const account = await stripe.accounts.create({
    //     type: "express",
    //     email: seller?.email,
    //     country: "IN",
    //     capabilities: {
    //       card_payments: { requested: true },
    //       transfers: { requested: true },
    //     },
    //   });
    //   await prisma.sellers.update({
    //     where: { id: sellerId },
    //     data: {
    //       stripeId: account.id,
    //     },
    //   });
    //   const accountLink = await stripe.accountLinks.create({
    //     account: account.id,
    //     refresh_url: `http://localhost:3000/success`,
    //     return_url: `http://localhost:3000/success`,
    //     type: "account_onboarding",
    //   });
    //   res.json({ url: accountLink.url });
    // }

    // demo code start
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return next(new ValidationError("Seller is not available with this ID!"));
    }
    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        stripeId: "5f9c3b1e2a7d4f81c6a3",
      },
    });
    res.json({
      success: true,
      url: "http://localhost:3001/success",
      message: "Successfully connect to the stripe",
    });
    // demo code end
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
    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(
        new AuthError("User does'not Exist !Please register first then login")
      );
    }

    const ismatch = await bcrypt.compare(password, seller.password!);
    if (!ismatch) {
      return next(new AuthError("Invalid email or password"));
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');


    const accessToken = await jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = await jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
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
