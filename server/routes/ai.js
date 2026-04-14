const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

router.post('/tutor', protect, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ reply: "I'm your Eco-Tutor! Connect a Gemini API key to start chatting about sustainability." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are GreenQuest Eco-Tutor, a friendly expert in sustainability. 
    User Context: ${JSON.stringify(context || {})}
    User Question: ${message}
    Provide a concise, encouraging, and accurate answer.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
