import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/radis";
import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/sendMail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    console.log("selectedAddress id", selectedAddressId);
    const userId = req.user.id;
    if (!cart || !Array.isArray(cart) || cart?.length === 0) {
      return next(new ValidationError("Cart is empty or invalid"));
    }
    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: item.id,
          quantity: item?.quantity,
          sale_price: item?.sale_price,
          shopId: item?.shopId,
          selectedOptions: item?.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys("payment-session:*");
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session?.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item?.quantity,
                sale_price: item?.sale_price,
                shopId: item?.shopId,
                selectedOptions: item?.selectedOptions || {},
              }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          );
          if (existingCart === normalizedCart) {
            return res.status(200).json({
              sessionId: key.split(":")[1],
            });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        sellerId: true,
        seller: {
          select: {
            stripeId: true,
          },
        },
      },
      where: {
        id: { in: uniqueShopIds },
      },
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop?.id,
      sellerId: shop?.sellerId,
      stripeAccountId: shop?.seller?.stripeId,
    }));

    const totalAmount = cart.reduce(
      (total: number, item: any) => total + item.quantity * item?.sale_price,
      0
    );

    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
    };
    await redis.setex(
      `payment-session:${sessionId}`,
      60 * 10,
      JSON.stringify(sessionData)
    );
    return res.status(201).json({
      sessionId,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyingPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({
        error: "Session id is required",
      });
    }
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({
        error: "Session is not found or expired",
      });
    }

    const session = JSON.parse(sessionData);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, sellerStripeAccountId, sessionId } = req.body;
    const customerAmount = Math.round(amount * 100);
    const plateFormFee = Math.round(customerAmount * 0.1);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: plateFormFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req?.user?.id,
      },
    });

    return res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return next(error);
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];
    if (!stripeSignature) {
      return res.status(400).send("Missing stripe signature");
    }
    const rawBody = (req as any).rawBody;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error("Webhook signature varification failed.", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;
      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn("Session data expired or missing for", sessionId);
        return res
          .status(200)
          .send("No session found, skipping order creation");
      }
      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item?.shopId]) acc[item?.shopId] = [];
        acc[item?.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];
        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );
          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;

            orderTotal -= discount;
          }
        }
        // Create order
        await prisma.order.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: "Paid",
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions,
              })),
            },
          },
        });
        for (const item of orderItems) {
          const { id: productId, quantity } = item;
          // Update product stock and sales
          await prisma.product.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity },
            },
          });
          // Update product analytics
          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: quantity },
            },
          });
          // Check for existing user analytics
          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId },
          });

          // Create new purchase action
          const newAction = {
            productId,
            shopId,
            action: "purchase",
            timestamp: Date.now(),
          };
          const currentActions = Array.isArray(existingAnalytics?.actions)
            ? (existingAnalytics.actions as Prisma.JsonArray)
            : [];

          // Update or create user analytics
          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: { userId },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
              },
            });
          }
        }

        // notification to user
        await sendEmail(
          email,
          "your Bazario order confirmation",
          "order-confirmation",
          {
            name,
            cart,
            originalTotal: totalAmount, // Original total before discount
            totalAmount: coupon?.discountAmount
              ? totalAmount - coupon?.discountAmount
              : totalAmount, // Final total after discount
            trackingUrl: `https://bazario.com/order/${sessionId}`,
            coupon: coupon || null,
          }
        );

        // notification to seller
        const createdShopIds = Object.keys(shopGrouped);
        const sellerShops = await prisma.shop?.findMany({
          select: {
            id: true,
            sellerId: true,
            name: true,
          },
          where: {
            id: { in: createdShopIds },
          },
        });

        for (const shop of sellerShops) {
          const firstProduct = shopGrouped[shop?.id][0];
          const productTitle = firstProduct?.title || "new tem";

          await prisma.notification.create({
            data: {
              title: "New Order revieved",
              message: `A customer just ordered ${productTitle} from your shop`,
              creatorId: userId,
              receiverId: shop?.sellerId,
              redirect_link: `https://bazario.com/order/${sessionId}`,
            },
          });
        }

        await prisma.notification.create({
          data: {
            title: "Plateform order alert",
            message: `A new order was placed by ${name}.`,
            creatorId: userId,
            receiverId: process.env.ADMIN_USER_ID!,
            redirect_link: `https://bazario.com/order/${sessionId}`,
          },
        });
        await redis.del(sessionKey);
      }
    }
    res.status(200).json({
      recieved: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: {
        sellerId: req?.seller?.id,
      },
    });

    const orders = await prisma.order.findMany({
      where: {
        shopId: shop?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatars: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });
    if (!order) {
      return next(new NotFoundError("Order not found with the id"));
    }
    const shippingAddress = order?.shippingAddressId
      ? await prisma?.address?.findUnique({
          where: {
            id: order?.shippingAddressId,
          },
        })
      : null;
    const coupon = order?.couponCode
      ? await prisma.discountCode.findUnique({
          where: {
            discountCode: order?.couponCode,
          },
        })
      : null;

    const productIds = order.items?.map((item) => item?.productId);
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        images: true,
      },
      where: {
        id: { in: productIds },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const items = order?.items.map((item) => ({
      ...item,
      selectedOptions: item?.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));
    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        couponCode: coupon,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateDeliveryStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;
    if (!orderId || !deliveryStatus) {
      return next(new ValidationError("Missing order id or delivery status"));
    }
    const allowedStatuses = [
      "Ordered",
      "Packed",
      "Shipped",
      "Out for delivery",
      "Delivered",
    ];
    if (!allowedStatuses.includes(deliveryStatus)) {
      return next(new ValidationError("Invalid Delivery status"));
    }
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    if (!existingOrder) {
      return next(new NotFoundError("Order not found!"));
    }
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryStatus: deliveryStatus,
        updatedAt: new Date(),
      },
    });
    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyCouponCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body;
    if (!couponCode || !cart || cart.length === 0) {
      return next(new ValidationError("Coupon code an dcart are required"));
    }

    const discount = await prisma.discountCode.findUnique({
      where: {
        discountCode: couponCode,
      },
    });

    if (!discount) {
      return next(new ValidationError("Coupon code is not valid!"));
    }

    const matchingProduct = cart.find((item: any) =>
      item.discountCode?.some((d: any) => d === discount.id)
    );

    if (!matchingProduct) {
      return res.status(200).json({
        valid: false,
        discount: 0,
        discountAmount: 0,
        message: "No Matching product found in cart for this coupon",
      });
    }

    let discountAmount = 0;
    const price = matchingProduct?.sale_price * matchingProduct?.quantity;
    if (discount?.discountType === "percentage") {
      discountAmount = (price * discount?.discountValue) / 100;
    } else if (discount?.discountType === "flat") {
      discountAmount = discount?.discountValue;
    }

    discountAmount = Math.min(discountAmount, price);

    res.status(200).json({
      valid: true,
      discount: discount?.discountValue,
      discountAmount: discountAmount.toFixed(2),
      discountedProductId: matchingProduct?.id,
      discountType: discount?.discountType,
      message: "Discount Applied to 1 eligibal product",
    });
  } catch (error) {
    return next(error);
  }
};
