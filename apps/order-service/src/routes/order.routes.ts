import express, { Router } from "express";
import {
  createPaymentIntent,
  createPaymentSession,
  getOrderDetails,
  getSellerOrders,
  updateDeliveryStatus,
  verifyCouponCode,
  verifyingPaymentSession,
} from "../controllers/order.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";
const router: Router = express.Router();

router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get(
  "/verifying-payment-session",
  isAuthenticated,
  verifyingPaymentSession
);
router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
// webhook route that is created at main.ts

router.get("/get-seller-orders", isAuthenticated, isSeller, getSellerOrders);
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
router.put(
  "/update-status/:orderId",
  isAuthenticated,
  isSeller,
  updateDeliveryStatus
);
router.put("/verify-coupon", isAuthenticated, verifyCouponCode);

export default router;
