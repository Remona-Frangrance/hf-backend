import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/default";
import User from "../models/User";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error();

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findOne({ _id: decoded.id });

    if (!user) throw new Error();

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};