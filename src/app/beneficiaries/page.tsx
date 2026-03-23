"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Plus, Users, Mail, Trash2, UserCheck } from "lucide-react";

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", relation: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/beneficiaries").then(r => r.json()).then(d => {
      setBeneficiaries(d.beneficiaries || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  async function addBeneficiary(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/beneficiaries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", email: "", relation: "" });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/beneficiaries/${id}`, { method: "DELETE" });
    load();
  }

  const relations = ["Partner", "Kind", "Kleinkind", "Broer/Zus", "Ouder", "Vriend", "Overig"];

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Erfgenamen"
        subtitle={`${beneficiaries.length} erfgenaa${beneficiaries.length !== 1 ? "men" : "m"} toegevoegd`}
        actions={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-3.5 w-3.5" /> Erfgenaam toevoegen
          </Button>
        }
      />
      <div className="flex-1 p-8">
        <div className="max-w-2xl space-y-5">
          {showForm && (
            <Card className="border-amber-200 animate-fade-in">
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold text-ink-900 mb-4">Nieuwe erfgenaam toevoegen</h3>
                <form onSubmit={addBeneficiary} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Naam *" placeholder="Volledige naam" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    <Input label="E-mailadres *" type="email" placeholder="erfgenaam@email.nl" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink-700 block mb-1.5">Relatie</label>
                    <div className="flex flex-wrap gap-2">
                      {relations.map(r => (
                        <button key={r} type="button" onClick={() => setForm({...form, relation: r})}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.relation === r ? "bg-ink-900 text-white border-ink-900" : "border-ink-200 text-ink-600 hover:border-ink-400"}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm" loading={saving}>Toevoegen</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Annuleren</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-ink-200 border-t-ink-700" />
            </div>
          ) : beneficiaries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-ink-100">
              <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-ink-300" />
              </div>
              <p className="text-sm text-ink-500 mb-3">Nog geen erfgenamen toegevoegd</p>
              <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                <Plus className="h-3.5 w-3.5" /> Eerste erfgenaam toevoegen
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {beneficiaries.map(b => (
                <div key={b.id} className="bg-white border border-ink-100 rounded-xl px-5 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-ink-100 flex items-center justify-center text-ink-600 text-sm font-medium flex-shrink-0">
                    {b.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-ink-900">{b.name}</p>
                      {b.relation && <span className="text-xs text-ink-400 bg-ink-50 px-2 py-0.5 rounded-full">{b.relation}</span>}
                    </div>
                    <p className="text-xs text-ink-500 flex items-center gap-1"><Mail className="h-3 w-3" />{b.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {b._count?.assets > 0 && (
                      <span className="text-xs text-ink-500">{b._count.assets} bezitting{b._count.assets !== 1 ? "en" : ""}</span>
                    )}
                    {b.acceptedAt ? (
                      <span className="text-xs text-emerald-600 flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Geaccepteerd</span>
                    ) : (
                      <span className="text-xs text-amber-600">Uitnodiging verzonden</span>
                    )}
                    <button onClick={() => remove(b.id)} className="p-1.5 rounded-lg text-ink-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-ink-50 rounded-xl p-4 text-xs text-ink-500 leading-relaxed">
            <p className="font-medium text-ink-700 mb-1">Over erfgenamen</p>
            <p>Erfgenamen kunnen uitsluitend de bezittingen inzien die aan hen zijn toegewezen en pas nadat de notaris de vrijgave heeft goedgekeurd. Ze ontvangen een uitnodigingsmail om een account aan te maken.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
