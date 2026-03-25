import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env });
}

run("npx prisma generate");

const shouldPushOnBuild = process.env.RUN_DB_PUSH_ON_BUILD === "true";

if (shouldPushOnBuild && process.env.DATABASE_URL) {
  console.log("🗄️ RUN_DB_PUSH_ON_BUILD=true: Prisma schema wordt toegepast (db push)...");
  run("npx prisma db push --skip-generate");
} else {
  console.log("ℹ️ db push overgeslagen (zet RUN_DB_PUSH_ON_BUILD=true om dit tijdens build te doen).");
}

if (process.env.SEED_ON_DEPLOY === "true") {
  console.log("🌱 SEED_ON_DEPLOY=true: demo seed wordt uitgevoerd...");
  run("npm run db:seed");
}

run("next build");
