import express from "express";
import { getUsers, login, logout, signup, updateUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = express.Router();

router.patch("/update-user", verifyJWT, updateUser);
router.get("/users", verifyJWT, getUsers);

// Authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;