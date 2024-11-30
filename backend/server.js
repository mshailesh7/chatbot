// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// app.use(express.json());
// app.use(cors());

// // Gemini API key and base URL
// const GEMINI_API_KEY = 'AIzaSyBCw_62Ej1RyiErBIsjI5PlSbrh7Yf-PjQ'; // Replace with your real API key
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateText?key=<GEMINI_API_KEY>';

// /**
//  * Send content to the Gemini API
//  * @param {string} inputText - Text to send to Gemini
//  * @returns {Promise<string>} - The Gemini API response
//  */
// const sendToGemini = async (inputText) => {
//   try {
//     const response = await axios.post(
//       GEMINI_API_URL,
//       {
//         prompt: {
//           text: inputText, // Gemini expects this nested in `prompt.text`
//         },
//         temperature: 1,
//         maxOutputTokens: 2048,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${GEMINI_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     // Extract the response message content
//     return response.data.candidates[0].output; // Adjust based on API response structure
//   } catch (error) {
//     console.error('Error communicating with Gemini API:', error.response?.data || error.message);
//     throw new Error('Error communicating with Gemini API');
//   }
// };

// // Endpoint for chat interaction
// app.post('/chat', async (req, res) => {
//   const { userMessage } = req.body;

//   try {
//     if (!userMessage.trim()) {
//       return res.status(400).json({ error: 'User message cannot be empty.' });
//     }

//     // Send user message to Gemini
//     const geminiResponse = await sendToGemini(userMessage);

//     res.json({ reply: geminiResponse });
//   } catch (error) {
//     console.error('Error processing chat request:', error);
//     res.status(500).json({ error: 'Error processing chat request' });
//   }
// });

// // Start the server
// app.listen(3001, () => console.log('Server running on http://localhost:3001'));

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Translate } = require('@google-cloud/translate').v2;

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyBCw_62Ej1RyiErBIsjI5PlSbrh7Yf-PjQY");

// Configure Google Translate
const translate = new Translate();

// Gemini model configuration
const generationConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2048,
};

const safetySettings = [
    {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        category: "HARM_CATEGORY_HATE_SPEECH", 
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
];

// In-memory storage for conversations (replace with database in production)
let conversations = [];

// Translation route
app.post('/translate', async (req, res) => {
    try {
        const { prompt } = req.body;

        // Generate Gemini model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig,
            safetySettings 
        });

        // Generate content
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Store conversation
        const conversation = { 
            prompt, 
            response 
        };
        conversations.push(conversation);

        res.json(conversation);
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

// Get conversations route
app.get('/conversations', (req, res) => {
    res.json(conversations);
});

app.listen(port, () => {
    console.log('Server running on http://localhost:3001');
});