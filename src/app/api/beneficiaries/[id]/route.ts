import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;

  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id },
    include: { vault: true },
  });

  if (!beneficiary || beneficiary.vault.ownerId !== userId) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  await prisma.beneficiary.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { vaultId: beneficiary.vaultId, userId, action: "BENEFICIARY_REMOVED", details: `Erfgenaam '${beneficiary.name}' verwijderd` },
  });

  return NextResponse.json({ ok: true });
}
