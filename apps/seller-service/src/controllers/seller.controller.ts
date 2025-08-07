import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

export const getShop = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { shopId } = req.params;
    if (!shopId) {
      return next(new ValidationError("Shop id is required"));
    }

    const [shop, followersCount] = await Promise.all([
      prisma.shop.findFirst({
        where: {
          id: shopId,
        },
      }),
      prisma.follower.count({
        where: { shopId: shopId },
      }),
    ]);

    if (!shop) {
      return next(new NotFoundError("shop not found!"));
    }

    return res.status(200).json({
      success: true,
      shop,
      followersCount,
    });
  } catch (error) {
    return next(error);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where: {
        shopId,
      },
      take: limit,
      skip,
      include: {
        images: true,
        shop: true,
      },
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

export const getShopEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const events = await prisma.product.findMany({
      where: {
        AND: [
          { shopId },
          { starting_date: { not: null } },
          { ending_date: { not: null } },
        ],
      },
      take: limit,
      skip,
      include: {
        images: true,
        shop: true,
      },
    });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(error);
  }
};

export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;
    const userId = req.user.id;

    if (!shopId || !userId) {
      return next(
        new ValidationError("Shop id is required or user is not authenticated")
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    const existingFollow = await prisma.follower.findUnique({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "You are already following this shop",
      });
    }

    const follow = await prisma.follower.create({
      data: {
        userId: userId,
        shopId: shopId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Successfully followed the shop",
    });
  } catch (error) {
    return next(error);
  }
};

export const unfollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;
    const userId = req.user.id;

    const existingFollow = await prisma.follower.findUnique({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
    });

    if (!existingFollow) {
      return next(new ValidationError("You are not following this shop"));
    }

    await prisma.follower.delete({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed the shop",
    });
  } catch (error) {
    return next(error);
  }
};

export const getFollowStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.id;

    const existingFollow = await prisma.follower.findUnique({
      where: {
        userId_shopId: {
          userId: userId,
          shopId: shopId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      isFollowing = true;
    }
    return res.status(200).json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    return next(error);
  }
};
