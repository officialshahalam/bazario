import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

export const getAllNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req?.user?.id;
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: adminId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return next(error);
  }
};

export const sellerNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: sellerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return next(error);
  }
};

export const userNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req?.body;

    if (!notificationId) {
      return next(new ValidationError("Notification id is required"));
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: "Read",
      },
    });
    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    return next(error);
  }
};
