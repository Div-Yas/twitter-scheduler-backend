import express from "express";
import protect from "../middlewares/authMiddleware";
import { z } from "zod";
import validate from "../middlewares/validate";
import User from "../models/User";

const router = express.Router();

const settingsSchema = z.object({ timeZone: z.string().min(1) });

router.put("/settings", protect, validate(settingsSchema), async (req: any, res) => {
  const { timeZone } = req.body as { timeZone: string };
  await User.findByIdAndUpdate(req.user._id, { timeZone });
  return res.json({ success: true, data: { timeZone }, message: "Settings updated" });
});

export default router;

