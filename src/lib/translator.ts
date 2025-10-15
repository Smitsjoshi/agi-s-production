import { translations, TranslationKeys } from '@/locales/translation';

export function translate(key: TranslationKeys, lang: string): string {
  const translation = translations[key];

  if (translation && typeof translation === 'object' && lang in translation) {
    return (translation as any)[lang];
  }

  return key as string;
}
