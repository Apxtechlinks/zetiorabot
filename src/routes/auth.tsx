import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — WhatsApp AI Assistant" },
      {
        name: "description",
        content:
          "Create an account or sign in to manage your WhatsApp AI assistant, products, orders and customers.",
      },
      { property: "og:title", content: "Sign in — WhatsApp AI Assistant" },
      {
        property: "og:description",
        content: "Access your business dashboard for the WhatsApp AI assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: isSuperAdmin ? "/admin" : "/app" });
    }
  }, [session, loading, isSuperAdmin, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-lg font-semibold text-foreground">
            WhatsApp AI Assistant
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            One assistant that answers your customers, day and night.
          </p>
        </div>
        <Card>
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
              <TabsContent value="reset">
                <ResetForm />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <CardDescription>Log in to your business dashboard.</CardDescription>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: fullName, phone },
        },
      });
      if (error) throw error;
      if (!data.session || !data.user) {
        toast.success("Account created. Check your email to confirm, then log in.");
        return;
      }

      const userId = data.user.id;
      await supabase
        .from("profiles")
        .upsert({ id: userId, full_name: fullName, email, phone }, { onConflict: "id" });

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({ name: businessName, owner_id: userId, contact_email: email, contact_phone: phone })
        .select("id")
        .single();
      if (businessError) throw businessError;

      const { error: memberError } = await supabase
        .from("business_members")
        .insert({ business_id: business.id, user_id: userId, role: "OWNER" });
      if (memberError) throw memberError;

      await Promise.all([
        supabase.from("business_settings").insert({
          business_id: business.id,
          business_name: businessName,
          phone,
          email,
        }),
        supabase.from("ai_prompts").insert({ business_id: business.id }),
      ]);

      await refresh();
      toast.success("Business created. Welcome!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <CardDescription>Create your account and your business in one step.</CardDescription>
      <div className="space-y-2">
        <Label htmlFor="reg-name">Your name</Label>
        <Input id="reg-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-business">Business name</Label>
        <Input
          id="reg-business"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-phone">Phone</Label>
        <Input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function ResetForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent. Check your email.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <CardDescription>We'll email you a link to set a new password.</CardDescription>
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
