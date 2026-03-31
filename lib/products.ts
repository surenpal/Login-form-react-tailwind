export const productCatalog = [
  {
    id: "kotoba-quest-lifetime",
    name: "N1 Vocabulary App Lifetime Access",
    description:
      "Full access to the JLPT N1 study library and future vocabulary packs.",
    price: 9800,
    currency: "jpy",
    benefits: [
      "Full N1 vocabulary library",
      "Premium quizzes and flashcards",
      "Future deck updates included",
      "Japan-friendly payment flow with PayPay support",
    ],
  },
] as const;

export type ProductId = (typeof productCatalog)[number]["id"];
