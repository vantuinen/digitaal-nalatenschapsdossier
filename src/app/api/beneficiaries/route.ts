import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;

  const vault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  if (!vault) return NextResponse.json({ beneficiaries: [] });

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { vaultId: vault.id },
    include: {
      _count: { select: { assets: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ beneficiaries });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;

  const vault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  if (!vault) return NextResponse.json({ error: "Maak eerst een kluis aan" }, { status: 404 });

  const body = await req.json();
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Naam en e-mailadres zijn verplicht" }, { status: 400 });
  }

  // Check if email already exists in this vault
  const existing = await prisma.beneficiary.findFirst({
    where: { vaultId: vault.id, email: body.email },
  });
  if (existing) {
    return NextResponse.json({ error: "Dit e-mailadres is al toegevoegd" }, { status: 409 });
  }

  // Try to link to existing user account
  const linkedUser = await prisma.user.findUnique({ where: { email: body.email } });

  const beneficiary = await prisma.beneficiary.create({
    data: {
      vaultId: vault.id,
      name: body.name,
      email: body.email,
      relation: body.relation || null,
      userId: linkedUser?.id || null,
      invitedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      vaultId: vault.id,
      userId,
      action: "BENEFICIARY_ADDED",
      details: `Erfgenaam '${beneficiary.name}' (${beneficiary.email}) toegevoegd`,
    },
  });

  return NextResponse.json({ beneficiary }, { status: 201 });
}
