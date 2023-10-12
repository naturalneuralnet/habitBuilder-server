import express from "express";
import { loginLimiter } from "../middleware/loginLimiter.js";
import {
  login,
  logout,
  refresh,
  signup,
  verify,
  guest,
} from "../controllers/auth.js";
const router = express.Router();

router.route("/").post(loginLimiter, login);
router.get("/refresh", refresh);
router.get("/logout", logout);
router.post("/signup", signup);
router.post("/verify/:confirmationCode", verify);
router.post("/guest", guest);
export default router;
