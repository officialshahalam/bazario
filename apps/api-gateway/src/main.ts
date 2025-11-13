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

const allowedOrigins = [
  "https://bazario.officialshahalam.me",
  "https://seller.bazario.officialshahalam.me",
  "https://admin.bazario.officialshahalam.me",
  "https://api.bazario.officialshahalam.me",
  "http://localhost:4000",
  "http://localhost:3001",
  "http://localhost:3002",
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

app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", isProduction ? "loopback" : 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many requests, try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.ip,
});
app.use(limiter);

const getServiceUrl = (serviceName: string, port: number) => {
  return isProduction
    ? `http://${serviceName}-service:${port}`
    : `http://localhost:${port}`;
};

const createProxyMiddleware = (serviceName: string, port: number) => {
  const serviceUrl = getServiceUrl(serviceName, port);
  return proxy(serviceUrl, {
    timeout: 30000,
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

app.use("/auth", createProxyMiddleware("auth", 4001));
app.use("/admin", createProxyMiddleware("admin", 4002));
app.use("/seller", createProxyMiddleware("seller", 4003));
app.use("/user", createProxyMiddleware("user", 4004));
app.use("/product", createProxyMiddleware("product", 4005));
app.use("/order", createProxyMiddleware("order", 4006));
app.use("/notification", createProxyMiddleware("notification", 4007));
app.use("/logger", createProxyMiddleware("logger", 4008));
app.use("/chatting", createProxyMiddleware("chatting", 4009));
app.use("/recommendation", createProxyMiddleware("recommendation", 4010));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bazario API Gateway</title>
        <style>
          :root {
            --bg-dark: #0f172a;
            --card-bg: #1e293b;
            --card-hover: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --label-color: #cbd5e1;
            --value-color: #38bdf8;
            --accent: #38bdf8;
            --section-title: #facc15;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 2rem 1rem;
          }
          h1 {
            font-size: 2.2rem;
            color: var(--accent);
            margin-bottom: 0.5rem;
            text-align: center;
          }
          h2 {
            font-size: 1.6rem;
            color: var(--section-title);
            margin-top: 2rem;
            margin-bottom: 1rem;
            width: 100%;
            max-width: 1180px;
          }
          .services {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
            width: 100%;
            max-width: 1180px;
          }
          .services h3:hover{
            text-decoration: underline;
          }
          .card {
            background: var(--card-bg);
            padding: 1.4rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid var(--card-hover);
            transition: all 0.25s ease-in-out;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .card:hover {
            transform: translateY(-3px);
          }
          .card h3 {
            margin-bottom: 1rem;
            color: var(--accent);
            font-size: 1.1rem;
          }
          .credentials {
            background: rgba(148, 163, 184, 0.1);
            border-radius: 8px;
            padding: 0.9rem;
            font-size: 0.95rem;
            text-align: left;
            width: 100%;
          }
          .credentials p {
            margin: 0.4rem 0;
            cursor: pointer;
            transition: color 0.2s;
          }
          .credentials p:hover {
            color: var(--section-title);
          }
          .label {
            color: var(--label-color);
            font-size: 0.95rem;
            font-weight: 600;
          }
          .value {
            color: var(--value-color);
            font-size: 1rem;
            font-weight: 500;
            margin-left: 0.3rem;
            word-break: break-all;
          }
          .copy-btn {
            background: var(--accent);
            border: none;
            color: var(--bg-dark);
            font-size: 0.8rem;
            font-weight: bold;
            border-radius: 6px;
            padding: 3px 8px;
            margin-left: 6px;
            cursor: pointer;
          }
          .copy-btn:hover {
            background: #7dd3fc;
          }
          footer {
            margin-top: 3rem;
            font-size: 0.9rem;
            color: #64748b;
          }

          /* Toast message */
          .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent);
            color: var(--bg-dark);
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .toast.show {
            opacity: 1;
          }
        </style>
      </head>
      <body>
        <h1>🎉 Welcome to the Bazario API Gateway!</h1>
        <p>Seamlessly connect to all Bazario services and UIs.</p>

        <!-- 🌐 Frontend Domains -->
        <h2>🌐 Frontend Domains</h2>
        <div class="services">
          <a
            href="https://bazario.officialshahalam.me"
            target="_blank"
            class="card"
          >
            <h3>User UI</h3>
            <div class="credentials">
              <p>
                <span class="label">Test Email:</span>
                <span class="value">ansarishahalam855@gmail.com</span>
                <button
                  onclick="copyText('ansarishahalam855@gmail.com', event)"
                  class="copy-btn"
                >
                  Copy
                </button>
              </p>
              <p>
                <span class="label">Test Password:</span>
                <span class="value">test12</span>
                <button onclick="copyText('test12', event)" class="copy-btn">
                  Copy
                </button>
              </p>
            </div>
          </a>

          <a
            href="https://seller.bazario.officialshahalam.me"
            target="_blank"
            class="card"
          >
            <h3>Seller UI</h3>
            <div class="credentials">
              <p>
                <span class="label">Test Email:</span>
                <span class="value">unofficialshahalam855@gmail.com</span>
                <button
                  onclick="copyText('unofficialshahalam855@gmail.com', event)"
                  class="copy-btn"
                >
                  Copy
                </button>
              </p>
              <p>
                <span class="label">Test Password:</span>
                <span class="value">test12</span>
                <button onclick="copyText('test12', event)" class="copy-btn">
                  Copy
                </button>
              </p>
            </div>
          </a>

          <a
            href="https://admin.bazario.officialshahalam.me"
            target="_blank"
            class="card"
          >
            <h3>Admin UI</h3>
            <div class="credentials">
              <p>
                <span class="label">Test Email:</span>
                <span class="value">officialshahalam855@gmail.com</span>
                <button
                  onclick="copyText('officialshahalam855@gmail.com', event)"
                  class="copy-btn"
                >
                  Copy
                </button>
              </p>
              <p>
                <span class="label">Test Password:</span>
                <span class="value">test12</span>
                <button onclick="copyText('test12', event)" class="copy-btn">
                  Copy
                </button>
              </p>
            </div>
          </a>
        </div>

        <!-- ⚙️ Backend API Docs -->
        <h2>⚙️ Backend API Docs</h2>
        <div class="services">
          <a
            href="https://api.bazario.officialshahalam.me/auth/"
            target="_blank"
            class="card"
          >
            <h3>Auth Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/admin/"
            target="_blank"
            class="card"
          >
            <h3>Admin Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/seller/"
            target="_blank"
            class="card"
          >
            <h3>Seller Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/user/"
            target="_blank"
            class="card"
          >
            <h3>user Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/product/"
            target="_blank"
            class="card"
          >
            <h3>Product Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/order/"
            target="_blank"
            class="card"
          >
            <h3>Order Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/notification/"
            target="_blank"
            class="card"
          >
            <h3>Npotification Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/chatting/"
            target="_blank"
            class="card"
          >
            <h3>Chatting Service Docs</h3>
          </a>
          <a
            href="https://api.bazario.officialshahalam.me/logger/"
            target="_blank"
            class="card"
          >
            <h3>Logger Service Docs</h3>
          </a>
        </div>

        <div id="toast" class="toast">Copied!</div>

        <script>
          function copyText(text, event) {
            event.stopPropagation(); // prevent opening the link
            event.preventDefault();
            navigator.clipboard.writeText(text);
            const toast = document.getElementById("toast");
            toast.textContent = "Copied!";
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 1200);
          }
        </script>
      </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "API Gateway is healthy!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

const server = app.listen(port, () => {
  console.log(`🚀 API Gateway is running on http://localhost:${port}`);
  try {
    initializeConfig();
    console.log("✅ Site config initialized successfully");
  } catch (error) {
    console.log("❌ Error while initializing site config", error);
  }
});

server.on("error", (e) => {
  console.log("❌ Server Error:", e);
});
