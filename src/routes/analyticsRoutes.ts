import express from "express";
import { getAnalytics } from "../controllers/analyticsController";
import protect from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", protect, getAnalytics);

export default router;

