import express, { Router } from "express";
import {
  createShop,
  createStripeConnectLink,
  getSeller,
  getUser,
  loginAdmin,
  loginSeller,
  loginUser,
  logoutAdmin,
  logoutSeller,
  refreshToken,
  registerSeller,
  resetUserPassword,
  updateUserPassword,
  userForgotPassword,
  userRegistration,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin, isSeller, isUser } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPassword);
router.post("/reset-password-user", resetUserPassword);

router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);
router.get("/logout-seller", isAuthenticated, isSeller, logoutSeller);

router.post("/login-admin", loginAdmin);
router.get("/logout-admin", isAuthenticated, isAdmin, logoutAdmin);

router.post("/change-password", isAuthenticated, updateUserPassword);
router.post("/refresh-token", refreshToken);

export default router;
