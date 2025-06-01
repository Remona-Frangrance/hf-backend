import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import config from "./config/default";
import imageRoutes from "./routes/imageRoutes";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import subcategoryRoutes from "./routes/subcategoryRoutes";
import brandRoutes from "./routes/brandRoutes";
import adminRoutes from './routes/adminRoutes';
import galleryRoutes from './routes/gallaryRoutes';

dotenv.config();
const app = express();
const PORT = config.port || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
.connect(config.mongoUri)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/images", imageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/gallery", galleryRoutes);

app.use('/admin', adminRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));