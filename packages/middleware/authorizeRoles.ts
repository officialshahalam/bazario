import { NextFunction, Response } from "express";
import { AuthError } from "../../packages/error-handler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "seller") {
    return next(new AuthError("Access denied: seller only"));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "user") {
    return next(new AuthError("Access denied: User only"));
  }
  next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== "admin") {
    return next(new AuthError("Access denied: Admin only"));
  }
  next();
};
