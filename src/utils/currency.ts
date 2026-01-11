// src/utils/currency.ts

export const CURRENCY = {
  symbol: '₼',
  code: 'AZN',
  name: 'Manat',
} as const;

/**
 * Qiyməti formatla
 * @param price - Qiymət (number və ya string)
 * @param showSymbol - Valyuta simvolunu göstər (default: true)
 * @returns Formatlanmış qiymət: "123.45 ₼"
 */
export const formatPrice = (price: number | string | undefined | null, showSymbol = true): string => {
  const num = Number(price || 0);
  const formatted = num.toFixed(2);
  return showSymbol ? `${formatted} ${CURRENCY.symbol}` : formatted;
};

/**
 * Endirimli qiyməti hesabla
 * @param price - Əsas qiymət
 * @param discount - Endirim faizi
 * @returns Endirimli qiymət
 */
export const calculateDiscountedPrice = (price: number | string, discount: number | string): number => {
  const p = Number(price || 0);
  const d = Number(discount || 0);
  return p - (p * d / 100);
};

/**
 * Qiymət aralığını formatla
 * @param minPrice - Minimum qiymət
 * @param maxPrice - Maximum qiymət
 * @returns "123.45 - 456.78 ₼"
 */
export const formatPriceRange = (minPrice: number | string, maxPrice: number | string): string => {
  const min = Number(minPrice || 0).toFixed(2);
  const max = Number(maxPrice || 0).toFixed(2);
  return `${min} - ${max} ${CURRENCY.symbol}`;
};
