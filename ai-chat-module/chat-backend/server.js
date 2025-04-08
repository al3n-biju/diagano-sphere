const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyB7SUk_D6Hy8Z5-X6x3NlR22Ump2MASbAw");

app.post('/chat', async (req, res) => {
  try {
    const message = req.body.message;
    const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});
    const result = await model.generateContent(message);
    const reply = result.response.text();
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
