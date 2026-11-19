import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface PlatformConfig {
  whatsappWorker: boolean;
  aiProvider: boolean;
  aiModel: string | null;
  inboundToken: boolean;
}

/**
 * Reports which server-side integrations are configured.
 * Only super admins may call it; no secret values are ever returned.
 */
export const platformConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlatformConfig> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "SUPER_ADMIN",
    });
    if (isAdmin !== true) throw new Error("Forbidden");

    return {
      whatsappWorker: Boolean(
        process.env["WHATSAPP_WORKER_URL"] && process.env["WHATSAPP_WORKER_TOKEN"],
      ),
      aiProvider: Boolean(process.env["GEMINI_API_KEY"]),
      aiModel: process.env["GEMINI_API_KEY"] ? (process.env["GEMINI_MODEL"] ?? "gemini-2.0-flash") : null,
      inboundToken: Boolean(process.env["WHATSAPP_WORKER_TOKEN"]),
    };
  });
