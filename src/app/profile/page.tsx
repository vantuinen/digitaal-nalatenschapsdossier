"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Download, Trash2, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Profiel & Instellingen" subtitle="Uw accountgegevens en privacyinstellingen" />
      <div className="flex-1 p-8 space-y-5">
        <div className="max-w-lg space-y-5">
          <Card>
            <CardHeader><h2 className="font-semibold text-ink-900 text-sm">Accountgegevens</h2></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-ink-500 mb-0.5">Naam</p>
                <p className="text-sm text-ink-900">{session?.user?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500 mb-0.5">E-mailadres</p>
                <p className="text-sm text-ink-900">{session?.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-ink-500 mb-0.5">Rol</p>
                <p className="text-sm text-ink-900 capitalize">
                  {(session?.user as any)?.role === "TESTATOR" ? "Erflater" :
                   (session?.user as any)?.role === "NOTARY" ? "Notaris" : "Erfgenaam"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-ink-500" />
                <h2 className="font-semibold text-ink-900 text-sm">Privacy & AVG-rechten</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-ink-600 leading-relaxed">
                Op grond van de Algemene Verordening Gegevensbescherming (AVG) heeft u het recht op inzage,
                rectificatie en verwijdering van uw persoonsgegevens. U kunt uw gegevens exporteren of
                uw account volledig verwijderen.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="h-3.5 w-3.5" /> Mijn gegevens exporteren (AVG Art. 20)
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
                  <Download className="h-3.5 w-3.5" /> Auditlog exporteren
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h2 className="font-semibold text-red-900 text-sm">Gevarenzone</h2>
              </div>
            </CardHeader>
            <CardContent>
              {!showDeleteWarning ? (
                <div>
                  <p className="text-xs text-red-700 mb-3 leading-relaxed">
                    Het verwijderen van uw account is onomkeerbaar. Al uw dossiergegevens, bezittingen en
                    instellingen worden permanent verwijderd. Dit is niet van toepassing op reeds vrijgegeven dossiers.
                  </p>
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteWarning(true)}>
                    <Trash2 className="h-3.5 w-3.5" /> Account verwijderen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-red-900">Weet u het zeker?</p>
                  <p className="text-xs text-red-700">In de MVP wordt account-verwijdering hier gesimuleerd. In productie vereist dit een extra verificatiestap via e-mail.</p>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm">Definitief verwijderen (demo)</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteWarning(false)}>Annuleren</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
