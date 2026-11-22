/**
 * Connection-state callback from the external WhatsApp worker.
 *
 * POST /api/public/whatsapp/connection-state
 * Authorization: Bearer <WHATSAPP_WORKER_TOKEN>
 *
 * The account row is the source of truth for the business — the body may only
 * change the connection fields of an account that already exists.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  accountId: z.string().uuid(),
  connectionState: z.enum(["CONNECTING", "CONNECTED", "DISCONNECTED", "RECONNECTING"]),
  phoneNumber: z.string().max(32).nullish(),
  jid: z.string().max(120).nullish(),
  displayName: z.string().max(120).nullish(),
  lastError: z.string().max(500).nullish(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/whatsapp/connection-state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["WHATSAPP_WORKER_TOKEN"];
        if (!token) return json({ ok: false, code: "NOT_CONFIGURED" }, 503);
        if (request.headers.get("authorization") !== `Bearer ${token}`) {
          return json({ ok: false, code: "UNAUTHORIZED" }, 401);
        }

        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return json({ ok: false, code: "INVALID_REQUEST", message: "Invalid payload" }, 400);
        }
        const input = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: account } = await supabaseAdmin
          .from("whatsapp_accounts")
          .select("id, business_id")
          .eq("id", input.accountId)
          .maybeSingle();
        if (!account) return json({ ok: false, code: "UNKNOWN_ACCOUNT" }, 404);

        const now = new Date().toISOString();
        const { error } = await supabaseAdmin
          .from("whatsapp_accounts")
          .update({
            connection_state: input.connectionState,
            last_seen_at: now,
            last_error: input.lastError ?? null,
            ...(input.connectionState === "CONNECTED" ? { last_connected_at: now } : {}),
            ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}),
            ...(input.jid ? { jid: input.jid } : {}),
            ...(input.displayName ? { display_name: input.displayName } : {}),
          })
          .eq("id", account.id);
        if (error) return json({ ok: false, code: "DB_ERROR", message: error.message }, 500);

        await supabaseAdmin.from("audit_logs").insert({
          business_id: account.business_id,
          action: `WHATSAPP_${input.connectionState}`,
          resource_type: "whatsapp_account",
          resource_id: account.id,
          metadata: { lastError: input.lastError ?? null },
        });

        return json({ ok: true });
      },
    },
  },
});
