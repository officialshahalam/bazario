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
app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
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
app.use("/product", proxy("http://localhost:4002"));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  console.log(`Swagger Auth Docs is available at localhost:${port}/auth/docs`);
  console.log(
    `Swagger Product Docs is available at localhost:${port}/product/docs`
  );
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
