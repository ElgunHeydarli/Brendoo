import { useParams } from 'react-router-dom';
import GETRequest from '../setting/Request';
import { TranslationsKeys } from '../setting/Types';

/**
 * Dil-spesifik çeviriləri almaq üçün hook
 * Backend'dən `/translates` endpoint'indən
 */
export function useTranslation() {
  const { lang = 'az' } = useParams<{ lang: string }>();
  
  const { data: translations, isLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  /**
   * Çeviri açarından dəyər al
   * @param key - Çeviri açarı (məs: "Ana_səhifə")
   * @param fallback - Standart dəyər (default: açar adı)
   */
  const t = (key: string, fallback?: string): string => {
    if (!translations) return fallback || key;
    return (translations as Record<string, string>)[key] || fallback || key;
  };

  return {
    t,
    translations,
    lang,
    isLoading,
  };
}

/**
 * Bütün çeviriləri almaq üçün hook
 */
export function useAllTranslations() {
  const { lang = 'az' } = useParams<{ lang: string }>();
  
  const { data: translations, isLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  return {
    translations: translations || {},
    lang,
    isLoading,
  };
}

/**
 * Format edilmiş çeviri al (placeholder desteği)
 * @param key - Çeviri açarı
 * @param params - Placeholder dəyərləri (məs: {name: "John"})
 */
export function useFormattedTranslation() {
  const { t, translations, lang, isLoading } = useTranslation();

  const tf = (key: string, params?: Record<string, string | number>): string => {
    let result = t(key);
    
    if (params) {
      Object.entries(params).forEach(([placeholder, value]) => {
        result = result.replace(`{${placeholder}}`, String(value));
      });
    }
    
    return result;
  };

  return {
    tf,
    t,
    translations,
    lang,
    isLoading,
  };
}
