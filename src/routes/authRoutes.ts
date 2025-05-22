import express from "express";
import { register, login, getMe } from "../controllers/authController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);

export default router;