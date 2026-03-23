import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/vault/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, ASSET_TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import { Plus, ArrowRight, Shield, FileText, Users, Scale, AlertTriangle } from "lucide-react";
import { BeneficiaryNotice } from "./beneficiary-notice";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const vault = await prisma.legacyVault.findUnique({
    where: { ownerId: userId },
    include: {
      assets: true,
      beneficiaries: true,
      releaseRequests: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  const recentLogs = await prisma.auditLog.findMany({
    where: vault ? { vaultId: vault.id } : { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const assetsByType = vault?.assets.reduce((acc: Record<string, number>, a) => {
    acc[a.assetType] = (acc[a.assetType] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Overzicht"
        subtitle={`Welkom terug, ${session?.user?.name || session?.user?.email}`}
        actions={
          !vault ? (
            <Link href="/vault" className="inline-flex items-center gap-1.5 bg-ink-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-ink-800 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Kluis aanmaken
            </Link>
          ) : null
        }
      />

      <div className="flex-1 p-8 space-y-6 animate-fade-in">
        {vault && vault.status === "DRAFT" && (
          <div className="bg-white border border-ink-100 rounded-xl p-5 shadow-card">
            <h3 className="font-semibold text-ink-900 text-sm mb-4">Volgende stappen om uw kluis te activeren</h3>
            <div className="space-y-3">
              {[
                {
                  done: true,
                  label: "Kluis aangemaakt",
                  href: "/vault",
                  linkLabel: "Bekijken",
                },
                {
                  done: (vault.assets?.length ?? 0) > 0,
                  label: "Digitale bezittingen toevoegen",
                  href: "/assets",
                  linkLabel: "Bezittingen beheren",
                },
                {
                  done: vault.notaryAccepted === "ACCEPTED",
                  label: vault.notaryAccepted === "PENDING"
                    ? "Notaris koppelen — wacht op acceptatie"
                    : "Notaris koppelen",
                  href: "/notary",
                  linkLabel: vault.notaryAccepted === "PENDING" ? "Status bekijken" : "Notaris koppelen →",
                  highlight: !vault.notaryEmail,
                },
                {
                  done: false,
                  label: "Kluis activeren",
                  href: "/vault",
                  linkLabel: "Naar kluis",
                  disabled: vault.notaryAccepted !== "ACCEPTED",
                },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${step.highlight ? "bg-amber-50 border border-amber-200" : "bg-ink-50"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${step.done ? "bg-emerald-500 text-white" : step.highlight ? "bg-amber-400 text-white" : "bg-ink-200 text-ink-500"}`}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  <p className={`flex-1 text-sm ${step.done ? "line-through text-ink-400" : "text-ink-800"} ${step.highlight ? "font-semibold" : ""}`}>
                    {step.label}
                  </p>
                  {!step.done && !step.disabled && (
                    <Link href={step.href} className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${step.highlight ? "bg-amber-600 text-white hover:bg-amber-700" : "border border-ink-300 text-ink-600 hover:bg-ink-100"}`}>
                      {step.linkLabel}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!vault && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1 text-sm">Maak uw digitale nalatenschapskluis aan</h3>
              <p className="text-sm text-amber-800 mb-3 leading-relaxed">
                U heeft nog geen digitale kluis aangemaakt. Klik hieronder om te beginnen met het vastleggen van uw digitale bezittingen.
              </p>
              <Link href="/vault" className="inline-flex items-center gap-1.5 bg-amber-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Kluis aanmaken
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Bezittingen", value: vault?.assets.length ?? 0, icon: FileText, href: "/assets" },
            { label: "Erfgenamen", value: vault?.beneficiaries.length ?? 0, icon: Users, href: "/beneficiaries" },
            { label: "Notaris", value: vault?.notaryEmail ? "Gekoppeld" : "Niet gekoppeld", icon: Scale, href: "/notary" },
            { label: "Status", value: vault ? <StatusBadge status={vault.status} /> : "—", icon: Shield, href: "/vault" },
          ].map((stat, i) => (
            <Link key={i} href={stat.href}>
              <Card hover className="stagger-1 animate-fade-in">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0">
                    <stat.icon className="h-4 w-4 text-ink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">{stat.label}</p>
                    <div className="text-sm font-semibold text-ink-900">{stat.value}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Asset types breakdown */}
          {vault && vault.assets.length > 0 && (
            <Card className="stagger-2 animate-fade-in">
              <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                <h2 className="font-semibold text-ink-900 text-sm">Bezittingen per categorie</h2>
                <Link href="/assets" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  Alles bekijken <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <CardContent className="py-3">
                {Object.entries(assetsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                    <span className="text-sm text-ink-700">{ASSET_TYPE_LABELS[type] || type}</span>
                    <span className="text-xs font-medium bg-ink-100 text-ink-600 px-2 py-0.5 rounded-full">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent activity */}
          <Card className="stagger-3 animate-fade-in">
            <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
              <h2 className="font-semibold text-ink-900 text-sm">Recente activiteit</h2>
              <Link href="/audit" className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                Volledig log <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardContent className="py-2">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-ink-400 py-3 text-center">Geen recente activiteit</p>
              ) : (
                <div className="space-y-0">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-ink-50 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink-800">{log.action.replace(/_/g, " ")}</p>
                        {log.details && <p className="text-xs text-ink-500 truncate mt-0.5">{log.details}</p>}
                      </div>
                      <p className="text-[10px] text-ink-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Legal reminder */}
        <div className="legal-banner rounded-xl p-4 flex gap-3">
          <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Herinnering: </span>
            Dit digitaal nalatenschapsdossier is een aanvulling op uw testament en vervangt dit niet. Informatie wordt
            pas vrijgegeven na verificatie van het overlijden en formele goedkeuring door uw aangestelde notaris.
          </p>
        </div>

        <BeneficiaryNotice />
      </div>
    </div>
  );
}

