import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log("No API key found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const defaultResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await defaultResponse.json();
    console.log(data);
  } catch (error) {
    console.error("Failed to list models:", error);
  }
}

run();
