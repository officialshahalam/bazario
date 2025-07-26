import { Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.cookies["seller-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing" });
    }

    let decoded: { id: string; role: "user" | "seller" | "admin" };

    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as typeof decoded;
    } catch (err: any) {
      if (err instanceof TokenExpiredError) {
        return res.status(401).json({ message: "Access token expired" });
      }
      return res.status(401).json({ message: "Invalid access token" });
    }


    let account;
    if (decoded.role === "user" || decoded.role === "admin") {
      account = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          avatars: true,
        },
      });
      req.user = account;
    } else if (decoded.role === "seller") {
      account = await prisma.seller.findUnique({
        where: { id: decoded.id },
        include: { shop: true, avatars: true },
      });
      req.seller = account;
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found" });
    }
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export default isAuthenticated;
