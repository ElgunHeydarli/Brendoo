# Complete Static Text Strings Inventory for Admin Panel

This document contains ALL hardcoded text strings from the codebase that need to be managed through the admin panel translation system.

## Format for Admin Panel Import

Each string should be added to the backend with:
- **Key**: Unique translation key identifier
- **English**: English text
- **Azərbaycan**: Azerbaijani text
- **Type**: Category of string (button, label, error, placeholder, message, title)
- **Component**: Which React component uses it
- **Notes**: Additional context

---

## 1. AUTHENTICATION PAGES (login.tsx, register.tsx)

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| auth_welcome_title | Welcome | Xoş gəldiniz | title | Login | Login page main heading |
| auth_welcome_desc | Please login to your account | Hesabınıza daxil olun | description | Login | Login subtitle |
| auth_or | OR | VƏ YA | label | Login/Register | Divider text |
| auth_user_type | User | İstifadəçi | label | Login | User type option |
| auth_influencer_type | Influencer | Influencer | label | Login | Influencer type option |
| auth_email_label | Email | Email | label | Login/Register | Email field |
| auth_password_label | Password | Şifrə | label | Login/Register | Password field |
| auth_forgot_password | Forgot password? | Şifrəni unutdunuz? | link | Login | Forgot password link |
| auth_login_button | Login | Daxil Ol | button | Login | Login submit button |
| auth_no_account | Don't have an account? | Hesabınız yoxdur? | text | Login | Login to register prompt |
| auth_register_button | Register | Qeydiyyat Ol | button | Login/Register | Register button |
| auth_register_title | Create Your Account | Hesab Yaradın | title | Register | Register page title |
| auth_register_desc | Join us today | Bizə bu gün qoşulun | description | Register | Register subtitle |
| auth_email_invalid | Please enter a valid email | Düzgün email daxil edin | error | Register | Email validation error |
| auth_email_required | Email is required | Email tələb olunur | error | Register | Email required error |
| auth_password_required | Password is required | Şifrə tələb olunur | error | Register | Password required error |
| auth_password_min | Password must be at least 6 characters | Şifrə minimum 6 simvol olmalıdır | error | Register | Password length validation |
| auth_name_required | Name is required | Ad tələb olunur | error | Register | Name required error |
| auth_phone_required | Phone number is required | Telefon nömrəsi tələb olunur | error | Register | Phone required error |
| auth_phone_invalid | Phone must be 9 digits | Telefon nömrəsi 9 rəqəm olmalıdır | error | Register | Phone format validation |
| auth_fin_code_required | FIN code is required | FIN kod tələb olunur | error | Register | FIN code required |
| auth_fin_code_invalid | FIN code must be 7 characters | FIN kod 7 simvol olmalıdır | error | Register | FIN code format |
| auth_gender_required | Gender is required | Cins tələb olunur | error | Register | Gender required |
| auth_birthday_required | Date of birth is required | Doğum tarixi tələb olunur | error | Register | Birthday required |
| auth_terms_required | You must accept the terms | Şərtləri qəbul etməlisiniz | error | Register | Terms acceptance |
| auth_gender_male | Male | Erkək | label | Register | Male gender option |
| auth_gender_female | Female | Qadın | label | Register | Female gender option |
| auth_login_success | Login successful | Giriş uğurlu oldu | message | Login | Success notification |
| auth_register_success | Registration completed successfully | Qeydiyyat uğurla tamamlandı | message | Register | Success notification |
| auth_loading | Loading... | Yüklənir... | label | Login | Loading state |

---

