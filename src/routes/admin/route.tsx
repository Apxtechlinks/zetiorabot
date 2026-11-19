import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  FileClock,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";
import { useEffect } from "react";

import { LoadingState } from "@/components/common/states";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const items: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/businesses", label: "Businesses", icon: Building2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/whatsapp", label: "WhatsApp Accounts", icon: MessageCircle },
  { to: "/admin/usage", label: "Usage", icon: BarChart3 },
  { to: "/admin/logs", label: "System Logs", icon: FileClock },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { session, loading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) void navigate({ to: "/auth" });
    else if (!isSuperAdmin) void navigate({ to: "/app" });
  }, [loading, session, isSuperAdmin, navigate]);

  if (loading || !session || !isSuperAdmin) return <LoadingState label="Checking access…" />;

  return (
    <DashboardShell items={items} brand="Platform Admin" subtitle="Owner console">
      <Outlet />
    </DashboardShell>
  );
}
