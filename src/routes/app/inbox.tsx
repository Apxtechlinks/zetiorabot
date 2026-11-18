import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatDate, label } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { conversationsService } from "@/services/db";

export const Route = createFileRoute("/app/inbox")({
  head: pageHead(
    "Inbox | WhatsApp AI Assistant",
    "Read every WhatsApp conversation, take over from the assistant and reply yourself when needed.",
  ),
  component: InboxPage,
});

interface ConversationRow {
  id: string;
  ai_mode: "AI_ACTIVE" | "HUMAN_ACTIVE";
  status: string;
  last_message_at: string | null;
  contacts: { id: string; name: string | null; phone: string; stage: string } | null;
}

function InboxPage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const conversations = useQuery({
    queryKey: ["conversations", businessId],
    queryFn: () =>
      conversationsService.list(businessId!) as Promise<unknown> as Promise<ConversationRow[]>,
    enabled: Boolean(businessId),
  });

  const active = (conversations.data ?? []).find((c) => c.id === activeId) ?? null;

  const messages = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => conversationsService.messages(activeId!),
    enabled: Boolean(activeId),
  });

  const setMode = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: "AI_ACTIVE" | "HUMAN_ACTIVE" }) =>
      conversationsService.setAiMode(id, mode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["conversations", businessId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const send = useMutation({
    mutationFn: async () => {
      if (!businessId || !activeId) throw new Error("Pick a conversation first");
      if (!draft.trim()) throw new Error("Write a message first");
      return conversationsService.addHumanMessage({
        business_id: businessId,
        conversation_id: activeId,
        content: draft.trim(),
        sender_type: "HUMAN",
        message_type: "TEXT",
      });
    },
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
      toast.success("Reply saved. It is sent once the WhatsApp service is connected.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Inbox" description="Every conversation with your customers." />

      {conversations.isLoading ? (
        <LoadingState />
      ) : conversations.error ? (
        <ErrorState
          message={(conversations.error as Error).message}
          onRetry={() => void conversations.refetch()}
        />
      ) : (conversations.data ?? []).length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Chats show up here as soon as customers message your WhatsApp number."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-2">
            {(conversations.data ?? []).map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveId(conversation.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                  conversation.id === activeId
                    ? "border-primary bg-accent/50"
                    : "border-border bg-card hover:bg-accent/30",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {conversation.contacts?.name ?? conversation.contacts?.phone ?? "Unknown"}
                  </p>
                  <Badge variant={conversation.ai_mode === "AI_ACTIVE" ? "default" : "secondary"}>
                    {conversation.ai_mode === "AI_ACTIVE" ? "AI" : "You"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(conversation.last_message_at)}
                </p>
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="flex min-h-[420px] flex-col gap-3 py-5">
              {!active ? (
                <p className="text-sm text-muted-foreground">Pick a conversation to read it.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {active.contacts?.name ?? active.contacts?.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {active.contacts?.phone} · {label(active.contacts?.stage)}
                      </p>
                    </div>
                    {active.ai_mode === "AI_ACTIVE" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setMode.mutate({ id: active.id, mode: "HUMAN_ACTIVE" })}
                      >
                        Take over
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setMode.mutate({ id: active.id, mode: "AI_ACTIVE" })}
                      >
                        Return to AI
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {messages.isLoading ? (
                      <LoadingState label="Loading messages…" />
                    ) : (messages.data ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No messages in this chat yet.</p>
                    ) : (
                      (messages.data ?? []).map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                            message.sender_type === "CUSTOMER"
                              ? "bg-muted text-foreground"
                              : "ml-auto bg-primary text-primary-foreground",
                          )}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="mt-1 text-[10px] opacity-70">
                            {label(message.sender_type)} · {formatDate(message.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-end gap-2 border-t border-border pt-3">
                    <Textarea
                      rows={2}
                      placeholder="Write a reply…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <Button onClick={() => send.mutate()} disabled={send.isPending}>
                      Send
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
