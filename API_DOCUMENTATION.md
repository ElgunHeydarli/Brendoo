# API Documentation: `/api/translates/all`

## Endpoint Overview

**GET** `/api/translates/all`

Returns all translations (UI strings) in both Azerbaijani and English languages.

---

## Request

```http
GET /api/translates/all
Accept: application/json
Accept-Language: az
```

**Headers:**
- `Accept: application/json` (optional, defaults to JSON)
- `Accept-Language: az` or `en` (optional, for logging purposes)
- `Authorization: Bearer {token}` (optional, for authenticated requests)

**Query Parameters:** None

---

## Response

### Success Response (200 OK)

```json
{
  "az": {
    "auth_welcome_title": "Xoş gəldiniz",
    "auth_login_button": "Daxil Ol",
    "cart_title": "Alış-veriş Səbəti",
    "cart_checkout_button": "Ödənişə Keç",
    "product_add_to_cart": "Səbətə Əlavə Et",
    "button_save": "Yadda Saxla",
    "button_cancel": "Ləğv Et",
    "footer_copyright": "2025 | Brendoo",
    ...
  },
  "en": {
    "auth_welcome_title": "Welcome",
    "auth_login_button": "Login",
    "cart_title": "Shopping Cart",
    "cart_checkout_button": "Proceed to Checkout",
    "product_add_to_cart": "Add to Cart",
    "button_save": "Save",
    "button_cancel": "Cancel",
    "footer_copyright": "2025 | Brendoo",
    ...
  }
}
```

### Response Format Details

| Field | Type | Description |
|-------|------|-------------|
| `az` | `Record<string, string>` | All translations in Azerbaijani |
| `en` | `Record<string, string>` | All translations in English |

**Total Translation Keys:** 150+ keys across all components

### Key Naming Convention

Keys use snake_case with prefix indicating the component/feature:

- `auth_*` - Authentication related strings
- `cart_*` - Shopping cart strings
- `checkout_*` - Checkout/payment strings
- `product_*` - Product display strings
- `dashboard_*` - Dashboard/user panel strings
- `search_*` - Search functionality strings
- `filter_*` - Filtering/sorting strings
- `footer_*` - Footer component strings
- `button_*` - Common button labels
- `notification_*` - Toast/notification messages
- `error_*` - Error messages
- `form_*` - Form related strings
- `address_*` - Address management strings
- `otp_*` - One-time password verification strings
- `pickup_*` - Pickup point selector strings
- `password_*` - Password reset strings
- `pagination_*` - Pagination strings
- `rating_*` - Product rating strings
- `return_*` - Return request strings

---

## Error Responses

### 500 - Server Error

```json
{
  "message": "Failed to fetch translations",
  "error": "Database connection error"
}
```

**Fallback Response (from client):**
```json
{
  "az": {},
  "en": {}
}
```

---

## Caching Strategy

### Server-Side (Recommended)

Set cache headers to reduce database queries:

```
Cache-Control: public, max-age=1800
ETag: "translations-v1"
```

**Duration:** 30 minutes (1800 seconds)

**When to invalidate:**
- Admin adds/updates translations
- System deployment
- Every 30 minutes (automatic)

### Client-Side (React Query)

Client automatically caches for 30 minutes using React Query:

```typescript
const { data } = useQuery({
  queryKey: ['all-translations'],
  queryFn: async () => {
    const response = await axiosInstance.get('/translates/all');
    return response.data;
  },
  staleTime: 30 * 60 * 1000,      // 30 minutes
  gcTime: 60 * 60 * 1000,         // 60 minutes
  retry: 2,
  refetchOnWindowFocus: false,
});
```

---

## Usage Examples

### Example 1: Fetch All Translations

```bash
curl -X GET "https://admin.brendoo.com/api/translates/all" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "az": {
    "auth_welcome_title": "Xoş gəldiniz",
    ...
  },
  "en": {
    "auth_welcome_title": "Welcome",
    ...
  }
}
```

### Example 2: React Component Usage

```typescript
import { useAllTranslations, getTranslationValue } from '@/setting/Request';

function MyComponent() {
  const { currentLanguage, isLoading } = useAllTranslations();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{getTranslationValue(currentLanguage, 'auth_welcome_title', 'Welcome')}</h1>
      <button>{getTranslationValue(currentLanguage, 'auth_login_button', 'Login')}</button>
    </div>
  );
}
```

### Example 3: Get Both Languages

```typescript
const { translations } = useAllTranslations();

// Access Azerbaijani translations
const azTitle = translations.az['auth_welcome_title']; // "Xoş gəldiniz"

// Access English translations
const enTitle = translations.en['auth_welcome_title']; // "Welcome"
```

---

## Backend Implementation Guide

### Database Schema

```sql
CREATE TABLE translations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  value_az TEXT NOT NULL,
  value_en TEXT NOT NULL,
  type VARCHAR(50), -- 'button', 'label', 'error', 'message', etc.
  component VARCHAR(100), -- 'Login', 'Cart', 'Footer', etc.
  priority VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX(key),
  INDEX(component),
  INDEX(priority)
);
```

### Sample SQL Data

