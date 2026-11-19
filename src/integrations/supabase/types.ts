export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      ai_prompts: {
        Row: {
          ai_enabled: boolean
          business_id: string
          created_at: string
          id: string
          language: string
          personality: string
          response_length: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          ai_enabled?: boolean
          business_id: string
          created_at?: string
          id?: string
          language?: string
          personality?: string
          response_length?: string
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          ai_enabled?: boolean
          business_id?: string
          created_at?: string
          id?: string
          language?: string
          personality?: string
          response_length?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          business_id: string | null
          created_at: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          business_id: string
          business_name: string | null
          created_at: string
          delivery_info: string | null
          description: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          opening_hours: string | null
          payment_methods: string | null
          phone: string | null
          social_links: Json
          updated_at: string
          website: string | null
        }
        Insert: {
          business_id: string
          business_name?: string | null
          created_at?: string
          delivery_info?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          opening_hours?: string | null
          payment_methods?: string | null
          phone?: string | null
          social_links?: Json
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_id?: string
          business_name?: string | null
          created_at?: string
          delivery_info?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          opening_hours?: string | null
          payment_methods?: string | null
          phone?: string | null
          social_links?: Json
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          owner_id: string | null
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          business_id: string
          created_at: string
          email: string | null
          id: string
          jid: string | null
          last_interaction_at: string | null
          name: string | null
          notes: string | null
          phone: string
          stage: Database["public"]["Enums"]["contact_stage"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          jid?: string | null
          last_interaction_at?: string | null
          name?: string | null
          notes?: string | null
          phone: string
          stage?: Database["public"]["Enums"]["contact_stage"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          jid?: string | null
          last_interaction_at?: string | null
          name?: string | null
          notes?: string | null
          phone?: string
          stage?: Database["public"]["Enums"]["contact_stage"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_mode: Database["public"]["Enums"]["ai_mode"]
          business_id: string
          contact_id: string
          created_at: string
          id: string
          last_message_at: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          updated_at: string
          whatsapp_account_id: string | null
        }
        Insert: {
          ai_mode?: Database["public"]["Enums"]["ai_mode"]
          business_id: string
          contact_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          updated_at?: string
          whatsapp_account_id?: string | null
        }
        Update: {
          ai_mode?: Database["public"]["Enums"]["ai_mode"]
          business_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          updated_at?: string
          whatsapp_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_whatsapp_account_id_fkey"
            columns: ["whatsapp_account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          business_id: string
          category: Database["public"]["Enums"]["kb_category"]
          content: string | null
          created_at: string
          id: string
          source_url: string | null
          status: Database["public"]["Enums"]["kb_status"]
          title: string
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: Database["public"]["Enums"]["kb_category"]
          content?: string | null
          created_at?: string
          id?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["kb_status"]
          title: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: Database["public"]["Enums"]["kb_category"]
          content?: string | null
          created_at?: string
          id?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["kb_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          business_id: string
          created_at: string
          file_name: string
          id: string
          knowledge_base_id: string | null
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          file_name: string
          id?: string
          knowledge_base_id?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          file_name?: string
          id?: string
          knowledge_base_id?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_documents_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          business_id: string
          content: string | null
          conversation_id: string
          created_at: string
          external_id: string | null
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json
          sender: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
        }
        Insert: {
          business_id: string
          content?: string | null
          conversation_id: string
          created_at?: string
          external_id?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          sender?: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
        }
        Update: {
          business_id?: string
          content?: string | null
          conversation_id?: string
          created_at?: string
          external_id?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          sender?: string | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          business_id: string
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          subtotal?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string
          contact_id: string | null
          conversation_id: string | null
          created_at: string
          currency: string
          delivery_address: string | null
          delivery_notes: string | null
          id: string
          notes: string | null
          order_number: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
        }
        Insert: {
          business_id: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string
          delivery_address?: string | null
          delivery_notes?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string
          currency?: string
          delivery_address?: string | null
          delivery_notes?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: Database["public"]["Enums"]["product_availability"]
          business_id: string
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          product_url: string | null
          sku: string | null
          stock: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["product_availability"]
          business_id: string
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          product_url?: string | null
          sku?: string | null
          stock?: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["product_availability"]
          business_id?: string
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          product_url?: string | null
          sku?: string | null
          stock?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          business_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          quantity: number
        }
        Insert: {
          business_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          quantity?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_accounts: {
        Row: {
          business_id: string
          connection_state: Database["public"]["Enums"]["wa_connection_state"]
          created_at: string
          display_name: string | null
          id: string
          jid: string | null
          last_connected_at: string | null
          last_error: string | null
          last_seen_at: string | null
          phone_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          connection_state?: Database["public"]["Enums"]["wa_connection_state"]
          created_at?: string
          display_name?: string | null
          id?: string
          jid?: string | null
          last_connected_at?: string | null
          last_error?: string | null
          last_seen_at?: string | null
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          connection_state?: Database["public"]["Enums"]["wa_connection_state"]
          created_at?: string
          display_name?: string | null
          id?: string
          jid?: string | null
          last_connected_at?: string | null
          last_error?: string | null
          last_seen_at?: string | null
          phone_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_accounts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_business: { Args: { _business_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_business_member: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      owns_business: { Args: { _business_id: string }; Returns: boolean }
    }
    Enums: {
      ai_mode: "AI_ACTIVE" | "HUMAN_ACTIVE"
      app_role: "SUPER_ADMIN" | "BUSINESS_USER"
      business_status: "ACTIVE" | "SUSPENDED"
      contact_stage:
        | "NEW"
        | "INTERESTED"
        | "READY_TO_BUY"
        | "ORDERED"
        | "COMPLETED"
        | "LOST"
      conversation_status: "OPEN" | "CLOSED"
      kb_category:
        | "BUSINESS"
        | "PRODUCTS"
        | "FAQ"
        | "SERVICES"
        | "POLICIES"
        | "DOCUMENTS"
        | "OTHER"
      kb_status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
      member_role: "OWNER" | "MEMBER"
      message_type:
        | "TEXT"
        | "IMAGE"
        | "AUDIO"
        | "VIDEO"
        | "DOCUMENT"
        | "LOCATION"
        | "OTHER"
      order_status:
        | "PENDING"
        | "CONFIRMED"
        | "PROCESSING"
        | "COMPLETED"
        | "CANCELLED"
      product_availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER"
      sender_type: "CUSTOMER" | "AI" | "HUMAN"
      wa_connection_state:
        | "CONNECTING"
        | "CONNECTED"
        | "DISCONNECTED"
        | "RECONNECTING"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_mode: ["AI_ACTIVE", "HUMAN_ACTIVE"],
      app_role: ["SUPER_ADMIN", "BUSINESS_USER"],
      business_status: ["ACTIVE", "SUSPENDED"],
      contact_stage: [
        "NEW",
        "INTERESTED",
        "READY_TO_BUY",
        "ORDERED",
        "COMPLETED",
        "LOST",
      ],
      conversation_status: ["OPEN", "CLOSED"],
      kb_category: [
        "BUSINESS",
        "PRODUCTS",
        "FAQ",
        "SERVICES",
        "POLICIES",
        "DOCUMENTS",
        "OTHER",
      ],
      kb_status: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      member_role: ["OWNER", "MEMBER"],
      message_type: [
        "TEXT",
        "IMAGE",
        "AUDIO",
        "VIDEO",
        "DOCUMENT",
        "LOCATION",
        "OTHER",
      ],
      order_status: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "COMPLETED",
        "CANCELLED",
      ],
      product_availability: ["IN_STOCK", "OUT_OF_STOCK", "PREORDER"],
      sender_type: ["CUSTOMER", "AI", "HUMAN"],
      wa_connection_state: [
        "CONNECTING",
        "CONNECTED",
        "DISCONNECTED",
        "RECONNECTING",
      ],
    },
  },
} as const
