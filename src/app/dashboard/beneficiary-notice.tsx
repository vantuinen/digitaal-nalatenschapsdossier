"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export function BeneficiaryNotice() {
  const [data, setData] = useState<{ isBeneficiary: boolean; count: number } | null>(null);

  useEffect(() => {
    fetch("/api/beneficiary/check")
      .then(r => r.json())
      .then(d => setData(d));
  }, []);

  if (!data?.isBeneficiary) return null;

  return (
    <div className="bg-white border border-ink-100 rounded-xl p-4 shadow-card flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <KeyRound className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-900">U bent ook erfgenaam</p>
          <p className="text-xs text-ink-500 mt-0.5">
            U staat als erfgenaam geregistreerd in {data.count} dossier{data.count !== 1 ? "s" : ""}.
            Bekijk uw toegang via het erfgenaamsportaal.
          </p>
        </div>
      </div>
      <Link
        href="/beneficiary-dashboard"
        className="flex-shrink-0 text-xs bg-ink-900 text-white px-3 py-2 rounded-lg hover:bg-ink-800 transition-colors whitespace-nowrap"
      >
        Mijn erfenistoegang →
      </Link>
    </div>
  );
}
