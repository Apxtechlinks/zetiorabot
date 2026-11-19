import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole, BusinessStatus } from "@/lib/domain";

export interface ActiveBusiness {
  id: string;
  name: string;
  status: BusinessStatus;
  role: "OWNER" | "MEMBER";
}

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isSuperAdmin: boolean;
  business: ActiveBusiness | null;
  fullName: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [business, setBusiness] = useState<ActiveBusiness | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const [rolesRes, membershipRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("business_members")
        .select("role, businesses(id, name, status)")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1),
      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    ]);

    setRoles((rolesRes.data ?? []).map((r) => r.role as AppRole));
    setFullName(profileRes.data?.full_name ?? null);

    const membership = membershipRes.data?.[0];
    const biz = membership?.businesses as
      | { id: string; name: string; status: BusinessStatus }
      | null
      | undefined;
    setBusiness(
      biz
        ? {
            id: biz.id,
            name: biz.name,
            status: biz.status,
            role: (membership?.role ?? "MEMBER") as "OWNER" | "MEMBER",
          }
        : null,
    );
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession?.user) {
        setRoles([]);
        setBusiness(null);
        setFullName(null);
        setLoading(false);
        return;
      }
      // Avoid calling other Supabase APIs inside the callback.
      setTimeout(() => {
        void loadProfile(nextSession.user.id).finally(() => setLoading(false));
      }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        void loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) await loadProfile(data.session.user.id);
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    setSession(null);
    setRoles([]);
    setBusiness(null);
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      roles,
      isSuperAdmin: roles.includes("SUPER_ADMIN"),
      business,
      fullName,
      refresh,
      signOut,
    }),
    [session, loading, roles, business, fullName, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
