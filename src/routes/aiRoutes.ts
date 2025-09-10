import express from "express";
import { suggestContent } from "../controllers/aiController";
import protect from "../middlewares/authMiddleware";
import validate from "../middlewares/validate";
import { z } from "zod";

const router = express.Router();

const suggestionSchema = z.object({ topic: z.string().optional() });

router.post("/suggest", protect, validate(suggestionSchema), suggestContent);

export default router;

