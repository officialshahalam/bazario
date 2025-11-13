import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { createWebSocketServer } from "./websocket";
import { startConsumer } from "./chat-message.consumer";
import router from "./routes/chatting.routes";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";

const port = process.env.PORT || 4009;
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");

const app = express();
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3002",
  "https://bazario.officialshahalam.me",
  "https://seller.bazario.officialshahalam.me",
  "https://admin.bazario.officialshahalam.me",
  "http://localhost:4000",
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
app.use(express.json());
app.use(cookieParser());

app.use("/api", router);
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Chatting Service is healthy!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

//swagger doc
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);

//websocker
createWebSocketServer(server);
// start kafka consumer
startConsumer().catch((err) => console.log(err));
