"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "TESTATOR" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setError("U dient akkoord te gaan met de voorwaarden."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Er is een fout opgetreden.");
      setLoading(false);
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="font-serif text-sm font-semibold text-ink-900">Digitaal Nalatenschapsdossier</span>
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold text-ink-900 mb-1">Account aanmaken</h1>
          <p className="text-sm text-ink-500">Begin met het beheren van uw digitale nalatenschap</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Volledige naam"
            placeholder="Jan van der Berg"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <Input
            label="E-mailadres"
            type="email"
            placeholder="uw@email.nl"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            label="Wachtwoord"
            type="password"
            placeholder="Minimaal 8 tekens"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={8}
            hint="Kies een sterk wachtwoord van minimaal 8 tekens."
          />
          <Select
            label="Primaire rol"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            options={[
              { value: "TESTATOR", label: "Erflater — ik wil mijn bezittingen registreren" },
              { value: "NOTARY",   label: "Notaris — ik beheer dossiers voor cliënten" },
              { value: "BENEFICIARY", label: "Erfgenaam — ik ben uitgenodigd als erfgenaam" },
            ]}
            hint="U kunt ook erfgenaam zijn van iemand anders, ongeacht uw rol hier."
          />

          <div className="bg-ink-50 rounded-lg p-3 text-xs text-ink-600 leading-relaxed">
            <p className="font-medium text-ink-800 mb-1">AVG / Privacy toestemming</p>
            <p>
              Uw persoonsgegevens worden verwerkt conform de AVG (Algemene Verordening
              Gegevensbescherming). Gegevens worden uitsluitend gebruikt voor het beheren van
              uw digitaal nalatenschapsdossier en worden nooit zonder toestemming gedeeld.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-ink-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs text-ink-600">
              Ik ga akkoord met de{" "}
              <span className="text-amber-600 cursor-pointer hover:underline">privacyverklaring</span>
              {" "}en{" "}
              <span className="text-amber-600 cursor-pointer hover:underline">gebruiksvoorwaarden</span>
              {" "}van het Digitaal Nalatenschapsdossier.
            </span>
          </label>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Account aanmaken
          </Button>
        </form>

        <p className="text-center text-xs text-ink-500 mt-6">
          Al een account?{" "}
          <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
