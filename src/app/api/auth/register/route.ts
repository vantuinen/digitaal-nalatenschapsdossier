import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { readBooleanSetting } from "@/lib/admin";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["TESTATOR", "NOTARY"]),
});

export async function POST(req: Request) {
  try {
    const registrationsSetting = await prisma.appSetting.findUnique({
      where: { key: "allow_registrations" },
    });
    const allowRegistrations = readBooleanSetting(registrationsSetting?.value, true);
    if (!allowRegistrations) {
      return NextResponse.json(
        { error: "Registraties zijn tijdelijk uitgeschakeld door beheer." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const data = schema.parse(body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ error: "E-mailadres al in gebruik." }, { status: 409 });

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: data.role,
      },
    });

    if (data.role === "NOTARY") {
      await prisma.notaryProfile.create({ data: { userId: user.id } });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTERED",
        details: `Nieuw account aangemaakt: ${user.email} (${user.role})`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.name === "ZodError") return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
    return NextResponse.json({ error: "Interne fout." }, { status: 500 });
  }
}
