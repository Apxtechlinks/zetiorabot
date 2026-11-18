import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageSquare,
  Bot,
  Package,
  BookOpen,
  Users,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const TITLE = "WhatsApp AI Assistant for Tanzanian Businesses";
const DESCRIPTION =
  "Let an AI assistant answer your customers on WhatsApp in Swahili and English — share products, capture orders and hand over to a human any time.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Bot,
    title: "Replies day and night",
    body: "Your assistant answers questions in Swahili, English or a mix of both, using your own words and tone.",
  },
  {
    icon: Package,
    title: "Shares your products",
    body: "Prices, photos, availability and links go out automatically when a customer asks.",
  },
  {
    icon: BookOpen,
    title: "Knows your business",
    body: "Add opening hours, delivery, payment and FAQs once — the assistant uses them in every chat.",
  },
  {
    icon: ShoppingCart,
    title: "Captures orders",
    body: "Orders and delivery details are collected in the chat and land in your dashboard.",
  },
  {
    icon: Users,
    title: "Keeps your customers",
    body: "Every contact is saved with tags, notes and where they are in the buying journey.",
  },
  {
    icon: MessageSquare,
    title: "You can step in",
    body: "Take over any conversation with one tap, then hand it back to the assistant when you're done.",
  },
];

const STEPS = [
  { n: "1", t: "Create your business", d: "Sign up and tell us your name, phone and what you sell." },
  { n: "2", t: "Add products and answers", d: "Fill your product list and knowledge base in a few minutes." },
  { n: "3", t: "Connect WhatsApp", d: "Link your number and let the assistant start replying." },
];

function Landing() {
  const { session, isSuperAdmin } = useAuth();
  const dashboardTo = isSuperAdmin ? "/admin" : "/app";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
            WhatsApp AI Assistant
          </span>
          {session ? (
            <Button asChild size="sm">
              <Link to={dashboardTo}>Open dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:pt-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Built for small businesses in Tanzania
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              An assistant that answers your customers on WhatsApp — all day, every day.
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {DESCRIPTION}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={session ? dashboardTo : "/auth"}>
                  {session ? "Open dashboard" : "Create your business"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              No payment details needed to set up your business.
            </p>
          </div>
        </section>

        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border-border">
                <CardHeader className="pb-2">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <CardTitle className="mt-2 text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Up and running in three steps
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-lg border border-border bg-card p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {s.n}
                </span>
                <h3 className="mt-3 font-medium text-foreground">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
              <div>
                <h2 className="font-semibold text-foreground">Your data stays yours</h2>
                <p className="text-sm text-muted-foreground">
                  Each business only ever sees its own chats, customers and orders.
                </p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link to={session ? dashboardTo : "/auth"}>
                {session ? "Open dashboard" : "Get started free"}
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>WhatsApp AI Assistant</span>
          <Link to="/auth" className="hover:text-foreground">
            Log in
          </Link>
        </div>
      </footer>
    </div>
  );
}
