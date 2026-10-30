import { ZodIssue, ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(error: ZodError | ZodIssue[], statusCode: number = 400) {
    const issues: ZodIssue[] = error instanceof ZodError ? error.issues : error;

    const formattedMessage = issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "general";
        return `${path}: ${issue.message}`;
      })
      .join("; ");

    super(formattedMessage, statusCode);

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
