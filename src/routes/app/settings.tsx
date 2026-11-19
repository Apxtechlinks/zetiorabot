import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { pageHead } from "@/lib/seo";
import { settingsService } from "@/services/db";

export const Route = createFileRoute("/app/settings")({
  head: pageHead(
    "Business settings | WhatsApp AI Assistant",
    "Keep your business name, contacts, opening hours, delivery and payment details up to date.",
  ),
  component: SettingsPage,
});

const FIELDS = [
  ["business_name", "Business name", false],
  ["phone", "Phone", false],
  ["email", "Email", false],
  ["location", "Location", false],
  ["website", "Website", false],
  ["opening_hours", "Opening hours", true],
  ["delivery_info", "Delivery information", true],
  ["payment_methods", "Payment methods", true],
  ["description", "About the business", true],
] as const;

type FieldKey = (typeof FIELDS)[number][0];

function SettingsPage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<FieldKey, string>>({
    business_name: "",
    phone: "",
    email: "",
    location: "",
    website: "",
    opening_hours: "",
    delivery_info: "",
    payment_methods: "",
    description: "",
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["settings", businessId],
    queryFn: () => settingsService.get(businessId!),
    enabled: Boolean(businessId),
  });

  useEffect(() => {
    if (!data) return;
    setValues({
      business_name: data.business_name ?? business?.name ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      location: data.location ?? "",
      website: data.website ?? "",
      opening_hours: data.opening_hours ?? "",
      delivery_info: data.delivery_info ?? "",
      payment_methods: data.payment_methods ?? "",
      description: data.description ?? "",
    });
  }, [data, business?.name]);

  const save = useMutation({
    mutationFn: () =>
      settingsService.update(businessId!, {
        business_name: values.business_name || null,
        phone: values.phone || null,
        email: values.email || null,
        location: values.location || null,
        website: values.website || null,
        opening_hours: values.opening_hours || null,
        delivery_info: values.delivery_info || null,
        payment_methods: values.payment_methods || null,
        description: values.description || null,
      }),
    onSuccess: async () => {
      toast.success("Settings saved");
      await queryClient.invalidateQueries({ queryKey: ["settings", businessId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="These details are used by the assistant when it answers customers."
      />
      <Card className="max-w-3xl">
        <CardContent className="grid gap-4 py-6 sm:grid-cols-2">
          {FIELDS.map(([key, labelText, multiline]) => (
            <div key={key} className={multiline ? "sm:col-span-2" : undefined}>
              <Label htmlFor={key}>{labelText}</Label>
              {multiline ? (
                <Textarea
                  id={key}
                  rows={3}
                  value={values[key]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                />
              ) : (
                <Input
                  id={key}
                  value={values[key]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                />
              )}
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
