/**
 * Thin typed data-access layer over the Lovable Cloud (Supabase) client.
 * Every query is scoped by business_id; row-level security enforces the same
 * isolation server-side, so a forged business_id is rejected by the database.
 * UI components must not build queries directly — use these modules.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Business = Tables<"businesses">;
export type BusinessSettings = Tables<"business_settings">;
export type Product = Tables<"products">;
export type Contact = Tables<"contacts">;
export type Conversation = Tables<"conversations">;
export type Message = Tables<"messages">;
export type KnowledgeEntry = Tables<"knowledge_base">;
export type KnowledgeDocument = Tables<"knowledge_documents">;
export type AiPrompt = Tables<"ai_prompts">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type UsageEvent = Tables<"usage_events">;
export type AuditLog = Tables<"audit_logs">;
export type WhatsappAccount = Tables<"whatsapp_accounts">;

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

/* ------------------------------- products ------------------------------- */
export const productsService = {
  async list(businessId: string, search?: string) {
    let query = supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });
    if (search) query = query.ilike("name", `%${search}%`);
    return unwrap(await query) ?? [];
  },
  async create(input: TablesInsert<"products">) {
    return unwrap(await supabase.from("products").insert(input).select().single());
  },
  async update(id: string, input: TablesUpdate<"products">) {
    return unwrap(await supabase.from("products").update(input).eq("id", id).select().single());
  },
  async remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
  async uploadImage(businessId: string, file: File) {
    const path = `${businessId}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  },
};

/* ------------------------------- contacts ------------------------------- */
export const contactsService = {
  async list(businessId: string, search?: string) {
    let query = supabase
      .from("contacts")
      .select("*")
      .eq("business_id", businessId)
      .order("last_interaction_at", { ascending: false, nullsFirst: false });
    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    return unwrap(await query) ?? [];
  },
  async update(id: string, input: TablesUpdate<"contacts">) {
    return unwrap(await supabase.from("contacts").update(input).eq("id", id).select().single());
  },
  async create(input: TablesInsert<"contacts">) {
    return unwrap(await supabase.from("contacts").insert(input).select().single());
  },
};

/* ----------------------------- conversations ---------------------------- */
export const conversationsService = {
  async list(businessId: string) {
    return (
      unwrap(
        await supabase
          .from("conversations")
          .select("*, contacts(id, name, phone, stage)")
          .eq("business_id", businessId)
          .order("last_message_at", { ascending: false, nullsFirst: false }),
      ) ?? []
    );
  },
  async messages(conversationId: string) {
    return (
      unwrap(
        await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ) ?? []
    );
  },
  async setAiMode(conversationId: string, aiMode: "AI_ACTIVE" | "HUMAN_ACTIVE") {
    return unwrap(
      await supabase
        .from("conversations")
        .update({ ai_mode: aiMode })
        .eq("id", conversationId)
        .select()
        .single(),
    );
  },
  async addHumanMessage(input: TablesInsert<"messages">) {
    return unwrap(await supabase.from("messages").insert(input).select().single());
  },
};

/* ---------------------------- knowledge base ---------------------------- */
export const knowledgeService = {
  async list(businessId: string) {
    return (
      unwrap(
        await supabase
          .from("knowledge_base")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),
      ) ?? []
    );
  },
  async create(input: TablesInsert<"knowledge_base">) {
    return unwrap(await supabase.from("knowledge_base").insert(input).select().single());
  },
  async update(id: string, input: TablesUpdate<"knowledge_base">) {
    return unwrap(
      await supabase.from("knowledge_base").update(input).eq("id", id).select().single(),
    );
  },
  async remove(id: string) {
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
  async documents(businessId: string) {
    return (
      unwrap(
        await supabase
          .from("knowledge_documents")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),
      ) ?? []
    );
  },
  async uploadDocument(businessId: string, file: File, knowledgeBaseId?: string | null) {
    const path = `${businessId}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("knowledge-files").upload(path, file);
    if (error) throw new Error(error.message);
    return unwrap(
      await supabase
        .from("knowledge_documents")
        .insert({
          business_id: businessId,
          file_name: file.name,
          storage_path: path,
          mime_type: file.type,
          size_bytes: file.size,
          knowledge_base_id: knowledgeBaseId ?? null,
        })
        .select()
        .single(),
    );
  },
  async removeDocument(doc: KnowledgeDocument) {
    await supabase.storage.from("knowledge-files").remove([doc.storage_path]);
    const { error } = await supabase.from("knowledge_documents").delete().eq("id", doc.id);
    if (error) throw new Error(error.message);
  },
};

/* -------------------------------- prompts ------------------------------- */
export const aiService = {
  async get(businessId: string): Promise<AiPrompt> {
    const existing = unwrap(
      await supabase.from("ai_prompts").select("*").eq("business_id", businessId).maybeSingle(),
    );
    if (existing) return existing;
    return unwrap(
      await supabase.from("ai_prompts").insert({ business_id: businessId }).select().single(),
    );
  },
  async update(businessId: string, input: TablesUpdate<"ai_prompts">) {
    return unwrap(
      await supabase
        .from("ai_prompts")
        .update(input)
        .eq("business_id", businessId)
        .select()
        .single(),
    );
  },
};

