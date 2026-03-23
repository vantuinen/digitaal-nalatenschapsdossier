import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const userId = (session.user as any).id;
  const userEmail = session.user?.email || "";
  const role = (session.user as any).role;

  let requests: any[] = [];

  if (role === "NOTARY") {
    // Notary: see all requests for vaults assigned to them
    requests = await prisma.releaseRequest.findMany({
      where: { vault: { notaryEmail: userEmail } },
      include: {
        vault: {
          include: { owner: { select: { name: true, email: true } } },
        },
      },
      orderBy: [
        // Pending first, then by date
        { createdAt: "desc" },
      ],
    });
    // Sort pending to top
    requests.sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return 0;
    });
  } else {
    // Testator or beneficiary: see requests on their own vault or submitted by them
    const vault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
    const vaultId = vault?.id;

    requests = await prisma.releaseRequest.findMany({
      where: vaultId ? { vaultId } : { requestedBy: { contains: userEmail } },
      include: {
        vault: {
          include: { owner: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json({ requests });
}
