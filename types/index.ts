export type VocabularyWord = {
  id: string;
  term: string;
  reading: string;
  meaning: string;
  category: string;
  level: "N1";
  tags: string[];
  example: {
    jp: string;
    en: string;
  };
};