/* -------------------------------- orders -------------------------------- */
export const ordersService = {
  async list(businessId: string) {
    return (
      unwrap(
        await supabase
          .from("orders")
          .select("*, contacts(name, phone), order_items(*)")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),
      ) ?? []
    );
  },
  async updateStatus(id: string, status: Order["status"]) {
    return unwrap(await supabase.from("orders").update({ status }).eq("id", id).select().single());
  },
  async update(id: string, input: TablesUpdate<"orders">) {
    return unwrap(await supabase.from("orders").update(input).eq("id", id).select().single());
  },
};

/* -------------------------------- settings ------------------------------ */
export const settingsService = {
  async get(businessId: string): Promise<BusinessSettings> {
    const existing = unwrap(
      await supabase
        .from("business_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle(),
    );
    if (existing) return existing;
    return unwrap(
      await supabase.from("business_settings").insert({ business_id: businessId }).select().single(),
    );
  },
  async update(businessId: string, input: TablesUpdate<"business_settings">) {
    return unwrap(
      await supabase
        .from("business_settings")
        .update(input)
        .eq("business_id", businessId)
        .select()
        .single(),
    );
  },
};

/* --------------------------------- usage -------------------------------- */
export const usageService = {
  async list(businessId: string) {
    return (
      unwrap(
        await supabase
          .from("usage_events")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(500),
      ) ?? []
    );
  },
};

/* ------------------------------- overview ------------------------------- */
async function countRows(table: "contacts" | "products" | "orders" | "messages" | "conversations", businessId: string) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export const overviewService = {
  async load(businessId: string) {
    const [contacts, products, orders, messages, conversations, account, prompt] = await Promise.all(
      [
        countRows("contacts", businessId),
        countRows("products", businessId),
        countRows("orders", businessId),
        countRows("messages", businessId),
        countRows("conversations", businessId),
        supabase
          .from("whatsapp_accounts")
          .select("*")
          .eq("business_id", businessId)
          .maybeSingle()
          .then((r) => r.data),
        supabase
          .from("ai_prompts")
          .select("ai_enabled")
          .eq("business_id", businessId)
          .maybeSingle()
          .then((r) => r.data),
      ],
    );
    const recent =
      unwrap(
        await supabase
          .from("messages")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(8),
      ) ?? [];
    return { contacts, products, orders, messages, conversations, account, prompt, recent };
  },
};

/* -------------------------------- whatsapp ------------------------------ */
export const whatsappAccountsService = {
  async get(businessId: string) {
    return unwrap(
      await supabase.from("whatsapp_accounts").select("*").eq("business_id", businessId).maybeSingle(),
    );
  },
  async ensure(businessId: string, phoneNumber?: string | null) {
    const existing = await whatsappAccountsService.get(businessId);
    if (existing) return existing;
    return unwrap(
      await supabase
        .from("whatsapp_accounts")
        .insert({ business_id: businessId, phone_number: phoneNumber ?? null })
        .select()
        .single(),
    );
  },
  async setPhone(id: string, phoneNumber: string) {
    return unwrap(
      await supabase
        .from("whatsapp_accounts")
        .update({ phone_number: phoneNumber })
        .eq("id", id)
        .select()
        .single(),
    );
  },
};

/* --------------------------------- admin -------------------------------- */
export const adminService = {
  async businesses() {
    return (
      unwrap(
        await supabase
          .from("businesses")
          .select("*, business_members(user_id, role), whatsapp_accounts(connection_state, phone_number)")
          .order("created_at", { ascending: false }),
      ) ?? []
    );
  },
  async setStatus(id: string, status: Business["status"]) {
    return unwrap(
      await supabase.from("businesses").update({ status }).eq("id", id).select().single(),
    );
  },
  async createBusiness(name: string, contactEmail?: string, contactPhone?: string) {
    return unwrap(
      await supabase
        .from("businesses")
        .insert({ name, contact_email: contactEmail ?? null, contact_phone: contactPhone ?? null })
        .select()
        .single(),
    );
  },
  async profiles() {
    return (
      unwrap(await supabase.from("profiles").select("*").order("created_at", { ascending: false })) ??
      []
    );
  },
  async memberships() {
    return (
      unwrap(
        await supabase.from("business_members").select("user_id, role, businesses(name)"),
      ) ?? []
    );
  },

  async roles() {
    return unwrap(await supabase.from("user_roles").select("*")) ?? [];
  },
  async whatsappAccounts() {
    return (
      unwrap(
        await supabase
          .from("whatsapp_accounts")
          .select("*, businesses(name)")
          .order("created_at", { ascending: false }),
      ) ?? []
    );
  },
  async usage() {
    return (
      unwrap(
        await supabase
          .from("usage_events")
          .select("*, businesses(name)")
          .order("created_at", { ascending: false })
          .limit(500),
      ) ?? []
    );
  },
  async logs() {
    return (
      unwrap(
        await supabase
          .from("audit_logs")
          .select("*, businesses(name)")
          .order("created_at", { ascending: false })
          .limit(200),
      ) ?? []
    );
  },
  async platformCounts() {
    const tables = ["businesses", "profiles", "whatsapp_accounts", "messages", "usage_events"] as const;
    const results = await Promise.all(
      tables.map(async (table) => {
        const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
        return [table, count ?? 0] as const;
      }),
    );
    return Object.fromEntries(results) as Record<(typeof tables)[number], number>;
  },
};
