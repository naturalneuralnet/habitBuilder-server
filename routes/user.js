import express from "express";
import {
  getUser,
  getAllUsers,
  createNewUser,
  deleteUser,
  updateUser,
} from "../controllers/user.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = express.Router();
router.use(verifyJWT);

router.get("/user/:id", getUser);
router.get("/all", getAllUsers);
router
  .post("/new", createNewUser)
  .patch("/update", updateUser)
  .delete("/delete", deleteUser);
export default router;
