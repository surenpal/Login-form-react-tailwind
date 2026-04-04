import importedVocabularyJson from "@/data/ark-vocabulary.json";
import type { VocabularyWord } from "@/types";

export const importedVocabulary =
  importedVocabularyJson as VocabularyWord[];
