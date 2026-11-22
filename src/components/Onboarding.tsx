import { Loader2, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function BusinessOnboarding() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    setSaving(true);
    try {
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .insert({
          name: name.trim(),
          owner_id: user.id,
          contact_email: email.trim() || null,
          contact_phone: phone.trim() || null,
        })
        .select()
        .single();
      if (bizError) throw new Error(bizError.message);

      const { error: memberError } = await supabase.from("business_members").insert({
        business_id: business.id,
        user_id: user.id,
        role: "OWNER",
      });
      if (memberError) throw new Error(memberError.message);

      await refresh();
      toast.success("Your business is ready!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create your business");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <CardTitle>Set up your business</CardTitle>
          <CardDescription>
            One quick step before you can connect WhatsApp and start receiving customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="biz-name">Business name</Label>
              <Input
                id="biz-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amina Fashion Store"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-phone">Phone (optional)</Label>
              <Input
                id="biz-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +255 700 000 000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="biz-email">Contact email (optional)</Label>
              <Input
                id="biz-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {saving ? "Creating…" : "Create my business"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
