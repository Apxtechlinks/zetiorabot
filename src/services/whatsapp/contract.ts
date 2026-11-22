/**
 * WHATSAPP INTEGRATION CONTRACT
 * -----------------------------
 * This file is the single source of truth for how this application talks to an
 * external, always-on WhatsApp worker (Baileys). Nothing in this file simulates
 * a connection: every operation either reaches the real worker or returns a
 * typed `SERVICE_UNAVAILABLE` result.
 *
 * Architecture:
 *   Dashboard -> server functions (src/lib/whatsapp.functions.ts)
 *             -> worker adapter (src/lib/whatsapp.server.ts)
 *             -> external Baileys worker
 *
 * The worker exposes:
 *   GET  /whatsapp/status?businessId=&accountId=
 *   POST /whatsapp/connect
 *   POST /whatsapp/disconnect
 *   POST /whatsapp/reconnect
 *   GET  /whatsapp/pairing-code
 *   GET  /whatsapp/qr
 *
 * The worker calls back into this application through:
 *   POST /api/public/whatsapp/connection-state
 *   POST /api/public/whatsapp/inbound-message
 * Both are authenticated with the shared worker token and resolve business_id
 * from the stored WhatsApp account — never from the request body.
 */

import type { WaConnectionState } from "@/lib/domain";

export type WhatsappErrorCode =
  | "SERVICE_UNAVAILABLE"
  | "NOT_CONFIGURED"
  | "UNAUTHORIZED"
  | "WORKER_ERROR"
  | "INVALID_REQUEST";

export type WhatsappResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: WhatsappErrorCode; message: string };

export interface WhatsappStatus {
  accountId: string | null;
  businessId: string;
  phoneNumber: string | null;
  jid: string | null;
  displayName: string | null;
  connectionState: WaConnectionState;
  lastConnectedAt: string | null;
  lastSeenAt: string | null;
  lastError: string | null;
}

export interface PairingCode {
  code: string;
  expiresAt: string | null;
}

export interface QrCode {
  /** Raw QR payload, or a data URL when the worker renders it. */
  qr: string;
  expiresAt: string | null;
}

export interface WhatsappConnectInput {
  businessId: string;
  accountId: string;
  phoneNumber?: string | null;
  method: "QR" | "PAIRING_CODE";
}

/** The interface the future worker must satisfy. */
export interface WhatsappService {
  getStatus(input: { businessId: string; accountId: string }): Promise<
    WhatsappResult<WhatsappStatus>
  >;
  connect(input: WhatsappConnectInput): Promise<WhatsappResult<WhatsappStatus>>;
  disconnect(input: { businessId: string; accountId: string }): Promise<WhatsappResult<null>>;
  reconnect(input: { businessId: string; accountId: string }): Promise<WhatsappResult<null>>;
  getPairingCode(input: {
    businessId: string;
    accountId: string;
    phoneNumber: string;
  }): Promise<WhatsappResult<PairingCode>>;
  getQr(input: { businessId: string; accountId: string }): Promise<WhatsappResult<QrCode>>;
}

export const WHATSAPP_SERVICE_UNAVAILABLE_MESSAGE = "WhatsApp service not connected";

export function serviceUnavailable<T>(
  message = WHATSAPP_SERVICE_UNAVAILABLE_MESSAGE,
): WhatsappResult<T> {
  return { ok: false, code: "SERVICE_UNAVAILABLE", message };
}
