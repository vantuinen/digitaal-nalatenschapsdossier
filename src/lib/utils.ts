import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const VAULT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Concept",
  ACTIVE: "Actief",
  DEATH_REPORTED: "Overlijden gemeld",
  UNDER_REVIEW: "In behandeling",
  APPROVED: "Goedgekeurd",
  RELEASED: "Vrijgegeven",
  CLOSED: "Gesloten",
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  EMAIL: "E-mailaccount",
  CLOUD_STORAGE: "Cloudopslag",
  SOCIAL_MEDIA: "Social media",
  CRYPTO_WALLET: "Cryptowallet",
  DOMAIN_NAME: "Domeinnaam",
  ONLINE_BUSINESS: "Online onderneming",
  DIGITAL_SUBSCRIPTION: "Digitaal abonnement",
  PHOTO_ARCHIVE: "Fotoarchief",
  BANKING: "Bankieren",
  INVESTMENT: "Belegging",
  INSURANCE: "Verzekering",
  GAMING: "Gaming",
  OTHER: "Overig",
};

export const RECOMMENDED_ACTION_LABELS: Record<string, string> = {
  TRANSFER: "Overdragen",
  CLOSE_ACCOUNT: "Account sluiten",
  ARCHIVE: "Archiveren",
  MEMORIALIZE: "Herdenkingspagina",
  INFORMATION_ONLY: "Alleen inzage",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  DEATH_REPORTED: "bg-red-100 text-red-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  RELEASED: "bg-purple-100 text-purple-700",
  CLOSED: "bg-gray-100 text-gray-600",
};
