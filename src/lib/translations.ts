export const translations: Translations = {
  en: {
    "New Chat": "New Chat",
  },
  es: {
    "New Chat": "Nuevo Chat",
  },
  fr: {
    "New Chat": "Nouveau Chat",
  },
  ja: {
    "New Chat": "新しいチャット",
  },
  ko: {
    "New Chat": "새 채팅",
  },
  ru: {
    "New Chat": "Новый чат",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations[keyof typeof translations];

export type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};
