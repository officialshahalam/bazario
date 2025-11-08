import express, { NextFunction, Response } from "express";
import * as path from "path";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { initializeConfig } from "./libs/initializeSiteConfig";

const app = express();
const port = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = isProduction
  ? [
      "https://shondhane.com",
      "https://sellers.shondhane.com",
      "https://admin.shondhane.com",
      "http://nginx",
      "http://localhost",
    ]
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ["Authorization", "Content-type"],
    credentials: true,
  })
);

app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", isProduction ? "loopback" : 1);

// rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many request try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.ip,
});
app.use(limiter);

const getServiceUrl = (serviceName: string, port: number) => {
  if (isProduction) {
    return `http://${serviceName}:${port}`;
  } else {
    return `http://localhost:${port}`;
  }
};

const createProxyMiddleware = (serviceUrl: string, serviceName: string) => {
  return proxy(serviceUrl, {
    timeout: 30000, // 30-second timeout

    proxyReqOptDecorator: (proxyReqOpts: any, srcReq: express.Request) => {
      proxyReqOpts.headers["X-Forwarded-For"] = srcReq.ip;
      proxyReqOpts.headers["X-Original-Host"] = srcReq.get("host");
      return proxyReqOpts;
    },

    proxyErrorHandler: (err: any, res: Response, next: NextFunction) => {
      console.error(`Proxy error for ${serviceName}:`, err.message);

      if (!res.headersSent) {
        res.status(503).json({
          error: "Service temporarily unavailable",
          service: serviceName,
          timestamp: new Date().toISOString(),
        });
      } else {
        next(err);
      }
    },
  });
};

app.use(
  "/auth",
  createProxyMiddleware(getServiceUrl("auth-service", 4001), "auth-service")
);
app.use(
  "/admin",
  createProxyMiddleware(getServiceUrl("admin-service", 4002), "admin-service")
);
app.use(
  "/seller",
  createProxyMiddleware(getServiceUrl("seller-service", 4003), "seller-service")
);
app.use(
  "/user",
  createProxyMiddleware(getServiceUrl("user-service", 4004), "user-service")
);
app.use(
  "/product",
  createProxyMiddleware(
    getServiceUrl("product-service", 4005),
    "product-service"
  )
);
app.use(
  "/order",
  createProxyMiddleware(getServiceUrl("order-service", 4006), "order-service")
);
app.use(
  "/notification",
  createProxyMiddleware(
    getServiceUrl("notification-service", 4007),
    "notification-service"
  )
);
app.use(
  "/logger",
  createProxyMiddleware(getServiceUrl("logger-service", 4008), "logger-service")
);
app.use(
  "/chatting",
  createProxyMiddleware(
    getServiceUrl("chatting-service", 4009),
    "chatting-service"
  )
);
app.use(
  "/recommendation",
  createProxyMiddleware( 
    getServiceUrl("recommendation-service", 4010),
    "recommendation-service"
  )
);

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.get("/", (_req, res) => {
  res.send({
    message: "🎉Welcome to api-gateway!",
  });
});

app.get("/gateway-health", (req, res) => {
  res.status(200).json({
    message: "API Gateway is healthy!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

const server = app.listen(port, () => {
  console.log(`Api gateway is running on http://localhost${port}`);
  try {
    initializeConfig();
    console.log("✅site config is initialized successfully");
  } catch (error) {
    console.log("❌Error while Initialized site config", error);
  }
});

server.on("error", (e) => {
  console.log("❌Server Error", e);
});
