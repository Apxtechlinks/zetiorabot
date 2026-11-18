# GitHub → Railway (Service MOJA tu)

App na WhatsApp worker zinaendeshwa pamoja ndani ya container moja.
Huduma 1, domain 1, volume 1.

```text
Kivinjari → App (Railway, PORT) ⇄ WhatsApp worker (ndani, 127.0.0.1:8088) → WhatsApp
```

## 1. Backend yako
1. Tengeneza mradi mpya wa Supabase.
2. SQL Editor → endesha `supabase/self-host/schema.sql` mara moja.
3. Chukua: Project URL, Project ref, anon key, service_role key.
4. Auth → URL Configuration: weka Site URL = anwani ya Railway (baada ya hatua 3).

## 2. GitHub
Push repo yote (Dockerfile, start.sh, whatsapp-worker/, supabase/).
Hakikisha `.env` haipo GitHub.

## 3. Railway
1. New Project → Deploy from GitHub repo → chagua repo. Root Directory `/`.
2. Variables:

| Jina | Thamani |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project ref |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | anon key |
| `SUPABASE_PROJECT_ID` | Project ref |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `WHATSAPP_WORKER_TOKEN` | neno la siri refu lolote |
| `GEMINI_API_KEY` | key ya Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `NODE_ENV` | `production` |

   USIWEKE `WHATSAPP_WORKER_URL`, `PORT`, `APP_URL` wala `WORKER_TOKEN` — zinawekwa ndani.
3. Volume: Add Volume → Mount Path `/data` (session ya WhatsApp isipotee).
4. Settings → Networking → Generate Domain.
5. Replicas = 1 tu.

## 4. Jaribu
1. Fungua domain → Register → weka jina la biashara.
2. WhatsApp → andika namba bila `+` → Get pairing code.
3. Simu: WhatsApp → Linked Devices → Link with phone number → weka kodi.
4. Tuma ujumbe kutoka simu nyingine; AI ijibu na uonekane Inbox.

Kumbuka: kila deploy mpya inarestart WhatsApp kwa sekunde chache, kisha inajiunganisha tena kutoka volume.
