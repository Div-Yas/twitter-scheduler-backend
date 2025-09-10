import express from "express";
import { createTweet, getTweets, updateTweet, deleteTweet } from "../controllers/tweetController";
import protect from "../middlewares/authMiddleware";
import validate from "../middlewares/validate";
import { z } from "zod";

const router = express.Router();

const createTweetSchema = z.object({
  content: z.string().min(1).max(280),
  scheduledAt: z.string().datetime().or(z.string().min(1)),
  status: z.enum(["draft", "scheduled", "posted"]).optional(),
  media: z.array(z.string().url()).max(4).optional()
});

const updateTweetSchema = z.object({
  content: z.string().min(1).max(280).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["draft", "scheduled", "posted"]).optional(),
  media: z.array(z.string().url()).max(4).optional()
});

router.post("/", protect, validate(createTweetSchema), createTweet);
router.get("/", protect, getTweets);
router.put("/:id", protect, validate(updateTweetSchema), updateTweet);
router.delete("/:id", protect, deleteTweet);

export default router;
