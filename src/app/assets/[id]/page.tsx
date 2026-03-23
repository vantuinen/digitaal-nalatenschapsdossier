"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { AssetTypeIcon } from "@/components/vault/asset-type-icon";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABELS, RECOMMENDED_ACTION_LABELS } from "@/lib/utils";
import { Edit2, Trash2, Lock, ExternalLink, Save, X } from "lucide-react";

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [asset, setAsset] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [showSensitive, setShowSensitive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/assets/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        setAsset(d.asset);
        setForm(d.asset);
      })
      .catch(() => setAsset(null));
    fetch("/api/beneficiaries").then(r => r.json()).then(d => setBeneficiaries(d.beneficiaries || []));
  }, [id]);

  function update(k: string, v: string) { setForm((f: any) => ({...f, [k]: v})); }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/assets/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    setAsset(d.asset);
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    router.push("/assets");
  }

  if (!asset) return (
    <div className="flex-1 flex flex-col">
      <Header title="Bezitting" />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-ink-200 border-t-ink-700" />
      </div>
    </div>
  );

  const actionVariants: Record<string, any> = { TRANSFER: "info", CLOSE_ACCOUNT: "danger", ARCHIVE: "default", MEMORIALIZE: "warning", INFORMATION_ONLY: "outline" };
  const assetTypeOptions = Object.entries(ASSET_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const actionOptions = Object.entries(RECOMMENDED_ACTION_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const beneficiaryOptions = [{ value: "", label: "Geen specifieke erfgenaam" }, ...beneficiaries.map(b => ({ value: b.id, label: `${b.name} (${b.email})` }))];

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={asset.name}
        subtitle={ASSET_TYPE_LABELS[asset.assetType]}
        actions={
          <div className="flex gap-2">
            {!editing && <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit2 className="h-3.5 w-3.5" /> Bewerken</Button>}
            {editing && <>
              <Button size="sm" onClick={handleSave} loading={saving}><Save className="h-3.5 w-3.5" /> Opslaan</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}><X className="h-3.5 w-3.5" /></Button>
            </>}
            {!editing && (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        }
      />
      <div className="flex-1 p-8">
        {confirmDelete && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
            <p className="text-sm text-red-800 flex-1">Weet u zeker dat u <strong>{asset.name}</strong> wilt verwijderen?</p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete}>Verwijderen</Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Annuleren</Button>
            </div>
          </div>
        )}
        <div className="max-w-2xl space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AssetTypeIcon type={asset.assetType} size="lg" />
                <div>
                  {editing ? <Input value={form.name} onChange={e => update("name", e.target.value)} className="font-semibold" /> : <h2 className="font-semibold text-ink-900">{asset.name}</h2>}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={actionVariants[asset.recommendedAction]}>{RECOMMENDED_ACTION_LABELS[asset.recommendedAction]}</Badge>
                    {asset.platform && <span className="text-xs text-ink-500">{asset.platform}</span>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Type" value={form.assetType} onChange={e => update("assetType", e.target.value)} options={assetTypeOptions} />
                    <Input label="Platform" value={form.platform || ""} onChange={e => update("platform", e.target.value)} />
                  </div>
                  <Input label="URL" type="url" value={form.accessUrl || ""} onChange={e => update("accessUrl", e.target.value)} />
                  <Textarea label="Omschrijving" value={form.description || ""} onChange={e => update("description", e.target.value)} />
                  <Textarea label="Instructies" value={form.instructions || ""} onChange={e => update("instructions", e.target.value)} className="min-h-[100px]" />
                  <Select label="Aanbevolen actie" value={form.recommendedAction} onChange={e => update("recommendedAction", e.target.value)} options={actionOptions} />
                  <Select label="Erfgenaam" value={form.beneficiaryId || ""} onChange={e => update("beneficiaryId", e.target.value)} options={beneficiaryOptions} />
                </>
              ) : (
                <>
                  {asset.accessUrl && (
                    <div>
                      <p className="text-xs text-ink-500 mb-0.5">URL</p>
                      <a href={asset.accessUrl} target="_blank" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                        {asset.accessUrl} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {asset.description && (
                    <div>
                      <p className="text-xs text-ink-500 mb-0.5">Omschrijving</p>
                      <p className="text-sm text-ink-700 leading-relaxed">{asset.description}</p>
                    </div>
                  )}
                  {asset.instructions && (
                    <div>
                      <p className="text-xs text-ink-500 mb-0.5">Instructies voor erfgenamen</p>
                      <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{asset.instructions}</p>
                    </div>
                  )}
                  {asset.beneficiary && (
                    <div>
                      <p className="text-xs text-ink-500 mb-0.5">Toegewezen erfgenaam</p>
                      <p className="text-sm text-ink-700">{asset.beneficiary.name} — {asset.beneficiary.email}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Sensitive notes */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-ink-900">Gevoelige notities</h3>
                </div>
                {asset.sensitiveNotes && !editing && (
                  <button onClick={() => setShowSensitive(!showSensitive)} className="text-xs text-amber-600 hover:text-amber-700">
                    {showSensitive ? "Verbergen" : "Tonen (demo)"}
                  </button>
                )}
              </div>
              {editing ? (
                <Textarea value={form.sensitiveNotes || ""} onChange={e => update("sensitiveNotes", e.target.value)} placeholder="Gevoelige notities (versleuteld opgeslagen)" hint="In productie end-to-end versleuteld. Alleen zichtbaar na notariële goedkeuring." />
              ) : (
                <div className={`rounded-lg p-3 text-sm ${showSensitive ? "bg-amber-50 border border-amber-200 text-amber-900" : "bg-ink-50 border border-ink-100"}`}>
                  {showSensitive && asset.sensitiveNotes ? (
                    <p className="font-mono text-xs whitespace-pre-wrap">{asset.sensitiveNotes}</p>
                  ) : (
                    <p className="text-ink-400 text-xs italic">{asset.sensitiveNotes ? "Versleuteld — klik 'Tonen' voor demo" : "Geen gevoelige notities opgeslagen"}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
