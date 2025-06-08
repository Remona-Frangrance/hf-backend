// src/routes/adminRoutes.ts
import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { getMetrics } from '../controllers/metricsController';

const router: Router = express.Router();

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({ message: 'JWT_SECRET not set in environment variables' });
      return;
    }

    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '1d' });

    res.json({ token });
    return;
  }

  res.status(401).json({ message: 'Invalid admin credentials' });
});

router.get('/metrics', getMetrics);


export default router;
