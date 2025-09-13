import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body as { email: string; password: string; name?: string };
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ success: false, data: null, message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword, name });

  res.json({ success: true, data: { _id: user._id, email: user.email, name: user.name, token: generateToken(user._id.toString()) }, message: "Registered" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(401).json({ success: false, data: null, message: "Invalid credentials" });
  }
  if (await bcrypt.compare(password, user.password)) {
    res.json({ success: true, data: { _id: user._id, email: user.email, name: user.name, token: generateToken(user._id.toString()) }, message: "Logged in" });
  } else {
    res.status(401).json({ success: false, data: null, message: "Invalid credentials" });
  }
};
