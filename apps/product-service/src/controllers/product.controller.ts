import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imageKit";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Categories not founds",
      });
    }
    res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;
    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });
    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discound code already available please use a different code!"
        )
      );
    }
    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(200).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });
    res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const discountCode = await prisma.discount_codes.findUnique({
      select: { id: true, sellerId: true },
      where: { id },
    });
    if (!discountCode) {
      return next(new NotFoundError("Discount Code Not Found"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new AuthError("Unauthorized Access"));
    }

    await prisma.discount_codes.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Discount Code deleted Successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;
    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/bazario/product",
    });
    res.status(200).json({
      fileId: response.fileId,
      file_url: response.url,
    });
  } catch (error) {
    return next(error);
  }
};

export const DeleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;
    const response = await imagekit.deleteFile(fileId);
    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      return next(new ValidationError("Missing Required Fields"));
    }

    if (!req.seller.id) {
      return next(new AuthError("Only seller can create product"));
    }
    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });
    if (slugChecking) {
      return next(
        new ValidationError("Slug Already uses! please use a different slug")
      );
    }
    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: Array.isArray(discountCodes)
          ? discountCodes.map((codeId) => codeId)
          : [],
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties || [],
        custom_specifications: custom_specifications || {},
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((image: any) => ({
              file_id: image.fileId,
              url: image.file_url,
            })),
        },
        starting_date: null,
        ending_date: null,
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      newProduct,
      message: "Product is created successfully",
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
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: { images: true },
    });
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
      where: {
        id: productId,
      },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized Action"));
    }
    if (product.isDeleted) {
      return next(new ValidationError("product already deleted"));
    }
    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return res.status(200).json({
      message:
        "Product is Scheduled for deletion in 24 hours. You can restore it within this time",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
      },
      where: {
        id: productId,
      },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized Action"));
    }
    if (!product.isDeleted) {
      return next(new ValidationError("product is not in deleted state"));
    }
    await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
    return res.status(200).json({
      message: "Product is restored successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const baseFilter = {
      OR: [
        {
          starting_date: null,
        },
        {
          ending_date: null,
        },
      ],
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { ratings: "desc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        orderBy: {
          ratings: "desc",
        },
        take: limit,
        skip,
        include: {
          images: true,
          shops: true,
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        where: baseFilter,
        orderBy,
        take: 10,
      }),
    ]);

    res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "top rating",
      top10Products,
      total,
      currentPage: page,
      totalPage: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const baseFilter = {
      AND: [
        {
          starting_date: { not: null },
        },
        {
          ending_date: { not: null },
        },
      ],
    };

    const [events, total, top10BySales] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        take: limit,
        skip,
        include: {
          images: true,
          shops: true,
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        where: baseFilter,
        take: 10,
        orderBy: {
          totalSales: "desc",
        },
      }),
    ]);

    res.status(200).json({
      events,
      top10BySales,
      total,
      currentPage: page,
      totalPage: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        slug: req.params.slug!,
      },
      include: {
        images: true,
        shops: true,
      },
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 1000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;
    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 1000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;
    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      starting_date: null,
    };
    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }
    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [String(colors)],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [String(sizes)],
      };
    }
    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shops: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);
    const totalPage = Math.ceil(total / parsedLimit);
    res.status(200).json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPage,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFilteredOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 1000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;
    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 1000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        starting_date: null,
      },
    };
    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }
    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [String(colors)],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [String(sizes)],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shops: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);
    const totalPage = Math.ceil(total / parsedLimit);
    res.status(200).json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPage,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }
    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(","),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          // followers:true,
          products: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);
    const totalPage = Math.ceil(total / parsedLimit);

    res.status(200).json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPage,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ products });
  } catch (error) {
    return next(error);
  }
};

export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topShopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
    });

    // Fetch the corresponding shop details
    const shopIds = topShopsData.map((item) => item.shopId);
    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatars: true,
        coverBanner: true,
        address: true,
        ratings: true,
        // followers: true,
        category: true,
      },
    });

    // Merge sales with shop data
    const enrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((s) => s.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    // Sort by sales and get top 10
    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ shops: top10Shops });
  } catch (error) {
    console.error("Error fetching top shops:", error);
    return next(error);
  }
};