## 2. FOOTER COMPONENT (src/components/Footer/index.tsx)

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| footer_latest_offers | Latest offers | Ən son təkliflər | title | Footer | Newsletter section |
| footer_subscribe_button | Subscribe | Abunə ol | button | Footer | Newsletter subscribe button |
| footer_subscribing | Subscribing... | Abunə olunur... | label | Footer | Subscribe loading state |
| footer_copyright | 2025 \| Brendoo | 2025 \| Brendoo | text | Footer | Copyright text |
| footer_have_question | Any questions? | Sualınız var? | title | Footer | Contact form section |
| footer_name_label | Name and surname | Ad və soyad | label | Footer | Contact form field |
| footer_phone_label | Phone number | Telefon nömrəsi | placeholder | Footer | Contact form field |
| footer_email_label | Email | Email | label | Footer | Contact form field |
| footer_message_label | Message | Mesaj | placeholder | Footer | Contact form textarea |
| footer_send_button | Send | Göndər | button | Footer | Contact form submit |
| footer_sending | Sending... | Göndərilir... | label | Footer | Send loading state |
| footer_contact_success | Message sent successfully | Mesaj uğurla göndərildi | message | Footer | Success notification |
| footer_contact_error | Error sending message | Mesaj göndərilərkən xəta | error | Footer | Error notification |

---

## 3. CART & CHECKOUT PAGES (Basked.tsx, BaskedConfirm.tsx)

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| cart_title | Shopping Cart | Alış-veriş Səbəti | title | Basket | Page title |
| cart_empty | Your cart is empty | Səbətiniz boşdur | message | Basket | Empty state message |
| cart_continue_shopping | Continue Shopping | Alış-verişi Dəvam Et | button | Basket | Continue shopping button |
| cart_quantity_label | Quantity | Miqdar | label | Basket | Quantity selector |
| cart_remove | Remove | Sil | button | Basket | Remove item button |
| cart_subtotal | Subtotal | Ara Cəmi | label | Basket | Price section |
| cart_shipping | Shipping | Çatdırılma | label | Basket | Shipping cost |
| cart_tax | Tax | Vergi | label | Basket | Tax amount |
| cart_total | Total | Cəmi | label | Basket | Total price |
| cart_checkout_button | Proceed to Checkout | Ödənişə Keç | button | Basket | Checkout button |
| cart_update_quantity | Update Quantity | Miqdarı Güncəllə | button | Basket | Update button |
| checkout_title | Checkout | Ödəniş | title | BasketConfirm | Checkout page title |
| checkout_delivery_title | Delivery Address | Çatdırılma Ünvanı | title | BasketConfirm | Delivery section |
| checkout_billing_title | Billing Information | Ödəniş Məlumatları | title | BasketConfirm | Billing section |
| checkout_payment_title | Payment Method | Ödəniş Metodu | title | BasketConfirm | Payment section |
| checkout_order_summary | Order Summary | Sifariş Xülasəsi | title | BasketConfirm | Summary section |
| checkout_place_order | Place Order | Sifariş Et | button | BasketConfirm | Place order button |
| checkout_continue_button | Continue | Dəvam Et | button | BasketConfirm | Continue button |

---

## 4. PRODUCT PAGES (Products/Id.tsx, ProductCard)

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| product_price | Price | Qiymət | label | ProductCard | Price label |
| product_original_price | Original Price | Orijinal Qiymət | label | ProductCard | Full price |
| product_discount | Discount | Endirim | label | ProductCard | Discount amount |
| product_add_to_cart | Add to Cart | Səbətə Əlavə Et | button | ProductCard | Add to cart button |
| product_in_stock | In Stock | Stokda Var | label | ProductCard | Stock status |
| product_out_of_stock | Out of Stock | Stok Yoxdur | label | ProductCard | Out of stock |
| product_color | Color | Rəng | label | ProductCard | Color variant |
| product_size | Size | Ölçü | label | ProductCard | Size variant |
| product_select_color | Please select a color | Xahiş olaraq rəng seçin | message | ProductCard | Selection prompt |
| product_select_size | Please select a size | Xahiş olaraq ölçü seçin | message | ProductCard | Selection prompt |
| product_description | Description | Təsvir | title | ProductCard | Description section |
| product_specifications | Specifications | Texniki Xüsusiyyətlər | title | ProductCard | Specs section |
| product_reviews | Reviews | Rəylər | title | ProductCard | Reviews section |
| product_add_review | Add Review | Rəy Əlavə Et | button | ProductCard | Add review button |
| product_rating | Rating | Reytinq | label | ProductCard | Rating label |
| product_best_sellers | Best Sellers | Ən Çox Satılan | title | ProductCard | Best sellers badge |

