import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const notaries = await prisma.user.findMany({
    where: { role: "NOTARY" },
    select: {
      id: true,
      name: true,
      email: true,
      notaryProfile: {
        select: { firmName: true, city: true, verified: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ notaries });
}
