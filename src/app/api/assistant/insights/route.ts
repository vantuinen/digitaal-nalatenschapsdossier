import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildEstateInsights } from "@/lib/estate-assistant";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "TESTATOR") {
    return NextResponse.json(
      { error: "Deze assistent is momenteel alleen beschikbaar voor erflaters." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const wishesText = typeof body?.wishesText === "string" ? body.wishesText : "";

  const vault = await prisma.legacyVault.findUnique({
    where: { ownerId: userId },
    include: {
      beneficiaries: {
        select: {
          id: true,
          name: true,
        },
      },
      assets: {
        select: {
          id: true,
          name: true,
          assetType: true,
          recommendedAction: true,
          beneficiary: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!vault) {
    return NextResponse.json({
      insights: buildEstateInsights({ assetItems: [], beneficiaries: [], wishesText }),
      meta: { hasVault: false },
    });
  }

  const insights = buildEstateInsights({
    assetItems: vault.assets,
    beneficiaries: vault.beneficiaries,
    wishesText,
  });

  return NextResponse.json({
    insights,
    meta: {
      hasVault: true,
      assetCount: vault.assets.length,
      beneficiaryCount: vault.beneficiaries.length,
    },
  });
}
