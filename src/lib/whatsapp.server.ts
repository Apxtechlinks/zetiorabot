/**
 * Server-only adapter for the external Baileys worker.
 * Reads WHATSAPP_WORKER_URL / WHATSAPP_WORKER_TOKEN at call time.
 * When they are not configured, every call returns SERVICE_UNAVAILABLE —
 * connections are never simulated.
 */
import {
  serviceUnavailable,
  type PairingCode,
  type QrCode,
  type WhatsappConnectInput,
  type WhatsappResult,
  type WhatsappService,
  type WhatsappStatus,
} from "@/services/whatsapp/contract";

function workerConfig() {
  const url = process.env["WHATSAPP_WORKER_URL"];
  const token = process.env["WHATSAPP_WORKER_TOKEN"];
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function isWorkerConfigured() {
  return workerConfig() !== null;
}

async function call<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; query?: Record<string, string> },
): Promise<WhatsappResult<T>> {
  const config = workerConfig();
  if (!config) return serviceUnavailable<T>();

  const query = init.query ? `?${new URLSearchParams(init.query).toString()}` : "";
  try {
    const response = await fetch(`${config.url}${path}${query}`, {
      method: init.method,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.token}`,
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message: unknown }).message)
          : `WhatsApp worker returned ${response.status}`;
      return {
        ok: false,
        code: response.status === 401 || response.status === 403 ? "UNAUTHORIZED" : "WORKER_ERROR",
        message,
      };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    return {
      ok: false,
      code: "SERVICE_UNAVAILABLE",
      message:
        error instanceof Error
          ? `WhatsApp service unreachable: ${error.message}`
          : "WhatsApp service unreachable",
    };
  }
}

export const whatsappWorker: WhatsappService = {
  getStatus: ({ businessId, accountId }) =>
    call<WhatsappStatus>("/whatsapp/status", {
      method: "GET",
      query: { businessId, accountId },
    }),
  connect: (input: WhatsappConnectInput) =>
    call<WhatsappStatus>("/whatsapp/connect", { method: "POST", body: input }),
  disconnect: (input) => call<null>("/whatsapp/disconnect", { method: "POST", body: input }),
  reconnect: (input) => call<null>("/whatsapp/reconnect", { method: "POST", body: input }),
  getPairingCode: ({ businessId, accountId, phoneNumber }) =>
    call<PairingCode>("/whatsapp/pairing-code", {
      method: "GET",
      query: { businessId, accountId, phoneNumber },
    }),
  getQr: ({ businessId, accountId }) =>
    call<QrCode>("/whatsapp/qr", { method: "GET", query: { businessId, accountId } }),
};
