/**
 * Server-only Gemini service abstraction.
 * GEMINI_API_KEY / GEMINI_MODEL are read inside functions at call time and must
 * never be imported from client code.
 */

export interface AiBusinessProfile {
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  openingHours?: string | null;
  deliveryInfo?: string | null;
  paymentMethods?: string | null;
  website?: string | null;
}

export interface AiProductContext {
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  availability: string;
  imageUrl?: string | null;
  productUrl?: string | null;
}

export interface AiKnowledgeContext {
  title: string;
  category: string;
  content: string;
}

export interface AiPromptConfig {
  systemPrompt: string;
  language: string;
  personality: string;
  responseLength: string;
}

export interface AiHistoryTurn {
  senderType: "CUSTOMER" | "AI" | "HUMAN";
  content: string;
}

export interface AiReplyRequest {
  business: AiBusinessProfile;
  prompt: AiPromptConfig;
  history: AiHistoryTurn[];
  knowledge: AiKnowledgeContext[];
  products: AiProductContext[];
  customerMessage: string;
}

export type AiReplyResult =
  | { ok: true; text: string; model: string }
  | { ok: false; code: "NOT_CONFIGURED" | "UPSTREAM_ERROR"; message: string };

export function isGeminiConfigured() {
  return Boolean(process.env["GEMINI_API_KEY"]);
}

export function buildSystemInstruction(request: AiReplyRequest): string {
  const { business, prompt, knowledge, products } = request;

  const businessBlock = [
    `Business name: ${business.name}`,
    business.description ? `About: ${business.description}` : null,
    business.phone ? `Phone: ${business.phone}` : null,
    business.email ? `Email: ${business.email}` : null,
    business.location ? `Location: ${business.location}` : null,
    business.openingHours ? `Opening hours: ${business.openingHours}` : null,
    business.deliveryInfo ? `Delivery: ${business.deliveryInfo}` : null,
    business.paymentMethods ? `Payment methods: ${business.paymentMethods}` : null,
    business.website ? `Website: ${business.website}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const knowledgeBlock = knowledge.length
    ? knowledge.map((k) => `- [${k.category}] ${k.title}: ${k.content}`).join("\n")
    : "No knowledge base entries matched this message.";

  const productBlock = products.length
    ? products
        .map(
          (p) =>
            `- ${p.name} | ${p.currency} ${p.price} | ${p.availability}` +
            (p.description ? ` | ${p.description}` : "") +
            (p.productUrl ? ` | ${p.productUrl}` : ""),
        )
        .join("\n")
    : "No products matched this message.";

  return [
    prompt.systemPrompt,
    `Personality: ${prompt.personality}`,
    `Primary language: ${prompt.language}. You understand Swahili, English and mixed Swahili-English. Always reply in the language the customer used.`,
    `Response length: ${prompt.responseLength}.`,
    "",
    "BUSINESS PROFILE",
    businessBlock,
    "",
    "RELEVANT KNOWLEDGE",
    knowledgeBlock,
    "",
    "RELEVANT PRODUCTS",
    productBlock,
    "",
    "Rules: never invent prices, stock or policies that are not listed above. If you do not know, say you will check with the team.",
  ].join("\n");
}

export async function generateReply(request: AiReplyRequest): Promise<AiReplyResult> {
  const apiKey = process.env["GEMINI_API_KEY"];
  const model = process.env["GEMINI_MODEL"] ?? "gemini-2.0-flash";

  if (!apiKey) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Gemini is not configured. Add GEMINI_API_KEY to enable AI replies.",
    };
  }

  const contents = [
    ...request.history.map((turn) => ({
      role: turn.senderType === "CUSTOMER" ? "user" : "model",
      parts: [{ text: turn.content }],
    })),
    { role: "user", parts: [{ text: request.customerMessage }] },
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemInstruction(request) }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
        }),
      },
    );

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message: payload.error?.message ?? `Gemini returned ${response.status}`,
      };
    }

    const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text.trim()) {
      return { ok: false, code: "UPSTREAM_ERROR", message: "Gemini returned an empty response." };
    }

    return { ok: true, text: text.trim(), model };
  } catch (error) {
    return {
      ok: false,
      code: "UPSTREAM_ERROR",
      message: error instanceof Error ? error.message : "Gemini request failed",
    };
  }
}
