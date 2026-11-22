import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingState, PageHeader, StatCard } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, label } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { adminService } from "@/services/db";

export const Route = createFileRoute("/admin/whatsapp")({
  head: pageHead(
    "WhatsApp Accounts | Owner Console",
    "Connection state of every WhatsApp number linked to a business on this platform.",
  ),
  component: AdminWhatsapp,
});

function AdminWhatsapp() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "whatsapp"],
    queryFn: adminService.whatsappAccounts,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  const accounts = data ?? [];
  const count = (state: string) =>
    accounts.filter((account) => account.connection_state === state).length;

  return (
    <div>
      <PageHeader
        title="WhatsApp accounts"
        description="Live connection state reported by the WhatsApp service."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Connected" value={count("CONNECTED")} />
        <StatCard label="Connecting" value={count("CONNECTING")} />
        <StatCard label="Reconnecting" value={count("RECONNECTING")} />
        <StatCard label="Disconnected" value={count("DISCONNECTED")} />
      </div>

      <div className="mt-6">
        {accounts.length === 0 ? (
          <EmptyState
            title="No WhatsApp accounts yet"
            description="An account appears here once a business starts connecting a number."
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Last connected</TableHead>
                    <TableHead>Last error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium text-foreground">
                        {account.businesses?.name ?? "—"}
                      </TableCell>
                      <TableCell>{account.phone_number ?? "Not set"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            account.connection_state === "CONNECTED" ? "secondary" : "outline"
                          }
                        >
                          {label(account.connection_state)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(account.last_connected_at)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {account.last_error ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
