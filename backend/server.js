import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage.trim()) {
      return res.status(400).json({ error: "User message cannot be empty." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error("Full Error:", error);
    res.status(500).json({
      error: "Error processing chat request",
      details: error.message,
    });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
