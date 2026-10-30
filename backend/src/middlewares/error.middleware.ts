import type { Response, ErrorRequestHandler } from "express";

import { AppError } from "../utils/AppError.js";
import { MongooseError } from "mongoose";

const handleDevError = (error: AppError, res: Response) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack,
  });
};

const handleProdError = (error: AppError, res: Response) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.log("💥ERROR: ", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const handleDuplicateError = (error: MongooseError) => {
  const keyValue = (
    error as MongooseError & { keyValue?: Record<string, unknown> }
  ).keyValue;
  const message = `Duplicate ${Object.keys(keyValue ?? {})} entered`;
  return new AppError(message, 400);
};

const handleCastError = (error: MongooseError) => {
  const message = `Resource not found. Invalid: ${(error as MongooseError & { path: string }).path}`;

  return new AppError(message, 400);
};

const handleInvalidJwtError = () => {
  return new AppError("Invalid JWT Token", 401);
};

const handleJwtTokenExpiredError = () => {
  return new AppError("JWT Token is expired. Try again", 401);
};

export const errorHandler: ErrorRequestHandler = (
  error: AppError & { code?: number },
  req,
  res,
  next,
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  let err = { ...error };
  err.message = error.message;

  // 11000 = Duplicate field error
  err.code =
    error instanceof MongooseError && error?.code === 11000
      ? error.code
      : undefined;

  // CastError = Invalid mongoDB ID
  err.name =
    error instanceof MongooseError && error.name == "CastError"
      ? "CastError"
      : error.name;

  if (process.env.NODE_ENV === "development") {
    handleDevError(error, res);
    return;
  } else if (process.env.NODE_ENV === "production") {
    if (error.code === 11000) err = handleDuplicateError(error);
    if (error.name === "CastError") err = handleCastError(error);
    if (error.name === "JsonWebTokenError") err = handleInvalidJwtError();
    if (error.name === "TokenExpiredError") err = handleJwtTokenExpiredError();

    handleProdError(err, res);
    return;
  }
};
