import express from "express";
import { submitContactForm, getAllContacts } from "../controllers/contactController";

const router = express.Router();

router.get("/contact", getAllContacts); 
router.post("/contact", submitContactForm);

export default router;
