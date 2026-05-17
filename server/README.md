# Server

Two independent servers:

- **Express** (`src/express.ts`) — HTTP REST API on port `8080`
- **WebSocket** (`src/ws/server.ts`) — WebSocket server on port `8082`

Run both simultaneously (different ports).

## Prerequisites

### 1. Environment variables

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/pixel_bomb

# Cloudflare Turnstile
TURNSTILE_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

# Signing
SIGNER_PK=
```

### 2. PostgreSQL

Start with Docker:

```bash
# from project root
docker compose up -d
```

Or use an existing instance and set `DATABASE_URL` accordingly.

### 3. Install dependencies

```bash
cd server
npm install
```

### 4. Run Prisma migrations

```bash
cd server
npx prisma migrate deploy
```

---

## Run Express server

Handles HTTP routes: `/verifyHuman`, `/generateUploadURL`, `/bombshare/:gameId`

```bash
cd server
npx ts-node src/express.ts
```

Or via npm script:

```bash
npm start
```

Server starts at `http://localhost:8080`.

---

## Run WebSocket server

Handles real-time game events (bomb game, chat, subscriptions).

```bash
cd server
npx ts-node src/ws/server.ts
```

Server starts at `ws://localhost:8082`.

---

## Build for production

```bash
cd server
npm run build
# output in dist/

node dist/express.js
# or
node dist/ws/server.js
```
