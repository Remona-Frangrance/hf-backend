import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/default";
import User from "../models/User";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      username, 
      email, 
      password: hashedPassword,
      role: req.body.role || "user"
    });
    
    const token = jwt.sign({ id: newUser._id }, config.jwtSecret, { expiresIn: "1h" });
    res.status(201).json({ user: newUser, token });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: "Registration failed" });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "1h" });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json((req as any).user);
};