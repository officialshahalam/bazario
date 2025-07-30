import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  fetchMessages,
  fetchSellerMessages,
  getSellerConversation,
  getUserConversation,
  newConversation,
} from "../controllers/chatting.controller";
import { isSeller } from "@packages/middleware/authorizeRoles";
const router: Router = express.Router();

router.post(
  "/create-user-conversation-group",
  isAuthenticated,
  newConversation
);
router.get("/get-user-conversations", isAuthenticated, getUserConversation);
router.get(
  "/get-seller-conversations",
  isAuthenticated,
  isSeller,
  getSellerConversation
);
router.get("/get-messages/:conversationId", isAuthenticated, fetchMessages);
router.get(
  "/get-seller-messages/:conversationId",
  isAuthenticated,
  isSeller,
  fetchSellerMessages
);

export default router;
