import express from "express";
import protect from "../middlewares/authMiddleware";
import { upload, getPublicUrl } from "../middlewares/upload";

const router = express.Router();

router.post("/", protect, upload.array("media", 4), (req: any, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const urls = files.map(f => getPublicUrl(f.filename));
  return res.json({ success: true, data: { urls }, message: "Uploaded" });
});

export default router;

