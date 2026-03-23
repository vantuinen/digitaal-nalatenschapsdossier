"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ListChecks, Lightbulb, Route } from "lucide-react";

type Insights = {
  summary: string;
  keyFindings: string[];
  nextSteps: string[];
  wishesChecklist: string[];
};

export default function AssistantPage() {
  const [wishesText, setWishesText] = useState("");
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateInsights() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishesText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kon geen inzichten genereren.");
        setInsights(null);
        return;
      }

      setInsights(data.insights);
    } catch {
      setError("Netwerkfout bij genereren van inzichten.");
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generateInsights();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="AI Nalatenschapsassistent"
        subtitle="Krijg direct inzicht in digitale bezittingen en gewenste opvolgacties"
      />

      <div className="flex-1 p-8 space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-ink-900">Wensen van erflater (optioneel)</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              rows={5}
              placeholder="Bijv: Behoud familiefoto's, sluit social media, draag domeinnaam over aan Lisa..."
              value={wishesText}
              onChange={(e) => setWishesText(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button onClick={generateInsights} disabled={loading}>
                <Sparkles className="h-4 w-4" />
                {loading ? "Analyse uitvoeren..." : "Analyseer bezittingen"}
              </Button>
              <p className="text-xs text-ink-500">
                Deze eerste versie gebruikt regels op basis van jouw data en is voorbereid op latere LLM-koppeling.
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {insights && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-3">
              <CardContent className="py-5">
                <p className="text-sm text-ink-700"><strong>Samenvatting:</strong> {insights.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-ink-900 flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Belangrijkste inzichten</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ink-700 list-disc pl-4">
                  {insights.keyFindings.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-ink-900 flex items-center gap-2"><Route className="h-4 w-4" /> Aanbevolen vervolgstappen</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ink-700 list-disc pl-4">
                  {insights.nextSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-ink-900 flex items-center gap-2"><ListChecks className="h-4 w-4" /> Wensen-checklist</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-ink-700 list-disc pl-4">
                  {insights.wishesChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
