import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const userId = (session.user as any).id;
  const userEmail = session.user?.email || "";

  // Find all beneficiary entries for this user (by userId OR email)
  const beneficiaryEntries = await prisma.beneficiary.findMany({
    where: {
      OR: [{ userId }, { email: userEmail }],
    },
    include: {
      vault: {
        include: {
          owner: { select: { name: true, email: true } },
        },
      },
      assets: true,
    },
  });

  // For each vault, also fetch the release requests made by this user
  const entriesWithRequests = await Promise.all(
    beneficiaryEntries.map(async (entry) => {
      const releaseRequests = await prisma.releaseRequest.findMany({
        where: {
          vaultId: entry.vault.id,
          requestedByRole: "beneficiary",
        },
        orderBy: { createdAt: "desc" },
      });
      return { ...entry, releaseRequests };
    })
  );

  return NextResponse.json({ entries: entriesWithRequests });
}
