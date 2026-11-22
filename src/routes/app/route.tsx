import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
  Users,
  BarChart3,
} from "lucide-react";
import { useEffect } from "react";

import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { LoadingState } from "@/components/common/states";
import { BusinessOnboarding } from "@/components/Onboarding";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app")({
  component: BusinessLayout,
});

const items: NavItem[] = [
  { to: "/app", label: "Overview", icon: LayoutDashboard },
  { to: "/app/inbox", label: "Inbox", icon: Inbox },
  { to: "/app/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/app/products", label: "Products", icon: Package },
  { to: "/app/knowledge", label: "Knowledge Base", icon: BookOpen },
  { to: "/app/ai", label: "AI & Prompts", icon: Bot },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/orders", label: "Orders", icon: ShoppingCart },
  { to: "/app/usage", label: "Usage", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function BusinessLayout() {
  const { session, loading, business } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) return <LoadingState label="Checking your session…" />;

  if (!business) return <BusinessOnboarding />;

  return (
    <DashboardShell
      items={items}
      brand="WhatsApp AI Assistant"
      subtitle={business?.name ?? "No business yet"}
    >
      <Outlet />
    </DashboardShell>
  );
}
