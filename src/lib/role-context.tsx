"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RoleContextValue {
  activeView: string;          // the role the user is currently browsing as
  availableRoles: string[];    // all roles this user has access to
  setActiveView: (r: string) => void;
  loading: boolean;
}

const RoleContext = createContext<RoleContextValue>({
  activeView: "TESTATOR",
  availableRoles: ["TESTATOR"],
  setActiveView: () => {},
  loading: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [activeView, setActiveViewState] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/me/roles")
      .then(r => r.json())
      .then(d => {
        const roles: string[] = d.roles || [(session?.user as any)?.role || "TESTATOR"];
        setAvailableRoles(roles);
        // Restore previously selected view from sessionStorage
        const saved = typeof window !== "undefined"
          ? sessionStorage.getItem("activeView")
          : null;
        const initial = saved && roles.includes(saved) ? saved : roles[0];
        setActiveViewState(initial);
        setLoading(false);
      })
      .catch(() => {
        const fallback = (session?.user as any)?.role || "TESTATOR";
        setAvailableRoles([fallback]);
        setActiveViewState(fallback);
        setLoading(false);
      });
  }, [status]);

  function setActiveView(role: string) {
    setActiveViewState(role);
    sessionStorage.setItem("activeView", role);
  }

  return (
    <RoleContext.Provider value={{ activeView, availableRoles, setActiveView, loading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  return useContext(RoleContext);
}

export const ROLE_LABELS: Record<string, string> = {
  TESTATOR:    "Erflater",
  NOTARY:      "Notaris",
  BENEFICIARY: "Erfgenaam",
};
