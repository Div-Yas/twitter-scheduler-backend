import express from "express";
import { register, login } from "../controllers/authController";
import passport from "passport";
import { generateToken } from "../utils/generateToken";
import validate from "../middlewares/validate";
import { z } from "zod";
const router = express.Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", validate(authSchema), register);
router.post("/login", validate(authSchema), login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), (req: any, res) => {
  const token = generateToken(req.user._id.toString());
  res.json({ success: true, data: { _id: req.user._id, email: req.user.email, token }, message: "Logged in with Google" });
});

export default router;
