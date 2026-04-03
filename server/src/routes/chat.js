import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// System constraint: wildlife biology only, concise answers
const SYSTEM_PROMPT = `You are BioDex Agent, an expert wildlife biologist and naturalist. 
Your role is to answer questions about animals, plants, ecosystems, and biodiversity — particularly focusing on Indian wildlife when relevant.
Rules:
- Only answer questions related to animals, nature, ecology, and biodiversity.
- Keep answers informative but conversational, 2-4 sentences max.
- If asked something unrelated to nature/wildlife, politely redirect: "I'm specialized in wildlife and nature topics! Ask me about any animal, plant, or ecosystem."
- You have access to current knowledge. Be accurate and engaging.`;

router.post("/", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key not configured. Add GEMINI_API_KEY to server/.env" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build chat history from previous messages
    const chatHistory = (history || []).map((msg) => ({
      role: msg.role === "agent" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ error: "Failed to get response from BioDex Agent." });
  }
});

export default router;
