import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import {
  followShop,
  getShop,
  getShopProducts,
  getShopEvents,
  unfollowShop,
  getFollowStatus,
} from "../controllers/seller.controller";
const router: Router = express.Router();

router.get("/get-shop/:shopId", getShop);
router.get("/get-shop-products/:shopId", isAuthenticated, getShopProducts);
router.get("/get-shop-events/:shopId", isAuthenticated, getShopEvents);
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop);
router.get("/get-follow-status/:shopId", isAuthenticated, getFollowStatus);

export default router;
