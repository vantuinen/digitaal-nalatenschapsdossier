"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/vault/status-badge";
import { AssetTypeIcon } from "@/components/vault/asset-type-icon";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, ASSET_TYPE_LABELS, RECOMMENDED_ACTION_LABELS } from "@/lib/utils";
import { Lock, CheckCircle, XCircle, AlertTriangle, FileText, Users, ClipboardList, Edit2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vault, setVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = () => {
    if (!id) return;
    fetch(`/api/vaults/${id}/notary`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        setVault(d.vault ?? null);
        setLoading(false);
      })
      .catch(() => {
        setVault(null);
        setLoading(false);
      });
  };

  useEffect(() => { if (id) load(); }, [id]);

  async function updateStatus(newStatus: string) {
    setProcessing(true);
    await fetch(`/api/vaults/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, notes }),
    });
    setAction("");
    setNotes("");
    setProcessing(false);
    load();
  }

  if (loading) return (
    <div className="flex-1 flex flex-col">
      <Header title="Dossier" />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-ink-200 border-t-ink-700" />
      </div>
    </div>
  );

  if (!vault) return (
    <div className="flex-1 flex flex-col">
      <Header title="Dossier niet gevonden" />
      <div className="flex-1 p-8"><p className="text-ink-500 text-sm">Dit dossier bestaat niet of u heeft geen toegang.</p></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={vault.owner?.name || vault.owner?.email || "Dossier"}
        subtitle={vault.title}
        actions={<StatusBadge status={vault.status} />}
      />
      <div className="flex-1 p-8 space-y-6 animate-fade-in">
        {/* Actions panel */}
        {["ACTIVE", "DEATH_REPORTED", "UNDER_REVIEW"].includes(vault.status) && (
          <Card className="border-amber-200">
            <CardHeader>
              <h2 className="font-semibold text-ink-900 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Notariële acties
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {vault.status === "ACTIVE" && (
                  <Button size="sm" variant="danger" onClick={() => setAction("death")}>
                    🕊️ Overlijden bevestigen
                  </Button>
                )}
                {vault.status === "DEATH_REPORTED" && (
                  <Button size="sm" onClick={() => setAction("review")}>
                    📋 In behandeling nemen
                  </Button>
                )}
                {vault.status === "UNDER_REVIEW" && (
                  <>
                    <Button size="sm" onClick={() => setAction("approve")}>
                      <CheckCircle className="h-3.5 w-3.5" /> Vrijgave goedkeuren
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAction("reject")}>
                      <XCircle className="h-3.5 w-3.5" /> Afwijzen
                    </Button>
                  </>
                )}
                {vault.status === "APPROVED" && (
                  <Button size="sm" onClick={() => setAction("release")}>
                    Vrijgeven aan erfgenamen
                  </Button>
                )}
              </div>
              {action && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3 animate-fade-in">
                  <p className="text-sm font-semibold text-amber-900">
                    {action === "death" && "⚠️ Bevestig overlijden — deze actie kan niet ongedaan worden gemaakt"}
                    {action === "review" && "Dossier in behandeling nemen"}
                    {action === "approve" && "Vrijgave goedkeuren"}
                    {action === "reject" && "Vrijgave afwijzen"}
                    {action === "release" && "Vrijgeven aan erfgenamen"}
                  </p>
                  <Textarea
                    placeholder="Notariële aantekening (optioneel maar aanbevolen)..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="min-h-[70px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" loading={processing} onClick={() => {
                      const statusMap: Record<string, string> = {
                        death: "DEATH_REPORTED", review: "UNDER_REVIEW",
                        approve: "APPROVED", reject: "ACTIVE", release: "RELEASED"
                      };
                      updateStatus(statusMap[action]);
                    }}>Bevestigen</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAction("")}>Annuleren</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Vault info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Testament references */}
            <TestamentRefPanel vaultId={id} vault={vault} onSaved={load} />

            {/* Assets */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-ink-900 text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-ink-500" /> Digitale bezittingen ({vault.assets?.length || 0})
                </h2>
              </CardHeader>
              <div className="divide-y divide-ink-50">
                {vault.assets?.length === 0 ? (
                  <p className="text-sm text-ink-400 px-5 py-4">Geen bezittingen geregistreerd</p>
                ) : (
                  vault.assets?.map((asset: any) => (
                    <div key={asset.id} className="flex items-start gap-3 px-5 py-3">
                      <AssetTypeIcon type={asset.assetType} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-ink-900">{asset.name}</p>
                          <Badge variant="default">{RECOMMENDED_ACTION_LABELS[asset.recommendedAction]}</Badge>
                        </div>
                        <p className="text-xs text-ink-500">{ASSET_TYPE_LABELS[asset.assetType]}{asset.platform ? ` · ${asset.platform}` : ""}</p>
                        {asset.instructions && <p className="text-xs text-ink-600 mt-1 leading-relaxed">{asset.instructions}</p>}
                        {asset.sensitiveNotes && vault.status === "RELEASED" && (
                          <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded p-2 flex gap-2">
                            <Lock className="h-3 w-3 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-mono text-amber-900">{asset.sensitiveNotes}</p>
                          </div>
                        )}
                      </div>
                      {asset.beneficiary && (
                        <span className="text-xs text-ink-400 flex-shrink-0">{asset.beneficiary.name}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Beneficiaries */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-ink-900 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-ink-500" /> Erfgenamen ({vault.beneficiaries?.length || 0})
                </h2>
              </CardHeader>
              <div className="divide-y divide-ink-50">
                {vault.beneficiaries?.map((b: any) => (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-7 h-7 rounded-full bg-ink-100 flex items-center justify-center text-ink-600 text-xs font-medium flex-shrink-0">
                      {b.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{b.name}</p>
                      <p className="text-xs text-ink-500">{b.email}{b.relation ? ` · ${b.relation}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3 py-4">
                <div>
                  <p className="text-xs text-ink-500 mb-0.5">Status</p>
                  <StatusBadge status={vault.status} />
                </div>
                <div>
                  <p className="text-xs text-ink-500 mb-0.5">Eigenaar</p>
                  <p className="text-sm text-ink-700">{vault.owner?.name || vault.owner?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 mb-0.5">Aangemaakt</p>
                  <p className="text-sm text-ink-700">{formatDate(vault.createdAt)}</p>
                </div>
                {vault.activatedAt && (
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">Geactiveerd</p>
                    <p className="text-sm text-ink-700">{formatDate(vault.activatedAt)}</p>
                  </div>
                )}
                {vault.deathReportedAt && (
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">Overlijden gemeld</p>
                    <p className="text-sm text-red-700 font-medium">{formatDate(vault.deathReportedAt)}</p>
                  </div>
                )}
                {vault.testamentRef && (
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">Testament ref.</p>
                    <p className="text-sm text-ink-700">{vault.testamentRef}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit log preview */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-ink-900 text-xs flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" /> Recente activiteiten
                </h3>
              </CardHeader>
              <div className="divide-y divide-ink-50 max-h-64 overflow-y-auto">
                {vault.auditLogs?.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="px-4 py-2.5">
                    <p className="text-xs font-medium text-ink-800">{log.action.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-ink-400">{formatDateTime(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Testament Reference Panel ─────────────────────────────────────────────────
function TestamentRefPanel({
  vaultId,
  vault,
  onSaved,
}: {
  vaultId: string;
  vault: any;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(vault.notaryTestamentRef || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/vaults/${vaultId}/annotate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notaryTestamentRef: value }),
    });
    setSaving(false);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSaved();
  }

  const hasTestatorRef  = !!vault.testamentRef;
  const hasNotaryRef    = !!vault.notaryTestamentRef;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-ink-500" /> Testamentreferenties
          </h2>
          {!editing && (
            <button
              onClick={() => { setEditing(true); setValue(vault.notaryTestamentRef || ""); }}
              className="text-xs text-ink-500 hover:text-ink-700 flex items-center gap-1 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {hasNotaryRef ? "Annotatie wijzigen" : "Annotatie toevoegen"}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 py-4">

        {/* Testator's original reference — read-only */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              Ingevoerd door erflater
            </span>
            <span className="text-[10px] text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">
              Alleen-lezen
            </span>
          </div>
          <p className={`text-sm ${hasTestatorRef ? "text-ink-800" : "text-ink-400 italic"}`}>
            {vault.testamentRef || "Geen referentie opgegeven door erflater"}
          </p>
        </div>

        <div className="border-t border-ink-100" />

        {/* Notary annotation — editable */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
              Notariële annotatie
            </span>
            <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              Alleen bewerkbaar door notaris
            </span>
          </div>

          {editing ? (
            <div className="space-y-2">
              <Input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Bijv. Akte nr. 2022-0042, d.d. 3 januari 2022, Mr. A. de Vries"
                autoFocus
              />
              <p className="text-xs text-ink-400">
                De originele referentie van de erflater blijft altijd bewaard.
                Elke wijziging wordt geregistreerd in de auditlog.
              </p>
              <div className="flex gap-2">
                <Button size="sm" loading={saving} onClick={save}>
                  <Save className="h-3.5 w-3.5" /> Opslaan
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  <X className="h-3.5 w-3.5" /> Annuleren
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <p className={`text-sm flex-1 ${hasNotaryRef ? "text-ink-800" : "text-ink-400 italic"}`}>
                {vault.notaryTestamentRef || "Nog geen notariële annotatie toegevoegd"}
              </p>
              {saved && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 flex-shrink-0">
                  <CheckCircle className="h-3.5 w-3.5" /> Opgeslagen
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
