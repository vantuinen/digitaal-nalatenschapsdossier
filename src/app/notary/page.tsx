"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, CheckCircle, Shield, Building2, MapPin, BadgeCheck, X, Clock } from "lucide-react";

export default function NotaryPage() {
  const [vault, setVault] = useState<any>(null);
  const [notaries, setNotaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/vaults/my").then(r => r.json()),
      fetch("/api/notaries").then(r => r.json()),
    ]).then(([vaultData, notaryData]) => {
      setVault(vaultData.vault);
      setNotaries(notaryData.notaries || []);
      setLoading(false);
    });
  }, []);

  async function assign() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch("/api/vaults/my", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notaryName: selected.notaryProfile?.firmName || selected.name,
        notaryEmail: selected.email,
      }),
    });
    const data = await res.json();
    setVault(data.vault);
    setSaving(false);
    setSaved(true);
    setConfirming(false);
    setTimeout(() => setSaved(false), 4000);
  }

  async function unlink() {
    setSaving(true);
    const res = await fetch("/api/vaults/my", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notaryName: "", notaryEmail: "" }),
    });
    const data = await res.json();
    setVault(data.vault);
    setSelected(null);
    setSaving(false);
  }

  // Find the currently linked notary object from the list
  const linkedNotary = notaries.find(n => n.email === vault?.notaryEmail);

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Notaris koppelen" subtitle="Selecteer een aangesloten notariskantoor" />
      <div className="flex-1 p-8">
        <div className="max-w-xl space-y-5">

          {/* Legal banner */}
          <div className="legal-banner rounded-xl p-5 flex gap-3">
            <Scale className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Notarieel toezicht verplicht</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                De aangestelde notaris is verantwoordelijk voor het vrijgaveproces na overlijden.
                Selecteer een notariskantoor dat is aangesloten bij het Digitaal Nalatenschapsdossier platform.
              </p>
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 animate-fade-in">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Notariskantoor succesvol gekoppeld aan uw dossier.
            </div>
          )}

          {/* Currently linked */}
          {vault?.notaryEmail && !confirming && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-ink-900 text-sm">Gekoppeld notariskantoor</h2>
              </CardHeader>
              <CardContent className="py-4 space-y-3">
                <NotaryCard notary={linkedNotary || { name: vault.notaryName, email: vault.notaryEmail, notaryProfile: null }} selected={false} />

                {/* Acceptance status */}
                {vault.notaryAccepted === "PENDING" && (
                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">Wacht op acceptatie van de notaris</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Het notariskantoor heeft uw koppelverzoek nog niet bevestigd.
                        De kluis kan nog niet worden geactiveerd.
                      </p>
                    </div>
                  </div>
                )}
                {vault.notaryAccepted === "ACCEPTED" && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-emerald-800">Koppeling geaccepteerd door notaris</p>
                  </div>
                )}

                <button
                  onClick={unlink}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <X className="h-3 w-3" /> Ontkoppelen
                </button>
              </CardContent>
            </Card>
          )}

          {/* Notary picker */}
          {!vault?.notaryEmail || confirming ? (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-ink-900 text-sm">
                  {confirming ? "Notariskantoor wijzigen" : "Kies een notariskantoor"}
                </h2>
              </CardHeader>
              <CardContent className="py-2">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-ink-200 border-t-ink-700" />
                  </div>
                ) : notaries.length === 0 ? (
                  <div className="text-center py-10">
                    <Building2 className="h-8 w-8 text-ink-200 mx-auto mb-3" />
                    <p className="text-sm text-ink-500">Geen notariskantoren aangesloten</p>
                    <p className="text-xs text-ink-400 mt-1">
                      Neem contact op met uw notaris om een account aan te laten maken.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-ink-50">
                    {notaries.map(notary => (
                      <button
                        key={notary.id}
                        onClick={() => setSelected(selected?.id === notary.id ? null : notary)}
                        className="w-full text-left py-3 px-1 transition-colors hover:bg-ink-50/50 rounded-lg"
                      >
                        <NotaryCard
                          notary={notary}
                          selected={selected?.id === notary.id}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {selected && (
                  <div className="mt-4 pt-4 border-t border-ink-100 space-y-3">
                    <div className="bg-ink-50 rounded-lg p-3 text-xs text-ink-600">
                      <p className="font-medium text-ink-800 mb-1">Bevestiging vereist</p>
                      <p>
                        U staat op het punt{" "}
                        <strong>{selected.notaryProfile?.firmName || selected.name}</strong> te koppelen
                        als verantwoordelijk notariskantoor voor uw digitaal nalatenschapsdossier.
                        De notaris krijgt toegang tot uw dossier na activering.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={assign} loading={saving}>
                        <CheckCircle className="h-3.5 w-3.5" />
                        {vault?.notaryEmail ? "Wijziging bevestigen" : "Notaris koppelen"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setSelected(null); setConfirming(false); }}>
                        Annuleren
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-ink-500 hover:text-ink-700 underline underline-offset-2 transition-colors"
            >
              Notariskantoor wijzigen
            </button>
          )}

          {/* Role explanation */}
          <Card>
            <CardContent className="py-4">
              <h3 className="text-sm font-semibold text-ink-900 mb-3">Rol van de notaris</h3>
              <div className="space-y-2.5">
                {[
                  "Bevestigt het overlijden via een officiële verklaring van erfrecht",
                  "Beoordeelt vrijgaveverzoeken van erfgenamen",
                  "Keurt de vrijgave van het dossier goed of af",
                  "Houdt toezicht op de overdracht van digitale bezittingen",
                  "Heeft inzage in de volledige auditlog van het dossier",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-amber-700">{i + 1}</span>
                    </div>
                    <p className="text-xs text-ink-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NotaryCard({ notary, selected }: { notary: any; selected: boolean }) {
  const profile = notary.notaryProfile;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
      selected
        ? "border-amber-400 bg-amber-50"
        : "border-transparent"
    }`}>
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        selected ? "bg-amber-100" : "bg-ink-100"
      }`}>
        <Scale className={`h-5 w-5 ${selected ? "text-amber-700" : "text-ink-500"}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-ink-900">
            {profile?.firmName || notary.name}
          </p>
          {profile?.verified && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
              <BadgeCheck className="h-2.5 w-2.5" /> Geverifieerd
            </span>
          )}
        </div>
        <p className="text-xs text-ink-500 mt-0.5">{notary.name}</p>
        {profile?.city && (
          <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {profile.city}
          </p>
        )}
        <p className="text-xs text-ink-400">{notary.email}</p>
      </div>

      {selected && (
        <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-1" />
      )}
    </div>
  );
}
