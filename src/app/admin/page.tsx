"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AdminStatus = {
  users: number;
  vaults: number;
  assets: number;
  pendingReleaseRequests: number;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  assistantEnabled: boolean;
  timestamp: string;
};

type AdminSettings = {
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  assistantEnabled: boolean;
};

export default function AdminPage() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [statusRes, settingsRes] = await Promise.all([
        fetch("/api/admin/status"),
        fetch("/api/admin/settings"),
      ]);

      const statusJson = await statusRes.json();
      const settingsJson = await settingsRes.json();

      if (!statusRes.ok) throw new Error(statusJson.error || "Kon status niet laden.");
      if (!settingsRes.ok) throw new Error(settingsJson.error || "Kon instellingen niet laden.");

      setStatus(statusJson.status);
      setSettings(settingsJson.settings);
    } catch (err: any) {
      setError(err?.message || "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveSettings() {
    if (!settings) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kon instellingen niet opslaan.");

      setSettings(data.settings);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Beheercentrum"
        subtitle="Beheer applicatiestatus en globale instellingen"
      />

      <div className="flex-1 p-8 space-y-6">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-ink-500">Laden...</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Gebruikers" value={status?.users ?? 0} />
              <StatCard label="Dossiers" value={status?.vaults ?? 0} />
              <StatCard label="Bezittingen" value={status?.assets ?? 0} />
              <StatCard label="Open vrijgaven" value={status?.pendingReleaseRequests ?? 0} />
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-ink-900">Globale instellingen</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <ToggleRow
                  label="Onderhoudsmodus"
                  description="Blokkeer tijdelijk kritieke gebruikersacties tijdens onderhoud."
                  checked={settings?.maintenanceMode || false}
                  onChange={(checked) => setSettings((prev) => prev ? ({ ...prev, maintenanceMode: checked }) : prev)}
                />
                <ToggleRow
                  label="Nieuwe registraties"
                  description="Sta nieuwe account-registraties toe of blokkeer ze platformbreed."
                  checked={settings?.allowRegistrations || false}
                  onChange={(checked) => setSettings((prev) => prev ? ({ ...prev, allowRegistrations: checked }) : prev)}
                />
                <ToggleRow
                  label="AI assistent"
                  description="Zet de AI-assistent feature platformbreed aan of uit."
                  checked={settings?.assistantEnabled || false}
                  onChange={(checked) => setSettings((prev) => prev ? ({ ...prev, assistantEnabled: checked }) : prev)}
                />

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-xs text-ink-500">
                    Laatste statusmeting: {status?.timestamp ? new Date(status.timestamp).toLocaleString("nl-NL") : "-"}
                  </p>
                  <Button onClick={saveSettings} disabled={saving}>
                    {saving ? "Opslaan..." : "Instellingen opslaan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs text-ink-500 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-ink-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border border-ink-100 rounded-lg p-4">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-xs text-ink-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full relative transition-colors ${checked ? "bg-emerald-500" : "bg-ink-300"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}
