import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, label } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { adminService } from "@/services/db";

export const Route = createFileRoute("/admin/users")({
  head: pageHead(
    "Users | Owner Console",
    "Everyone with an account, the business they belong to and their platform role.",
  ),
  component: AdminUsers,
});

function AdminUsers() {
  const profiles = useQuery({ queryKey: ["admin", "profiles"], queryFn: adminService.profiles });
  const roles = useQuery({ queryKey: ["admin", "roles"], queryFn: adminService.roles });
  const memberships = useQuery({
    queryKey: ["admin", "memberships"],
    queryFn: adminService.memberships,
  });

  if (profiles.isLoading || roles.isLoading) return <LoadingState />;
  if (profiles.error)
    return (
      <ErrorState
        message={(profiles.error as Error).message}
        onRetry={() => void profiles.refetch()}
      />
    );

  const rows = profiles.data ?? [];
  const roleFor = (userId: string) =>
    (roles.data ?? []).filter((role) => role.user_id === userId).map((role) => role.role);

  return (
    <div>
      <PageHeader title="Users" description="People with access to this platform." />

      {rows.length === 0 ? (
        <EmptyState title="No users yet" description="Accounts appear here after the first sign-up." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((profile) => {
                  const membership = (memberships.data ?? []).find(
                    (item) => item.user_id === profile.id,
                  );
                  const platformRoles = roleFor(profile.id);
                  return (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium text-foreground">
                        {profile.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {profile.email ?? "—"}
                      </TableCell>
                      <TableCell>
                        {membership?.businesses?.name ?? "No business"}
                        {membership ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {label(membership.role)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {platformRoles.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          platformRoles.map((role) => (
                            <Badge
                              key={role}
                              variant={role === "SUPER_ADMIN" ? "default" : "secondary"}
                              className="mr-1"
                            >
                              {label(role)}
                            </Badge>
                          ))
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(profile.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
