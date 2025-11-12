import { Router } from "express";
import {
  createUser,
  deleteUserId,
  getUserId,
  getUsers,
  updateUserId,
} from "../controllers/users.controllers.js";

const router = Router();

router.get("/users", getUsers);

router.get("/users/:userId", getUserId);

router.post("/users", createUser);

router.delete("/users:userId", deleteUserId);

router.put("/users/:userId", updateUserId);

export default router;