import express from "express";
import { loginLimiter } from "../middleware/loginLimiter.js";
import { login, logout, refresh, signup, verify } from "../controllers/auth.js";
const router = express.Router();

router.route("/").post(loginLimiter, login);
router.get("/refresh", refresh);
router.get("/logout", logout);
router.post("/signup", signup);
router.post("/verify/:confirmationCode", verify);
export default router;
