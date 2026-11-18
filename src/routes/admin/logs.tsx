import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { adminService } from "@/services/db";

export const Route = createFileRoute("/admin/logs")({
  head: pageHead(
    "System Logs | Owner Console",
    "Recent recorded actions across the platform, including WhatsApp connection changes.",
  ),
  component: AdminLogs,
});

function AdminLogs() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "logs"],
    queryFn: adminService.logs,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  const term = search.trim().toLowerCase();
  const logs = (data ?? []).filter((log) =>
    term
      ? `${log.action} ${log.resource_type ?? ""} ${log.businesses?.name ?? ""}`
          .toLowerCase()
          .includes(term)
      : true,
  );

  return (
    <div>
      <PageHeader
        title="System logs"
        description="The 200 most recent recorded actions."
        actions={
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search actions…"
            className="w-56"
          />
        }
      />

      {logs.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          description="Actions such as WhatsApp connection changes appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.businesses?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.resource_type ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
