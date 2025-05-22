// import express, { Router, Request, Response } from 'express';
// import jwt from 'jsonwebtoken';

// const router = Router();

// // Hardcoded admin credentials
// const ADMIN_EMAIL = 'admin@edusphere.com';
// const ADMIN_PASSWORD = 'admin123';

// // Admin Login Route
// router.post('/login', (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
//     // Create JWT token
//     const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET as string, {
//       expiresIn: '1d',
//     });
//     return res.json({ token });
//   }

//   return res.status(401).json({ message: 'Invalid admin credentials' });
// });

// export default router;