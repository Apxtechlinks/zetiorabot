import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { KB_CATEGORIES, KB_STATUSES, formatDate, label, type KbCategory, type KbStatus } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { knowledgeService, type KnowledgeEntry } from "@/services/db";

export const Route = createFileRoute("/app/knowledge")({
  head: pageHead(
    "Knowledge base | WhatsApp AI Assistant",
    "Teach your assistant about your business with notes, policies, FAQs and uploaded documents.",
  ),
  component: KnowledgePage,
});

interface Draft {
  title: string;
  content: string;
  category: KbCategory;
  status: KbStatus;
  source_url: string;
}

const emptyDraft: Draft = {
  title: "",
  content: "",
  category: "BUSINESS",
  status: "PUBLISHED",
  source_url: "",
};

function KnowledgePage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const entries = useQuery({
    queryKey: ["knowledge", businessId],
    queryFn: () => knowledgeService.list(businessId!),
    enabled: Boolean(businessId),
  });
  const documents = useQuery({
    queryKey: ["knowledge-docs", businessId],
    queryFn: () => knowledgeService.documents(businessId!),
    enabled: Boolean(businessId),
  });

  const refreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["knowledge", businessId] });
    await queryClient.invalidateQueries({ queryKey: ["knowledge-docs", businessId] });
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business");
      if (!draft.title.trim()) throw new Error("Title is required");
      const payload = {
        business_id: businessId,
        title: draft.title.trim(),
        content: draft.content.trim() || null,
        category: draft.category,
        status: draft.status,
        source_url: draft.source_url.trim() || null,
      };
      return editing ? knowledgeService.update(editing.id, payload) : knowledgeService.create(payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Entry updated" : "Entry added");
      setOpen(false);
      setEditing(null);
      setDraft(emptyDraft);
      await refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => knowledgeService.remove(id),
    onSuccess: async () => {
      toast.success("Entry deleted");
      await refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = useMutation({
    mutationFn: (file: File) => knowledgeService.uploadDocument(businessId!, file),
    onSuccess: async () => {
      toast.success("File uploaded");
      await refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeDoc = useMutation({
    mutationFn: (doc: Parameters<typeof knowledgeService.removeDocument>[0]) =>
      knowledgeService.removeDocument(doc),
    onSuccess: async () => {
      toast.success("File removed");
      await refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        description="What your assistant knows about your business."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDraft(emptyDraft);
              setOpen(true);
            }}
          >
            Add entry
          </Button>
        }
      />

      {entries.isLoading ? (
        <LoadingState />
      ) : entries.error ? (
        <ErrorState message={(entries.error as Error).message} onRetry={() => void entries.refetch()} />
      ) : (entries.data ?? []).length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Add opening hours, delivery rules, FAQs or anything customers usually ask."
        />
      ) : (
        <div className="space-y-3">
          {(entries.data ?? []).map((entry) => (
            <Card key={entry.id}>
              <CardContent className="space-y-2 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{entry.title}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{label(entry.category)}</Badge>
                    <Badge variant={entry.status === "PUBLISHED" ? "default" : "secondary"}>
                      {label(entry.status)}
                    </Badge>
                  </div>
                </div>
                {entry.content ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.content}</p>
                ) : null}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(entry);
                      setDraft({
                        title: entry.title,
                        content: entry.content ?? "",
                        category: entry.category,
                        status: entry.status,
                        source_url: entry.source_url ?? "",
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(entry.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && businessId) upload.mutate(file);
            }}
          />
          {documents.isLoading ? (
            <LoadingState label="Loading files…" />
          ) : (documents.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(documents.data ?? []).map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeDoc.mutate(doc)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit entry" : "Add entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="k-title">Title</Label>
              <Input
                id="k-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => setDraft({ ...draft, category: v as KbCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KB_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {label(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => setDraft({ ...draft, status: v as KbStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KB_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {label(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="k-content">Content</Label>
              <Textarea
                id="k-content"
                rows={6}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="k-source">Source link</Label>
              <Input
                id="k-source"
                value={draft.source_url}
                onChange={(e) => setDraft({ ...draft, source_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
