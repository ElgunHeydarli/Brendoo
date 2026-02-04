# Translation Hook Usage Examples

## Overview
Frontend artıq `/api/translates/all` endpoint-indən bütün tərcümələri ala bilər həm Azərbaycan, həm də İngilis dilində.

**Response Format:**
```json
{
  "az": { 
    "cart_title": "Səbət", 
    "checkout_title": "Sifariş",
    "button_save": "Yadda Saxla",
    ...
  },
  "en": { 
    "cart_title": "Cart", 
    "checkout_title": "Checkout",
    "button_save": "Save",
    ...
  }
}
```

---

## 1. Basic Usage - Current Language Translations

**useAllTranslations() Hook:**

```tsx
import { useAllTranslations, getTranslationValue } from '@/setting/Request';

function MyComponent() {
  const { currentLanguage, isLoading } = useAllTranslations();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{getTranslationValue(currentLanguage, 'cart_title', 'Cart')}</h1>
      <button>{getTranslationValue(currentLanguage, 'button_save', 'Save')}</button>
    </div>
  );
}
```

**Output:**
- `/az/` route-da: "Səbət", "Yadda Saxla"
- `/en/` route-da: "Cart", "Save"

---

## 2. Both Languages at Once

**Həm az, həm en dillərindən mətnləri birlikdə almaq:**

```tsx
import { useAllTranslations, getTranslationInBothLanguages } from '@/setting/Request';

function LanguageSwitcherPreview() {
  const { translations } = useAllTranslations();
  const { az, en } = getTranslationInBothLanguages(translations, 'cart_title');

  return (
    <div>
      <div>Azərbaycan: {az}</div>
      <div>English: {en}</div>
    </div>
  );
}
```

**Output:**
```
Azərbaycan: Səbət
English: Cart
```

---

## 3. Full Access to All Translations

**Hər iki dil üçün tam mətnlərə daxil olmaq:**

```tsx
import { useAllTranslations } from '@/setting/Request';

function AdminPanel() {
  const { translations, lang } = useAllTranslations();

  // translations.az -> bütün az tərcümələr
  // translations.en -> bütün en tərcümələr
  
  return (
    <div>
      <h2>Current Language: {lang}</h2>
      <ul>
        {Object.entries(translations[lang]).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. Safe Fallback Usage

**Əgər key yoxdursa, fallback istifadə etmək:**

```tsx
import { useAllTranslations, getTranslationValue } from '@/setting/Request';

function Form() {
  const { currentLanguage } = useAllTranslations();

  return (
    <input
      placeholder={getTranslationValue(
        currentLanguage,
        'search_placeholder',
        'Search...' // Fallback əgər key yoxdursa
      )}
    />
  );
}
```

---

## 5. Replace Old Translation Pattern

**Əvvəlki pattern (silinəcək):**
```tsx
// ❌ OLD - Hardcoded fallback
const { tarnslation } = GETRequest('/translates', 'translates', [lang]);
return <div>{tarnslation?.cart_title || 'Cart'}</div>;
```

**Yeni pattern:**
```tsx
// ✅ NEW - Dynamic from API
import { useAllTranslations, getTranslationValue } from '@/setting/Request';

function CartComponent() {
  const { currentLanguage } = useAllTranslations();
  return <div>{getTranslationValue(currentLanguage, 'cart_title', 'Cart')}</div>;
}
```

---

## 6. Component Implementation Example

**Complete Cart Component:**

```tsx
import React from 'react';
import { useAllTranslations, getTranslationValue } from '@/setting/Request';

