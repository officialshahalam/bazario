import express from "express";
import WebSocket from "ws";
import http from "http";
import cors from "cors";
import { consumeKafkaMessages } from "./logger-consumer";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");

const port = process.env.PORT || 4008;

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    allowedHeaders: ["Authorization", "Content-type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

//swagger doc
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

const wsServer = new WebSocket.Server({ noServer: true });

export const clients = new Set<WebSocket>();

wsServer.on("connection", (ws) => {
  console.log("New logger client connected");
  clients.add(ws);

  ws.on("close", () => {
    console.log("Logger client disconnected");
    clients.delete(ws);
  });
});

const server = http.createServer(app);

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, request);
  });
});

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

// start kafka consumer
consumeKafkaMessages();
