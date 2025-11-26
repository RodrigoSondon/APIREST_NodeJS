import { Router } from "express";
import {
  createUser,
  deleteUserId,
  getUserId,
  getUsers,
  updateUserId,
  loginUser,
  verifyTokenController,
  logoutUser
} from "../controllers/users.controllers.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post("/auth/login", loginUser);
router.post("/auth/register", createUser);

// Rutas protegidas (requieren autenticación)
router.get("/users", verifyToken, getUsers);
router.get("/users/:userId", verifyToken, getUserId);
router.put("/users/:userId", verifyToken, updateUserId);
router.delete("/users/:userId", verifyToken, deleteUserId);

// Ruta para verificar token
router.get("/verify", verifyToken, verifyTokenController);

// Ruta para logout
router.post("/auth/logout", verifyToken, logoutUser);

export default router;