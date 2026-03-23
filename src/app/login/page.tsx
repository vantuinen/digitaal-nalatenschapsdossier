"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Ongeldig e-mailadres of wachtwoord.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[420px] bg-ink-950 flex-col justify-between p-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center">
            <Scale className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-serif text-sm font-semibold">Digitaal Nalatenschapsdossier</span>
        </div>
        <div>
          <p className="font-serif text-3xl text-white leading-snug font-medium mb-4">
            "Uw digitale nalatenschap,<br />
            <span className="text-amber-400 italic">veilig en geregeld.</span>"
          </p>
          <p className="text-ink-400 text-sm leading-relaxed">
            Beheer uw digitale bezittingen en geef erfgenamen de juiste toegang
            op het juiste moment — altijd onder notarieel toezicht.
          </p>
        </div>
        <p className="text-ink-600 text-xs">AVG-conform · Notarieel gecontroleerd · Nederlandse wetgeving</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-serif text-2xl font-semibold text-ink-900 mb-1">Inloggen</h1>
            <p className="text-sm text-ink-500">Toegang tot uw digitaal nalatenschapsdossier</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mailadres"
              type="email"
              placeholder="uw@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-700">Wachtwoord</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-9 rounded-lg border border-ink-200 text-sm bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Inloggen
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-ink-100">
            <p className="text-xs text-ink-500 text-center mb-3">Demo accounts (wachtwoord: demo1234)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Erflater", email: "jan@demo.nl" },
                { label: "Notaris", email: "notaris@demo.nl" },
                { label: "Erfgenaam", email: "erfgenaam@demo.nl" },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword("demo1234"); }}
                  className="text-xs border border-ink-200 rounded-lg px-2 py-2 text-ink-600 hover:bg-ink-50 hover:border-ink-300 transition-colors text-center"
                >
                  <span className="block font-medium text-ink-800">{d.label}</span>
                  <span className="text-ink-400 text-[10px] truncate block">{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-ink-500 mt-6">
            Nog geen account?{" "}
            <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Registreer hier
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
