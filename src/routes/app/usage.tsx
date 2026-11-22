import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { ErrorState, LoadingState, PageHeader, StatCard } from "@/components/common/states";
import { PlanCards } from "@/components/PlanCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { expiresAt, getPlan, isExpired, type SubscriptionInfo } from "@/lib/plans";
import { pageHead } from "@/lib/seo";
import { usageService } from "@/services/db";

export const Route = createFileRoute("/app/usage")({
  head: pageHead(
    "Kifurushi na Matumizi | Zetiora AI",
    "Angalia kifurushi chako, siku zilizobaki, majibu ya AI na bidhaa ulizotumia.",
  ),
  component: UsagePage,
});

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-medium text-foreground">{used.toLocaleString("en-US")} / {max.toLocaleString("en-US")}</span>
      </div>
      <Progress value={pct} className="mt-1.5" />
    </div>
  );
}

function UsagePage() {
  const { business } = useAuth();
  const businessId = business?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["usage-plan", businessId],
    enabled: Boolean(businessId),
    queryFn: async () => {
      const [biz, products, events] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", businessId!).maybeSingle(),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("business_id", businessId!),
        usageService.list(businessId!),
      ]);
      if (biz.error) throw new Error(biz.error.message);
      return { sub: (biz.data ?? {}) as SubscriptionInfo, productCount: products.count ?? 0, events: events ?? [] };
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  if (!data) return null;

  const { sub, productCount, events } = data;
  const plan = getPlan(sub.plan_id);
  const end = expiresAt(sub);
  const expired = isExpired(sub);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  const total = (type: string) =>
    events.filter((e) => e.event_type === type).reduce((s, e) => s + (e.quantity ?? 1), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Kifurushi na Matumizi" description="Kifurushi chako cha sasa na vifurushi vyote." />

      <Card className="border-gold">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-lg">
            <span>Kifurushi: {plan.name}</span>
            <span className={expired ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
              {expired ? "Kimeisha muda" : `Siku ${daysLeft} zimebaki`} · Kinaisha {end.toLocaleDateString("en-GB")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Meter label="Majibu ya AI" used={sub.ai_replies_used ?? 0} max={plan.maxAiReplies} />
          <Meter label="Bidhaa" used={productCount} max={plan.maxProducts} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ujumbe" value={total("MESSAGE")} />
        <StatCard label="Majibu ya AI" value={total("AI_REPLY")} />
        <StatCard label="Oda" value={total("ORDER")} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Vifurushi vyote</h2>
        <PlanCards
          currentId={plan.id}
          onPick={(id) => toast.info(`Kuchagua ${getPlan(id).name}, lipia kisha wasiliana nasi ili tukuwashie.`)}
        />
      </div>
    </div>
  );
}
