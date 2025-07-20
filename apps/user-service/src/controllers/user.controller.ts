import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";

export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        isDefault: "desc",
      },
    });
    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};

export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;
    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError("All fields are required"));
    }
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });
    return res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError("Address ID is required"));
    }
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });
    if (!existingAddress) {
      return next(new ValidationError("Address not found or unauthorized"));
    }
    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
