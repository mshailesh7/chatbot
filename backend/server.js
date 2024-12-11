import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import systemInstructions from './systemInstructions.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(openai);

let pdfText = ''; 

// Endpoint for PDF upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
      const filePath = path.resolve(req.file.path);

      if (!fs.existsSync(filePath)) {
          return res.status(400).json({ error: 'File not found after upload' });
      }

      const fileStats = fs.statSync(filePath);
      if (fileStats.size === 0) {
          return res.status(400).json({ error: 'Uploaded file is empty' });
      }

      const data = await pdfParse(fs.readFileSync(filePath));
      pdfText = data.text; // Extracted PDF text
      console.log('PDF content:', pdfText.slice(0, 100)); // Displaying a preview of PDF content
      res.json({ message: 'PDF uploaded and processed successfully.', pdfContent: pdfText.slice(0, 100) });
  } catch (error) {
      console.error('Error processing PDF:', error.message);
      res.status(500).json({ error: 'Failed to process PDF. Please ensure the file is valid.' });
  } finally {
      // Clean up uploaded file
      fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
      });
  }
});

//Reset Endpoint
app.post('/reset', (req, res) => {
  pdfText = '';
  console.log('PDF content has been reset.');
  res.json({ message: 'PDF content has been reset.' });
});


// Chat endpoint
app.post('/chat', async (req, res) => {
  const { userMessage } = req.body;

  console.log(pdfText);
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        { role: 'system', content: `${systemInstructions}\n\nPDF Content: ${pdfText}` },
        { role: 'user', content: userMessage },
      ],
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log('Chatbot response:', response);

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).json({ error: 'Error communicating with OpenAI' });
  }
});


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:3001`));
