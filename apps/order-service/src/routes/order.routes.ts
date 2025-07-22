import express, { Router } from "express";
import {
  createPaymentIntent,
  createPaymentSessiion,
  verifyingPaymentSession,
} from "../controllers/order.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
const router: Router = express.Router();

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSessiion);
router.get('/verifying-payment-session',isAuthenticated,verifyingPaymentSession);


export default router;
