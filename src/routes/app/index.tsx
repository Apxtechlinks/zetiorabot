import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, label } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { overviewService } from "@/services/db";

export const Route = createFileRoute("/app/")({
  head: pageHead(
    "Business overview | WhatsApp AI Assistant",
    "See your WhatsApp connection, AI status, conversations, customers, products and orders at a glance.",
  ),
  component: Overview,
});

function Overview() {
  const { business } = useAuth();
  const businessId = business?.id;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["overview", businessId],
    queryFn: () => overviewService.load(businessId!),
    enabled: Boolean(businessId),
  });

  if (!businessId)
    return <EmptyState title="No business yet" description="Your account is not linked to a business." />;
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;
  if (!data) return null;

  return (
    <div>
      <PageHeader title={`Welcome, ${business?.name}`} description="Today's activity across your assistant." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant={data.account?.connection_state === "CONNECTED" ? "default" : "secondary"}>
              {label(data.account?.connection_state ?? "DISCONNECTED")}
            </Badge>
            <Link to="/app/whatsapp" className="text-sm font-medium text-primary underline underline-offset-4">
              Manage
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">AI assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Badge variant={data.prompt?.ai_enabled ? "default" : "secondary"}>
              {data.prompt?.ai_enabled ? "On" : "Off"}
            </Badge>
            <Link to="/app/ai" className="text-sm font-medium text-primary underline underline-offset-4">
              Configure
            </Link>
          </CardContent>
        </Card>
        <StatCard label="Conversations" value={data.conversations} />
        <StatCard label="Messages" value={data.messages} />
        <StatCard label="Customers" value={data.contacts} />
        <StatCard label="Products" value={data.products} />
        <StatCard label="Orders" value={data.orders} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <EmptyState title="No messages yet" description="Activity appears here once customers write in." />
          ) : (
            <ul className="divide-y divide-border">
              {data.recent.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{m.content ?? label(m.message_type)}</p>
                    <p className="text-xs text-muted-foreground">{label(m.sender_type)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