---

## 5. USER DASHBOARD (influencer_dashboard/*)

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| dashboard_title | Dashboard | Paneli | title | Dashboard | Main dashboard |
| dashboard_welcome | Welcome | Xoş gəldiniz | greeting | Dashboard | User greeting |
| dashboard_collections | Collections | Kolleksiyalar | link | Dashboard | Sidebar link |
| dashboard_products | Products | Məhsullar | link | Dashboard | Sidebar link |
| dashboard_orders | Orders | Sifarişlər | link | Dashboard | Sidebar link |
| dashboard_payments | Payments | Ödənişlər | link | Dashboard | Sidebar link |
| dashboard_promocodes | Promo Codes | Promo Kodları | link | Dashboard | Sidebar link |
| dashboard_analytics | Analytics | Analitika | link | Dashboard | Sidebar link |
| dashboard_settings | Settings | Ayarlar | link | Dashboard | Sidebar link |
| dashboard_logout | Logout | Çıxış | button | Dashboard | Logout button |
| dashboard_edit_profile | Edit Profile | Profili Redaktə Et | button | Dashboard | Edit button |
| dashboard_pending | Pending | Gözləmədə | label | Dashboard | Status badge |
| dashboard_approved | Approved | Təsdiq Edildi | label | Dashboard | Status badge |
| dashboard_rejected | Rejected | Rədd Edildi | label | Dashboard | Status badge |
| dashboard_active | Active | Aktiv | label | Dashboard | Status badge |
| dashboard_inactive | Inactive | Fasiləsi | label | Dashboard | Status badge |

---

## 6. SEARCH & FILTERING

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| search_placeholder | Search... | Axtar... | placeholder | Search | Search input |
| search_searching | Searching... | Axtarış edilir... | label | Search | Loading state |
| search_no_results | No results found | Nəticə tapılmadı | message | Search | Empty results |
| search_popular | Popular | Məşhur | title | Search | Popular section |
| search_recent | Recent | Yenilər | title | Search | Recent searches |
| search_categories | Categories | Kateqoriyalar | title | Search | Categories section |
| filter_by_price | Filter by Price | Qiymətə Görə Sıxla | title | Filter | Price filter |
| filter_by_category | Filter by Category | Kateqoriyaya Görə Sıxla | title | Filter | Category filter |
| filter_by_brand | Filter by Brand | Brenda Görə Sıxla | title | Filter | Brand filter |
| filter_sort_relevance | Sort by Relevance | Uyğunluğa Görə | option | Sort | Sort option |
| filter_sort_price_low | Price: Low to High | Qiymət: Aşağıdan Yuxarıya | option | Sort | Sort option |
| filter_sort_price_high | Price: High to Low | Qiymət: Yuxarıdan Aşağıya | option | Sort | Sort option |
| filter_sort_newest | Newest | Ən Yeni | option | Sort | Sort option |
| filter_reset | Reset Filters | Filtrləri Sıfırla | button | Filter | Reset button |

---

## 7. NOTIFICATIONS & MESSAGES

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| notification_success | Success | Uğurlu | title | Toast | Success toast |
| notification_error | Error | Xəta | title | Toast | Error toast |
| notification_warning | Warning | Xəbərdarlıq | title | Toast | Warning toast |
| notification_info | Information | Məlumat | title | Toast | Info toast |
| notification_item_added | Item added to cart | Element səbətə əlavə edildi | message | Toast | Add to cart |
| notification_item_removed | Item removed from cart | Element səbətdən silindi | message | Toast | Remove from cart |
| notification_loading | Loading... | Yüklənir... | label | Loader | Generic loading |
| notification_please_wait | Please wait... | Lütfən gözləyin... | label | Loader | Loading prompt |

