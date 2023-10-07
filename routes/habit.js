import express from "express";
import {
  getHabitsSimple,
  updateHabit,
  deleteHabit,
  createHabit,
  getAllHabits,
} from "../controllers/habit.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = express.Router();
router.use(verifyJWT);
//router.get("/:id", getHabitsSimple);
router.get("/all", getAllHabits);
router
  .post("/new", createHabit)
  .patch("/update", updateHabit)
  .delete("/delete", deleteHabit);
export default router;
