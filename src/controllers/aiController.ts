import { Request, Response } from "express";
import { getTweetSuggestions } from "../services/aiService";

export const suggestContent = async (req: Request, res: Response) => {
  const { topic } = req.body as { topic?: string };
  const suggestions = await getTweetSuggestions(topic || "");
  return res.json({ success: true, data: { suggestions }, message: "Suggestions generated" });
};

export default suggestContent;

