import express from "express";
import { chatjsonData } from "../services/openaiService";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const botResponse = await chatjsonData(query);
    res.json({ message: botResponse });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process your request." });
  }
});

export default router;
