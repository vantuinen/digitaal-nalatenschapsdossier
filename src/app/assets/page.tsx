"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetTypeIcon } from "@/components/vault/asset-type-icon";
import { ASSET_TYPE_LABELS, RECOMMENDED_ACTION_LABELS } from "@/lib/utils";
import { Plus, Search, Filter, ExternalLink } from "lucide-react";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    fetch("/api/assets").then(r => r.json()).then(d => {
      setAssets(d.assets || []);
      setLoading(false);
    });
  }, []);

  const filtered = assets.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.platform || "").toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || a.assetType === filterType;
    return matchSearch && matchType;
  });

  const actionColors: Record<string, string> = {
    TRANSFER: "info", CLOSE_ACCOUNT: "danger", ARCHIVE: "default", MEMORIALIZE: "warning", INFORMATION_ONLY: "outline"
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Digitale Bezittingen"
        subtitle={`${assets.length} bezitting${assets.length !== 1 ? "en" : ""} geregistreerd`}
        actions={
          <Link href="/assets/new">
            <Button size="sm"><Plus className="h-3.5 w-3.5" /> Bezitting toevoegen</Button>
          </Link>
        }
      />
      <div className="flex-1 p-8">
        {/* Search and filter bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
            <input
              type="text"
              placeholder="Zoeken..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink-200 text-sm bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-ink-200 text-sm bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
          >
            <option value="">Alle typen</option>
            {Object.entries(ASSET_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-ink-200 border-t-ink-700" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center mx-auto mb-3">
              <Filter className="h-6 w-6 text-ink-300" />
            </div>
            <p className="text-ink-500 text-sm mb-4">{search || filterType ? "Geen resultaten gevonden" : "Nog geen bezittingen toegevoegd"}</p>
            {!search && !filterType && (
              <Link href="/assets/new">
                <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> Eerste bezitting toevoegen</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`}>
                <div className="bg-white border border-ink-100 rounded-xl px-5 py-4 flex items-center gap-4 hover:shadow-card hover:border-ink-200 transition-all vault-card">
                  <AssetTypeIcon type={asset.assetType} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-ink-900 truncate">{asset.name}</p>
                      {asset.platform && <span className="text-xs text-ink-400">· {asset.platform}</span>}
                    </div>
                    <p className="text-xs text-ink-500 truncate">{asset.description || ASSET_TYPE_LABELS[asset.assetType]}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {asset.beneficiary && (
                      <span className="text-xs text-ink-500 hidden md:block">{asset.beneficiary.name}</span>
                    )}
                    <Badge variant={(actionColors[asset.recommendedAction] || "default") as any}>
                      {RECOMMENDED_ACTION_LABELS[asset.recommendedAction]}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
