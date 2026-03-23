"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react";

export default function ReleaseRequestsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () => {
    fetch("/api/release-requests/list")
      .then((r) => r.json())
      .then((d) => { setRequests(d.requests || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setActing(id);
    await fetch(`/api/release-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notaryNotes: notes[id] || "" }),
    });
    setActing(null);
    load();
  }

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
    PENDING:      { label: "In afwachting",   icon: <Clock className="h-4 w-4 text-amber-500" />,   classes: "bg-amber-50 border-amber-200" },
    UNDER_REVIEW: { label: "In behandeling",  icon: <Clock className="h-4 w-4 text-blue-500" />,    classes: "bg-blue-50 border-blue-200" },
    APPROVED:     { label: "Goedgekeurd",     icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, classes: "bg-emerald-50 border-emerald-200" },
    REJECTED:     { label: "Afgewezen",       icon: <XCircle className="h-4 w-4 text-red-500" />,   classes: "bg-red-50 border-red-200" },
    CANCELLED:    { label: "Geannuleerd",     icon: <XCircle className="h-4 w-4 text-gray-400" />,  classes: "bg-gray-50 border-gray-200" },
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Vrijgaveverzoeken"
        subtitle={role === "NOTARY" ? "Beoordeel vrijgaveverzoeken van erfgenamen" : "Uw ingediende vrijgaveverzoeken"}
      />
      <div className="flex-1 p-8">
        <div className="max-w-3xl space-y-5">
          <div className="flex items-start gap-3 bg-ink-50 rounded-xl p-4 border border-ink-100">
            <Shield className="h-4 w-4 text-ink-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ink-600 leading-relaxed">
              {role === "NOTARY"
                ? "Vrijgaveverzoeken worden ingediend door erfgenamen. Als notaris kunt u elk verzoek goedkeuren of afwijzen. Na goedkeuring kunt u het volledige dossier vrijgeven via de dossierdetailpagina."
                : "Vrijgaveverzoeken worden beoordeeld door de aangestelde notaris. U ontvangt geen directe melding — vraag de notaris om de status te bevestigen."}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-ink-200 border-t-ink-700" />
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Shield className="h-8 w-8 text-ink-200 mx-auto mb-3" />
                <p className="text-sm text-ink-500">Geen vrijgaveverzoeken gevonden</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const cfg = statusConfig[req.status] || statusConfig.PENDING;
                const isOpen = acting === req.id;
                return (
                  <div key={req.id} className={`border rounded-xl overflow-hidden ${cfg.classes}`}>
                    <div className="px-5 py-4 flex items-start gap-3">
                      <div className="mt-0.5">{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-ink-900">{req.requestedBy}</p>
                          <span className="text-xs font-medium text-ink-600 bg-white/60 border border-ink-200 px-2 py-0.5 rounded-full">
                            {cfg.label}
                          </span>
                        </div>
                        {req.vault && (
                          <p className="text-xs text-ink-600 mb-1">
                            Dossier:{" "}
                            <span className="font-medium">{req.vault.title}</span>
                            {req.vault.owner && ` — ${req.vault.owner.name || req.vault.owner.email}`}
                          </p>
                        )}
                        {req.reason && (
                          <p className="text-xs text-ink-600 italic">"{req.reason}"</p>
                        )}
                        {req.notaryNotes && (
                          <p className="text-xs text-ink-500 mt-1">
                            Notarisaantekening: {req.notaryNotes}
                          </p>
                        )}
                        <p className="text-xs text-ink-400 mt-1">
                          {new Date(req.createdAt).toLocaleString("nl-NL")}
                        </p>
                      </div>
                    </div>

                    {/* Notary action panel */}
                    {role === "NOTARY" && req.status === "PENDING" && (
                      <div className="border-t border-ink-200 bg-white/50 px-5 py-3 space-y-3">
                        <Textarea
                          placeholder="Optionele aantekening voor de erfgenaam..."
                          value={notes[req.id] || ""}
                          onChange={(e) => setNotes((n) => ({ ...n, [req.id]: e.target.value }))}
                          className="text-xs min-h-[60px] bg-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            loading={acting === req.id}
                            onClick={() => decide(req.id, "APPROVED")}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Goedkeuren
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={acting === req.id}
                            onClick={() => decide(req.id, "REJECTED")}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Afwijzen
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
