import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function assertSeedSafety() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ontbreekt. Zet een geldige PostgreSQL connectiestring.");
  }

  const isProductionEnv =
    process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  if (isProductionEnv && process.env.ALLOW_PROD_SEED !== "true") {
    throw new Error(
      "Seed in productie is geblokkeerd. Zet ALLOW_PROD_SEED=true voor een bewuste eenmalige seed."
    );
  }
}

async function main() {
  assertSeedSafety();
  console.log("🌱 Seeding demo data...");

  const pw = await bcrypt.hash("demo1234", 12);

  // ── 1. Testator: Jan van der Berg ──────────────────────────────────────────
  const jan = await prisma.user.upsert({
    where: { email: "jan@demo.nl" },
    update: {},
    create: { name: "Jan van der Berg", email: "jan@demo.nl", password: pw, role: "TESTATOR" },
  });

  // ── 2. Notary: mr. A. de Vries ────────────────────────────────────────────
  const notaris = await prisma.user.upsert({
    where: { email: "notaris@demo.nl" },
    update: {},
    create: { name: "Mr. A. de Vries", email: "notaris@demo.nl", password: pw, role: "NOTARY" },
  });

  // ── 2b. Admin ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@demo.nl" },
    update: {},
    create: { name: "Platform Beheer", email: "admin@demo.nl", password: pw, role: "ADMIN" },
  });

  await prisma.notaryProfile.upsert({
    where: { userId: notaris.id },
    update: {},
    create: {
      userId: notaris.id,
      firmName: "De Vries Notarissen Amsterdam",
      city: "Amsterdam",
      verified: true,
    },
  });

  // ── 2c. App settings defaults ─────────────────────────────────────────────
  const defaultSettings = [
    { key: "maintenance_mode", value: "false" },
    { key: "allow_registrations", value: "true" },
    { key: "assistant_enabled", value: "true" },
  ];

  for (const setting of defaultSettings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // ── 3. Beneficiaries ──────────────────────────────────────────────────────
  const lisa = await prisma.user.upsert({
    where: { email: "erfgenaam@demo.nl" },
    update: {},
    create: { name: "Lisa van der Berg", email: "erfgenaam@demo.nl", password: pw, role: "BENEFICIARY" },
  });

  const tom = await prisma.user.upsert({
    where: { email: "tom@demo.nl" },
    update: {},
    create: { name: "Tom van der Berg", email: "tom@demo.nl", password: pw, role: "BENEFICIARY" },
  });

  // ── 4. Vault ───────────────────────────────────────────────────────────────
  const vault = await prisma.legacyVault.upsert({
    where: { ownerId: jan.id },
    update: {},
    create: {
      ownerId: jan.id,
      title: "Digitale nalatenschap Jan van der Berg",
      description: "Overzicht van alle digitale bezittingen en accounts van Jan van der Berg, geboren 14 maart 1958 te Amsterdam.",
      status: "ACTIVE",
      testamentRef: "Testament opgemaakt 3 januari 2022, akte nr. 2022-0042, Mr. A. de Vries, Amsterdam",
      notaryEmail: "notaris@demo.nl",
      notaryAccepted: "ACCEPTED",
      notaryName: "Mr. A. de Vries — De Vries Notarissen Amsterdam",
      activatedAt: new Date("2024-03-01"),
    },
  });

  // ── 5. Beneficiary records ────────────────────────────────────────────────
  let lisaBenef = await prisma.beneficiary.findFirst({ where: { vaultId: vault.id, email: lisa.email } });
  if (!lisaBenef) {
    lisaBenef = await prisma.beneficiary.create({
      data: {
        vaultId: vault.id,
        userId: lisa.id,
        name: "Lisa van der Berg",
        email: lisa.email,
        relation: "Dochter",
        invitedAt: new Date("2024-03-01"),
        acceptedAt: new Date("2024-03-05"),
      },
    });
  }

  let tomBenef = await prisma.beneficiary.findFirst({ where: { vaultId: vault.id, email: tom.email } });
  if (!tomBenef) {
    tomBenef = await prisma.beneficiary.create({
      data: {
        vaultId: vault.id,
        userId: tom.id,
        name: "Tom van der Berg",
        email: tom.email,
        relation: "Zoon",
        invitedAt: new Date("2024-03-01"),
        acceptedAt: new Date("2024-03-07"),
      },
    });
  }

  // ── 6. Digital Assets ─────────────────────────────────────────────────────
  const assetsData = [
    {
      name: "Gmail — hoofdaccount",
      assetType: "EMAIL",
      platform: "Google",
      description: "Primair e-mailaccount, gebruikt voor correspondentie en als herstel-e-mail voor andere diensten.",
      instructions: "Neem contact op met Google via het nalatenschapsportaal (support.google.com/accounts/troubleshooter/6357590). U heeft een overlijdensakte nodig en bewijs van relatie. Het account kan worden gedownload via Google Takeout of worden gesloten.",
      sensitiveNotes: "Herstelcode: GOOG-2847-XMPL-9912\nHerstel e-mail: jan.backup@hotmail.com",
      recommendedAction: "ARCHIVE",
      accessUrl: "https://mail.google.com",
      beneficiaryId: lisaBenef.id,
    },
    {
      name: "Dropbox — fotoarchief familie",
      assetType: "PHOTO_ARCHIVE",
      platform: "Dropbox",
      description: "Meer dan 12.000 familiefoto's en -video's van 1982 tot heden, gesorteerd per jaar.",
      instructions: "Inloggen met het e-mailadres hieronder. Download alle bestanden via 'Alles selecteren' en 'Downloaden'. Dropbox biedt ook een nalatenschapsaanvraag aan via hun supportpagina.",
      sensitiveNotes: "E-mail: jan@demo.nl\nWachtwoord: Zie wachtwoordkluis (LastPass)\nRecovery: Gebruik Google-account",
      recommendedAction: "TRANSFER",
      accessUrl: "https://dropbox.com",
      beneficiaryId: lisaBenef.id,
    },
    {
      name: "Binance — cryptoportefeuille",
      assetType: "CRYPTO_WALLET",
      platform: "Binance",
      description: "Cryptoportefeuille met Bitcoin en Ethereum. Geschatte waarde ca. €8.400 (stand 2024).",
      instructions: "BELANGRIJK: Neem geen onmiddellijke actie zonder juridisch advies over belastingimplicaties. Neem contact op met Binance via hun nalatenschapsprocedure. Het hardware wallet seed phrase staat in de kluis bij de notaris.",
      sensitiveNotes: "Account e-mail: jan.crypto@proton.me\nTwee-factor: Google Authenticator — herstelcodes in de brandkast\nHardware wallet: Ledger Nano X — bewaard in huiskluis, code bij notaris",
      recommendedAction: "TRANSFER",
      accessUrl: "https://binance.com",
      beneficiaryId: tomBenef.id,
    },
    {
      name: "vanderberg-advies.nl — domein",
      assetType: "DOMAIN_NAME",
      platform: "TransIP",
      description: "Domeinnaam voor voormalig adviesbureau. Verloopt jaarlijks in april.",
      instructions: "Inloggen op TransIP met gegevens hieronder. Het domein kan worden overgedragen of worden opgezegd. Overweeg de website te archiveren via web.archive.org.",
      sensitiveNotes: "TransIP login: jan@demo.nl\nWachtwoord: Zie LastPass-kluis",
      recommendedAction: "CLOSE_ACCOUNT",
      accessUrl: "https://transip.nl",
      beneficiaryId: tomBenef.id,
    },
    {
      name: "LinkedIn — professioneel profiel",
      assetType: "SOCIAL_MEDIA",
      platform: "LinkedIn",
      description: "Professioneel netwerk met 340+ connecties, artikelen en aanbevelingen.",
      instructions: "LinkedIn heeft een 'Verwijderingsverzoek' procedure voor nabestaanden. Ga naar linkedin.com/help en zoek op 'deceased member'. U kunt het account laten verwijderen of omzetten naar een herdenkingsprofiel.",
      sensitiveNotes: null,
      recommendedAction: "MEMORIALIZE",
      accessUrl: "https://linkedin.com",
      beneficiaryId: lisaBenef.id,
    },
    {
      name: "Spotify Premium",
      assetType: "DIGITAL_SUBSCRIPTION",
      platform: "Spotify",
      description: "Maandelijks abonnement (€10,99/maand). Afspeellijsten met meer dan 200 nummers.",
      instructions: "Abonnement opzeggen via Spotify accountpagina of neem contact op met Spotify support. De playlist-collectie kan worden geëxporteerd via tools als Soundiiz.",
      sensitiveNotes: "Login: jan@demo.nl / Spotify wachtwoord in LastPass",
      recommendedAction: "CLOSE_ACCOUNT",
      accessUrl: "https://spotify.com",
      beneficiaryId: null,
    },
    {
      name: "ABN AMRO — bankieren online",
      assetType: "BANKING",
      platform: "ABN AMRO",
      description: "Online bankieren account. Saldo en transactiehistorie beschikbaar.",
      instructions: "Neem direct contact op met de dichtstbijzijnde ABN AMRO vestiging met de overlijdensakte. De notaris zal de verklaring van erfrecht bij de bank indienen. Rekeningen worden bevroren tot de nalatenschap is afgewikkeld.",
      sensitiveNotes: "Rekeningnummer: NL91 ABNA 0417 1643 00\nKlantcode: 4829110",
      recommendedAction: "INFORMATION_ONLY",
      accessUrl: "https://abnamro.nl",
      beneficiaryId: tomBenef.id,
    },
    {
      name: "LastPass — wachtwoordkluis",
      assetType: "OTHER",
      platform: "LastPass",
      description: "Wachtwoordmanager met alle overige inloggegevens. Dit is de sleutel tot de meeste andere accounts.",
      instructions: "LastPass heeft een noodtoegang-functie. Neem contact op met LastPass support met de overlijdensakte. De noodtoegang voor Lisa is ingesteld met 48 uur vertraging. Zie het e-mailaccount voor de oorspronkelijke registratie-e-mail.",
      sensitiveNotes: "Hoofdwachtwoord: Bewaard in gesloten envelop bij notaris De Vries\nNoodtoegang ingesteld voor: lisa@demo.nl",
      recommendedAction: "TRANSFER",
      accessUrl: "https://lastpass.com",
      beneficiaryId: lisaBenef.id,
    },
  ];

  for (const a of assetsData) {
    const exists = await prisma.digitalAsset.findFirst({ where: { vaultId: vault.id, name: a.name } });
    if (!exists) {
      await prisma.digitalAsset.create({ data: { vaultId: vault.id, ...a as any } });
    }
  }

  // ── 7. Audit logs ──────────────────────────────────────────────────────────
  const auditEntries = [
    { action: "VAULT_CREATED", details: "Kluis aangemaakt door eigenaar", createdAt: new Date("2024-03-01T10:00:00") },
    { action: "NOTARY_ASSIGNED", details: "Notaris ingesteld: notaris@demo.nl", createdAt: new Date("2024-03-01T10:05:00") },
    { action: "BENEFICIARY_ADDED", details: "Erfgenaam 'Lisa van der Berg' toegevoegd", createdAt: new Date("2024-03-01T10:10:00") },
    { action: "BENEFICIARY_ADDED", details: "Erfgenaam 'Tom van der Berg' toegevoegd", createdAt: new Date("2024-03-01T10:12:00") },
    { action: "ASSET_CREATED", details: "Bezitting 'Gmail — hoofdaccount' (EMAIL) toegevoegd", createdAt: new Date("2024-03-02T14:00:00") },
    { action: "ASSET_CREATED", details: "Bezitting 'Binance — cryptoportefeuille' (CRYPTO_WALLET) toegevoegd", createdAt: new Date("2024-03-02T14:20:00") },
    { action: "VAULT_ACTIVATED", details: "Kluis geactiveerd door eigenaar", createdAt: new Date("2024-03-05T09:00:00") },
    { action: "ASSET_UPDATED", details: "Bezitting 'Binance — cryptoportefeuille' bijgewerkt", createdAt: new Date("2024-06-15T11:30:00") },
    { action: "USER_LOGIN", details: "Login via e-mail: jan@demo.nl", createdAt: new Date("2024-11-01T08:45:00") },
  ];

  for (const entry of auditEntries) {
    const exists = await prisma.auditLog.findFirst({
      where: { vaultId: vault.id, action: entry.action, details: entry.details },
    });
    if (!exists) {
      await prisma.auditLog.create({
        data: { vaultId: vault.id, userId: jan.id, ...entry },
      });
    }
  }

  // ── 8. Second demo vault (UNDER_REVIEW) ───────────────────────────────────
  const maria = await prisma.user.upsert({
    where: { email: "maria@demo.nl" },
    update: {},
    create: { name: "Maria Jansen", email: "maria@demo.nl", password: pw, role: "TESTATOR" },
  });

  const vault2 = await prisma.legacyVault.upsert({
    where: { ownerId: maria.id },
    update: {},
    create: {
      ownerId: maria.id,
      title: "Digitale nalatenschap M. Jansen",
      description: "Dossier aangemaakt in afwachting van verklaring van erfrecht.",
      status: "UNDER_REVIEW",
      notaryEmail: "notaris@demo.nl",
      notaryAccepted: "ACCEPTED",
      notaryName: "Mr. A. de Vries — De Vries Notarissen Amsterdam",
      activatedAt: new Date("2024-01-15"),
      deathReportedAt: new Date("2024-09-20"),
    },
  });

  const v2asset = await prisma.digitalAsset.findFirst({ where: { vaultId: vault2.id } });
  if (!v2asset) {
    await prisma.digitalAsset.create({
      data: {
        vaultId: vault2.id,
        name: "iCloud-account",
        assetType: "CLOUD_STORAGE",
        platform: "Apple",
        description: "Foto's, documenten en aankopen gelinkt aan Apple ID.",
        instructions: "Neem contact op met Apple Support via apple.com/support. Overlijdensakte vereist.",
        recommendedAction: "ARCHIVE",
      },
    });
  }

  // Add Jan as beneficiary on Maria's vault so he can experience both roles
  const janBenef = await prisma.beneficiary.findFirst({ where: { vaultId: vault2.id, email: jan.email } });
  if (!janBenef) {
    await prisma.beneficiary.create({
      data: {
        vaultId: vault2.id,
        userId: jan.id,
        name: "Jan van der Berg",
        email: jan.email,
        relation: "Broer",
        invitedAt: new Date("2024-01-15"),
        acceptedAt: new Date("2024-01-16"),
      },
    });
  }

  const vault2Logs = [
    { vaultId: vault2.id, userId: maria.id, action: "VAULT_CREATED", details: "Kluis aangemaakt", createdAt: new Date("2024-01-15") },
    { vaultId: vault2.id, userId: maria.id, action: "VAULT_ACTIVATED", details: "Kluis geactiveerd", createdAt: new Date("2024-01-20") },
    { vaultId: vault2.id, userId: notaris.id, action: "STATUS_CHANGED_TO_DEATH_REPORTED", details: "Overlijden bevestigd door notaris. Overlijdensakte ontvangen.", createdAt: new Date("2024-09-20") },
    { vaultId: vault2.id, userId: notaris.id, action: "STATUS_CHANGED_TO_UNDER_REVIEW", details: "Dossier in behandeling genomen. Verklaring van erfrecht aangevraagd.", createdAt: new Date("2024-09-25") },
  ];
  for (const entry of vault2Logs) {
    const exists = await prisma.auditLog.findFirst({
      where: { vaultId: entry.vaultId, action: entry.action },
    });
    if (!exists) await prisma.auditLog.create({ data: entry });
  }

  console.log("✅ Seed voltooid!");
  console.log("");
  console.log("Demo accounts (wachtwoord: demo1234):");
  console.log("  Erflater:  jan@demo.nl");
  console.log("  Notaris:   notaris@demo.nl");
  console.log("  Erfgenaam: erfgenaam@demo.nl");
  console.log("  Extra:     maria@demo.nl (erflater, dossier in behandeling)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
