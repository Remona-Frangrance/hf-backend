import { Request, Response , NextFunction } from "express";
import Contact from "../models/Contact";

// POST /api/contact
export const submitContactForm = async (req: Request, res: Response , next: NextFunction): Promise<any> => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Save to database
    const contactEntry = await Contact.create({ name, email, message });

     res.status(201).json({
      message: "Contact form submitted successfully.",
      contact: contactEntry,
    });
  } catch (err) {
    console.error("Error saving contact form:", err);
     res.status(500).json({ error: "Internal server error." });
  }
};

// GET /api/contacts
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};
