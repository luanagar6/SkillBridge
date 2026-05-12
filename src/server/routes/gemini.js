import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { messages, system } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Missing GROQ_API_KEY" });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", // grátis e muito capaz
      max_tokens: 1000,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        ...messages,
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data?.error?.message });
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) return res.status(500).json({ error: "Resposta vazia" });

  res.json({ content: [{ text }] });
});

export default router;