import express from "express";
import "./jobs/productCronJob"; // to delete product permanently after 24 hours
import cors from "cors";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");

const port = process.env.PORT || 4005;

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:4000",
  "https://bazario.officialshahalam.me",
  "https://seller.bazario.officialshahalam.me",
  "https://admin.bazario.officialshahalam.me",
  "https://api.bazario.officialshahalam.me",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowedHeaders: ["Authorization", "Content-type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use("/api", router);
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Product Service is healthy!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

//swagger doc
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Product Service is running on http://localhost${port}`);
});

server.on("error", (e) => {
  console.log("Server Error", e);
});
