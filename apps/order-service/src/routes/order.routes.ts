import express, { Router } from "express";
import {
  createPaymentIntent,
  createPaymentSession,
  verifyingPaymentSession,
} from "../controllers/order.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
const router: Router = express.Router();

router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get('/verifying-payment-session',isAuthenticated,verifyingPaymentSession);
router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);


export default router;
 