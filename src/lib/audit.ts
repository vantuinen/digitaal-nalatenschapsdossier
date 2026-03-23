import { prisma } from "@/lib/prisma";

export async function createAuditLog({
  vaultId,
  userId,
  action,
  details,
  ipAddress,
}: {
  vaultId?: string;
  userId?: string;
  action: string;
  details?: string;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: { vaultId, userId, action, details, ipAddress },
  });
}
