import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

run("npx prisma generate");

if (process.env.DATABASE_URL) {
  console.log("🗄️ DATABASE_URL gedetecteerd: Prisma schema wordt toegepast (db push)...");
  run("npx prisma db push --skip-generate");

  if (process.env.SEED_ON_DEPLOY === "true") {
    console.log("🌱 SEED_ON_DEPLOY=true: demo seed wordt uitgevoerd...");
    run("npm run db:seed");
  }
} else {
  console.log("ℹ️ Geen DATABASE_URL gevonden; db push overgeslagen.");
}

run("next build");
