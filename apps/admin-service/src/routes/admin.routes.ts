import { isAdmin } from "@packages/middleware/authorizeRoles";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import express, { Router } from "express";
import { getAllProduct } from "../controllers/admin.controller";

const router: Router = express.Router();

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProduct);

export default router;
