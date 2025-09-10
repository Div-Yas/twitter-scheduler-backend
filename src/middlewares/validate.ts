import { NextFunction, Request, Response } from "express";
import { ZodTypeAny, ZodError } from "zod";

export const validate = (schema: ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = await schema.parseAsync(req.body);
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, data: null, message: err.errors.map(e => e.message).join(", ") });
    }
    return res.status(400).json({ success: false, data: null, message: "Invalid request" });
  }
};

export default validate;

