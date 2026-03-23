"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AssetTypeIcon } from "@/components/vault/asset-type-icon";
import { ASSET_TYPE_LABELS, RECOMMENDED_ACTION_LABELS } from "@/lib/utils";
import { Lock, Shield, ExternalLink, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function BeneficiaryDashboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    fetch("/api/beneficiary/my-access")
      .then((r) => r.json())
      .then((d) => { setEntries(d.entries || []); setLoading(false); });
  };

  useEffect(() => {
    reload();
    window.addEventListener("refresh-beneficiary", reload);
    return () => window.removeEventListener("refresh-beneficiary", reload);
  }, []);

  if (loading) return (
    <div className="flex-1 flex flex-col">
      <Header title="Mijn Toegang als Erfgenaam" />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-ink-200 border-t-ink-700" />
      </div>
    </div>
  );

  const released = entries.filter((e) => e.vault.status === "RELEASED" || e.vault.status === "CLOSED");
  const pending  = entries.filter((e) => e.vault.status !== "RELEASED" && e.vault.status !== "CLOSED");

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Mijn Toegang als Erfgenaam"
        subtitle="Bezittingen die aan u zijn toegewezen"
        actions={
          <button
            onClick={reload}
            className="text-xs text-ink-500 hover:text-ink-700 flex items-center gap-1.5 border border-ink-200 px-3 py-1.5 rounded-lg hover:bg-ink-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Vernieuwen
          </button>
        }
      />
      <div className="flex-1 p-8 space-y-6 animate-fade-in">

        {/* Legal banner */}
        <div className="legal-banner rounded-xl p-4 flex gap-3">
          <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            U heeft als erfgenaam toegang tot dit portaal. Bezittingen zijn uitsluitend zichtbaar
            wanneer de notaris de vrijgave heeft goedgekeurd en het dossier de status{" "}
            <strong>'Vrijgegeven'</strong> heeft. U kunt hieronder een vrijgaveverzoek indienen.
          </p>
        </div>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Lock className="h-8 w-8 text-ink-200 mx-auto mb-3" />
              <p className="text-sm text-ink-500">Geen dossiers aan u toegewezen</p>
              <p className="text-xs text-ink-400 mt-1">
                U ontvangt een melding zodra een dossier aan u wordt gekoppeld
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pending/active vaults — show release request UI */}
            {pending.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-ink-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Dossiers in afwachting
                </h2>
                {pending.map((entry) => (
                  <PendingVaultCard key={entry.id} entry={entry} />
                ))}
              </section>
            )}

            {/* Released vaults — full content */}
            {released.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-ink-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Vrijgegeven dossiers
                </h2>
                {released.map((entry) => (
                  <ReleasedVaultCard key={entry.id} entry={entry} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Pending vault: show status + release request form ─────────────────────────
function PendingVaultCard({ entry }: { entry: any }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const statusLabels: Record<string, string> = {
    DRAFT: "Concept — nog niet actief",
    ACTIVE: "Actief — overlijden nog niet gemeld",
    DEATH_REPORTED: "Overlijden gemeld — wacht op notaris",
    UNDER_REVIEW: "In behandeling bij notaris",
    APPROVED: "Goedgekeurd — wacht op vrijgave",
  };

  const canRequest = ["ACTIVE", "DEATH_REPORTED", "UNDER_REVIEW", "APPROVED"].includes(
    entry.vault.status
  );

  async function submitRequest() {
    setSubmitting(true);
    setResult(null);
    const res = await fetch("/api/release-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vaultId: entry.vault.id, reason }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult({ ok: true, message: "Uw verzoek is ingediend en wordt beoordeeld door de notaris." });
      setShowForm(false);
      setReason("");
      // Re-fetch so the request status shows up immediately
      setTimeout(() => {
        fetch("/api/beneficiary/my-access")
          .then((r) => r.json())
          .then((d) => {
            // bubble up to parent — use window event as simple signal
            window.dispatchEvent(new Event("refresh-beneficiary"));
          });
      }, 800);
    } else {
      setResult({ ok: false, message: data.error || "Er is een fout opgetreden." });
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <div className="px-5 py-4 border-b border-ink-100">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-ink-900 text-sm">{entry.vault.title}</p>
            <p className="text-xs text-ink-500">
              Nalatenschap van{" "}
              <span className="font-medium">{entry.vault.owner.name || entry.vault.owner.email}</span>
            </p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
            {statusLabels[entry.vault.status] || entry.vault.status}
          </span>
        </div>
      </div>

      <CardContent className="py-4 space-y-4">
        {/* Assigned assets summary (locked) */}
        {entry.assets.length > 0 && (
          <div>
            <p className="text-xs text-ink-500 mb-2">
              Aan u toegewezen bezittingen ({entry.assets.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {entry.assets.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center gap-1.5 bg-ink-50 border border-ink-100 rounded-lg px-2.5 py-1.5"
                >
                  <Lock className="h-3 w-3 text-ink-300" />
                  <span className="text-xs text-ink-600">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing requests */}
        {entry.releaseRequests?.length > 0 && (
          <div className="space-y-2">
            {entry.releaseRequests.map((req: any) => (
              <div
                key={req.id}
                className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs border ${
                  req.status === "APPROVED"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : req.status === "REJECTED"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                {req.status === "APPROVED" ? (
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                ) : req.status === "REJECTED" ? (
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium">
                    {req.status === "PENDING" && "Verzoek ingediend — wacht op beoordeling notaris"}
                    {req.status === "UNDER_REVIEW" && "Verzoek wordt beoordeeld door notaris"}
                    {req.status === "APPROVED" && "Verzoek goedgekeurd door notaris"}
                    {req.status === "REJECTED" && "Verzoek afgewezen door notaris"}
                  </span>
                  {req.notaryNotes && (
                    <p className="mt-0.5 opacity-80">Notaris: {req.notaryNotes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Result feedback */}
        {result && (
          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs border ${
              result.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {result.ok ? (
              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            )}
            {result.message}
          </div>
        )}

        {/* Request form */}
        {canRequest && !showForm && !result?.ok && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full justify-center gap-2"
          >
            <Send className="h-3.5 w-3.5" />
            Vrijgaveverzoek indienen
          </Button>
        )}

        {showForm && (
          <div className="border border-ink-200 rounded-xl p-4 space-y-3 bg-ink-50 animate-fade-in">
            <p className="text-sm font-semibold text-ink-900">Vrijgaveverzoek indienen</p>
            <p className="text-xs text-ink-600 leading-relaxed">
              Uw verzoek wordt doorgestuurd naar de aangestelde notaris. De notaris beoordeelt
              of het overlijden is geverifieerd en of de nalatenschap kan worden vrijgegeven.
            </p>
            <Textarea
              label="Toelichting (optioneel)"
              placeholder="Bijv. 'Overlijdensakte is beschikbaar. Graag contact opnemen voor verdere afhandeling.'"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white"
            />
            <div className="flex gap-2">
              <Button size="sm" loading={submitting} onClick={submitRequest}>
                <Send className="h-3.5 w-3.5" />
                Verzoek indienen
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowForm(false); setReason(""); }}
              >
                Annuleren
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Released vault: show all assigned assets with full details ─────────────────
function ReleasedVaultCard({ entry }: { entry: any }) {
  return (
    <Card>
      <div className="px-5 py-4 border-b border-ink-100">
        <p className="font-semibold text-ink-900 text-sm">{entry.vault.title}</p>
        <p className="text-xs text-ink-500">
          Nalatenschap van{" "}
          <span className="font-medium">{entry.vault.owner.name || entry.vault.owner.email}</span>
        </p>
      </div>

      {entry.assets.length === 0 ? (
        <CardContent>
          <p className="text-sm text-ink-400">Geen bezittingen aan u toegewezen in dit dossier</p>
        </CardContent>
      ) : (
        <div className="divide-y divide-ink-50">
          {entry.assets.map((asset: any) => (
            <div key={asset.id} className="flex items-start gap-3 px-5 py-4">
              <AssetTypeIcon type={asset.assetType} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-ink-900">{asset.name}</p>
                  <span className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded-full">
                    {RECOMMENDED_ACTION_LABELS[asset.recommendedAction]}
                  </span>
                </div>
                <p className="text-xs text-ink-500 mb-2">
                  {ASSET_TYPE_LABELS[asset.assetType]}
                  {asset.platform ? ` · ${asset.platform}` : ""}
                </p>
                {asset.description && (
                  <p className="text-xs text-ink-600 mb-2">{asset.description}</p>
                )}
                {asset.instructions && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
                    <p className="text-xs font-semibold text-blue-800 mb-1">Instructies</p>
                    <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-wrap">
                      {asset.instructions}
                    </p>
                  </div>
                )}
                {asset.sensitiveNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lock className="h-3 w-3 text-amber-600" />
                      <p className="text-xs font-semibold text-amber-800">Toegangsgegevens</p>
                    </div>
                    <p className="text-xs font-mono text-amber-900 whitespace-pre-wrap">
                      {asset.sensitiveNotes}
                    </p>
                  </div>
                )}
                {asset.accessUrl && (
                  <a
                    href={asset.accessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> {asset.accessUrl}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
