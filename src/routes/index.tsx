import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Headphones,
  MessageCircle,
  Package,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  CircleCheck,
} from "lucide-react";

import heroAsset from "@/assets/zetiora-hero-mockup.png.asset.json";
import logoAsset from "@/assets/zetiora-logo.png.asset.json";
import { PlanCards } from "@/components/PlanCards";
import { useAuth } from "@/hooks/useAuth";

const TITLE = "Zetiora AI — Your Business Never Sleeps";
const DESCRIPTION =
  "Msaidizi wa mauzo wa AI kwenye WhatsApp: anajibu wateja, anaonyesha bidhaa na kupokea oda hata ukiwa offline.";

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
  { icon: Headphones, title: "24/7 Customer Support", body: "Jibu maswali ya wateja muda wote." },
  { icon: ShoppingCart, title: "Smart Product Showcase", body: "Onyesha bidhaa zako kwa picha na bei kwenye WhatsApp." },
  { icon: ClipboardCheck, title: "Order Management", body: "Pokea na simamia oda zako kwa urahisi." },
  { icon: BarChart3, title: "Business Insights", body: "Pata taarifa muhimu za biashara yako." },
];

const STEPS = [
  { icon: MessageCircle, t: "1. Connect WhatsApp", d: "Unganisha namba yako ya biashara." },
  { icon: Package, t: "2. Add your products", d: "Weka bidhaa na taarifa za biashara." },
  { icon: CircleCheck, t: "3. Let Zetiora AI assist", d: "AI itahudumia wateja kwa akili." },
];

const gold = "inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-gold-foreground shadow-md transition hover:opacity-90";

function Landing() {
  const { session, isSuperAdmin } = useAuth();
  const to = session ? (isSuperAdmin ? "/admin" : "/app") : "/auth";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <img src={logoAsset.url} alt="Zetiora AI" className="h-9 w-auto" />
          <nav className="hidden gap-7 text-sm font-medium text-foreground md:flex">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            {!session ? (
              <Link to="/auth" className="hidden text-sm font-medium text-foreground sm:inline">Log in</Link>
            ) : null}
            <Link to={to} className="inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground">
              {session ? "Dashboard" : "Get Started"} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden /> AI-Powered Business Assistant
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Your Business <span className="block text-gold">Never Sleeps.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-foreground/80">
              Meet your AI sales assistant that helps answer customers, showcase products and manage orders on WhatsApp — even when you're offline.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link to={to} className={gold}>Get Started <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <a href="#how" className="inline-flex items-center gap-2 font-semibold text-foreground">
                <PlayCircle className="h-7 w-7 text-gold" aria-hidden /> See How It Works
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-gold" aria-hidden /> Built for ambitious businesses.
            </p>
          </div>
          <img src={heroAsset.url} alt="Zetiora AI ikijibu mteja kwenye WhatsApp" className="mx-auto w-full max-w-md" />
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-3xl font-bold text-foreground">Everything your business needs to sell smarter</h2>
          <div className="mx-auto mt-3 h-1 w-20 rounded bg-gold" />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
                <Icon className="mx-auto h-9 w-9 text-gold" aria-hidden />
                <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-3xl font-bold text-foreground">How It Works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, t, d }) => (
              <li key={t} className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
                  <Icon className="h-8 w-8 text-gold" aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-3xl font-bold text-foreground">Vifurushi vya Zetiora AI</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Vifurushi vyote vina mipaka maalum. Boresha kifurushi biashara yako inapokua.
          </p>
          <div className="mt-8"><PlanCards /></div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-start gap-5 rounded-3xl border-2 border-gold bg-ink p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink-foreground">
                Ready to give your business an <span className="text-gold">AI advantage?</span>
              </h2>
              <p className="mt-1 text-ink-foreground/80">Join hundreds of smart businesses using Zetiora AI today.</p>
            </div>
            <Link to={to} className={gold}>Start with Zetiora AI <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="Zetiora AI" className="h-7 w-auto" />
            <span>Powered by Zetiora AI Technologies</span>
          </div>
          <a href="https://www.zetiora.co.tz" className="text-foreground">www.zetiora.co.tz</a>
        </div>
      </footer>
    </div>
  );
}
