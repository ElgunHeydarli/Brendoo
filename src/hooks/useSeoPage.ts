import { useParams, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export interface SeoPageConfig {
  title: string;
  description: string;
  keywords?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
  price?: string;
  availability?: string;
  brand?: string;
}

/**
 * useSeoPage hook - Hər səhifə üçün SEO məlumatlarını standart qaydada tərəftən
 * Kanonik URL-ni avtomatik olaraq yaradır
 */
export function useSeoPage(config: SeoPageConfig) {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const location = useLocation();

  const canonicalUrl = useMemo(() => {
    const baseUrl = 'https://brendoo.com';
    return `${baseUrl}${location.pathname}`;
  }, [location.pathname]);

  return {
    ...config,
    canonical: canonicalUrl,
    lang,
    url: canonicalUrl,
  };
}

/**
 * Səhifə başlığı və H1 tag-ını sinxronlaşdır
 */
export function usePageH1Title(title: string) {
  return useMemo(() => ({
    pageTitle: title,
    h1Title: title, // H1 həmişə SEO başlığı ilə eyni olmalıdır
  }), [title]);
}
