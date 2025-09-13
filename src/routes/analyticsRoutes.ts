import express from "express";
import { getAnalytics, getTrendingTopics, getHashtagSuggestions } from "../controllers/analyticsController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getAnalytics);
router.get("/trending", protect, getTrendingTopics);
router.post("/hashtags", protect, getHashtagSuggestions);

export default router;

