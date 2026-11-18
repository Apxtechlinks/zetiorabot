# WhatsApp AI Assistant

A multi-tenant platform where a small business connects its WhatsApp number and an
AI assistant answers customers using that business's own products, knowledge base
and prompt settings. Nothing is simulated: when the WhatsApp service or the AI
provider is not configured, the app says so instead of faking a result.

## What's inside

- **Landing page** at `/`
- **Business dashboard** at `/app` — Overview, Inbox, WhatsApp, Products,
  Knowledge Base, AI & Prompts, Customers, Orders, Usage, Settings
- **Owner console** at `/admin` — Overview, Businesses, Users, WhatsApp Accounts,
  Usage, System Logs, Settings (super admins only)
- **AI reply pipeline** that reads the business profile, published knowledge,
  matching products and recent history, and replies in the customer's language
- **Callback endpoints** for the external WhatsApp service

## Tech

TanStack Start (React 19, Vite 7), Tailwind CSS v4, shadcn/ui, TanStack Query,
and Lovable Cloud (Postgres + auth + storage) with row-level security on every
table.

## Architecture

```text
Dashboard  ──▶ server functions (src/lib/*.functions.ts)
              ──▶ worker adapter (src/lib/whatsapp.server.ts)
                  ──▶ external WhatsApp (Baileys) service

External WhatsApp service ──▶ POST /api/public/whatsapp/inbound-message
                          ──▶ POST /api/public/whatsapp/connection-state
```

The contract with the external service lives in `src/services/whatsapp/contract.ts`.
All database reads from the browser go through `src/services/db.ts`.

## Environment

For independent GitHub → Railway deployment, follow [RAILWAY.md](./RAILWAY.md).
The app and WhatsApp worker have separate Dockerfiles. `.env.example` lists the
app configuration; `supabase/self-host/schema.sql` prepares a fresh, independently
owned backend. Existing Lovable Cloud accounts, records and files are not copied.

Set on the server (never exposed to the browser):

| Variable | Purpose |
| --- | --- |
| `WHATSAPP_WORKER_URL` | Base URL of the always-on WhatsApp service |
| `WHATSAPP_WORKER_TOKEN` | Shared token — sent to the service and required on both callbacks |
| `GEMINI_API_KEY` | Enables AI replies |
| `GEMINI_MODEL` | Optional, defaults to `gemini-2.0-flash` |

Without these the app still runs; WhatsApp and AI features report that they are
not configured.

## Callback endpoints

Both require `Authorization: Bearer <WHATSAPP_WORKER_TOKEN>`. The business is
always resolved from the stored WhatsApp account, never from the request body.

### `POST /api/public/whatsapp/inbound-message`

```json
{
  "accountId": "uuid",
  "phone": "255700000000",
  "jid": "255700000000@s.whatsapp.net",
  "name": "Asha",
  "message": "Bei ya viatu ni ngapi?",
  "externalId": "wamid...",
  "messageType": "TEXT"
}
```

Stores the customer message, records usage, and — when the conversation is in AI
mode and AI is enabled — returns the generated reply for the service to send:

```json
{ "ok": true, "conversationId": "uuid", "reply": "…", "model": "gemini-2.0-flash" }
```

When no reply is generated, `reply` is `null` and `reason` explains why
(`HUMAN_ACTIVE`, `AI_DISABLED`, `NOT_CONFIGURED`, `UPSTREAM_ERROR`).

### `POST /api/public/whatsapp/connection-state`

```json
{
  "accountId": "uuid",
  "connectionState": "CONNECTED",
  "phoneNumber": "255700000000",
  "jid": "255700000000@s.whatsapp.net",
  "displayName": "Asha Shoes",
  "lastError": null
}
```

Updates the account and writes an audit log entry.

## Roles and access

Roles live in a dedicated `user_roles` table and are checked server-side with a
security-definer function. `/app` requires a signed-in user; `/admin` requires
the `SUPER_ADMIN` role. Every business table is isolated by row-level security,
so a forged business id is rejected by the database.

## Local development

```bash
bun install
bun run dev
```
