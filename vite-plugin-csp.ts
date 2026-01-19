import type { Plugin } from 'vite';

/**
 * Content Security Policy plugin for Vite
 * HTML-ə CSP meta tag əlavə edir
 */
export function viteCspPlugin(): Plugin {
  return {
    name: 'vite-plugin-csp',
    transformIndexHtml(html) {
      // CSP policy
      const cspPolicy = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://sdk.vexvon.com https://cdn.builder.io https://translate.google.com https://translate.googleapis.com https://mc.yandex.ru https://accounts.google.com https://www.google-analytics.com https://translate-pa.googleapis.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.googleapis.com https://www.gstatic.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://admin.brendoo.com https://www.googletagmanager.com https://sdk.vexvon.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.google-analytics.com https://mc.yandex.ru wss://mc.yandex.ru",
        "frame-src 'self' https://www.googletagmanager.com https://translate.google.com https://sdk.vexvon.com",
        "media-src 'self' https://admin.brendoo.com blob: data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://admin.brendoo.com",
        "upgrade-insecure-requests"
      ].join('; ');

      // CSP meta tag-ı əlavə et
      const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="${cspPolicy}">`;

      // Security headers-dən sonra əlavə et
      return html.replace(
        '<!-- Security Headers -->',
        `<!-- Security Headers -->\n    ${cspMetaTag}`
      );
    },
  };
}
