# 🔒 Brendoo Frontend Security Documentation

Bu sənəd Brendoo frontend-də tətbiq edilmiş təhlükəsizlik tədbirlərini izah edir.

## 📋 Təhlükəsizlik Tədbirləri

### 1. Security Headers (HTTP Başlıqları)

**Fayl:** `index.html`

Aşağıdakı security headers əlavə edilmişdir:

- **X-Content-Type-Options: nosniff** - MIME type sniffing hücumlarının qarşısını alır
- **X-Frame-Options: DENY** - Clickjacking hücumlarından qoruyur (iframe-də açılmasının qarşısını alır)
- **X-XSS-Protection: 1; mode=block** - Built-in XSS filterlərini aktivləşdirir
- **Referrer-Policy: strict-origin-when-cross-origin** - Referrer məlumatlarını məhdudlaşdırır
- **Permissions-Policy** - Geolocation, microphone, camera kimi xüsusiyyətləri deaktiv edir

### 2. XSS (Cross-Site Scripting) Protection

**Fayl:** `src/utils/sanitize.ts`

XSS hücumlarından qorunmaq üçün input təmizləmə funksiyaları:

#### İstifadə nümunəsi:
```typescript
import { sanitizeText, sanitizeSearchQuery, escapeHtml } from '../utils/sanitize';

// Mətn inputunu təmizləmək
const cleanText = sanitizeText(userInput);

// Axtarış query-sini təmizləmək
const cleanQuery = sanitizeSearchQuery(searchInput);

// HTML simvollarını escape etmək
const safeHtml = escapeHtml(userContent);
```

#### Mövcud funksiyalar:
- `escapeHtml()` - HTML təqlərini escape edir
- `sanitizeText()` - Script, iframe, object təqlərini və event handler-ləri silir
- `sanitizeSearchQuery()` - Axtarış inputlarını təmizləyir
- `sanitizeUrl()` - Təhlükəli protokolları (javascript:, data:) bloklayır
- `sanitizeNumber()` - Rəqəmləri validate edir
- `isValidEmail()` - Email formatını yoxlayır
- `isValidPhone()` - Telefon nömrəsini yoxlayır (AZ formatı)
- `sanitizeObjectKeys()` - Prototype pollution-dan qoruyur
- `sanitizeLocalStorageValue()` - LocalStorage-a təhlükəsiz yazılış

### 3. Environment Variables (Mühit Dəyişənləri)

**Fayllar:** `.env`, `.env.example`, `.gitignore`

Həssas məlumatlar (API keys, endpoint-lər) environment variable-larda saxlanılır:

```env
VITE_API_BASE_URL=https://admin.brendoo.com/api
VITE_GTM_ID=GTM-XXXXXXXX
VITE_VEXVON_API_KEY=your-api-key-here
VITE_BUILDER_API_KEY=your-builder-io-api-key
```

⚠️ **Vacib:** `.env` faylı `.gitignore`-dadır və Git-ə commit olunmur!

#### İstifadə:
```typescript
// Request.ts
baseURL: import.meta.env.VITE_API_BASE_URL

// index.html
apiKey: "%VITE_VEXVON_API_KEY%"
```

### 4. Rate Limiting (Sorğu Məhdudlaşdırması)

**Fayl:** `src/utils/rateLimiter.ts`

API sorğularını məhdudlaşdırmaq və DDoS hücumlarının qarşısını almaq üçün:

#### İstifadə nümunəsi:
```typescript
import { globalRateLimiter, authRateLimiter } from '../utils/rateLimiter';

// Ümumi sorğular üçün (100 sorğu / dəqiqə)
if (!globalRateLimiter.canMakeRequest('/api/products')) {
  console.error('Too many requests');
}

// Auth əməliyyatları üçün (5 sorğu / dəqiqə)
if (!authRateLimiter.canMakeRequest('/api/login')) {
  console.error('Too many login attempts');
}
```

#### Konfiqurasiya:
- **Global Limit:** 100 sorğu / 1 dəqiqə
- **Auth Limit:** 5 sorğu / 1 dəqiqə (login, register, password reset)

