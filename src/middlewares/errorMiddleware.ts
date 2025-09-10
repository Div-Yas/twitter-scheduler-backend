import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ success: false, data: null, message: "Not Found" });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ success: false, data: null, message });
};

export default errorHandler;

