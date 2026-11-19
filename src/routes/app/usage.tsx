import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from "@/components/common/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, label } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { usageService } from "@/services/db";

export const Route = createFileRoute("/app/usage")({
  head: pageHead(
    "Usage | WhatsApp AI Assistant",
    "See how many messages, AI replies and orders your business has handled over time.",
  ),
  component: UsagePage,
});

function UsagePage() {
  const { business } = useAuth();
  const businessId = business?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["usage", businessId],
    queryFn: () => usageService.list(businessId!),
    enabled: Boolean(businessId),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  const events = data ?? [];
  const total = (type: string) =>
    events.filter((e) => e.event_type === type).reduce((sum, e) => sum + (e.quantity ?? 1), 0);

  return (
    <div>
      <PageHeader title="Usage" description="Your activity this account." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Messages" value={total("MESSAGE")} />
        <StatCard label="AI replies" value={total("AI_REPLY")} />
        <StatCard label="Orders" value={total("ORDER")} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState title="Nothing recorded yet" description="Usage builds up as customers chat." />
          ) : (
            <ul className="divide-y divide-border">
              {events.slice(0, 100).map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-foreground">{label(event.event_type)}</span>
                  <span className="text-muted-foreground">
                    ×{event.quantity ?? 1} · {formatDate(event.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
