/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
import * as path from "path";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import initializeConfig from "./libs/initializeSiteConfig";

const app = express();

const port = process.env.PORT || 4000;

// (async () => {
//   try {
//     const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//     const deleted = await stripe.accounts.del("acct_1uykiglO0");
//     console.log("deleted Account", deleted);
//   } catch (error) {
//     console.log("error while deleting stripe account", error);
//   }
// })();

// (async () => {
//   try {
//     const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//     const account = await stripe.accounts.retrieve("acct_1RwssfQ0bI"); // mohd shahalam id
//     console.log("Stripe account:", account); // e.g., 'IN' for India, 'US' for United States
//   } catch (err) {
//     console.log("Error while get stripe Account details", err);
//   }
// })();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    allowedHeaders: ["Authorization", "Content-type"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many request try again later" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
});

app.use(limiter);

app.use("/auth", proxy("http://localhost:4001"));
app.use("/admin", proxy("http://localhost:4002"));
app.use("/seller", proxy("http://localhost:4003"));
app.use("/user", proxy("http://localhost:4004"));
app.use("/product", proxy("http://localhost:4005"));
app.use("/order", proxy("http://localhost:4006"));
app.use("/notification", proxy("http://localhost:4007"));
app.use("/logger", proxy("http://localhost:4008"));
app.use("/chatting", proxy("http://localhost:4009"));
app.use("/recommendation", proxy("http://localhost:4010"));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.send({ 
    message: "Welcome to api-gateway!",
  });
});

app.get("/gateway-health", (req, res) => {
  res.send({
    message: "Health of api gate is good!",
  });
});

const server = app.listen(port, () => {
  console.log(`Api gateway is running on http://localhost${port}`);
  console.log(`Check Health at http://localhost:${port}/gateway-health`);
  console.log(`Swagger Auth Docs is available at http://localhost:${port}/auth/docs`);
  console.log(`Swagger Admin Docs is available at http://localhost:${port}/admin/docs`);
  console.log(`Swagger Seller Docs is available at http://localhost:${port}/seller/docs`);
  console.log(`Swagger User Docs is available at http://localhost:${port}/user/docs`);
  console.log(`Swagger Product Docs is available at http://localhost:${port}/product/docs`);
  console.log(`Swagger Order Docs is available at http://localhost:${port}/order/docs`);
  console.log(`Swagger Notification Docs is available at http://localhost:${port}/notification/docs`);
  console.log(`Swagger Logger Docs is available at http://localhost:${port}/logger/docs`);
  console.log(`Swagger Chatting Docs is available at http://localhost:${port}/chatting/docs`);
  console.log(`Swagger Recommendation Docs is available at http://localhost:${port}/recommendation/docs`);
  try {
    initializeConfig();
    console.log("site config is initialized successfully");
  } catch (error) {
    console.log("Error while Initialized site config", error);
  }
});

server.on("error", (e) => {
  console.log("Server Error", e);
});
