import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  getAllNotification,
  markNotificationAsRead,
  sellerNotification,
  userNotification,
} from "../controllers/notification.controller";
import { isAdmin, isSeller, isUser } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get(
  "/admin-notifications",
  isAuthenticated,
  isAdmin,
  getAllNotification
);
router.get(
  "/seller-notifications",
  isAuthenticated,
  isSeller,
  sellerNotification
);
router.get("/user-notifications", isAuthenticated, isUser, userNotification);
router.put(
  "/mark-notification-as-read",
  isAuthenticated,
  markNotificationAsRead
);

export default router;
