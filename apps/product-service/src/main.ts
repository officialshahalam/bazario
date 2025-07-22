import express from "express";
import './jobs/productCronJob'      // to delete product permanently after 24 hours
import cors from "cors";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");


const port = process.env.PORT || 4004;

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

app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

//swagger doc
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

app.use("/api", router);
app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Product Service is running on http://localhost${port}`);
});

server.on("error", (e) => {
  console.log("Server Error", e);
});
 