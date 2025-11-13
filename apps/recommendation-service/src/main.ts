import express from "express";
import * as path from "path";

const app = express();

app.use("/assets", express.static(path.join(__dirname, "assets")));

//swagger doc

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Recommendation Service is healthy!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

const port = process.env.PORT || 4010;
const server = app.listen(port, () => {
  console.log(`Recommendation Service is running on http://localhost${port}`);
});
server.on("error", console.error);
