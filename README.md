# Digitaal Nalatenschapsdossier — MVP v0.1 test

Een beveiligd digitaal nalatenschapsplatform voor de Nederlandse markt, ontworpen voor erflaters, notarissen en erfgenamen.

---

## 🚀 Snelstart

### Vereisten
- Node.js 18+
- npm of yarn
- Supabase project (PostgreSQL)

### Installatie

```bash
# 1. Clone of unzip het project
cd digitaal-nalatenschapsdossier

# 2. Installeer dependencies
npm install

# 3. Kopieer de omgevingsvariabelen
cp .env.example .env.local

# 4. Pas .env.local aan (Supabase)
# DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
# NEXTAUTH_SECRET="verander-dit-naar-een-sterk-geheim"
# NEXTAUTH_URL="http://localhost:3000"

# 5. Initialiseer database + laad demo data
npm run db:setup

# 6. Start de dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Vercel + Supabase Deploy

1. Maak in Supabase een project aan en kopieer:
   - **Direct connection URL** (poort `5432`) → `DATABASE_URL`
2. Zet in Vercel (Project Settings → Environment Variables):
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (je productie-URL)
3. Gebruik de standaard build (`npm run build`): deze voert automatisch uit:
   - `prisma generate`
   - `prisma db push` (als `DATABASE_URL` gezet is)
   - `next build`
4. Optioneel: zet `SEED_ON_DEPLOY=true` om tijdens deploy demo-data te seeden.
5. Voor eerste setup kun je lokaal `npx prisma db push` en optioneel `npm run db:seed` draaien.

### Database is leeg na deploy?

Als er geen tabellen zijn, controleer eerst of `DATABASE_URL` correct in Vercel staat. De build probeert tabellen nu automatisch aan te maken via `prisma db push`.

Dat de database leeg is qua data is normaal: deploys voeren standaard geen demo-seed uit. Als je testdata wilt:

1. Zet tijdelijk lokaal je productie `DATABASE_URL` (Supabase direct URL, poort 5432).
2. Draai eenmalig:

```bash
npm run db:seed
```

3. Seeden in productie is expres beveiligd. Alleen als je dit bewust wilt forceren:

```bash
ALLOW_PROD_SEED=true npm run db:seed
```

> Let op: demo-accounts zijn alleen bedoeld voor test/acceptatie, niet voor live gebruik.

---

## 🤖 AI Nalatenschapsassistent (uitbreidbaar)

- Nieuwe pagina: `/assistant` (voor erflaters) met:
  - automatische samenvatting van bezittingen en toewijzingen
  - voorgestelde vervolgstappen
  - checklist op basis van ingevoerde wensen
- API endpoint: `POST /api/assistant/insights`
- Logica staat in `src/lib/estate-assistant.ts` en is bewust modulair, zodat je later eenvoudig een echte LLM-provider (bijv. OpenAI/Supabase Edge Function) kunt koppelen.

---

## 🛠 Beheer Backend (Admin)

- Nieuwe admin backend endpoints:
  - `GET /api/admin/status` — platformstatus + kerncijfers
  - `GET /api/admin/settings` — huidige globale instellingen
  - `PATCH /api/admin/settings` — instellingen aanpassen
- Nieuwe admin pagina: `/admin` (alleen voor rol `ADMIN`) om status te bekijken en instellingen te wijzigen.
- Ondersteunde globale settings:
  - `maintenance_mode`
  - `allow_registrations` (wordt afgedwongen in registratie-endpoint)
  - `assistant_enabled` (wordt afgedwongen in AI-assistent endpoint)

---

## 👤 Demo Accounts

| Rol | E-mail | Wachtwoord |
|-----|--------|------------|
| Erflater | jan@demo.nl | demo1234 |
| Notaris | notaris@demo.nl | demo1234 |
| Erfgenaam | erfgenaam@demo.nl | demo1234 |
| Erflater (in behandeling) | maria@demo.nl | demo1234 |
| Beheerder | admin@demo.nl | demo1234 |

---

## 🗂 Projectstructuur

```
src/
├── app/
│   ├── (public)         # Landingspagina
│   ├── login/           # Inlogpagina
│   ├── register/        # Registratiepagina
│   ├── dashboard/       # Erflater dashboard
│   ├── vault/           # Kluisbeheer
│   ├── assets/          # Bezittingen (CRUD)
│   ├── beneficiaries/   # Erfgenamen beheer
│   ├── notary/          # Notariskoppeling
│   ├── audit/           # Activiteitenlog
│   ├── profile/         # Profiel & AVG
│   ├── notary-dashboard/ # Notaris overzicht
│   ├── cases/[id]/      # Dossierdetail (notaris)
│   ├── release-requests/ # Vrijgaveverzoeken
│   ├── beneficiary-dashboard/ # Erfgenaam view
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # Herbruikbare UI componenten
│   ├── layout/          # Sidebar, Header, DashboardLayout
│   └── vault/           # Kluis-specifieke componenten
├── lib/
│   ├── prisma.ts        # Database client
│   ├── auth.ts          # NextAuth configuratie
│   ├── utils.ts         # Hulpfuncties + labels
│   └── audit.ts         # Audit log helper
└── types/
    └── next-auth.d.ts   # TypeScript declaraties
