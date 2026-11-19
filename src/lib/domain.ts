/**
 * Shared domain types and label maps.
 * These mirror the database enums exactly — keep them in sync with migrations.
 */

export type AppRole = "SUPER_ADMIN" | "BUSINESS_USER";
export type BusinessStatus = "ACTIVE" | "SUSPENDED";
export type MemberRole = "OWNER" | "MEMBER";
export type WaConnectionState = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "RECONNECTING";
export type AiMode = "AI_ACTIVE" | "HUMAN_ACTIVE";
export type SenderType = "CUSTOMER" | "AI" | "HUMAN";
export type MessageType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" | "LOCATION" | "OTHER";
export type ConversationStatus = "OPEN" | "CLOSED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type ContactStage =
  | "NEW"
  | "INTERESTED"
  | "READY_TO_BUY"
  | "ORDERED"
  | "COMPLETED"
  | "LOST";
export type KbCategory =
  | "BUSINESS"
  | "PRODUCTS"
  | "FAQ"
  | "SERVICES"
  | "POLICIES"
  | "DOCUMENTS"
  | "OTHER";
export type KbStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProductAvailability = "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

export const CONTACT_STAGES: ContactStage[] = [
  "NEW",
  "INTERESTED",
  "READY_TO_BUY",
  "ORDERED",
  "COMPLETED",
  "LOST",
];

export const KB_CATEGORIES: KbCategory[] = [
  "BUSINESS",
  "PRODUCTS",
  "FAQ",
  "SERVICES",
  "POLICIES",
  "DOCUMENTS",
  "OTHER",
];

export const KB_STATUSES: KbStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export const PRODUCT_AVAILABILITIES: ProductAvailability[] = [
  "IN_STOCK",
  "OUT_OF_STOCK",
  "PREORDER",
];

const TITLE_CASE = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const label = (value: string | null | undefined) => (value ? TITLE_CASE(value) : "—");

export function formatMoney(amount: number | string | null | undefined, currency = "TZS") {
  const value = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  return `${currency} ${Number.isFinite(value) ? value.toLocaleString("en-US") : "0"}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
