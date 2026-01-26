/**
 * XSS Protection & Input Sanitization Utilities
 * Təhlükəsiz mətn və HTML təmizləməsi
 */

/**
 * HTML təqlərini və xüsusi simvolları escape edir
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Mətn inputlarını təmizləyir (XSS riski olan simvolları silir)
 */
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') return '';

  // HTML təqlərini və script-ləri sil
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // onclick, onerror və s. sil
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
};

/**
 * Email ünvanlarını doğrulayır
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Telefon nömrəsini doğrulayır (Azərbaycan formatı)
 */
export const isValidPhone = (phone: string): boolean => {
  // +994XX XXX XX XX və ya 0XX XXX XX XX formatı
  const phoneRegex = /^(\+994|0)(50|51|55|70|77|99|10|12)\d{7}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * URL-i doğrulayır və təmizləyir
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';

  // Təhlükəli protokolları blok et
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Yalnız http, https və ya relative URL-lərə icazə ver
  if (!lowerUrl.startsWith('http://') &&
      !lowerUrl.startsWith('https://') &&
      !lowerUrl.startsWith('/') &&
      !lowerUrl.startsWith('#')) {
    return '';
  }

  return url;
};

/**
 * Rəqəmsal inputları doğrulayır
 */
export const sanitizeNumber = (input: string | number, min?: number, max?: number): number | null => {
  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num)) return null;

  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;

  return num;
};

/**
 * Search query-ləri təmizləyir
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';

  return query
    .replace(/[<>\"'`]/g, '') // Təhlükəli simvolları sil
    .replace(/\s+/g, ' ') // Çoxlu boşluqları tək boşluğa çevir
    .trim()
    .slice(0, 200); // Maksimum 200 simvol
};

/**
 * Object key-lərini təmizləyir (prototype pollution qarşısı)
 */
export const sanitizeObjectKeys = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const sanitized: any = {};

  for (const key in obj) {
    // __proto__, constructor və s. təhlükəli key-ləri bloklayır
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (obj.hasOwnProperty(key)) {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};

/**
 * LocalStorage-a yazmazdan əvvəl təmizləyir
 */
export const sanitizeLocalStorageValue = (value: any): string => {
  if (typeof value === 'object') {
    // Object-i JSON-a çevirərkən təhlükəli key-ləri sil
    const sanitized = sanitizeObjectKeys(value);
    return JSON.stringify(sanitized);
  }

  return String(value).slice(0, 10000); // Max 10KB
};

/**
 * SQL Injection riski olan simvolları escape edir
 * (Frontend-də SQL yoxdur, amma API-yə göndəriləcək data üçün)
 */
export const escapeSqlChars = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};
