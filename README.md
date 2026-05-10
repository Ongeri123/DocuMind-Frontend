# DocuMind — Frontend

React frontend for DocuMind chat with your PDFs using AI.

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth
- **State:** Zustand
- **Routing:** React Router v6
- **Deployment:** Vercel

## Local Setup

```bash
git clone https://github.com/yourusername/documind-frontend.git
cd documind-frontend
npm install
```

```bash
Backend Repository
https://github.com/Ongeri123/DocuMind-Backend.git
```

Create a `.env` file:

VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=

Run:

```bash
npm run dev
```

## Features

- PDF upload with PII detection warning
- Real-time SSE chat streaming
- Persistent chat history
- Document management — star, delete
- Supabase Auth — login, signup, password reset
- Sidebar navigation — documents, starred, history, settings, profile

## Deployment

Hosted on Vercel. Auto-deploys from GitHub on push to main.

## Demo

[Live App](https://docu-mind-frontend-mu.vercel.app)

Demo account:
Email: (demo@documind.com)
Password: Demo1234!
