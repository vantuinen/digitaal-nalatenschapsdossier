import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "NOTARY" && role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const userEmail = session.user?.email || "";

  const vaults = await prisma.legacyVault.findMany({
    where: { notaryEmail: userEmail },
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { assets: true } },
      releaseRequests: {
        where: { status: "PENDING" },
        select: { id: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ vaults, email: userEmail });
}