---

## 8. COMMON UI ELEMENTS

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| button_yes | Yes | Bəli | button | Modal | Yes button |
| button_no | No | Xeyr | button | Modal | No button |
| button_ok | OK | Tamam | button | Modal | OK button |
| button_cancel | Cancel | Ləğv Et | button | Modal | Cancel button |
| button_save | Save | Yadda Saxla | button | Form | Save button |
| button_delete | Delete | Sil | button | Form | Delete button |
| button_edit | Edit | Redaktə Et | button | Form | Edit button |
| button_next | Next | Sonrakı | button | Navigation | Next button |
| button_previous | Previous | Əvvəlki | button | Navigation | Previous button |
| label_required | Required | Tələb olunur | label | Form | Required field indicator |
| label_optional | Optional | Seçimli | label | Form | Optional field |
| error_network | Network error | Şəbəkə xətası | error | General | Network error |
| error_server | Server error | Server xətası | error | General | Server error |
| error_unknown | An unknown error occurred | Bilinməyən xəta baş verdi | error | General | Unknown error |

---

## 9. PICKUP POINT SELECTOR

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| pickup_select_point | Select Pickup Point | Seçilmə Nöqtəsi Seçin | label | PickupPointSelector | Main label |
| pickup_search | Search... | Axtar... | placeholder | PickupPointSelector | Search input |
| pickup_no_location | No location selected | Ünvan seçilməyib | message | PickupPointSelector | Empty state |
| pickup_loading | Loading... | Yüklənir... | label | PickupPointSelector | Loading state |
| pickup_error_required | Please select a pickup point | Xahiş olaraq bir seçilmə nöqtəsi seçin | error | PickupPointSelector | Validation error |

---

## 10. OTP & VERIFICATION

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| otp_title | Verify Your Email | E-mailinizi Doğrulayın | title | OTPDialog | Dialog title |
| otp_description | We sent a code to your email | Kod e-mailə göndərildi | description | OTPDialog | Instructions |
| otp_enter_code | Enter the 6-digit code | 6 rəqəmli kodu daxil edin | label | OTPDialog | Code input label |
| otp_verify_button | Verify | Doğrula | button | OTPDialog | Verify button |
| otp_resend | Resend Code | Kodu Yenidən Göndər | button | OTPDialog | Resend button |
| otp_expires_in | Code expires in | Kod bittiyə... | label | OTPDialog | Expiry timer |
| otp_invalid | Invalid code | Yanlış kod | error | OTPDialog | Error message |
| otp_too_many_attempts | Too many attempts | Çox sayda cəhd | error | OTPDialog | Rate limit error |

---

## 11. ADDRESS MANAGEMENT

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| address_title | Address | Ünvan | label | AddressForm | Field label |
| address_street | Street Address | Küçə Ünvanı | label | AddressForm | Field label |
| address_city | City | Şəhər | label | AddressForm | Field label |
| address_region | Region | Rayon | label | AddressForm | Field label |
| address_postal_code | Postal Code | Poçt Kodu | label | AddressForm | Field label |
| address_country | Country | Ölkə | label | AddressForm | Field label |
| address_add | Add Address | Ünvan Əlavə Et | button | AddressForm | Add button |
| address_edit | Edit Address | Ünvanı Redaktə Et | button | AddressForm | Edit button |
| address_delete | Delete Address | Ünvanı Sil | button | AddressForm | Delete button |
| address_default | Set as Default | Standart kimi təyin et | button | AddressForm | Set default |
| address_required | Address is required | Ünvan tələb olunur | error | AddressForm | Validation error |

---

