"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/vault/status-badge";
import { formatDate, VAULT_STATUS_LABELS } from "@/lib/utils";
import { Shield, Edit2, Check, X, Save, Scale } from "lucide-react";
import Link from "next/link";

export default function VaultPage() {
  const [vault, setVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", testamentRef: "" });

  useEffect(() => {
    fetch("/api/vaults/my").then(r => r.json()).then(d => {
      setVault(d.vault);
      if (d.vault) setForm({ title: d.vault.title, description: d.vault.description || "", testamentRef: d.vault.testamentRef || "" });
      setLoading(false);
    });
  }, []);

  async function createVault() {
    setSaving(true);
    const res = await fetch("/api/vaults", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setVault(data.vault);
    setSaving(false);
  }

  async function updateVault() {
    setSaving(true);
    const res = await fetch("/api/vaults/my", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setVault(data.vault);
    setEditing(false);
    setSaving(false);
  }

  async function activateVault() {
    setSaving(true);
    const res = await fetch("/api/vaults/my/activate", { method: "POST" });
    const data = await res.json();
    setVault(data.vault);
    setSaving(false);
  }

  if (loading) return (
    <div className="flex-1 flex flex-col">
      <Header title="Mijn Kluis" />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-ink-200 border-t-ink-700" />
      </div>
    </div>
  );

  if (!vault) return (
    <div className="flex-1 flex flex-col">
      <Header title="Mijn Kluis" subtitle="Maak uw digitale nalatenschapskluis aan" />
      <div className="flex-1 p-8">
        <div className="max-w-lg">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Uw digitale kluis aanmaken</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Een digitale nalatenschapskluis bevat al uw digitale bezittingen en instructies.
                De kluis wordt alleen vrijgegeven na verificatie en notariële goedkeuring.
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="space-y-4 pt-5">
              <Input label="Naam van de kluis" placeholder="Bijv. Digitale nalatenschap Jan van der Berg" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <Textarea label="Omschrijving (optioneel)" placeholder="Aanvullende beschrijving of instructies voor de notaris..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <Input label="Testament referentie (optioneel)" placeholder="Bijv. akte nr. 2024-001, notaris De Vries Amsterdam" value={form.testamentRef} onChange={e => setForm({...form, testamentRef: e.target.value})} hint="Refereer aan uw bestaand testament voor juridische koppeling." />
            </CardContent>
            <CardFooter>
              <Button onClick={createVault} loading={saving} size="lg">Kluis aanmaken</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Mijn Kluis"
        subtitle={vault.title}
        actions={
          <div className="flex gap-2">
            {vault.status === "DRAFT" && !vault.notaryEmail && (
              <Link href="/notary" className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5" /> Notaris koppelen →
              </Link>
            )}
            {vault.status === "DRAFT" && vault.notaryEmail && (
              <Button size="sm" onClick={activateVault} loading={saving}>Kluis activeren</Button>
            )}
          </div>
        }
      />
      <div className="flex-1 p-8 space-y-6 animate-fade-in">
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main vault info */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-ink-900 text-sm">Kluisgegevens</h2>
                  <button onClick={() => setEditing(!editing)} className="text-xs text-ink-500 hover:text-ink-700 flex items-center gap-1 transition-colors">
                    {editing ? <X className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5" />}
                    {editing ? "Annuleren" : "Bewerken"}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <Input label="Naam" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    <Textarea label="Omschrijving" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <Input label="Testament referentie" value={form.testamentRef} onChange={e => setForm({...form, testamentRef: e.target.value})} />
                    <Button onClick={updateVault} loading={saving} size="sm"><Save className="h-3.5 w-3.5" /> Opslaan</Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-ink-500 mb-0.5">Naam van de kluis</p>
                      <p className="text-sm text-ink-900 font-medium">{vault.title}</p>
                    </div>
                    {vault.description && (
                      <div>
                        <p className="text-xs text-ink-500 mb-0.5">Omschrijving</p>
                        <p className="text-sm text-ink-700 leading-relaxed">{vault.description}</p>
                      </div>
                    )}
                    {vault.testamentRef && (
                      <div>
                        <p className="text-xs text-ink-500 mb-0.5">Testament referentie</p>
                        <p className="text-sm text-ink-700">{vault.testamentRef}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status timeline */}
            <Card>
              <CardHeader><h2 className="font-semibold text-ink-900 text-sm">Statusverloop</h2></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(VAULT_STATUS_LABELS).map(([key, label], i) => {
                    const statuses = ["DRAFT","ACTIVE","DEATH_REPORTED","UNDER_REVIEW","APPROVED","RELEASED","CLOSED"];
                    const currentIdx = statuses.indexOf(vault.status);
                    const thisIdx = statuses.indexOf(key);
                    const isPast = thisIdx < currentIdx;
                    const isCurrent = key === vault.status;
                    return (
                      <div key={key} className={`flex items-center gap-3 ${isPast || isCurrent ? "opacity-100" : "opacity-30"}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrent ? "bg-amber-500 text-white" : isPast ? "bg-ink-900 text-white" : "bg-ink-100"}`}>
                          {isPast ? <Check className="h-2.5 w-2.5" /> : <span className="text-[10px] font-bold">{i+1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${isCurrent ? "text-ink-900" : "text-ink-600"}`}>{label}</p>
                        </div>
                        {isCurrent && <StatusBadge status={key} />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3 py-4">
                <div>
                  <p className="text-xs text-ink-500 mb-0.5">Huidige status</p>
                  <StatusBadge status={vault.status} />
                </div>
                <div>
                  <p className="text-xs text-ink-500 mb-0.5">Aangemaakt op</p>
                  <p className="text-sm text-ink-700">{formatDate(vault.createdAt)}</p>
                </div>
                {vault.activatedAt && (
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">Geactiveerd op</p>
                    <p className="text-sm text-ink-700">{formatDate(vault.activatedAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-ink-500 mb-0.5">Notaris</p>
                  <p className="text-sm text-ink-700">{vault.notaryEmail || "Nog niet gekoppeld"}</p>
                </div>
              </CardContent>
            </Card>

            <div className="legal-banner rounded-xl p-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold block mb-1">Juridische opmerking</span>
                Dit dossier vervangt uw testament niet. Vrijgave vindt uitsluitend plaats na notariële goedkeuring en verificatie van het overlijden via een verklaring van erfrecht.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
