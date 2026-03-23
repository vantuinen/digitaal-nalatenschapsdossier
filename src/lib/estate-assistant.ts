import { ASSET_TYPE_LABELS, RECOMMENDED_ACTION_LABELS } from "@/lib/utils";

type AssetInput = {
  id: string;
  name: string;
  assetType: string;
  recommendedAction: string;
  beneficiary?: { name: string | null } | null;
};

type BeneficiaryInput = {
  id: string;
  name: string;
};

export type EstateInsightResult = {
  summary: string;
  keyFindings: string[];
  nextSteps: string[];
  wishesChecklist: string[];
};

export function buildEstateInsights(params: {
  assetItems: AssetInput[];
  beneficiaries: BeneficiaryInput[];
  wishesText?: string;
}): EstateInsightResult {
  const { assetItems, beneficiaries, wishesText } = params;

  const actionCounts = assetItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.recommendedAction] = (acc[item.recommendedAction] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = assetItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.assetType] = (acc[item.assetType] || 0) + 1;
    return acc;
  }, {});

  const unassignedAssets = assetItems.filter((item) => !item.beneficiary);
  const mostCommonType = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])[0];

  const summary = `${assetItems.length} bezittingen geregistreerd, ${beneficiaries.length} erfgena(a)m(en), ${unassignedAssets.length} nog niet toegewezen.`;

  const keyFindings: string[] = [];
  if (mostCommonType) {
    keyFindings.push(
      `Meest voorkomende categorie: ${ASSET_TYPE_LABELS[mostCommonType[0]] || mostCommonType[0]} (${mostCommonType[1]}).`
    );
  }

  const highPriorityActions = ["TRANSFER", "CLOSE_ACCOUNT", "MEMORIALIZE"];
  const urgentCount = highPriorityActions.reduce((sum, key) => sum + (actionCounts[key] || 0), 0);
  keyFindings.push(`${urgentCount} bezittingen vragen waarschijnlijk directe opvolging na overlijden.`);

  if (unassignedAssets.length > 0) {
    keyFindings.push(`${unassignedAssets.length} bezittingen hebben nog geen erfgenaam toegewezen.`);
  }

  const nextSteps: string[] = [
    "Controleer per bezitting of de aanbevolen actie juridisch en praktisch klopt (overdragen, sluiten, archiveren, etc.).",
    "Leg voor kritieke accounts (e-mail, wachtwoordmanager, bank/crypto) vast wie toegang krijgt en via welk proces.",
    "Plan een review met notaris zodat wensen aansluiten op testament en vrijgaveprocedure.",
  ];

  if (unassignedAssets.length > 0) {
    nextSteps.unshift("Wijs eerst de nog niet toegewezen bezittingen toe aan een erfgenaam of markeer ze als 'alleen inzage'.");
  }

  const wishesChecklist = parseWishesChecklist(wishesText);

  return {
    summary,
    keyFindings,
    nextSteps,
    wishesChecklist,
  };
}

function parseWishesChecklist(wishesText?: string) {
  if (!wishesText?.trim()) {
    return [
      "Beschrijf per categorie wat ermee moet gebeuren (behouden, overdragen, verwijderen, herdenken).",
      "Noteer expliciet uitzonderingen (bijv. privéaccounts niet delen).",
      "Leg prioriteiten vast: wat moet binnen 48 uur, binnen 30 dagen, en later gebeuren.",
    ];
  }

  return wishesText
    .split(/\n|\.|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 8)
    .map((line) => line[0].toUpperCase() + line.slice(1));
}
