import express, { Router } from "express";
import {
  addUserAddress,
  deleteUserAddress,
  getUserAddresses,
} from "../controllers/user.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/shipping-addresses", isAuthenticated, getUserAddresses);
router.post("/add-address", isAuthenticated, addUserAddress);
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress);

export default router;
