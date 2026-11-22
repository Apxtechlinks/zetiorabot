import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from "@/components/common/states";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, label } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { adminService } from "@/services/db";

export const Route = createFileRoute("/admin/usage")({
  head: pageHead(
    "Platform Usage | Owner Console",
    "Messages, AI replies and orders recorded across every business on the platform.",
  ),
  component: AdminUsage,
});

function AdminUsage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "usage"],
    queryFn: adminService.usage,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  const events = data ?? [];
  const total = (type: string) =>
    events.filter((e) => e.event_type === type).reduce((sum, e) => sum + (e.quantity ?? 1), 0);

  const perBusiness = new Map<string, number>();
  for (const event of events) {
    const name = event.businesses?.name ?? "Unknown";
    perBusiness.set(name, (perBusiness.get(name) ?? 0) + (event.quantity ?? 1));
  }
  const leaders = Array.from(perBusiness.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div>
      <PageHeader title="Platform usage" description="The last 500 recorded events." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Messages" value={total("MESSAGE")} />
        <StatCard label="AI replies" value={total("AI_REPLY")} />
        <StatCard label="Orders" value={total("ORDER")} />
      </div>

      {events.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing recorded yet"
            description="Usage builds up as customers start chatting."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Busiest businesses</TableHead>
                    <TableHead className="text-right">Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaders.map(([name, value]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium text-foreground">{name}</TableCell>
                      <TableCell className="text-right">{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recent events</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 50).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{label(event.event_type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {event.businesses?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(event.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
