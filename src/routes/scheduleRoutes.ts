import express from "express";
import protect from "../middlewares/authMiddleware";
import { recommendTimes } from "../services/scheduleAdvisor";

const router = express.Router();

router.get("/recommend", protect, async (req: any, res) => {
  const times = await recommendTimes(req.user._id.toString());
  return res.json({ success: true, data: { times }, message: "Recommendations" });
});

export default router;

