"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Vault, FileText, Users, Scale,
  ClipboardList, Settings, LogOut, ChevronDown, ChevronRight
} from "lucide-react";

const testatorNav = [
  { href: "/dashboard",       label: "Overzicht",        icon: LayoutDashboard },
  { href: "/vault",           label: "Mijn Kluis",        icon: Vault },
  { href: "/assets",          label: "Bezittingen",       icon: FileText },
  { href: "/beneficiaries",   label: "Erfgenamen",        icon: Users },
  { href: "/notary",          label: "Notaris",           icon: Scale },
  { href: "/audit",           label: "Activiteitenlog",   icon: ClipboardList },
];

const notaryNav = [
  { href: "/notary-dashboard",   label: "Notaris Overzicht",    icon: LayoutDashboard },
  { href: "/cases",              label: "Dossiers",             icon: Vault },
  { href: "/release-requests",   label: "Vrijgaveverzoeken",    icon: Scale },
  { href: "/audit",              label: "Auditlog",             icon: ClipboardList },
];

const beneficiaryNav = [
  { href: "/beneficiary-dashboard", label: "Mijn Toegang", icon: LayoutDashboard },
];

function NavSection({ title, items, defaultOpen = true }: {
  title?: string;
  items: { href: string; label: string; icon: React.ElementType }[];
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      {title && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
        >
          {title}
          {open
            ? <ChevronDown className="h-3 w-3" />
            : <ChevronRight className="h-3 w-3" />
          }
        </button>
      )}
      {open && (
        <div className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  active ? "text-amber-400" : "text-white/30 group-hover:text-white/50"
                )} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const primaryRole = (session?.user as any)?.role;
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/me/roles")
      .then(r => r.json())
      .then(d => setRoles(d.roles || [primaryRole]));
  }, [session, primaryRole]);

  const isTestator    = roles.includes("TESTATOR");
  const isNotary      = roles.includes("NOTARY");
  const isBeneficiary = roles.includes("BENEFICIARY");
  const isMultiRole   = (isTestator || isNotary) && isBeneficiary;

  const roleLabel =
    isNotary ? "Notaris" :
    isMultiRole ? "Erflater & Erfgenaam" :
    isTestator ? "Erflater" :
    "Erfgenaam";

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-ink-950 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Scale className="h-4 w-4 text-ink-950" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold tracking-wide leading-tight">DIGITAAL</p>
            <p className="text-amber-400 text-xs font-medium leading-tight">NALATENSCHAP</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-sm font-medium flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "G"}
          </div>
          <div className="min-w-0">
            <p className="text-white/80 text-xs font-medium truncate">
              {session?.user?.name || session?.user?.email}
            </p>
            <p className="text-white/40 text-xs">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        {isNotary && (
          <NavSection items={notaryNav} />
        )}

        {isTestator && !isNotary && (
          <NavSection
            title={isMultiRole ? "Mijn Nalatenschap" : undefined}
            items={testatorNav}
          />
        )}

        {isBeneficiary && (
          <NavSection
            title={isMultiRole ? "Als Erfgenaam" : undefined}
            items={beneficiaryNav}
            defaultOpen={true}
          />
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/10 space-y-0.5">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
        >
          <Settings className="h-4 w-4 text-white/30" />
          Instellingen
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
