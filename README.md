# SYNTHik AI

**SYNTHik AI** is a full-stack AI chatbot powered by **LLaMA 3.1 via Ollama**, integrated with **Clerk authentication**, a modern **Next.js (App Router)** frontend, and a type-safe database layer using **Drizzle ORM** with **SQLite (for development)** and **PostgreSQL (for production deployment)**.

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) using the App Router and TypeScript.

---

## Getting Started

To run the development server locally:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [`http://localhost:3000`](http://localhost:3000) in your browser to see the result.

You can start editing the app by modifying `app/page.tsx.` The page auto-updates as you save changes.

# Project Tech Stack

## Frontend
- **Framework:** Next.js (App Router, TypeScript)

## Authentication
- **Provider:** Clerk.dev

## AI Model
- **Provider:** Ollama
- **Model:** Meta LLaMA 3.1 (8B)

## Database
- **ORM:** Drizzle ORM
- **Development:** SQLite
- **Production:** PostgreSQL (via Neon or Supabase)

## Styling
- **CSS Framework:** Tailwind CSS
- **Fonts:** next/font with Geist

Create a `.env.local` file in the root and define the following variables:
```
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
OLLAMA_API_URL=http://localhost:11434  # or remote Ollama endpoint
```


<div align="center">SYNTHik</div>
