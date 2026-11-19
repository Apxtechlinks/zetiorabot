import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ErrorState, LoadingState, PageHeader, StatCard } from "@/components/common/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { adminService } from "@/services/db";

export const Route = createFileRoute("/admin/")({
  head: pageHead(
    "Platform Overview | Owner Console",
    "Platform-wide totals for businesses, users, WhatsApp accounts and message volume.",
  ),
  component: AdminOverview,
});

function AdminOverview() {
  const counts = useQuery({ queryKey: ["admin", "counts"], queryFn: adminService.platformCounts });
  const logs = useQuery({ queryKey: ["admin", "logs"], queryFn: adminService.logs });

  if (counts.isLoading) return <LoadingState />;
  if (counts.error)
    return (
      <ErrorState
        message={(counts.error as Error).message}
        onRetry={() => void counts.refetch()}
      />
    );

  const data = counts.data;

  return (
    <div>
      <PageHeader title="Platform overview" description="Everything running on this deployment." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Businesses" value={data?.businesses ?? 0} />
        <StatCard label="Users" value={data?.profiles ?? 0} />
        <StatCard label="WhatsApp accounts" value={data?.whatsapp_accounts ?? 0} />
        <StatCard label="Messages" value={data?.messages ?? 0} />
        <StatCard label="Usage events" value={data?.usage_events ?? 0} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Latest activity</CardTitle>
        </CardHeader>
        <CardContent>
          {(logs.data ?? []).length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(logs.data ?? []).slice(0, 10).map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-foreground">{log.action}</span>
                  <span className="text-muted-foreground">{formatDate(log.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/logs"
            className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
          >
            View all system logs
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
