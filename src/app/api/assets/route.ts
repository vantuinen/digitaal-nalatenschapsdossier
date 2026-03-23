import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;

  const vault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  if (!vault) return NextResponse.json({ assets: [] });

  const assets = await prisma.digitalAsset.findMany({
    where: { vaultId: vault.id },
    include: { beneficiary: { select: { id: true, name: true, email: true } } },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ assets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;

  const vault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  if (!vault) return NextResponse.json({ error: "Maak eerst een kluis aan" }, { status: 404 });

  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });

  const asset = await prisma.digitalAsset.create({
    data: {
      vaultId: vault.id,
      name: body.name,
      assetType: body.assetType || "OTHER",
      platform: body.platform || null,
      description: body.description || null,
      instructions: body.instructions || null,
      sensitiveNotes: body.sensitiveNotes || null,
      recommendedAction: body.recommendedAction || "INFORMATION_ONLY",
      accessUrl: body.accessUrl || null,
      beneficiaryId: body.beneficiaryId || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      vaultId: vault.id,
      userId,
      action: "ASSET_CREATED",
      details: `Bezitting '${asset.name}' (${asset.assetType}) toegevoegd`,
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
