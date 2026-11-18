/**
 * Server-only AI reply pipeline.
 *
 * Given an inbound customer message it gathers the business profile, prompt
 * configuration, matching knowledge entries and products plus recent history,
 * then asks Gemini for a reply. Nothing here is simulated: when Gemini is not
 * configured the caller receives a typed NOT_CONFIGURED result.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import {
  generateReply,
  type AiKnowledgeContext,
  type AiProductContext,
  type AiReplyResult,
} from "@/lib/gemini.server";

type Client = SupabaseClient<Database>;

const STOP_WORDS = new Set([
  "the", "and", "for", "you", "your", "with", "have", "this", "that", "what", "how",
  "naomba", "nataka", "bei", "je", "na", "ya", "wa", "kwa", "ni",
]);

function keywords(message: string): string[] {
  return Array.from(
    new Set(
      message
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 3 && !STOP_WORDS.has(word)),
    ),
  ).slice(0, 8);
}

function score(haystack: string, terms: string[]) {
  const text = haystack.toLowerCase();
  return terms.reduce((total, term) => (text.includes(term) ? total + 1 : total), 0);
}

export interface BuildAiReplyInput {
  businessId: string;
  conversationId: string;
  customerMessage: string;
}

export async function buildAiReply(
  supabase: Client,
  input: BuildAiReplyInput,
): Promise<AiReplyResult> {
  const { businessId, conversationId, customerMessage } = input;

  const [businessRes, settingsRes, promptRes, knowledgeRes, productsRes, historyRes] =
    await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).maybeSingle(),
      supabase.from("business_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("ai_prompts").select("*").eq("business_id", businessId).maybeSingle(),
      supabase
        .from("knowledge_base")
        .select("title, category, content, status")
        .eq("business_id", businessId)
        .eq("status", "PUBLISHED")
        .limit(200),
      supabase
        .from("products")
        .select("name, description, price, currency, availability, image_url, product_url")
        .eq("business_id", businessId)
        .limit(200),
      supabase
        .from("messages")
        .select("sender_type, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  const business = businessRes.data;
  if (!business) {
    return { ok: false, code: "UPSTREAM_ERROR", message: "Business not found" };
  }

  const settings = settingsRes.data;
  const prompt = promptRes.data;
  const terms = keywords(customerMessage);

  const knowledge: AiKnowledgeContext[] = (knowledgeRes.data ?? [])
    .map((entry) => ({
      entry: {
        title: entry.title,
        category: String(entry.category),
        content: entry.content ?? "",
      },
      rank: score(`${entry.title} ${entry.content ?? ""}`, terms),
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 8)
    .map((item) => item.entry);

  const products: AiProductContext[] = (productsRes.data ?? [])
    .map((product) => ({
      product: {
        name: product.name,
        description: product.description,
        price: Number(product.price ?? 0),
        currency: product.currency ?? "TZS",
        availability: String(product.availability),
        imageUrl: product.image_url,
        productUrl: product.product_url,
      },
      rank: score(`${product.name} ${product.description ?? ""}`, terms),
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 12)
    .map((item) => item.product);

  const history = (historyRes.data ?? [])
    .slice()
    .reverse()
    .filter((turn) => Boolean(turn.content))
    .map((turn) => ({
      senderType: turn.sender_type as "CUSTOMER" | "AI" | "HUMAN",
      content: turn.content as string,
    }));

  return generateReply({
    business: {
      name: settings?.business_name ?? business.name,
      description: settings?.description ?? null,
      phone: business.contact_phone,
      email: business.contact_email,
      location: settings?.location ?? null,
      openingHours: settings?.opening_hours ?? null,
      deliveryInfo: settings?.delivery_info ?? null,
      paymentMethods: settings?.payment_methods ?? null,
      website: settings?.website ?? null,
    },
    prompt: {
      systemPrompt:
        prompt?.system_prompt ??
        "You are a helpful WhatsApp assistant replying on behalf of this business.",
      language: prompt?.language ?? "Swahili",
      personality: prompt?.personality ?? "Friendly and professional",
      responseLength: prompt?.response_length ?? "Short",
    },
    history,
    knowledge,
    products,
    customerMessage,
  });
}
