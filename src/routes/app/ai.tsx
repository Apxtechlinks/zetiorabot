import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingState, PageHeader } from "@/components/common/states";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { pageHead } from "@/lib/seo";
import { aiService } from "@/services/db";

export const Route = createFileRoute("/app/ai")({
  head: pageHead(
    "AI & prompts | WhatsApp AI Assistant",
    "Set the voice, language and instructions your WhatsApp assistant follows when replying to customers.",
  ),
  component: AiPage,
});

function AiPage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ai-prompt", businessId],
    queryFn: () => aiService.get(businessId!),
    enabled: Boolean(businessId),
  });

  const [systemPrompt, setSystemPrompt] = useState("");
  const [language, setLanguage] = useState("Swahili (Tanzania)");
  const [personality, setPersonality] = useState("Friendly");
  const [responseLength, setResponseLength] = useState("Short");
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!data) return;
    setSystemPrompt(data.system_prompt);
    setLanguage(data.language);
    setPersonality(data.personality);
    setResponseLength(data.response_length);
    setEnabled(data.ai_enabled);
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      aiService.update(businessId!, {
        system_prompt: systemPrompt,
        language,
        personality,
        response_length: responseLength,
        ai_enabled: enabled,
      }),
    onSuccess: async () => {
      toast.success("AI settings saved");
      await queryClient.invalidateQueries({ queryKey: ["ai-prompt", businessId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  return (
    <div>
      <PageHeader title="AI & prompts" description="How your assistant speaks to customers." />

      <Card className="max-w-3xl">
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Automatic replies</p>
              <p className="text-xs text-muted-foreground">
                When off, messages still arrive but the assistant stays silent.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div>
            <Label htmlFor="prompt">Instructions</Label>
            <Textarea
              id="prompt"
              rows={10}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="lang">Main language</Label>
              <Input id="lang" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div>
              <Label>Personality</Label>
              <Select value={personality} onValueChange={setPersonality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Friendly", "Professional", "Playful", "Direct"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reply length</Label>
              <Select value={responseLength} onValueChange={setResponseLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Short", "Medium", "Detailed"].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            The assistant understands Swahili, English and a mix of both, and always answers in the
            language the customer used.
          </p>

          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