#### Mövcud funksiyalar:
- `canMakeRequest(endpoint)` - Sorğuya icazə verilir?
- `getTimeUntilReset(endpoint)` - Limitə nə qədər vaxt qalıb?
- `getRemainingRequests(endpoint)` - Qalan sorğu sayı
- `throttle(func, delay)` - Funksiyanı throttle edir
- `debounce(func, delay)` - Funksiyanı debounce edir

### 5. Input Validation (Input Yoxlanması)

**Fayl:** `src/hooks/useFormValidation.ts`

Form inputlarını validate və təmizləmək üçün custom hook:

#### İstifadə nümunəsi:
```typescript
import { useFormValidation } from '../hooks/useFormValidation';

const MyForm = () => {
  const { errors, validateForm, sanitizeFormData } = useFormValidation({
    email: {
      rules: ['required', 'email'],
    },
    phone: {
      rules: ['required', 'phone'],
    },
    age: {
      rules: ['number'],
      min: 18,
      max: 120,
    },
  });

  const handleSubmit = (formData) => {
    if (validateForm(formData)) {
      const cleanData = sanitizeFormData(formData);
      // API-yə göndər
    }
  };

  return (
    <form>
      <input type="email" />
      {errors.email && <span>{errors.email}</span>}
    </form>
  );
};
```

#### Dəstəklənən validation qaydaları:
- `required` - Mütləq doldurulmalı
- `email` - Email formatı
- `phone` - Telefon formatı (AZ)
- `url` - URL formatı
- `number` - Rəqəm
- `text` - Ümumi mətn (XSS təmizləmə ilə)
- `search` - Axtarış query

### 6. Content Security Policy (CSP)

**Fayl:** `vite-plugin-csp.ts`

CSP header-ləri vasitəsilə icazə verilən mənbələri məhdudlaşdırır:

#### Konfigurasiya:
```
default-src 'self'
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://sdk.vexvon.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: https: blob:
connect-src 'self' https://admin.brendoo.com
frame-ancestors 'none'
upgrade-insecure-requests
```

Bu policy:
- Yalnız icazə verilmiş mənbələrdən script yükləməyə icazə verir
- Iframe-də açılmasının qarşısını alır
- HTTP sorğularını HTTPS-ə yönləndirir

### 7. HTTPS-only Connections

Bütün API sorğuları və xarici mənbələr HTTPS protokolu ilə işləyir.

## 🛡️ Əlavə Tövsiyələr

### Backend tərəfində:

1. **CORS Policy** - Yalnız brendoo.com domain-inə icazə verin
2. **Rate Limiting** - API endpoint-lərində server-side rate limiting
3. **JWT Token Expiry** - Token-lərin vaxtını məhdudlaşdırın
4. **SQL Injection Protection** - Prepared statements istifadə edin
5. **Input Validation** - Backend-də də inputları validate edin

### Production deployment:

1. **HTTPS Certificate** - SSL sertifikatı quraşdırın
2. **Security Headers** - Nginx/Apache-də HTTP headers konfiqurasiya edin
3. **DDoS Protection** - CloudFlare və ya oxşar xidmət istifadə edin
4. **Regular Updates** - Asılılıqları mütəmadi yeniləyin
5. **Security Audit** - Mütəmadi security audit aparın

## 🔍 Yoxlama

Təhlükəsizlik tədbirlərini yoxlamaq üçün:

1. **XSS Test:**
   ```javascript
   // Formlara bu inputu daxil edin və XSS-in block olunduğunu yoxlayın
   <script>alert('XSS')</script>
   ```

2. **Rate Limiting Test:**
   - Bir endpoint-ə 100-dən çox sorğu göndərin
   - Rate limit xətası almalısınız

3. **CSP Test:**
   - Browser console-da CSP violation xətalarını yoxlayın
   - Yalnız icazə verilmiş mənbələrdən yüklənməlidir

4. **Environment Variables:**
   - API key-lərin kod bazasında hardcoded olmamasını yoxlayın
   - `.env` faylının Git-də olmamasını təsdiqləyin

## 📚 Əlavə Resurslar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## 🚨 Təhlükəsizlik Problemi Tapdınız?

Təhlükəsizlik problemi aşkar etsəniz, zəhmət olmasa dərhal development komandasına məlumat verin.

---

**Son yenilənmə:** 2026-01-15
**Versiya:** 1.0.0
