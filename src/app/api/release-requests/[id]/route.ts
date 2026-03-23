import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "NOTARY" && role !== "ADMIN") {
    return NextResponse.json({ error: "Alleen een notaris kan verzoeken beoordelen" }, { status: 403 });
  }

  const { id } = await params;
  const { status, notaryNotes } = await req.json();

  if (!["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
    return NextResponse.json({ error: "Ongeldige status" }, { status: 400 });
  }

  const existing = await prisma.releaseRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Verzoek niet gevonden" }, { status: 404 });

  const updated = await prisma.releaseRequest.update({
    where: { id },
    data: {
      status,
      notaryNotes: notaryNotes || null,
      reviewedBy: session.user?.email,
      reviewedAt: new Date(),
    },
  });

  // Auto-release vault when approved
  if (status === "APPROVED") {
    const vault = await prisma.legacyVault.findUnique({ where: { id: existing.vaultId } });
    const releasableStatuses = ["ACTIVE", "DEATH_REPORTED", "UNDER_REVIEW", "APPROVED"];
    if (vault && releasableStatuses.includes(vault.status)) {
      await prisma.legacyVault.update({
        where: { id: existing.vaultId },
        data: { status: "RELEASED" },
      });
      await prisma.auditLog.create({
        data: {
          vaultId: existing.vaultId,
          userId: (session.user as any).id,
          action: "VAULT_RELEASED",
          details: "Kluis automatisch vrijgegeven na goedkeuring vrijgaveverzoek door notaris",
        },
      });
    }
  }

  await prisma.auditLog.create({
    data: {
      vaultId: existing.vaultId,
      userId: (session.user as any).id,
      action: status === "APPROVED" ? "RELEASE_REQUEST_APPROVED" : "RELEASE_REQUEST_REJECTED",
      details: `Vrijgaveverzoek ${status === "APPROVED" ? "goedgekeurd" : "afgewezen"} door notaris${notaryNotes ? `: ${notaryNotes}` : ""}`,
    },
  });

  return NextResponse.json({ releaseRequest: updated });
}
