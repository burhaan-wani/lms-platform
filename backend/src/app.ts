import express from "express";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware.js";

export const app = express();

const options: CorsOptions = {
  origin: process.env.ORIGIN_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(options));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

// Health check endpoint
app.get("/health-check", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server up and running",
  });
});

// Endpoint for unknown routes
app.use("/", (req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);
