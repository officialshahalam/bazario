import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

export const addNewAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;
    const isUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!isUser) {
      return next(new ValidationError("You are not user"));
    }

    const updateRole = await prisma.user.update({
      where: { email: email },
      data: {
        role: role,
      },
    });

    return res.status(200).json({
      success: true,
      updateRole,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllAdmins = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
    });
    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllSellers = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [sellers, totalsellers] = await Promise.all([
      prisma.seller.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          shop: {
            select: {
              name: true,
              avatars: true,
              address: true,
            },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.seller.count(),
    ]);

    const totalPages = Math.ceil(totalsellers / limit);

    return res.status(200).json({
      success: true,
      data: sellers,
      meta: {
        totalsellers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllUsers = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, totalusers] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalusers / limit);

    return res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalusers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          ratings: true,
          category: true,
          createdAt: true,
          images: {
            select: { url: true },
            take: 1,
          },
          shop: {
            select: { name: true },
          },
        },
        where: { starting_date: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: { starting_date: null },
      }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [events, totalEvents] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          ratings: true,
          category: true,
          starting_date: true,
          ending_date: true,
          images: {
            select: { url: true },
            take: 1,
          },
          shop: {
            select: { name: true },
          },
          createdAt: true,
        },
        where: { starting_date: { not: null } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: { starting_date: { not: null } },
      }),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    return res.status(200).json({
      success: true,
      data: events,
      meta: {
        totalEvents,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllCustomization = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.siteConfig.findFirst();

    return res.status(200).json({
      success: true,
      categories: config?.categories || [],
      subCategories: config?.subCategories || {},
      logo: config?.logo || null,
      banner: config?.banner || null,
    });
  } catch (error) {
    return next(error);
  }
};
