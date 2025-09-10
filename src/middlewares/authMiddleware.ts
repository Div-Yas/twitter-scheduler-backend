import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const protect = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, data: null, message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, data: null, message: "Not authorized, user not found" });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, data: null, message: "Not authorized, token failed" });
  }
};

export default protect;
