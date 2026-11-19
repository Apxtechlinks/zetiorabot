import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, label } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { adminService } from "@/services/db";

export const Route = createFileRoute("/admin/businesses")({
  head: pageHead(
    "Businesses | Owner Console",
    "Every business on the platform, its WhatsApp connection and its account status.",
  ),
  component: AdminBusinesses,
});

function AdminBusinesses() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "businesses"],
    queryFn: adminService.businesses,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });

  const create = useMutation({
    mutationFn: () => adminService.createBusiness(form.name, form.email, form.phone),
    onSuccess: () => {
      toast.success("Business created");
      setForm({ name: "", email: "", phone: "" });
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) =>
      adminService.setStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  const businesses = data ?? [];

  return (
    <div>
      <PageHeader
        title="Businesses"
        description="Every business account on this platform."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add business</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New business</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Contact email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Contact phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={!form.name.trim() || create.isPending}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {businesses.length === 0 ? (
        <EmptyState
          title="No businesses yet"
          description="Businesses appear here as soon as they are created."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business) => {
                  const account = business.whatsapp_accounts?.[0];
                  const suspended = business.status === "SUSPENDED";
                  return (
                    <TableRow key={business.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{business.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {business.contact_email ?? "No email"}
                        </div>
                      </TableCell>
                      <TableCell>{business.business_members?.length ?? 0}</TableCell>
                      <TableCell>
                        {account ? label(account.connection_state) : "Not set up"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={suspended ? "destructive" : "secondary"}>
                          {label(business.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(business.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={setStatus.isPending}
                          onClick={() =>
                            setStatus.mutate({
                              id: business.id,
                              status: suspended ? "ACTIVE" : "SUSPENDED",
                            })
                          }
                        >
                          {suspended ? "Reactivate" : "Suspend"}
                        </Button>
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