prisma/
├── schema.prisma        # Datamodel
└── seed.ts              # Demo data
```

---

## 🏗 Architectuur

### Rollen & Toegang

| Rol | Toegang |
|-----|---------|
| TESTATOR | Eigen kluis, bezittingen, erfgenamen, notariskoppeling |
| NOTARY | Alle toegewezen dossiers, statuswijzigingen, auditlogs |
| BENEFICIARY | Uitsluitend vrijgegeven bezittingen die aan hen zijn toegewezen |

### Kluis Statusflow

```
DRAFT → ACTIVE → DEATH_REPORTED → UNDER_REVIEW → APPROVED → RELEASED → CLOSED
```

Elke overgang wordt gelogd in de onveranderlijke audit trail.

### Datamodel (vereenvoudigd)

```
User (TESTATOR | NOTARY | BENEFICIARY)
  └── LegacyVault (1 per erflater)
        ├── DigitalAsset[] (8 types)
        ├── Beneficiary[] (met optionele User-link)
        ├── ReleaseRequest[]
        └── AuditLog[]
```

---

## 🔐 Beveiliging

### Geïmplementeerd (MVP)
- Wachtwoord-hashing met bcrypt (12 rounds)
- JWT-gebaseerde sessies via NextAuth
- Role-based access control op alle API routes
- Eigenaarverificatie per asset/kluis
- Volledige audit trail van alle handelingen
- AVG-bewuste UI (toestemmingsflow, exportoptie, verwijderoptie)

### Nog te implementeren (productie)
- End-to-end encryptie van `sensitiveNotes` (AES-256-GCM)
- User-controlled encryption keys (BYOK)
- Hardware Security Module (HSM) integratie
- Multi-factor authenticatie (TOTP/WebAuthn)
- DigiD-integratie voor notarisverificatie
- Rate limiting & brute-force bescherming
- CSP headers & security hardening
- Penetratietest & AVG-audit door derde partij
- Notarieel systeemkoppeling (KNB API)

---

## ⚖️ Juridische context

Dit systeem is ontworpen binnen de Nederlandse juridische context:

- **Niet-vervanging**: Het systeem vervangt geen testament (art. 4:94 BW)
- **Notarieel toezicht**: Alle vrijgave onder toezicht van erkende notaris (KNB-lid)
- **Verklaring van erfrecht**: Vereist voor vrijgave (art. 4:188 BW)
- **AVG-compliance**: Privacyverklaring, toestemmingsflow, recht op inzage/verwijdering

---

## 🗺 Productie Roadmap

### Fase 2 — Beveiliging & Compliance
- [ ] End-to-end encryptie sensitieve data
- [ ] MFA / DigiD integratie
- [ ] Formele AVG Data Protection Impact Assessment (DPIA)
- [ ] Notaris-verificatie via KNB-register
- [ ] SSL/TLS + security headers

### Fase 3 — Integraties
- [ ] E-mailnotificaties (Postmark/SendGrid)
- [ ] Digitale handtekening documenten
- [ ] API-koppeling notaristoepassingen
- [ ] Documentupload (overlijdensakte, testament)
- [ ] Crypto-wallet balanscheck (read-only)

### Fase 4 — Geavanceerde features
- [ ] Tijdsloten en conditionele vrijgave
- [ ] Video-boodschappen voor erfgenamen
- [ ] Automatische abonnement-opzeggingsassistent
- [ ] Partner-integraties (verzekeringsmaatschappijen, banken)

---

## ⚠️ MVP Beperkingen

1. **Geen echte encryptie**: `sensitiveNotes` worden in plaintext opgeslagen — verplicht te vervangen door AES-256-GCM vóór productie
2. **Geen e-mailnotificaties**: Uitnodigingen, statuswijzigingen etc. verzenden geen echte e-mails
3. **Geen documentupload**: Overlijdensakte en testament kunnen nog niet worden geüpload
4. **Geen MFA**: Twee-factor authenticatie is nog niet geïmplementeerd
5. **Geen notarisverificatie**: Notarissen worden nog niet geverifieerd via het KNB-register
6. **Geen audit-onveranderlijkheid**: Audit logs zijn in de database aanpasbaar — in productie een append-only store gebruiken
7. **Demo-seeding**: Seeddata alleen gebruiken in testomgevingen, niet in productie

---

## 📄 Licentie

MVP — Commercieel gebruik vereist aparte licentieovereenkomst.
