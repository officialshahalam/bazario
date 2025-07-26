import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

export const getAllProduct = async (
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
