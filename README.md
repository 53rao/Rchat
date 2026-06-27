# Rchat

> A temporary two-person chat room that self-destructs.

---

## What is this?

Rchat is a 10 mins chat room — two users enter, they chat, and then it's gone.

- **Two users max.** The room locks once a second person joins.
- **Self-destructs in 10 minutes** — or the moment either user leaves early.
- **No database.** Messages live entirely in Redis cache and vanish when the TTL expires. Nothing is stored, nothing persists.

---

## Stack

Next.js 16 · React 19 · Elysia · Upstash Redis + Realtime · TanStack Query · Zod · Tailwind CSS v4 · TypeScript

---

## Quick Start

```bash
git clone https://github.com/53rao/Rcheat.git
cd Rcheat
npm install
```

Create a `.env` file:

```env
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

*Built as a mini project .*