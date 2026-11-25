# MoneyMentor AI frontend and chat API

## Run locally

1. Copy `.env.example` to `.env`.
2. Set `GROQ_API_KEY` to your Groq API key and `GROQ_MODEL` to a model available in your Groq account. Keep this file private; `.env` is ignored by Git.
3. Install dependencies with `npm install`.
4. In one terminal, run `npm run server`.
5. In another terminal, run `npm run dev`, then open the local Vite URL.

The Vite development server proxies `/api/chat` to the Express server. The Groq key is only read by the server, never sent to the browser. The chat API is rate-limited; deploy it behind appropriate production access controls before exposing it publicly.