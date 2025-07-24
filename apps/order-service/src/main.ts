import express from "express";
import cors from "cors";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/order.routes";
import swaggerUi from "swagger-ui-express";
import { createOrder } from "./controllers/order.controller";
const swaggerDocument = require("./swagger-output.json");
import bodyParser from "body-parser";

const port = process.env.PORT || 4005;

const app = express();
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
app.post(
  "/api/create-order",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello Order API" });
});

//swagger doc
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});
app.use(errorMiddleware);

app.use("/api", router);
// api

const server = app.listen(port, () => {
  console.log(`Order Service is running on http://localhost${port}`);
});

server.on("error", (e) => {
  console.log("Server Error", e);
});
