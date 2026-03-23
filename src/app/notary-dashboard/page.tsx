"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/vault/status-badge";
import { formatDate } from "@/lib/utils";
import {
  Scale, FileText, Clock, CheckCircle, AlertTriangle,
  Search, X, UserPlus, ShieldAlert, ShieldCheck
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Alle statussen" },
  { value: "DRAFT", label: "Concept" },
  { value: "ACTIVE", label: "Actief" },
  { value: "DEATH_REPORTED", label: "Overlijden gemeld" },
  { value: "UNDER_REVIEW", label: "In behandeling" },
  { value: "APPROVED", label: "Goedgekeurd" },
  { value: "RELEASED", label: "Vrijgegeven" },
  { value: "CLOSED", label: "Gesloten" },
];

export default function NotaryDashboardPage() {
  const [vaults, setVaults] = useState<any[]>([]);
  const [pendingCouplings, setPendingCouplings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deciding, setDeciding] = useState<string | null>(null);

  const load = () => {
    fetch("/api/notary/dashboard")
      .then(r => r.json())
      .then(d => {
        setVaults(d.vaults || []);
        setPendingCouplings(d.pendingCouplings || []);
        setEmail(d.email || "");
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  async function decide(vaultId: string, decision: "ACCEPTED" | "REJECTED") {
    setDeciding(vaultId + decision);
    await fetch("/api/notary/coupling-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vaultId, decision }),
    });
    setDeciding(null);
    load();
  }

  const filtered = vaults.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || (
      (v.owner?.name || "").toLowerCase().includes(q) ||
      (v.owner?.email || "").toLowerCase().includes(q) ||
      v.title.toLowerCase().includes(q) ||
      (v.testamentRef || "").toLowerCase().includes(q) ||
      (v.notaryTestamentRef || "").toLowerCase().includes(q)
    );
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:          vaults.length,
    active:         vaults.filter(v => v.status === "ACTIVE").length,
    pendingReview:  vaults.filter(v => ["DEATH_REPORTED", "UNDER_REVIEW"].includes(v.status)).length,
    openRequests:   vaults.reduce((s: number, v: any) => s + (v.releaseRequests?.length ?? 0), 0),
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Notaris Dashboard" subtitle={`Ingelogd als notaris — ${email}`} />
      <div className="flex-1 p-8 space-y-6 animate-fade-in">

        {/* ── Pending coupling requests ───────────────────────────────────── */}
        {pendingCouplings.length > 0 && (
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-600" />
                <h2 className="font-semibold text-amber-900 text-sm">
                  Openstaande koppelverzoeken ({pendingCouplings.length})
                </h2>
              </div>
            </CardHeader>
            <div className="divide-y divide-amber-100">
              {pendingCouplings.map(v => (
                <div key={v.id} className="px-6 py-4 flex items-center gap-4 bg-amber-50/40">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-semibold flex-shrink-0">
                    {(v.owner?.name || v.owner?.email || "?")[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900">
                      {v.owner?.name || v.owner?.email}
                    </p>
                    <p className="text-xs text-ink-500">{v.owner?.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ink-400">
                      <span>{v._count?.assets ?? 0} bezittingen geregistreerd</span>
                      {v.testamentRef && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[200px]" title={v.testamentRef}>
                            {v.testamentRef}
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>Aangevraagd {formatDate(v.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      loading={deciding === v.id + "ACCEPTED"}
                      onClick={() => decide(v.id, "ACCEPTED")}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Accepteren
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={deciding === v.id + "REJECTED"}
                      onClick={() => decide(v.id, "REJECTED")}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Weigeren
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-amber-50 rounded-b-xl border-t border-amber-100">
              <p className="text-xs text-amber-700">
                Als u een verzoek weigert, wordt de koppeling verwijderd en ontvangt de erflater geen melding (MVP).
                In productie zou hier een notificatie-e-mail worden verzonden.
              </p>
            </div>
          </Card>
        )}

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Geaccepteerde dossiers", value: stats.total,         icon: FileText,      color: "text-ink-600" },
            { label: "Actieve dossiers",        value: stats.active,        icon: CheckCircle,   color: "text-emerald-600" },
            { label: "In behandeling",          value: stats.pendingReview, icon: Clock,         color: "text-amber-600" },
            { label: "Open verzoeken",          value: stats.openRequests,  icon: AlertTriangle, color: "text-red-600" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-ink-500">{stat.label}</p>
                  <p className="text-lg font-bold text-ink-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Search + filter ─────────────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Zoek op naam, e-mail, testament of annotatie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-ink-200 text-sm bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-ink-200 text-sm bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238e8b79' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); }}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 border border-amber-200 bg-amber-50 px-3 py-2 rounded-lg transition-colors"
            >
              <X className="h-3 w-3" /> Filters wissen
            </button>
          )}

          <p className="text-xs text-ink-400 ml-auto">
            {filtered.length} van {vaults.length} dossier{vaults.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Vault list ─────────────────────────────────────────────────── */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-ink-200 border-t-ink-700" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="h-8 w-8 text-ink-200 mx-auto mb-3" />
              {vaults.length === 0 ? (
                <>
                  <p className="text-sm text-ink-500">Geen geaccepteerde dossiers</p>
                  <p className="text-xs text-ink-400 mt-1">
                    Cliënten kunnen u als notaris selecteren — u ontvangt dan een koppelverzoek hierboven
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-ink-500">Geen dossiers gevonden voor uw zoekopdracht</p>
                  <button onClick={() => { setSearch(""); setStatusFilter(""); }} className="text-xs text-amber-600 hover:text-amber-700 mt-2 underline underline-offset-2">
                    Alle dossiers tonen
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-ink-50">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-2.5 bg-ink-50/80 rounded-t-xl">
                <p className="col-span-4 text-xs font-semibold text-ink-500 uppercase tracking-wide">Cliënt</p>
                <p className="col-span-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Testament ref.</p>
                <p className="col-span-2 text-xs font-semibold text-ink-500 uppercase tracking-wide">Bezittingen</p>
                <p className="col-span-2 text-xs font-semibold text-ink-500 uppercase tracking-wide">Status</p>
                <p className="col-span-1 text-xs font-semibold text-ink-500 uppercase tracking-wide">Datum</p>
              </div>

              {filtered.map(vault => (
                <Link key={vault.id} href={`/cases/${vault.id}`}>
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-ink-50/50 transition-colors items-center group">
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-ink-600 text-sm font-medium flex-shrink-0 group-hover:bg-ink-200 transition-colors">
                        {(vault.owner?.name || vault.owner?.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">
                          {vault.owner?.name || vault.owner?.email}
                          {vault.releaseRequests?.length > 0 && (
                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                              {vault.releaseRequests.length} verzoek
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink-400 truncate">{vault.owner?.email}</p>
                      </div>
                    </div>

                    <div className="col-span-3 min-w-0 space-y-0.5">
                      {vault.testamentRef ? (
                        <p className="text-xs text-ink-600 truncate" title={vault.testamentRef}>{vault.testamentRef}</p>
                      ) : (
                        <p className="text-xs text-ink-300 italic">Geen referentie</p>
                      )}
                      {vault.notaryTestamentRef && (
                        <p className="text-xs text-amber-700 truncate flex items-center gap-1" title={vault.notaryTestamentRef}>
                          <span className="text-[9px] font-bold uppercase tracking-wide text-amber-500">Not.</span>
                          {vault.notaryTestamentRef}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm text-ink-700">
                        {vault._count?.assets ?? 0}
                        <span className="text-xs text-ink-400 ml-1">bezittingen</span>
                      </p>
                    </div>

                    <div className="col-span-2">
                      <StatusBadge status={vault.status} />
                    </div>

                    <div className="col-span-1">
                      <p className="text-xs text-ink-400 whitespace-nowrap">{formatDate(vault.updatedAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
