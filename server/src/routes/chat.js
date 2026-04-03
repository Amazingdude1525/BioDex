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
      model: "gemini-pro",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build chat history from previous messages
    let chatHistory = (history || []).map((msg) => ({
      role: msg.role === "agent" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    // Gemini requires the very first history message to be from the user
    if (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory.shift();
    }

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err.message);
    if (err.message.includes("API key not valid")) {
      return res.status(403).json({ error: "Your Gemini API Key is invalid. Please check your .env file." });
    }
    res.status(500).json({ error: "Failed to get response from BioDex Agent." });
  }
});

export default router;