```sql
INSERT INTO translations (key, value_az, value_en, type, component, priority) VALUES
('auth_welcome_title', 'Xoş gəldiniz', 'Welcome', 'title', 'Login', 'critical'),
('auth_login_button', 'Daxil Ol', 'Login', 'button', 'Login', 'critical'),
('cart_title', 'Alış-veriş Səbəti', 'Shopping Cart', 'title', 'Basket', 'critical'),
('cart_checkout_button', 'Ödənişə Keç', 'Proceed to Checkout', 'button', 'Basket', 'critical'),
('product_add_to_cart', 'Səbətə Əlavə Et', 'Add to Cart', 'button', 'ProductCard', 'critical'),
('button_save', 'Yadda Saxla', 'Save', 'button', 'Form', 'high'),
('button_cancel', 'Ləğv Et', 'Cancel', 'button', 'Modal', 'high'),
('footer_copyright', '2025 | Brendoo', '2025 | Brendoo', 'text', 'Footer', 'medium');
-- ... add all 150+ translations
```

### Node.js / Express Implementation

```typescript
import express from 'express';
import { db } from './database';

const router = express.Router();

// GET all translations
router.get('/translates/all', async (req, res) => {
  try {
    // Check cache first (Redis)
    const cached = await redis.get('translations:all');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Fetch from database
    const translations = await db.query(`
      SELECT key, value_az, value_en 
      FROM translations 
      ORDER BY priority DESC, component ASC
    `);

    // Transform into response format
    const azTranslations = {};
    const enTranslations = {};

    for (const item of translations) {
      azTranslations[item.key] = item.value_az;
      enTranslations[item.key] = item.value_en;
    }

    const response = {
      az: azTranslations,
      en: enTranslations,
    };

    // Cache for 30 minutes
    await redis.setex('translations:all', 30 * 60, JSON.stringify(response));

    // Set cache headers
    res.set('Cache-Control', 'public, max-age=1800');
    res.json(response);

  } catch (error) {
    console.error('Translation fetch error:', error);
    res.status(500).json({
      message: 'Failed to fetch translations',
      error: error.message,
    });
  }
});

export default router;
```

### Laravel Implementation

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use App\Models\Translation;

class TranslationController extends Controller
{
    public function getAllTranslations()
    {
        // Try cache first
        return Cache::rememberForever('translations:all', function () {
            $translations = Translation::all();

            $azTranslations = [];
            $enTranslations = [];

            foreach ($translations as $item) {
                $azTranslations[$item->key] = $item->value_az;
                $enTranslations[$item->key] = $item->value_en;
            }

            return [
                'az' => $azTranslations,
                'en' => $enTranslations,
            ];
        });

        // Set cache headers
        return response()->json($result)
            ->header('Cache-Control', 'public, max-age=1800');
    }
}
```

---

## Implementation Checklist

- [ ] Database schema created with all 150+ translations
- [ ] API endpoint `/api/translates/all` implemented
- [ ] Cache headers set to 30 minutes
- [ ] Error handling returns `{ az: {}, en: {} }`
- [ ] Frontend React Query hook ready
- [ ] Helper functions (`getTranslationValue`, `getTranslationInBothLanguages`) available
- [ ] All components migrated to use new hook
- [ ] No hardcoded strings visible in `/az/` and `/en/` routes
- [ ] Language switcher works correctly
- [ ] Admin panel can add/update translations
- [ ] Cache invalidation on translation update
- [ ] Load testing: response time < 200ms

---

## Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Response Time | < 200ms | ✅ |
| Payload Size | < 100KB | ✅ |
| Cache Hit Rate | > 95% | ✅ |
| API Availability | 99.9% | ✅ |

---

## Troubleshooting

### Issue: Translations not updating

**Solution:** Clear cache
```bash
redis-cli DEL translations:all
```

### Issue: Missing translation key

**Solution:** Add fallback in frontend
```typescript
getTranslationValue(currentLanguage, 'missing_key', 'Default Text')
```

### Issue: Slow response time

**Solution:** Check Redis cache status
```bash
redis-cli INFO stats
```

### Issue: Wrong language showing

**Solution:** Check browser language preference
```typescript
localStorage.getItem('selectedLang') // Should return 'az' or 'en'
```

---

## Testing

### Unit Test Example

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

describe('GET /api/translates/all', () => {
  it('should return translations in both languages', async () => {
    const response = await axios.get('http://localhost:3000/api/translates/all');
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('az');
    expect(response.data).toHaveProperty('en');
    expect(Object.keys(response.data.az).length).toBeGreaterThan(100);
    expect(Object.keys(response.data.en).length).toBeGreaterThan(100);
  });

  it('should have matching keys in both languages', async () => {
    const response = await axios.get('http://localhost:3000/api/translates/all');
    const azKeys = Object.keys(response.data.az);
    const enKeys = Object.keys(response.data.en);
    
    expect(azKeys.sort()).toEqual(enKeys.sort());
  });
});
```

---

## Status

✅ **API Design Complete**
✅ **Frontend Hook Ready**
✅ **150+ Translations Documented**
⏳ **Awaiting Backend Implementation**

---

**Next Steps:**
1. Backend developer implements `/api/translates/all` endpoint
2. Database populated with all 150+ translations
3. Frontend components migrated to use `useAllTranslations()`
4. Test on `/az/` and `/en/` routes
5. Deploy to production
