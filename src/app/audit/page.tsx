import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { ClipboardList, Shield } from "lucide-react";

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const vault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });

  const logs = await prisma.auditLog.findMany({
    where: vault ? { vaultId: vault.id } : { userId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  });

  const actionIcons: Record<string, string> = {
    USER_LOGIN: "🔐",
    VAULT_CREATED: "🗄️",
    VAULT_ACTIVATED: "✅",
    ASSET_CREATED: "📄",
    ASSET_UPDATED: "✏️",
    ASSET_DELETED: "🗑️",
    BENEFICIARY_ADDED: "👤",
    BENEFICIARY_REMOVED: "👤",
    NOTARY_ASSIGNED: "⚖️",
    RELEASE_REQUESTED: "📬",
    RELEASE_APPROVED: "✅",
    RELEASE_REJECTED: "❌",
    DEATH_REPORTED: "🕊️",
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Activiteitenlog" subtitle="Volledige audit trail van uw nalatenschapsdossier" />
      <div className="flex-1 p-8">
        <div className="max-w-3xl space-y-5">
          <div className="flex items-start gap-3 bg-ink-50 rounded-xl p-4 text-xs text-ink-600 border border-ink-100">
            <Shield className="h-4 w-4 text-ink-400 flex-shrink-0 mt-0.5" />
            <p>De auditlog registreert alle handelingen in uw dossier en is onveranderlijk. Deze log kan worden ingezien door uw aangestelde notaris en is bedoeld voor transparantie en rechtszekerheid. Alle tijden zijn in Nederlandse tijdzone (CET/CEST).</p>
          </div>

          <Card>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="h-6 w-6 text-ink-300" />
                </div>
                <p className="text-sm text-ink-500">Nog geen activiteiten geregistreerd</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {logs.map((log, i) => (
                  <div key={log.id} className={`flex gap-4 px-5 py-3.5 ${i === 0 ? "rounded-t-xl" : ""} ${i === logs.length - 1 ? "rounded-b-xl" : ""} hover:bg-ink-50/50 transition-colors`}>
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {actionIcons[log.action] || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-ink-900">{log.action.replace(/_/g, " ")}</p>
                        <span className="w-1 h-1 rounded-full bg-ink-300" />
                        <p className="text-xs text-ink-400">{log.user?.name || log.user?.email || "Systeem"}</p>
                      </div>
                      {log.details && <p className="text-xs text-ink-500 leading-relaxed">{log.details}</p>}
                    </div>
                    <div className="text-xs text-ink-400 whitespace-nowrap flex-shrink-0">
                      {formatDateTime(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <p className="text-xs text-ink-400 text-center">
            {logs.length} {logs.length === 100 ? "(maximaal 100 getoond)" : ""} activiteiten geregistreerd
          </p>
        </div>
      </div>
    </div>
  );
}