## 12. PASSWORD RESET

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| password_reset_title | Reset Password | Şifrəni Sıfırla | title | PasswordReset | Page title |
| password_reset_desc | Enter your email to reset your password | Şifrənizi sıfırlamaq üçün e-mailə daxil olun | description | PasswordReset | Instructions |
| password_new | New Password | Yeni Şifrə | label | PasswordReset | Field label |
| password_confirm | Confirm Password | Şifrəni Təsdiq Et | label | PasswordReset | Field label |
| password_mismatch | Passwords do not match | Şifrələr uyğun gəlmir | error | PasswordReset | Validation error |
| password_reset_sent | Reset link sent to your email | Sıfırlama keçidi e-mailə göndərildi | message | PasswordReset | Success message |
| password_reset_success | Password reset successfully | Şifrə uğurla sıfırlandı | message | PasswordReset | Success message |

---

## 13. PAGINATION & NAVIGATION

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| pagination_previous | Previous | Əvvəlki | button | Pagination | Previous button |
| pagination_next | Next | Sonrakı | button | Pagination | Next button |
| pagination_page | Page | Səhifə | label | Pagination | Page indicator |
| pagination_of | of | arasında | label | Pagination | Pagination divider |
| breadcrumb_home | Home | Əsas Səhifə | link | Breadcrumb | Home link |
| breadcrumb_back | Back | Geri | button | Navigation | Back button |

---

## 14. FORMS & VALIDATION

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| form_required | This field is required | Bu sahə tələb olunur | error | Form | Generic required error |
| form_invalid | This field is invalid | Bu sahə etibarsızdır | error | Form | Generic invalid error |
| form_submit | Submit | Göndər | button | Form | Submit button |
| form_reset | Reset | Sıfırla | button | Form | Reset button |
| form_success | Form submitted successfully | Form uğurla göndərildi | message | Form | Success message |
| form_error | Error submitting form | Form göndərilərkən xəta | error | Form | Error message |

---

## 15. RETURNS & REFUNDS

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| return_title | Return Request | Geri Qaytarma Tələbi | title | Returns | Page title |
| return_reason | Reason for Return | Geri Qaytarma Səbəbi | label | Returns | Field label |
| return_description | Return Details | Geri Qaytarma Detalları | label | Returns | Field label |
| return_submit | Submit Return Request | Geri Qaytarma Tələbini Göndər | button | Returns | Submit button |
| return_approved | Approved | Təsdiq Edildi | label | Returns | Status |
| return_pending | Pending | Gözləmədə | label | Returns | Status |
| return_rejected | Rejected | Rədd Edildi | label | Returns | Status |

---

## 16. RATING & COMMENTS

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| rating_title | Rate This Product | Bu Məhsulu Qiymətləndirin | title | Rating | Dialog title |
| rating_please_rate | Please rate this product | Xahiş olaraq bu məhsulu qiymətləndirin | label | Rating | Instructions |
| rating_comment | Your Comment | Sizin Şərhiniz | placeholder | Rating | Comment input |
| rating_submit | Submit Rating | Qiymətləndirməni Göndər | button | Rating | Submit button |
| rating_success | Rating submitted successfully | Qiymətləndirmə uğurla göndərildi | message | Rating | Success message |
| rating_1_star | 1 Star | 1 Ulduz | label | Rating | Star rating |
| rating_5_stars | 5 Stars | 5 Ulduz | label | Rating | Star rating |

---

## 17. PAGINATION & SORTING

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| sort_by | Sort by | Sırala | label | Sort | Dropdown label |
| results_per_page | Results per page | Səhifə üzrə nəticələr | label | Pagination | Dropdown label |
| total_results | Total Results | Cəmi Nəticələr | label | Results | Result count |

---

## 18. HOME PAGE & PROMOTIONS

