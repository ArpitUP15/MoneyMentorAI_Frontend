import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import Groq from 'groq-sdk';

const requiredEnvironment = ['GROQ_API_KEY', 'GROQ_MODEL'];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
}

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json({ limit: '16kb' }));
app.use('/api/chat', rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many chat requests. Please wait a moment and try again.' });
  },
}));

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body ?? {};

  if (
    !Array.isArray(messages)
    || messages.length === 0
    || messages.length > 12
    || messages.some((message) => (
      !message
      || typeof message !== 'object'
      || !['user', 'assistant'].includes(message.role)
      || typeof message.text !== 'string'
      || message.text.length === 0
      || message.text.length > 1000
    ))
  ) {
    return res.status(400).json({ error: 'Please send a valid chat message.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are MoneyMentor, a financial education assistant. Explain financial concepts clearly and cautiously. Do not provide personalized financial, investment, tax, or legal advice, and do not claim to have live market data. Be transparent about uncertainty and encourage users to verify important decisions with reliable sources or a qualified professional.',
        },
        ...messages.map(({ role, text }) => ({ role, content: text })),
      ],
      temperature: 0.6,
      max_completion_tokens: 700,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      console.error('Groq returned an empty chat completion.');
      return res.status(502).json({ error: 'The assistant could not generate a reply. Please try again.' });
    }

    return res.json({ reply });
  } catch (error) {
    console.error('Groq chat request failed:', error);
    return res.status(502).json({ error: 'The assistant is temporarily unavailable. Please try again.' });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Chat API listening on http://localhost:${port}`);
});
