import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, label } from "@/lib/domain";
import {
  whatsappConnect,
  whatsappDisconnect,
  whatsappPairingCode,
  whatsappQr,
  whatsappReconnect,
  whatsappStatus,
} from "@/lib/whatsapp.functions";
import { pageHead } from "@/lib/seo";
import { whatsappAccountsService, type WhatsappAccount } from "@/services/db";
import type { WhatsappResult } from "@/services/whatsapp/contract";

export const Route = createFileRoute("/app/whatsapp")({
  head: pageHead(
    "WhatsApp | WhatsApp AI Assistant",
    "Connect your WhatsApp number, view the connection status, and reconnect or disconnect at any time.",
  ),
  component: WhatsappPage,
});

function report<T>(result: WhatsappResult<T>, successMessage: string) {
  if (result.ok) {
    toast.success(successMessage);
    return result.data;
  }
  toast.error(result.message);
  return null;
}

function WhatsappPage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState("");
  const [pairing, setPairing] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const connectFn = useServerFn(whatsappConnect);
  const disconnectFn = useServerFn(whatsappDisconnect);
  const reconnectFn = useServerFn(whatsappReconnect);
  const pairingFn = useServerFn(whatsappPairingCode);
  const qrFn = useServerFn(whatsappQr);
  const statusFn = useServerFn(whatsappStatus);

  const accountQuery = useQuery({
    queryKey: ["whatsapp-account", businessId],
    queryFn: () => whatsappAccountsService.ensure(businessId!),
    enabled: Boolean(businessId),
  });

  const account = accountQuery.data as WhatsappAccount | undefined;

  const statusQuery = useQuery({
    queryKey: ["whatsapp-status", account?.id],
    queryFn: () => statusFn({ data: { businessId: businessId!, accountId: account!.id } }),
    enabled: Boolean(businessId && account?.id),
  });

  const busy = useMutation({
    mutationFn: async (action: "connect-qr" | "connect-code" | "disconnect" | "reconnect") => {
      if (!businessId || !account?.id) {
        toast.error("Your business is still loading. Try again in a moment.");
        return;
      }
      const data = { businessId, accountId: account.id };
      if (action === "connect-qr") {
        const result = await connectFn({ data: { ...data, method: "QR", phoneNumber: null } });
        if (report(result, "Connecting…")) {
          const qrResult = await qrFn({ data });
          setQr(qrResult.ok ? qrResult.data.qr : null);
          if (!qrResult.ok) toast.error(qrResult.message);
        }
        return;
      }
      if (action === "connect-code") {
        const number = (phone || account.phone_number || "").trim();
        if (number.length < 6) {
          toast.error("Enter the WhatsApp number first");
          return;
        }
        await whatsappAccountsService.setPhone(account.id, number);
        const result = await connectFn({
          data: { ...data, method: "PAIRING_CODE", phoneNumber: number },
        });
        if (report(result, "Connecting…")) {
          const codeResult = await pairingFn({ data: { ...data, phoneNumber: number } });
          setPairing(codeResult.ok ? codeResult.data.code : null);
          if (!codeResult.ok) toast.error(codeResult.message);
        }
        return;
      }
      if (action === "disconnect") {
        report(await disconnectFn({ data }), "Disconnected");
        return;
      }
      report(await reconnectFn({ data }), "Reconnecting…");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Something went wrong";
      console.error("WhatsApp action failed", error);
      toast.error(message);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
      void queryClient.invalidateQueries({ queryKey: ["whatsapp-account"] });
    },
  });

  if (accountQuery.isLoading) return <LoadingState />;
  if (accountQuery.error)
    return (
      <ErrorState
        message={(accountQuery.error as Error).message}
        onRetry={() => void accountQuery.refetch()}
      />
    );

  const status = statusQuery.data?.ok ? statusQuery.data.data : null;
  const serviceMessage =
    statusQuery.data && !statusQuery.data.ok ? statusQuery.data.message : null;
  const state = status?.connectionState ?? account?.connection_state ?? "DISCONNECTED";
  const working = busy.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp"
        description="Link the WhatsApp number your customers already message you on."
      />

      {serviceMessage ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">{serviceMessage}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Connection</CardTitle>
            <CardDescription>
              {status?.phoneNumber ?? account?.phone_number ?? "No number linked yet"}
            </CardDescription>
          </div>
          <Badge variant={state === "CONNECTED" ? "default" : "secondary"}>{label(state)}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Last connected</dt>
              <dd className="text-foreground">
                {status?.lastConnectedAt ? formatDate(status.lastConnectedAt) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last seen</dt>
              <dd className="text-foreground">
                {status?.lastSeenAt ? formatDate(status.lastSeenAt) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last error</dt>
              <dd className="text-foreground">{status?.lastError ?? "—"}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button disabled={working} onClick={() => busy.mutate("reconnect")} variant="outline">
              Reconnect
            </Button>
            <Button
              disabled={working}
              onClick={() => busy.mutate("disconnect")}
              variant="destructive"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link with a pairing code</CardTitle>
            <CardDescription>
              Enter your WhatsApp number, then type the code into WhatsApp on your phone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="wa-phone">WhatsApp number</Label>
              <Input
                id="wa-phone"
                placeholder="255700000000"
                value={phone || account?.phone_number || ""}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button disabled={working} onClick={() => busy.mutate("connect-code")}>
              Get pairing code
            </Button>
            {pairing ? (
              <p className="rounded-md bg-muted px-3 py-2 text-lg font-semibold tracking-[0.3em] text-foreground">
                {pairing}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link by scanning a code</CardTitle>
            <CardDescription>
              Open WhatsApp on your phone, go to linked devices, and scan the code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button disabled={working} variant="outline" onClick={() => busy.mutate("connect-qr")}>
              Show code
            </Button>
            {qr ? (
              qr.startsWith("data:") ? (
                <img src={qr} alt="WhatsApp linking code" className="h-56 w-56 rounded-md border border-border" />
              ) : (
                <p className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {qr}
                </p>
              )
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
