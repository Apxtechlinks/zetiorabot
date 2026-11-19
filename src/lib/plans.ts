/** WhatsApp AI Shop subscription plans. Fixed limits, no unlimited plans. */
export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  durationLabel: string;
  maxProducts: number;
  maxAiReplies: number;
}

export const PLANS: Plan[] = [
  { id: "FREE_TRIAL", name: "Free Trial", price: 0, durationDays: 3, durationLabel: "Siku 3", maxProducts: 5, maxAiReplies: 20 },
  { id: "STARTER", name: "Starter", price: 1500, durationDays: 7, durationLabel: "Wiki 1", maxProducts: 5, maxAiReplies: 50 },
  { id: "BASIC", name: "Basic", price: 5000, durationDays: 7, durationLabel: "Wiki 1", maxProducts: 10, maxAiReplies: 100 },
  { id: "LITE", name: "Lite", price: 10000, durationDays: 30, durationLabel: "Mwezi 1", maxProducts: 10, maxAiReplies: 300 },
  { id: "ESSENTIAL", name: "Essential", price: 25000, durationDays: 30, durationLabel: "Mwezi 1", maxProducts: 20, maxAiReplies: 700 },
  { id: "GROWTH", name: "Growth", price: 45000, durationDays: 30, durationLabel: "Mwezi 1", maxProducts: 35, maxAiReplies: 1500 },
  { id: "PROFESSIONAL", name: "Professional", price: 70000, durationDays: 30, durationLabel: "Mwezi 1", maxProducts: 60, maxAiReplies: 3000 },
  { id: "ENTERPRISE", name: "Enterprise", price: 120000, durationDays: 30, durationLabel: "Mwezi 1", maxProducts: 500, maxAiReplies: 6000 },
];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]!;
}

export interface SubscriptionInfo {
  plan_id?: string | null;
  plan_started_at?: string | null;
  plan_expires_at?: string | null;
  ai_replies_used?: number | null;
  created_at?: string | null;
}

/** Expiry: stored value, else trial counted from business creation. */
export function expiresAt(sub: SubscriptionInfo): Date {
  if (sub.plan_expires_at) return new Date(sub.plan_expires_at);
  const start = new Date(sub.plan_started_at ?? sub.created_at ?? Date.now());
  return new Date(start.getTime() + getPlan(sub.plan_id).durationDays * 86400000);
}

export function isExpired(sub: SubscriptionInfo, now = new Date()): boolean {
  return expiresAt(sub).getTime() <= now.getTime();
}

export function canAddProduct(planId: string | null | undefined, currentCount: number): boolean {
  return currentCount < getPlan(planId).maxProducts;
}

export function canSendAiReply(sub: SubscriptionInfo, now = new Date()): boolean {
  if (isExpired(sub, now)) return false;
  return (sub.ai_replies_used ?? 0) < getPlan(sub.plan_id).maxAiReplies;
}
