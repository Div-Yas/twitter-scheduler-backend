import { Request, Response } from "express";
import Tweet from "../models/Tweet";
import { summarize } from "../services/analyticsService";

export const getAnalytics = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const [total, scheduled, posted, drafts] = await Promise.all([
      Tweet.countDocuments({ user: userId }),
      Tweet.countDocuments({ user: userId, status: "scheduled" }),
      Tweet.countDocuments({ user: userId, status: "posted" }),
      Tweet.countDocuments({ user: userId, status: "draft" })
    ]);

    const recent = await Tweet.find({ user: userId }).sort({ updatedAt: -1 }).limit(50);
    const perf = summarize(recent);

    return res.json({ success: true, data: { total, scheduled, posted, drafts, performance: perf }, message: "Analytics fetched" });
  } catch (error) {
    return res.status(500).json({ success: false, data: null, message: "Server error" });
  }
};

export default getAnalytics;

