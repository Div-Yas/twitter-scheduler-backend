import express from "express";
import { register, login } from "../controllers/authController";
import passport from "passport";
import { generateToken } from "../utils/generateToken";
import validate from "../middlewares/validate";
import { z } from "zod";
const router = express.Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional()
});

router.post("/register", validate(authSchema), register);
router.post("/login", validate(authSchema), login);

// Initiate Google OAuth, preserve optional redirect via OAuth state
router.get("/google", (req, res, next) => {
  const state = typeof req.query.redirect === "string" ? (req.query.redirect as string) : undefined;
  return passport.authenticate("google", { scope: ["profile", "email"], state })(req, res, next);
});

// Callback: if state (redirect) provided, redirect to it with token in URL hash; else return JSON
router.get("/google/callback", passport.authenticate("google", { session: false }), (req: any, res) => {
  const token = generateToken(req.user._id.toString());
  const redirect = typeof req.query.state === "string" ? (req.query.state as string) : undefined;
  if (redirect) {
    try {
      const url = new URL(redirect);
      const hash = new URLSearchParams({ token, _id: req.user._id.toString(), email: req.user.email, name: req.user.name || '', avatar: req.user.avatar || '' }).toString();
      url.hash = hash;
      return res.redirect(url.toString());
    } catch {
      // Fallback to JSON if redirect is malformed
    }
  }
  return res.json({ success: true, data: { _id: req.user._id, email: req.user.email, token }, message: "Logged in with Google" });
});

export default router;