export function Cart() {
  const { currentLanguage, isLoading } = useAllTranslations();

  if (isLoading) return <div>Loading cart...</div>;

  return (
    <div className="cart">
      <h1>{getTranslationValue(currentLanguage, 'cart_title', 'Shopping Cart')}</h1>
      
      <div className="cart-summary">
        <div>
          <span>{getTranslationValue(currentLanguage, 'cart_subtotal', 'Subtotal')}:</span>
          <span>$100.00</span>
        </div>
        <div>
          <span>{getTranslationValue(currentLanguage, 'cart_shipping', 'Shipping')}:</span>
          <span>$10.00</span>
        </div>
        <div>
          <span>{getTranslationValue(currentLanguage, 'cart_total', 'Total')}:</span>
          <span>$110.00</span>
        </div>
      </div>

      <button>
        {getTranslationValue(currentLanguage, 'cart_checkout_button', 'Proceed to Checkout')}
      </button>
    </div>
  );
}
```

---

## 7. Available Helper Functions

### `getTranslationValue(translations, key, fallback?)`
Mətn key-i ilə translation almaq

```typescript
getTranslationValue(currentLanguage, 'cart_title', 'Cart')
// Returns: Azərbaycan'da "Səbət", English'də "Cart"
```

### `getTranslationInBothLanguages(allTranslations, key)`
Hər iki dildən mətn almaq

```typescript
const { az, en } = getTranslationInBothLanguages(translations, 'cart_title');
// Returns: { az: "Səbət", en: "Cart" }
```

### `useAllTranslations()`
Hook - bütün tərcümələri əldə etmək

```typescript
const {
  translations,      // { az: {...}, en: {...} }
  currentLanguage,   // Current language translations only
  isLoading,         // Loading state
  isError,           // Error state
  refetch,           // Refetch function
  lang               // Current language code ('az' or 'en')
} = useAllTranslations();
```

---

## 8. Performance Considerations

✅ **Cache davamsız**: 30 dəqiqə
- Komponenti rerender ediləndə API yenidən çağrılmır
- 30 dəqiqə sonra otomatik refresh olur

✅ **Minimal payload**: Yalnız dəfə bir GET request
- Bütün tərcümələr bir sefərdə gəlir
- Sonra localStorage cachesinə saxlanılır

✅ **Optimized for React Query**: 
- Deduplication: Eyni query-ləri birləşdirir
- Background refetch: Səhifə boş olanda təzələnir

---

## 9. Testing

**Test faylı nümunəsi:**

```tsx
import { renderHook } from '@testing-library/react';
import { useAllTranslations } from '@/setting/Request';

test('useAllTranslations returns translations', () => {
  const { result } = renderHook(() => useAllTranslations());
  
  expect(result.current.translations).toBeDefined();
  expect(result.current.currentLanguage).toBeDefined();
  expect(result.current.lang).toBe('az' || 'en');
});
```

---

## 10. Migration Checklist

- [ ] `/api/translates/all` endpoint istifadə hazır?
- [ ] `useAllTranslations()` hook istifadəsi anlaşıldı?
- [ ] Helper functions (`getTranslationValue`, `getTranslationInBothLanguages`) hazır?
- [ ] Bütün komponnetləri yeni pattern-ə köçürmək?
- [ ] Eslint/TypeScript warnings yoxdur?
- [ ] Bütün dil parametrləri test edildi (/az/, /en/)?
- [ ] Performance acceptable (cache, network requests)?

---

## 11. API Integration Checklist

Backend `/api/translates/all` endpoint-i:

✅ **Must return format:**
```json
{
  "az": {
    "auth_welcome_title": "Xoş gəldiniz",
    "auth_login_button": "Daxil Ol",
    ...
  },
  "en": {
    "auth_welcome_title": "Welcome",
    "auth_login_button": "Login",
    ...
  }
}
```

✅ **Should include all 150+ keys from TRANSLATION_STRINGS.json**

✅ **Caching strategy:**
- Set `Cache-Control: public, max-age=1800` (30 min)
- Or let React Query handle it (default: 30 min staleTime)

✅ **Error handling:**
- Fallback to empty object `{ az: {}, en: {} }`
- Console error logged
- Component shows default text

---

## Questions?

- **Hansı component-də istifadə etməliyəm?** 
  → Hər yerdə user-facing text var, orda istifadə et

- **Əski `tarnslation?.key` nə olacaq?**
  → Yavaş-yavaş yeni pattern-ə köçürt

- **Key yoxdursa nə olur?**
  → Fallback text istifadə olunur

---

**Status**: ✅ Ready to use!
