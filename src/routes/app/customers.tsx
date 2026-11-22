import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { CONTACT_STAGES, formatDate, label, type ContactStage } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { contactsService, type Contact } from "@/services/db";

export const Route = createFileRoute("/app/customers")({
  head: pageHead(
    "Customers | WhatsApp AI Assistant",
    "Track every WhatsApp customer, their stage in the buying journey, tags and private notes.",
  ),
  component: CustomersPage,
});

function CustomersPage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contacts", businessId, search],
    queryFn: () => contactsService.list(businessId!, search || undefined),
    enabled: Boolean(businessId),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof contactsService.update>[1] }) =>
      contactsService.update(id, patch),
    onSuccess: async () => {
      toast.success("Customer updated");
      await queryClient.invalidateQueries({ queryKey: ["contacts", businessId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const select = (contact: Contact) => {
    setSelected(contact);
    setNotes(contact.notes ?? "");
    setTags((contact.tags ?? []).join(", "));
  };

  return (
    <div>
      <PageHeader title="Customers" description="Everyone who has written to your WhatsApp." />

      <Input
        placeholder="Search by name or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Customers appear automatically as soon as they message your WhatsApp number."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            {data.map((contact) => (
              <button
                key={contact.id}
                onClick={() => select(contact)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {contact.name ?? contact.phone}
                  </p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="secondary">{label(contact.stage)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(contact.last_interaction_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <Card className="h-fit">
            <CardContent className="space-y-3 py-5">
              {selected ? (
                <>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {selected.name ?? selected.phone}
                    </p>
                    <p className="text-xs text-muted-foreground">{selected.phone}</p>
                  </div>
                  <div>
                    <Label>Stage</Label>
                    <Select
                      value={selected.stage}
                      onValueChange={(v) =>
                        update.mutate({ id: selected.id, patch: { stage: v as ContactStage } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_STAGES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {label(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="c-tags">Tags (comma separated)</Label>
                    <Input id="c-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="c-notes">Notes</Label>
                    <Textarea
                      id="c-notes"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() =>
                      update.mutate({
                        id: selected.id,
                        patch: {
                          notes: notes.trim() || null,
                          tags: tags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    disabled={update.isPending}
                  >
                    {update.isPending ? "Saving…" : "Save details"}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pick a customer on the left to see and edit their details.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
