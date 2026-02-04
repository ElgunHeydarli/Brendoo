# 🔐 Təhlükəsizlik Quraşdırılması

Bu layihə üçün təhlükəsizlik tədbirlərini aktivləşdirmək üçün aşağıdakı addımları izləyin.

## 1️⃣ Environment Variables Quraşdırması

### Development üçün:

1. `.env.example` faylını `.env` olaraq kopyalayın:
   ```bash
   cp .env.example .env
   ```

2. `.env` faylında API key-ləri doldurun:
   ```env
   VITE_API_BASE_URL=https://admin.brendoo.com/api
   VITE_GTM_ID=GTM-KSMWQQB2
   VITE_VEXVON_API_KEY=2ae5ca60-7d96-4a60-9912-863876db0c49
   VITE_BUILDER_API_KEY=2d5d82cf417847beb8cd2fbbc5e3c099
   VITE_ENV=development
   ```

### Production üçün:

Production environment-də `.env.production` faylı yaradın:

```env
VITE_API_BASE_URL=https://admin.brendoo.com/api
VITE_GTM_ID=GTM-KSMWQQB2
VITE_VEXVON_API_KEY=your-production-api-key
VITE_BUILDER_API_KEY=your-production-builder-key
VITE_ENV=production
```

⚠️ **VACIB:** Production key-lərini heç vaxt Git-ə commit etməyin!

## 2️⃣ Dependencies Quraşdırması

```bash
npm install
```

## 3️⃣ Build və Test

### Development mode:
```bash
npm run dev
```

### Production build:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## 4️⃣ Təhlükəsizlik Yoxlaması

### Rate Limiting Test:

Browser console-da:
```javascript
// 100+ sorğu göndərin və rate limit xətası almalısınız
for(let i=0; i<150; i++) {
  fetch('https://admin.brendoo.com/api/products');
}
```

### XSS Protection Test:

Formlara aşağıdakı məlumatı daxil edin:
```html
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
```

Heç bir alert görünməməlidir - input təmizlənməlidir.

### CSP Test:

1. Browser-in Developer Tools-unu açın (F12)
2. Console tab-ına gedin
3. CSP violation xətaları olmamalıdır
4. Yalnız icazə verilmiş mənbələrdən yüklənməlidir

## 5️⃣ Production Deployment

### Nginx konfiqurasiyası:

`/etc/nginx/sites-available/brendoo.com`:

```nginx
server {
    listen 443 ssl http2;
    server_name brendoo.com www.brendoo.com;

    # SSL sertifikatları
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://sdk.vexvon.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://admin.brendoo.com;" always;

    # HTTP -> HTTPS redirect
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    root /var/www/brendoo/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name brendoo.com www.brendoo.com;
    return 301 https://$server_name$request_uri;
}
```

### CloudFlare konfiqurasiyası (tövsiyə olunur):

1. CloudFlare-ə domain əlavə edin
2. SSL/TLS Mode: **Full (strict)**
3. Security Level: **Medium** və ya **High**
4. Firewall rules:
   - Block known bots
   - Challenge suspicious IPs
   - Rate limit API calls

## 6️⃣ Mütəmadi Yoxlamalar

### Həftəlik:
- [ ] Error log-larını yoxlayın
- [ ] Şübhəli istifadəçi davranışlarını monitorinq edin
- [ ] Rate limit log-larını təhlil edin

### Aylıq:
- [ ] Dependencies-ləri yeniləyin (`npm audit` çalışdırın)
- [ ] SSL sertifikatının vaxtını yoxlayın
- [ ] Security audit aparın

### Rüblük:
- [ ] Penetration testing aparın
- [ ] Backup strategiyanı yoxlayın
- [ ] Disaster recovery planı test edin

## 🆘 Problem Həlli

### Environment variables işləmir:

**Problem:** `import.meta.env.VITE_XXX` undefined qaytarır

**Həll:**
1. `.env` faylının layihənin root qovluğunda olduğunu yoxlayın
2. Bütün environment variable adları `VITE_` ilə başlamalıdır
3. Server-i restart edin (`npm run dev`)

### Rate limiting çox tez aktivləşir:

**Problem:** Normal istifadədə rate limit xətası alırsınız

**Həll:**
`src/utils/rateLimiter.ts` faylında limitləri artırın:
```typescript
export const globalRateLimiter = new RateLimiter({
  maxRequests: 200, // 100-dən 200-ə artırın
  timeWindow: 60000,
});
```

### CSP xətaları:

**Problem:** Console-da CSP violation xətaları görünür

**Həll:**
`vite-plugin-csp.ts` faylında CSP policy-ə yeni mənbələr əlavə edin:
```typescript
"script-src 'self' 'unsafe-inline' https://new-domain.com"
```

### XSS protection çox aqressiv:

**Problem:** Legitim HTML content bloklayır

**Həll:**
Müəyyən field-lər üçün HTML-ə icazə vermək lazımdırsa, yalnız o field-lərdə `sanitizeText` istifadə etməyin. Amma bu təhlükəlidir! Mümkünsə, backend-də HTML təmizləmə işlətməyin.

## 📞 Əlaqə

Təhlükəsizlik problemləri və ya suallar üçün:
- Email: security@brendoo.com
- Slack: #security-team

---

✅ Bütün addımları tamamladınız? Artıq layihəniz təhlükəsizdir!
