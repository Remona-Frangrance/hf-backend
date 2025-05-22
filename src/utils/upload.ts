// middleware/multer.ts
import multer from "multer";

const storage = multer.memoryStorage(); // Use memory to pass buffer to Cloudinary

 const upload = multer({ storage });
export default upload