import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { platformConfig } from "@/lib/platform.functions";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/admin/settings")({
  head: pageHead(
    "Platform Settings | Owner Console",
    "Check which platform integrations are configured: the WhatsApp service and the AI provider.",
  ),
  component: AdminSettings,
});

function StatusRow({ title, description, ready, detail }: {
  title: string;
  description: string;
  ready: boolean;
  detail?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
      </div>
      <Badge variant={ready ? "secondary" : "outline"}>{ready ? "Ready" : "Not set up"}</Badge>
    </div>
  );
}

function AdminSettings() {
  const configFn = useServerFn(platformConfig);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "config"],
    queryFn: () => configFn({ data: undefined }),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  return (
    <div>
      <PageHeader
        title="Platform settings"
        description="What is connected on the server right now."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
          <CardDescription>
            These are read from the server. No keys or secrets are ever shown here.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <StatusRow
            title="WhatsApp service"
            description="The always-on service that holds the WhatsApp sessions and delivers messages."
            ready={Boolean(data?.whatsappWorker)}
          />
          <StatusRow
            title="AI replies"
            description="The model used to draft replies to customers."
            ready={Boolean(data?.aiProvider)}
            detail={data?.aiModel ? `Model: ${data.aiModel}` : null}
          />
          <StatusRow
            title="Incoming message callbacks"
            description="Lets the WhatsApp service post new messages and connection changes back into the app."
            ready={Boolean(data?.inboundToken)}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Callback endpoints</CardTitle>
          <CardDescription>
            Point the WhatsApp service at these paths. Both require the shared service token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="font-mono text-xs">POST /api/public/whatsapp/inbound-message</p>
          <p className="font-mono text-xs">POST /api/public/whatsapp/connection-state</p>
        </CardContent>
      </Card>
    </div>
  );
}
