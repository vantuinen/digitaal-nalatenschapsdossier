import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAssetAndVerifyOwner(assetId: string, userId: string) {
  const asset = await prisma.digitalAsset.findUnique({
    where: { id: assetId },
    include: {
      vault: true,
      beneficiary: { select: { id: true, name: true, email: true } },
    },
  });
  if (!asset || asset.vault.ownerId !== userId) return null;
  return asset;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;
  const asset = await getAssetAndVerifyOwner(id, userId);
  if (!asset) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ asset });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;
  const existing = await getAssetAndVerifyOwner(id, userId);
  if (!existing) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const body = await req.json();
  const asset = await prisma.digitalAsset.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.assetType && { assetType: body.assetType }),
      ...(body.platform !== undefined && { platform: body.platform || null }),
      ...(body.description !== undefined && { description: body.description || null }),
      ...(body.instructions !== undefined && { instructions: body.instructions || null }),
      ...(body.sensitiveNotes !== undefined && { sensitiveNotes: body.sensitiveNotes || null }),
      ...(body.recommendedAction && { recommendedAction: body.recommendedAction }),
      ...(body.accessUrl !== undefined && { accessUrl: body.accessUrl || null }),
      ...(body.beneficiaryId !== undefined && { beneficiaryId: body.beneficiaryId || null }),
    },
    include: { beneficiary: { select: { id: true, name: true, email: true } } },
  });

  await prisma.auditLog.create({
    data: { vaultId: existing.vaultId, userId, action: "ASSET_UPDATED", details: `Bezitting '${asset.name}' bijgewerkt` },
  });

  return NextResponse.json({ asset });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;
  const asset = await getAssetAndVerifyOwner(id, userId);
  if (!asset) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  await prisma.digitalAsset.delete({ where: { id } });
  await prisma.auditLog.create({
    data: { vaultId: asset.vaultId, userId, action: "ASSET_DELETED", details: `Bezitting '${asset.name}' verwijderd` },
  });

  return NextResponse.json({ ok: true });
}
