/**
 * Translation System Guide (Çeviri Sistemi)
 * 
 * Backend'dən `/translates` endpoint'i çağırılır
 * Hər dil üçün fərqli çevirimlər alınır (az, en, etc)
 */

// 1. Hooks istifadə etməyi
// ========================
// 
// import { useTranslation, useFormattedTranslation } from '../hooks/useTranslation';
//
// function MyComponent() {
//   const { t, lang } = useTranslation();
//   
//   return (
//     <h1>{t('Ana_səhifə')}</h1>  // "Home" (en) yada "Ana səhifə" (az)
//   );
// }

// 2. GETRequest istifadə etməyi
// ============================
//
// import GETRequest from '../setting/Request';
// import { TranslationsKeys } from '../setting/Types';
// import { useParams } from 'react-router-dom';
//
// function MyComponent() {
//   const { lang } = useParams();
//   const { data: t } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);
//   
//   return <h1>{t?.Ana_səhifə}</h1>;
// }

// 3. Placeholder desteği
// =====================
//
// const { tf } = useFormattedTranslation();
// tf('Salam_{name}', { name: 'Elgun' }); // "Salam_Elgun"

// 4. Backend'dən Çeviri Formatı
// ============================
// Response:
// {
//   "data": {
//     "Ana_səhifə": "Home",
//     "Məhsullar": "Products",
//     "Haqqımızda": "About Us",
//     "Əlaqə": "Contact",
//     ...
//   }
// }

export const TRANSLATION_KEYS = {
  // Header
  ANA_SEHIFE: 'Ana_səhifə',
  MEHSULLAR: 'Məhsullar',
  HAQQIMIZDA: 'Haqqımızda',
  ELAQE: 'Əlaqə',
  
  // Common
  AXTARIS: 'Axtarış',
  FILTER: 'Filter',
  SIFARIS_ET: 'Sifariş Et',
  SEBETE_LAVE_ET: 'Səbətə Əlavə Et',
  
  // Sidebar
  KATEGORIYALAR: 'Kateqoriyalar',
  ENDIRIMLI_MEHSULLAR: 'Endirimli məhsullar',
  COX_SATILAN: 'Çox satılan',
  STOKDA_AZ: 'Stokda az olan',
  ULDUZLU_MEHSULLAR: '5 ulduzlu',
  
  // Navigation
  QAYTARMA_QAYDALARI: 'Qaytarma qaydaları',
  CHATDIRMA_QAYDALARI: 'Çatdırılma qaydaları',
  ISTIFADECI_QAYDALARI: 'İstifadəçi qaydaları',
} as const;

export type TranslationKey = typeof TRANSLATION_KEYS[keyof typeof TRANSLATION_KEYS];