| Key | English | Azərbaycan | Type | Component | Notes |
|-----|---------|-----------|------|-----------|-------|
| home_featured_title | 500,000+ Products — Affordable Prices, High Quality | 500.000+ məhsul — Sərfəli qiymət, yüksək keyfiyyət | title | Home | Main headline |
| home_featured_subtitle | Everything You're Looking For — All in One Platform | Axtardığın hər şey — bir platformada | description | Home | Subtitle |
| home_customer_promise | Customer Satisfaction is Our Main Principle | Müştəri məmnuniyyəti əsas prinsipimizdir | tagline | Home | Promise statement |
| home_new_products | New Products | Yeni məhsullar | title | Home | New products section |
| home_recently_viewed | Recently Viewed Products | Son baxılan məhsullar | title | Home | Recently viewed section |
| home_mobile_app | 📲 Mobile App iOS & Android Coming Soon | 📲Mobil tətbiq ios & android tezliklə xidmətinizdə | message | Home | Mobile app notification |
| home_catalog | Catalog | Katalog | label | Home | Catalog section |
| home_direct_from_china | Products Directly from China to Azerbaijan | Çindən bir başa Azərbaycana məhsullar | description | Home | Catalog description |
| home_categories | Categories | Kateqoriyalar | title | Home | Categories section |
| home_products_view | View Products | Məhsullara bax | button | Home | View products button |

---

## Implementation Instructions

1. **Copy the table above** into your admin panel translation management system
2. **For each string:**
   - Create a unique key (e.g., `auth_welcome_title`)
   - Add the English text
   - Add the Azərbaycan text
   - Assign the type/category
   - Save to database

3. **Update the API endpoint** `/api/translates/all` to return all these keys with both language versions

4. **Frontend Integration:**
   - Update `useAllTranslations()` hook in `src/setting/Request.ts` to include all new keys
   - Replace hardcoded strings with translation variables in components
   - Example: `placeholder={tarnslation?.search_placeholder ?? "Search..."}`

5. **Testing Checklist:**
   - [ ] All UI text displays in Azərbaycan on `/az/` routes
   - [ ] All UI text displays in English on `/en/` routes
   - [ ] Language switcher works properly
   - [ ] No hardcoded text remains visible
   - [ ] All form validations use translated messages

---

## Priority Order for Implementation

### Phase 1 (Critical - User Facing)
- Authentication (login, register)
- Cart & Checkout
- Product Display
- Footer

### Phase 2 (Important - User Features)
- Search & Filtering
- Notifications & Messages
- Address Management
- Password Reset

### Phase 3 (Enhancement - Additional Features)
- Dashboard
- OTP Verification
- Returns & Refunds
- Rating & Comments

---

## JSON Format for Bulk Import

If your admin panel supports bulk import, use this JSON format:

```json
{
  "translations": [
    {
      "key": "auth_welcome_title",
      "en": "Welcome",
      "az": "Xoş gəldiniz",
      "type": "title",
      "component": "Login",
      "notes": "Login page main heading"
    },
    {
      "key": "auth_welcome_desc",
      "en": "Please login to your account",
      "az": "Hesabınıza daxil olun",
      "type": "description",
      "component": "Login",
      "notes": "Login subtitle"
    }
    // ... continue for all strings
  ]
}
```

---

## CSV Format for Spreadsheet Import

For Excel/Google Sheets import:

```csv
Key,English,Azərbaycan,Type,Component,Notes
auth_welcome_title,Welcome,Xoş gəldiniz,title,Login,Login page main heading
auth_welcome_desc,Please login to your account,Hesabınıza daxil olun,description,Login,Login subtitle
auth_email_label,Email,Email,label,Login/Register,Email field
```

---

## Next Steps

1. ✅ **Inventory Complete** - You now have all 150+ strings documented
2. 📋 **Add to Admin Panel** - Manually add these to your backend translation table
3. 🔄 **Update API** - Ensure `/api/translates/all` returns all these keys
4. 💻 **Update Components** - Replace hardcoded strings with `tarnslation?.key` variables
5. ✅ **Test** - Verify all text translates properly on both `/az/` and `/en/` routes

This comprehensive inventory ensures 100% of your static UI text can be managed dynamically from your admin panel!
