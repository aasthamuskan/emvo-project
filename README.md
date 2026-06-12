# EMVO — AI-Native Mini CRM

> *"The CRM that understands what you mean, not just what you click."*

EMVO is an AI-native CRM built for the Xeno Engineering Take-Home Assignment 2026. It helps consumer brands intelligently reach their shoppers through natural-language campaign planning, automated segmentation, and a full async message delivery lifecycle.

---

## Live Demo

- **App**: [https://emvo.vercel.app](https://emvo.vercel.app)
- **Channel Service**: [https://emvo-channel.onrender.com](https://emvo-channel.onrender.com)

---

## What Makes It AI-Native

EMVO is not a CRM with AI bolted on. The product literally cannot function without AI — the segmentation engine IS the AI. 

The marketer types one sentence:
> *"Win back customers who spent ₹5000+ but haven't purchased in 60 days"*

EMVO responds in under 3 seconds with:
- 🎯 **247 customers** matched
- 📱 **WhatsApp** recommended as best channel
- ✍️ **2 message variants** drafted and ready to edit
- 🚀 **One button** to launch the entire campaign

That's the entire workflow. No filter dropdowns. No message composers. No 5-step wizards.

---

## Architecture

```
┌──────────────────────────────────────────┐
│  Next.js (Vercel)                         │
│  Frontend + API Routes                    │
│                                           │
│  /api/ai/plan   ← GPT-4o-mini             │
│  /api/campaigns ← Campaign CRUD           │
│  /api/receipt   ← Callback receiver       │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Channel Service (Render)                 │
│  Express.js — Separate microservice       │
│                                           │
│  POST /send → simulate → callback         │
│  Probabilistic lifecycle per channel      │
│  Retry with exponential backoff           │
└──────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  PostgreSQL (Neon)                        │
│  customers, orders, segments,             │
│  campaigns, messages, message_events      │
└──────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Next.js API Routes (not Express) | Single deployable, no CORS, serverless |
| Separate Channel Service | Forces proper async callback architecture |
| Prisma + Neon | Type-safe queries, serverless-optimized PG |
| GPT-4o-mini | Same quality as GPT-4o for structured extraction, 10x cheaper |
| Polling (not WebSockets) | Simpler, sufficient for demo, avoids persistent connections on serverless |
| Status-only advancement | Idempotent receipt handler — callbacks can arrive out of order safely |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React 19 |
| Styling | Tailwind CSS v4, custom dark design system |
| State | TanStack Query (React Query) |
| Charts | Recharts |
| ORM | Prisma 7 |
| Database | PostgreSQL via Neon |
| AI | OpenAI GPT-4o-mini |
| Channel Service | Node.js + Express |
| Icons | Lucide React |
| Deployment | Vercel + Render |

---

## Project Structure

```
emvo-project/
├── apps/
│   ├── web/                    # Next.js app
│   │   ├── src/
│   │   │   ├── app/            # Pages + API routes
│   │   │   ├── components/     # UI components
│   │   │   ├── lib/            # Core logic (AI, audience, channel client)
│   │   │   └── types/          # TypeScript types
│   │   └── prisma/             # Schema + seed
│   └── channel-service/        # Express microservice
└── package.json                # Monorepo root
```

---

## Local Setup

### Prerequisites
- Node.js 20+
- A Neon PostgreSQL database URL
- An OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/emvo-project
cd emvo-project
npm install
```

### 2. Configure Web App

```bash
cd apps/web
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL and OPENAI_API_KEY
```

### 3. Configure Channel Service

```bash
cd apps/channel-service
cp .env.example .env
# Edit .env — set CRM_RECEIPT_URL=http://localhost:3000/api/receipt
```

### 4. Run Database Migration

```bash
cd apps/web
npx prisma migrate dev --name init
```

### 5. Seed the Database

Visit `http://localhost:3000/api/seed` once after starting the dev server, OR run the HTTP seed endpoint.

### 6. Start Dev Servers

```bash
# Terminal 1 — Web app
cd apps/web && npm run dev

# Terminal 2 — Channel service
cd apps/channel-service && npm run dev
```

Visit `http://localhost:3000`

---

## Deployment

### Vercel (Web + API)

1. Push to GitHub
2. Connect repo to Vercel
3. Set root directory: `apps/web`
4. Add env vars: `DATABASE_URL`, `OPENAI_API_KEY`, `CHANNEL_SERVICE_URL`, `NEXTAUTH_URL`
5. Deploy

### Render (Channel Service)

1. Create new Web Service
2. Set root directory: `apps/channel-service`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add env var: `CRM_RECEIPT_URL=https://your-app.vercel.app/api/receipt`

---

## Campaign Lifecycle

```
DRAFT → SENDING → COMPLETED
              ↓
    [Per Message State Machine]
    QUEUED → SENT → DELIVERED → OPENED → CLICKED → CONVERTED
                  ↘ FAILED
```

Callbacks are idempotent — status only advances forward. Out-of-order delivery is handled gracefully. Every event is logged to the `message_events` table as an immutable audit trail.

---

## Key API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/ai/plan` | Parse NL intent → campaign plan |
| `GET` | `/api/dashboard` | Dashboard stats |
| `GET/POST` | `/api/campaigns` | List / create campaigns |
| `POST` | `/api/campaigns/:id/send` | Launch campaign |
| `GET` | `/api/campaigns/:id/analytics` | Live funnel metrics |
| `POST` | `/api/receipt` | Receive channel callbacks |
| `GET` | `/api/seed` | Seed demo data |

---

## Tradeoffs Documented

- **No auth**: Single-user for demo scope. Would add Clerk/NextAuth for multi-tenant.
- **Polling not SSE**: 3-second polling is sufficient and much simpler than WebSockets on serverless.
- **Prisma $queryRawUnsafe**: Used for complex audience aggregations that Prisma ORM can't express cleanly. Parameterized queries prevent SQL injection.
- **95% completion threshold**: Campaign auto-completes when 95% of messages reach terminal state — handles stragglers without waiting forever.
- **GPT-4o-mini**: Chose mini over full GPT-4o. Identical quality for structured extraction at 10x lower cost.

---

Built with ❤️ for the Xeno Engineering Internship 2026.
