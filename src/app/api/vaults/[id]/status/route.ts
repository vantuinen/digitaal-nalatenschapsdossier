import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_TRANSITIONS: Record<string, string[]> = {
  ACTIVE:        ["DEATH_REPORTED"],
  DEATH_REPORTED:["UNDER_REVIEW"],
  UNDER_REVIEW:  ["APPROVED", "ACTIVE"],
  APPROVED:      ["RELEASED"],
  RELEASED:      ["CLOSED"],
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "NOTARY" && role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;
  const { status, notes } = await req.json();

  const vault = await prisma.legacyVault.findUnique({ where: { id } });
  if (!vault) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const allowed = VALID_TRANSITIONS[vault.status] || [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Ongeldige statusovergang van ${vault.status} naar ${status}` },
      { status: 400 }
    );
  }

  const updateData: any = { status };
  if (status === "DEATH_REPORTED") updateData.deathReportedAt = new Date();

  const updated = await prisma.legacyVault.update({ where: { id }, data: updateData });

  await prisma.auditLog.create({
    data: {
      vaultId: vault.id,
      userId: (session.user as any).id,
      action: `STATUS_CHANGED_TO_${status}`,
      details: notes
        ? `Notarisaantekening: ${notes}`
        : `Status gewijzigd naar ${status} door notaris`,
    },
  });

  return NextResponse.json({ vault: updated });
}
