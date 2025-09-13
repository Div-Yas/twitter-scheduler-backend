import multer from "multer";
import path from "path";
import fs from "fs";

// Store uploads under the backend directory for consistency
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  }
});

const allowed = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4", ".mov", ".avi"]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.has(ext)) return cb(null, true);
  return cb(new Error("Unsupported file type"));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export const getPublicUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};

export default upload;

