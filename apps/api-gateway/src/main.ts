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

app.use("/auth", proxy(process.env.AUTH_SERVICE_URL!));
app.use("/admin", proxy(process.env.ADMIN_SERVICE_URL!));
app.use("/seller", proxy(process.env.SELLER_SERVICE_URL!));
app.use("/user", proxy(process.env.USER_SERVICE_URL!));
app.use("/product", proxy(process.env.PRODUCT_SERVICE_URL!));
app.use("/order", proxy(process.env.ORDER_SERVICE_URL!));
app.use("/notification", proxy(process.env.NOTIFICATION_SERVICE_URL!));
app.use("/logger", proxy(process.env.LOGGER_SERVICE_URL!));
app.use("/chatting", proxy(process.env.CHATTING_SERVICE_URL!));
app.use("/recommendation", proxy(process.env.RECOMMENDATION_SERVICE_URL!));

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
  console.log(
    `Swagger Auth Docs is available at http://localhost:${port}/auth/docs`
  );
  console.log(
    `Swagger Admin Docs is available at http://localhost:${port}/admin/docs`
  );
  console.log(
    `Swagger Seller Docs is available at http://localhost:${port}/seller/docs`
  );
  console.log(
    `Swagger User Docs is available at http://localhost:${port}/user/docs`
  );
  console.log(
    `Swagger Product Docs is available at http://localhost:${port}/product/docs`
  );
  console.log(
    `Swagger Order Docs is available at http://localhost:${port}/order/docs`
  );
  console.log(
    `Swagger Notification Docs is available at http://localhost:${port}/notification/docs`
  );
  console.log(
    `Swagger Logger Docs is available at http://localhost:${port}/logger/docs`
  );
  console.log(
    `Swagger Chatting Docs is available at http://localhost:${port}/chatting/docs`
  );
  console.log(
    `Swagger Recommendation Docs is available at http://localhost:${port}/recommendation/docs`
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