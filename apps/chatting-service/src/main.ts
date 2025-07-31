import cookieParser from "cookie-parser";
import express from "express";
import { createWebSocketServer } from "./websocket";
import { startConsumer } from "./chat-message.consumer";
import router from "./routes/chatting.routes";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";

import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");


const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => { 
  res.send({ message: "Welcome to chatting-service!" });
});

//swagger doc
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});
app.use(errorMiddleware);

app.use("/api", router);

const port = process.env.PORT || 4009;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);

//websocker
createWebSocketServer(server);
// start kafka consumer
startConsumer().catch((err) => console.log(err));
