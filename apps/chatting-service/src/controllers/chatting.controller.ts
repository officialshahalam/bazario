import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/radis";
import {
  clearUnseenCount,
  getUnseenCount,
} from "@packages/libs/radis/message.redis";
import { NextFunction, Response } from "express";

export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.id;

    if (!sellerId) {
      return next(new ValidationError("Seller id is required"));
    }
    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });
    if (existingGroup) {
      return res.status(200).json({
        conversation: existingGroup,
        isNew: false,
      });
    }
    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });
    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup?.id,
          userId,
        },
        {
          conversationId: newGroup?.id,
          sellerId,
        },
      ],
    });

    return res.status(200).json({
      conversation: newGroup,
      isNew: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        // get all participents inside this conversation
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            sellerId: { not: null },
          },
        });
        //get the sellers full information
        let seller = null;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.seller.findUnique({
            where: {
              id: sellerParticipant?.sellerId,
            },
            include: {
              shop: true,
            },
          });
        }
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group?.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        let isOnline = false;
        if (sellerParticipant?.sellerId) {
          const redisKey = `online:seller:${sellerParticipant?.sellerId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("user", group?.id);

        return {
          conversationId: group?.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || "Unknown",
            isOnline,
            avatar: seller?.shop?.coverBanner,
          },
          lastMessage:
            lastMessage?.content || "Say something to start conversation",
          lastMessageAt: lastMessage?.createdAt || group?.updatedAt,
          unreadCount,
        };
      })
    );
    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

export const getSellerConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: sellerId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        // get all participents inside this conversation
        const userParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            userId: { not: null },
          },
        });
        //get the sellers full information
        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.user.findUnique({
            where: {
              id: userParticipant?.userId,
            },
            include: {
              avatars: true,
            },
          });
        }
        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group?.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        let isOnline = false;
        if (userParticipant?.sellerId) {
          const redisKey = `online:user:${userParticipant?.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("seller", group?.id);

        return {
          conversationId: group?.id,
          user: {
            id: user?.id || null,
            name: user?.name || "Unknown",
            avatar: user?.avatars || null,
            isOnline,
          },
          lastMessage:
            lastMessage?.content || "Say something to start conversation",
          lastMessageAt: lastMessage?.createdAt || group?.updatedAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

// fetch user side messages
export const fetchMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    const hasAccess = conversation.participantIds.includes(userId);
    if (!hasAccess) {
      return next(new AuthError("Access denied to this conversation"));
    }

    // Clear unseen messages for this user
    await clearUnseenCount("user", conversationId);

    // Get the seller participant
    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId: { not: null },
      },
    });

    // Fetch seller info
    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.seller.findUnique({
        where: { id: sellerParticipant.sellerId },
        include: {
          shop: true,
        },
      });

      // Check seller online status
      const redisKey = `online:seller:${sellerParticipant.sellerId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    // Fetch paginated messages (latest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || "Unknown",
        avatar: seller?.shop?.coverBanner || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch seller side message
export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("Conversation ID is required"));
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    const hasAccess = conversation.participantIds.includes(sellerId);
    if (!hasAccess) {
      return next(new AuthError("Access denied to this conversation"));
    }

    // Clear unseen messages for this user
    await clearUnseenCount("seller", conversationId);

    // Get the seller participant
    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    // Fetch seller info
    let user = null;
    let isOnline = false;

    if (userParticipant?.sellerId) {
      user = await prisma.user.findUnique({
        where: { id: userParticipant.sellerId },
        include: {
          avatars: true,
        },
      });

      // Check seller online status
      const redisKey = `online:user:${userParticipant.userId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    // Fetch paginated messages (latest first)
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      user: {
        id: user?.id || null,
        name: user?.name || "Unknown",
        avatar: user?.avatars || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};
