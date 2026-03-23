"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ASSET_TYPE_LABELS, RECOMMENDED_ACTION_LABELS } from "@/lib/utils";
import { Lock, Shield, AlertTriangle } from "lucide-react";

export default function NewAssetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", assetType: "EMAIL", platform: "", description: "",
    instructions: "", sensitiveNotes: "", recommendedAction: "INFORMATION_ONLY",
    accessUrl: "", beneficiaryId: ""
  });
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/beneficiaries").then(r => r.json()).then(d => setBeneficiaries(d.beneficiaries || []));
  }, []);

  function update(k: string, v: string) { setForm(f => ({...f, [k]: v})); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Naam is verplicht";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const res = await fetch("/api/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) router.push("/assets");
    else { const d = await res.json(); setErrors({ general: d.error }); setSaving(false); }
  }

  const assetTypeOptions = Object.entries(ASSET_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const actionOptions = Object.entries(RECOMMENDED_ACTION_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const beneficiaryOptions = [
    { value: "", label: "Geen specifieke erfgenaam" },
    ...beneficiaries.map(b => ({ value: b.id, label: `${b.name} (${b.relation || b.email})` }))
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Bezitting toevoegen" subtitle="Registreer een nieuwe digitale bezitting" />
      <div className="flex-1 p-8">
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardContent className="space-y-4 pt-5">
                <h3 className="text-sm font-semibold text-ink-900">Basisgegevens</h3>
                <Input label="Naam van de bezitting *" placeholder="Bijv. Gmail-account" value={form.name} onChange={e => update("name", e.target.value)} error={errors.name} />
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Type bezitting" value={form.assetType} onChange={e => update("assetType", e.target.value)} options={assetTypeOptions} />
                  <Input label="Platform / aanbieder" placeholder="Bijv. Google, Binance, Spotify" value={form.platform} onChange={e => update("platform", e.target.value)} />
                </div>
                <Input label="URL / link (optioneel)" type="url" placeholder="https://" value={form.accessUrl} onChange={e => update("accessUrl", e.target.value)} />
                <Textarea label="Omschrijving" placeholder="Beschrijf kort wat deze bezitting inhoudt..." value={form.description} onChange={e => update("description", e.target.value)} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 pt-5">
                <h3 className="text-sm font-semibold text-ink-900">Instructies voor erfgenamen</h3>
                <Textarea
                  label="Instructies"
                  placeholder="Bijv. 'Log in met onderstaand e-mailadres. Neem contact op met Google om het account over te dragen of te verwijderen.'"
                  value={form.instructions}
                  onChange={e => update("instructions", e.target.value)}
                  className="min-h-[100px]"
                />
                <Select label="Aanbevolen actie" value={form.recommendedAction} onChange={e => update("recommendedAction", e.target.value)} options={actionOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-ink-900">Gevoelige notities</h3>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Gevoelige notities (zoals wachtwoorden of pincodes) worden versleuteld opgeslagen en
                    zijn pas zichtbaar na notariële goedkeuring van de vrijgave. Bewaar hier <strong>geen</strong> private keys
                    van cryptowallets in plaintext — gebruik hiervoor een hardwarewallet.
                  </p>
                </div>
                <Textarea
                  placeholder="Optionele gevoelige notities (toegangscodes, herstelcodes, etc.)"
                  value={form.sensitiveNotes}
                  onChange={e => update("sensitiveNotes", e.target.value)}
                  hint="In productie versleuteld opgeslagen. Alleen zichtbaar na notariële goedkeuring."
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold text-ink-900 mb-3">Toewijzing</h3>
                <Select
                  label="Toegewezen erfgenaam (optioneel)"
                  value={form.beneficiaryId}
                  onChange={e => update("beneficiaryId", e.target.value)}
                  options={beneficiaryOptions}
                  hint="Wijs deze bezitting toe aan een specifieke erfgenaam."
                />
              </CardContent>
            </Card>

            {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

            <div className="flex gap-3">
              <Button type="submit" loading={saving} size="lg">Bezitting opslaan</Button>
              <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Annuleren</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
