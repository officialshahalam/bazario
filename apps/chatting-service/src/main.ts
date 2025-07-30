import cookieParser from "cookie-parser";
import express from "express";
import { createWebSocketServer } from "./websocket";
import { startConsumer } from "./chat-message.consumer";
import router from "./routes/chatting.routes";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to chatting-service!" });
});

app.use("/api", router);

const port = process.env.PORT || 4007;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);

//websocker
createWebSocketServer(server);
// start kafka consumer
startConsumer().catch((err) => console.log(err));
