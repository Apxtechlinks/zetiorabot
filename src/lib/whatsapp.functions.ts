import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PairingCode, QrCode, WhatsappResult, WhatsappStatus } from "@/services/whatsapp/contract";

const AccountInput = z.object({ businessId: z.string().uuid(), accountId: z.string().uuid() });

async function assertMember(
  supabase: { rpc: (fn: "is_business_member", args: { _user_id: string; _business_id: string }) => Promise<{ data: unknown }> },
  userId: string,
  businessId: string,
) {
  const { data } = await supabase.rpc("is_business_member", {
    _user_id: userId,
    _business_id: businessId,
  });
  if (data !== true) throw new Error("Forbidden");
}

export const whatsappStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AccountInput.parse(input))
  .handler(async ({ data, context }): Promise<WhatsappResult<WhatsappStatus>> => {
    await assertMember(context.supabase as never, context.userId, data.businessId);
    const { whatsappWorker } = await import("./whatsapp.server");
    return whatsappWorker.getStatus(data);
  });

export const whatsappConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    AccountInput.extend({
      method: z.enum(["QR", "PAIRING_CODE"]),
      phoneNumber: z.string().min(6).nullable().default(null),
    }).parse(input),
  )
  .handler(async ({ data, context }): Promise<WhatsappResult<WhatsappStatus>> => {
    await assertMember(context.supabase as never, context.userId, data.businessId);
    const { whatsappWorker } = await import("./whatsapp.server");
    return whatsappWorker.connect(data);
  });

export const whatsappDisconnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AccountInput.parse(input))
  .handler(async ({ data, context }): Promise<WhatsappResult<null>> => {
    await assertMember(context.supabase as never, context.userId, data.businessId);
    const { whatsappWorker } = await import("./whatsapp.server");
    return whatsappWorker.disconnect(data);
  });

export const whatsappReconnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AccountInput.parse(input))
  .handler(async ({ data, context }): Promise<WhatsappResult<null>> => {
    await assertMember(context.supabase as never, context.userId, data.businessId);
    const { whatsappWorker } = await import("./whatsapp.server");
    return whatsappWorker.reconnect(data);
  });

export const whatsappPairingCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    AccountInput.extend({ phoneNumber: z.string().min(6) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<WhatsappResult<PairingCode>> => {
    await assertMember(context.supabase as never, context.userId, data.businessId);
    const { whatsappWorker } = await import("./whatsapp.server");
    return whatsappWorker.getPairingCode(data);
  });

export const whatsappQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AccountInput.parse(input))
  .handler(async ({ data, context }): Promise<WhatsappResult<QrCode>> => {
    await assertMember(context.supabase as never, context.userId, data.businessId);
    const { whatsappWorker } = await import("./whatsapp.server");
    return whatsappWorker.getQr(data);
  });
