import {
  Mail, Cloud, Share2, Bitcoin, Globe, Briefcase,
  CreditCard, Image, Building2, TrendingUp, Shield, Gamepad2, HelpCircle
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  EMAIL: Mail,
  CLOUD_STORAGE: Cloud,
  SOCIAL_MEDIA: Share2,
  CRYPTO_WALLET: Bitcoin,
  DOMAIN_NAME: Globe,
  ONLINE_BUSINESS: Briefcase,
  DIGITAL_SUBSCRIPTION: CreditCard,
  PHOTO_ARCHIVE: Image,
  BANKING: Building2,
  INVESTMENT: TrendingUp,
  INSURANCE: Shield,
  GAMING: Gamepad2,
  OTHER: HelpCircle,
};

const colorMap: Record<string, string> = {
  EMAIL: "bg-blue-100 text-blue-600",
  CLOUD_STORAGE: "bg-sky-100 text-sky-600",
  SOCIAL_MEDIA: "bg-purple-100 text-purple-600",
  CRYPTO_WALLET: "bg-orange-100 text-orange-600",
  DOMAIN_NAME: "bg-teal-100 text-teal-600",
  ONLINE_BUSINESS: "bg-emerald-100 text-emerald-600",
  DIGITAL_SUBSCRIPTION: "bg-pink-100 text-pink-600",
  PHOTO_ARCHIVE: "bg-violet-100 text-violet-600",
  BANKING: "bg-green-100 text-green-600",
  INVESTMENT: "bg-lime-100 text-lime-700",
  INSURANCE: "bg-cyan-100 text-cyan-600",
  GAMING: "bg-rose-100 text-rose-600",
  OTHER: "bg-gray-100 text-gray-600",
};

export function AssetTypeIcon({ type, size = "md" }: { type: string; size?: "sm" | "md" | "lg" }) {
  const Icon = iconMap[type] || HelpCircle;
  const color = colorMap[type] || "bg-gray-100 text-gray-600";
  const sizes = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-12 h-12" };
  const iconSizes = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5", lg: "h-6 w-6" };

  return (
    <div className={`${sizes[size]} rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className={iconSizes[size]} />
    </div>
  );
}
