---
title: FinRisk API
emoji: 🏦
colorFrom: blue
colorTo: red
sdk: docker
app_port: 7860
---

# FinRisk API

Financial Risk Management backend — FastAPI with ML models deployed on Hugging Face Spaces.

## Environment Variables

Set these in the Space settings:

- `DATABASE_URL` — Neon PostgreSQL URL
- `OPENROUTER_API_KEY` — OpenRouter API key
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `FRONTEND_URL` — Vercel frontend URL (for CORS)
