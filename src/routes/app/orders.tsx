import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatMoney, label, ORDER_STATUSES, type OrderStatus } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { ordersService } from "@/services/db";

export const Route = createFileRoute("/app/orders")({
  head: pageHead(
    "Orders | WhatsApp AI Assistant",
    "Follow every order captured from WhatsApp chats, with items, delivery details and status.",
  ),
  component: OrdersPage,
});

interface OrderRow {
  id: string;
  order_number: string | null;
  status: OrderStatus;
  total: number;
  currency: string;
  created_at: string;
  delivery_address: string | null;
  delivery_notes: string | null;
  payment_method: string | null;
  notes: string | null;
  contacts: { name: string | null; phone: string } | null;
  order_items: { id: string; product_name: string; quantity: number; subtotal: number }[];
}

function OrdersPage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders", businessId],
    queryFn: () => ordersService.list(businessId!) as Promise<unknown> as Promise<OrderRow[]>,
    enabled: Boolean(businessId),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onSuccess: async () => {
      toast.success("Order updated");
      await queryClient.invalidateQueries({ queryKey: ["orders", businessId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((o) => filter === "ALL" || o.status === filter);

  return (
    <div>
      <PageHeader title="Orders" description="Orders raised from WhatsApp conversations." />

      <Select value={filter} onValueChange={(v) => setFilter(v as "ALL" | OrderStatus)}>
        <SelectTrigger className="mb-4 max-w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {label(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders appear here when a chat turns into a purchase."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((order) => (
            <Card key={order.id}>
              <CardContent className="space-y-3 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {order.order_number ?? order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.contacts?.name ?? order.contacts?.phone ?? "Unknown customer"} ·{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{formatMoney(order.total, order.currency)}</Badge>
                    <Select
                      value={order.status}
                      onValueChange={(v) => setStatus.mutate({ id: order.id, status: v as OrderStatus })}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {label(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {order.order_items?.length ? (
                  <ul className="rounded-lg border border-border">
                    {order.order_items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between border-b border-border px-3 py-2 text-sm last:border-b-0"
                      >
                        <span>
                          {item.product_name} × {item.quantity}
                        </span>
                        <span>{formatMoney(item.subtotal, order.currency)}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <p>Delivery: {order.delivery_address ?? "—"}</p>
                  <p>Payment: {order.payment_method ?? "—"}</p>
                  <p>Delivery notes: {order.delivery_notes ?? "—"}</p>
                  <p>Notes: {order.notes ?? "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
