const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyDs6pKKft1d6hSXzPixhBA37nlmRv4yYT8");

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!userMessage.trim()) {
      return res.status(400).json({ error: 'User message cannot be empty.' });
    }

    // Generate model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
    const result = await model.generateContent(userMessage);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error('Full Error:', error);
    res.status(500).json({ 
      error: 'Error processing chat request',
      details: error.message 
    });
  }
});

// Start the server
app.listen(3001, () => console.log('Server running on http://localhost:3001'));
