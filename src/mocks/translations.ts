/**
 * Mock API Response Format
 * 
 * Backend-in /api/translates/all endpoint-indən döndəcəyi format
 */

export const MOCK_TRANSLATIONS_ALL = {
  az: {
    // Authentication
    auth_welcome_title: "Xoş gəldiniz",
    auth_welcome_desc: "Hesabınıza daxil olun",
    auth_or: "VƏ YA",
    auth_user_type: "İstifadəçi",
    auth_influencer_type: "Influencer",
    auth_email_label: "Email",
    auth_password_label: "Şifrə",
    auth_forgot_password: "Şifrəni unutdunuz?",
    auth_login_button: "Daxil Ol",
    auth_no_account: "Hesabınız yoxdur?",
    auth_register_button: "Qeydiyyat Ol",
    auth_register_title: "Hesab Yaradın",
    auth_register_desc: "Bizə bu gün qoşulun",
    auth_email_invalid: "Düzgün email daxil edin",
    auth_email_required: "Email tələb olunur",
    auth_password_required: "Şifrə tələb olunur",
    auth_password_min: "Şifrə minimum 6 simvol olmalıdır",
    auth_name_required: "Ad tələb olunur",
    auth_phone_required: "Telefon nömrəsi tələb olunur",
    auth_phone_invalid: "Telefon nömrəsi 9 rəqəm olmalıdır",
    auth_fin_code_required: "FIN kod tələb olunur",
    auth_fin_code_invalid: "FIN kod 7 simvol olmalıdır",
    auth_gender_required: "Cins tələb olunur",
    auth_birthday_required: "Doğum tarixi tələb olunur",
    auth_terms_required: "Şərtləri qəbul etməlisiniz",
    auth_gender_male: "Erkək",
    auth_gender_female: "Qadın",
    auth_login_success: "Giriş uğurlu oldu",
    auth_register_success: "Qeydiyyat uğurla tamamlandı",
    auth_loading: "Yüklənir...",

    // Footer
    footer_latest_offers: "Ən son təkliflər",
    footer_subscribe_button: "Abunə ol",
    footer_subscribing: "Abunə olunur...",
    footer_copyright: "2025 | Brendoo",
    footer_have_question: "Sualınız var?",
    footer_name_label: "Ad və soyad",
    footer_phone_label: "Telefon nömrəsi",
    footer_email_label: "Email",
    footer_message_label: "Mesaj",
    footer_send_button: "Göndər",
    footer_sending: "Göndərilir...",
    footer_contact_success: "Mesaj uğurla göndərildi",
    footer_contact_error: "Mesaj göndərilərkən xəta",

    // Cart
    cart_title: "Alış-veriş Səbəti",
    cart_empty: "Səbətiniz boşdur",
    cart_continue_shopping: "Alış-verişi Dəvam Et",
    cart_quantity_label: "Miqdar",
    cart_remove: "Sil",
    cart_subtotal: "Ara Cəmi",
    cart_shipping: "Çatdırılma",
    cart_tax: "Vergi",
    cart_total: "Cəmi",
    cart_checkout_button: "Ödənişə Keç",
    cart_update_quantity: "Miqdarı Güncəllə",

    // Checkout
    checkout_title: "Ödəniş",
    checkout_delivery_title: "Çatdırılma Ünvanı",
    checkout_billing_title: "Ödəniş Məlumatları",
    checkout_payment_title: "Ödəniş Metodu",
    checkout_order_summary: "Sifariş Xülasəsi",
    checkout_place_order: "Sifariş Et",
    checkout_continue_button: "Dəvam Et",

    // Products
    product_price: "Qiymət",
    product_original_price: "Orijinal Qiymət",
    product_discount: "Endirim",
    product_add_to_cart: "Səbətə Əlavə Et",
    product_in_stock: "Stokda Var",
    product_out_of_stock: "Stok Yoxdur",
    product_color: "Rəng",
    product_size: "Ölçü",
    product_select_color: "Xahiş olaraq rəng seçin",
    product_select_size: "Xahiş olaraq ölçü seçin",
    product_description: "Təsvir",
    product_specifications: "Texniki Xüsusiyyətlər",
    product_reviews: "Rəylər",
    product_add_review: "Rəy Əlavə Et",
    product_rating: "Reytinq",
    product_best_sellers: "Ən Çox Satılan",

    // Dashboard
    dashboard_title: "Paneli",
    dashboard_welcome: "Xoş gəldiniz",
    dashboard_collections: "Kolleksiyalar",
    dashboard_products: "Məhsullar",
    dashboard_orders: "Sifarişlər",
    dashboard_payments: "Ödənişlər",
    dashboard_promocodes: "Promo Kodları",
    dashboard_analytics: "Analitika",
    dashboard_settings: "Ayarlar",
    dashboard_logout: "Çıxış",
    dashboard_edit_profile: "Profili Redaktə Et",
    dashboard_pending: "Gözləmədə",
    dashboard_approved: "Təsdiq Edildi",
    dashboard_rejected: "Rədd Edildi",
    dashboard_active: "Aktiv",
    dashboard_inactive: "Fasiləsi",

    // Search
    search_placeholder: "Axtar...",
    search_searching: "Axtarış edilir...",
    search_no_results: "Nəticə tapılmadı",
    search_popular: "Məşhur",
    search_recent: "Yenilər",
    search_categories: "Kateqoriyalar",

    // Filters
    filter_by_price: "Qiymətə Görə Sıxla",
    filter_by_category: "Kateqoriyaya Görə Sıxla",
    filter_by_brand: "Brenda Görə Sıxla",
    filter_sort_relevance: "Uyğunluğa Görə",
    filter_sort_price_low: "Qiymət: Aşağıdan Yuxarıya",
    filter_sort_price_high: "Qiymət: Yuxarıdan Aşağıya",
    filter_sort_newest: "Ən Yeni",
    filter_reset: "Filtrləri Sıfırla",

    // Notifications
    notification_success: "Uğurlu",
    notification_error: "Xəta",
    notification_warning: "Xəbərdarlıq",
    notification_info: "Məlumat",
    notification_item_added: "Element səbətə əlavə edildi",
    notification_item_removed: "Element səbətdən silindi",
    notification_loading: "Yüklənir...",
    notification_please_wait: "Lütfən gözləyin...",

    // Buttons
    button_yes: "Bəli",
    button_no: "Xeyr",
    button_ok: "Tamam",
    button_cancel: "Ləğv Et",
    button_save: "Yadda Saxla",
    button_delete: "Sil",
    button_edit: "Redaktə Et",
    button_next: "Sonrakı",
    button_previous: "Əvvəlki",

    // Labels
    label_required: "Tələb olunur",
    label_optional: "Seçimli",

    // Errors
    error_network: "Şəbəkə xətası",
    error_server: "Server xətası",
    error_unknown: "Bilinməyən xəta baş verdi",

    // Pickup
    pickup_select_point: "Seçilmə Nöqtəsi Seçin",
    pickup_search: "Axtar...",
    pickup_no_location: "Ünvan seçilməyib",
    pickup_loading: "Yüklənir...",
    pickup_error_required: "Xahiş olaraq bir seçilmə nöqtəsi seçin",

    // OTP
    otp_title: "E-mailinizi Doğrulayın",
    otp_description: "Kod e-mailə göndərildi",
    otp_enter_code: "6 rəqəmli kodu daxil edin",
    otp_verify_button: "Doğrula",
    otp_resend: "Kodu Yenidən Göndər",
    otp_expires_in: "Kod bittiyə",
    otp_invalid: "Yanlış kod",
    otp_too_many_attempts: "Çox sayda cəhd",

    // Address
    address_title: "Ünvan",
    address_street: "Küçə Ünvanı",
    address_city: "Şəhər",
    address_region: "Rayon",
    address_postal_code: "Poçt Kodu",
    address_country: "Ölkə",
    address_add: "Ünvan Əlavə Et",
    address_edit: "Ünvanı Redaktə Et",
    address_delete: "Ünvanı Sil",
    address_default: "Standart kimi təyin et",
    address_required: "Ünvan tələb olunur",

    // Password
    password_reset_title: "Şifrəni Sıfırla",
    password_reset_desc: "Şifrənizi sıfırlamaq üçün e-mailə daxil olun",
    password_new: "Yeni Şifrə",
    password_confirm: "Şifrəni Təsdiq Et",
    password_mismatch: "Şifrələr uyğun gəlmir",
    password_reset_sent: "Sıfırlama keçidi e-mailə göndərildi",
    password_reset_success: "Şifrə uğurla sıfırlandı",

    // Pagination
    pagination_previous: "Əvvəlki",
    pagination_next: "Sonrakı",
    pagination_page: "Səhifə",
    pagination_of: "arasında",

    // Breadcrumb
    breadcrumb_home: "Əsas Səhifə",
    breadcrumb_back: "Geri",

    // Forms
    form_required: "Bu sahə tələb olunur",
    form_invalid: "Bu sahə etibarsızdır",
    form_submit: "Göndər",
    form_reset: "Sıfırla",
    form_success: "Form uğurla göndərildi",
    form_error: "Form göndərilərkən xəta",

    // Returns
    return_title: "Geri Qaytarma Tələbi",
    return_reason: "Geri Qaytarma Səbəbi",
    return_description: "Geri Qaytarma Detalları",
    return_submit: "Geri Qaytarma Tələbini Göndər",
    return_approved: "Təsdiq Edildi",
    return_pending: "Gözləmədə",
    return_rejected: "Rədd Edildi",

    // Rating
    rating_title: "Bu Məhsulu Qiymətləndirin",
    rating_please_rate: "Xahiş olaraq bu məhsulu qiymətləndirin",
    rating_comment: "Sizin Şərhiniz",
    rating_submit: "Qiymətləndirməni Göndər",
    rating_success: "Qiymətləndirmə uğurla göndərildi",
    rating_1_star: "1 Ulduz",
    rating_5_stars: "5 Ulduz",

    // Sorting
    sort_by: "Sırala",
    results_per_page: "Səhifə üzrə nəticələr",
    total_results: "Cəmi Nəticələr",

    // Home Page & Promotions
    home_featured_title: "500.000+ məhsul — Sərfəli qiymət, yüksək keyfiyyət",
    home_featured_subtitle: "Axtardığın hər şey — bir platformada",
    home_customer_promise: "Müştəri məmnuniyyəti əsas prinsipimizdir",
    home_new_products: "Yeni məhsullar",
    home_recently_viewed: "Son baxılan məhsullar",
    home_mobile_app: "📲Mobil tətbiq ios & android tezliklə xidmətinizdə",
    home_catalog: "Katalog",
    home_direct_from_china: "Çindən bir başa Azərbaycana məhsullar",
    home_categories: "Kateqoriyalar",
    home_products_view: "Məhsullara bax",
  },

  en: {
    // Authentication
    auth_welcome_title: "Welcome",
    auth_welcome_desc: "Please login to your account",
    auth_or: "OR",
    auth_user_type: "User",
    auth_influencer_type: "Influencer",
    auth_email_label: "Email",
    auth_password_label: "Password",
    auth_forgot_password: "Forgot password?",
    auth_login_button: "Login",
    auth_no_account: "Don't have an account?",
    auth_register_button: "Register",
    auth_register_title: "Create Your Account",
    auth_register_desc: "Join us today",
    auth_email_invalid: "Please enter a valid email",
    auth_email_required: "Email is required",
    auth_password_required: "Password is required",
    auth_password_min: "Password must be at least 6 characters",
    auth_name_required: "Name is required",
    auth_phone_required: "Phone number is required",
    auth_phone_invalid: "Phone must be 9 digits",
    auth_fin_code_required: "FIN code is required",
    auth_fin_code_invalid: "FIN code must be 7 characters",
    auth_gender_required: "Gender is required",
    auth_birthday_required: "Date of birth is required",
    auth_terms_required: "You must accept the terms",
    auth_gender_male: "Male",
    auth_gender_female: "Female",
    auth_login_success: "Login successful",
    auth_register_success: "Registration completed successfully",
    auth_loading: "Loading...",

    // Footer
    footer_latest_offers: "Latest offers",
    footer_subscribe_button: "Subscribe",
    footer_subscribing: "Subscribing...",
    footer_copyright: "2025 | Brendoo",
    footer_have_question: "Any questions?",
    footer_name_label: "Name and surname",
    footer_phone_label: "Phone number",
    footer_email_label: "Email",
    footer_message_label: "Message",
    footer_send_button: "Send",
    footer_sending: "Sending...",
    footer_contact_success: "Message sent successfully",
    footer_contact_error: "Error sending message",

    // Cart
    cart_title: "Shopping Cart",
    cart_empty: "Your cart is empty",
    cart_continue_shopping: "Continue Shopping",
    cart_quantity_label: "Quantity",
    cart_remove: "Remove",
    cart_subtotal: "Subtotal",
    cart_shipping: "Shipping",
    cart_tax: "Tax",
    cart_total: "Total",
    cart_checkout_button: "Proceed to Checkout",
    cart_update_quantity: "Update Quantity",

    // Checkout
    checkout_title: "Checkout",
    checkout_delivery_title: "Delivery Address",
    checkout_billing_title: "Billing Information",
    checkout_payment_title: "Payment Method",
    checkout_order_summary: "Order Summary",
    checkout_place_order: "Place Order",
    checkout_continue_button: "Continue",

    // Products
    product_price: "Price",
    product_original_price: "Original Price",
    product_discount: "Discount",
    product_add_to_cart: "Add to Cart",
    product_in_stock: "In Stock",
    product_out_of_stock: "Out of Stock",
    product_color: "Color",
    product_size: "Size",
    product_select_color: "Please select a color",
    product_select_size: "Please select a size",
    product_description: "Description",
    product_specifications: "Specifications",
    product_reviews: "Reviews",
    product_add_review: "Add Review",
    product_rating: "Rating",
    product_best_sellers: "Best Sellers",

    // Dashboard
    dashboard_title: "Dashboard",
    dashboard_welcome: "Welcome",
    dashboard_collections: "Collections",
    dashboard_products: "Products",
    dashboard_orders: "Orders",
    dashboard_payments: "Payments",
    dashboard_promocodes: "Promo Codes",
    dashboard_analytics: "Analytics",
    dashboard_settings: "Settings",
    dashboard_logout: "Logout",
    dashboard_edit_profile: "Edit Profile",
    dashboard_pending: "Pending",
    dashboard_approved: "Approved",
    dashboard_rejected: "Rejected",
    dashboard_active: "Active",
    dashboard_inactive: "Inactive",

    // Search
    search_placeholder: "Search...",
    search_searching: "Searching...",
    search_no_results: "No results found",
    search_popular: "Popular",
    search_recent: "Recent",
    search_categories: "Categories",

    // Filters
    filter_by_price: "Filter by Price",
    filter_by_category: "Filter by Category",
    filter_by_brand: "Filter by Brand",
    filter_sort_relevance: "Sort by Relevance",
    filter_sort_price_low: "Price: Low to High",
    filter_sort_price_high: "Price: High to Low",
    filter_sort_newest: "Newest",
    filter_reset: "Reset Filters",

    // Notifications
    notification_success: "Success",
    notification_error: "Error",
    notification_warning: "Warning",
    notification_info: "Information",
    notification_item_added: "Item added to cart",
    notification_item_removed: "Item removed from cart",
    notification_loading: "Loading...",
    notification_please_wait: "Please wait...",

    // Buttons
    button_yes: "Yes",
    button_no: "No",
    button_ok: "OK",
    button_cancel: "Cancel",
    button_save: "Save",
    button_delete: "Delete",
    button_edit: "Edit",
    button_next: "Next",
    button_previous: "Previous",

    // Labels
    label_required: "Required",
    label_optional: "Optional",

    // Errors
    error_network: "Network error",
    error_server: "Server error",
    error_unknown: "An unknown error occurred",

    // Pickup
    pickup_select_point: "Select Pickup Point",
    pickup_search: "Search...",
    pickup_no_location: "No location selected",
    pickup_loading: "Loading...",
    pickup_error_required: "Please select a pickup point",

    // OTP
    otp_title: "Verify Your Email",
    otp_description: "We sent a code to your email",
    otp_enter_code: "Enter the 6-digit code",
    otp_verify_button: "Verify",
    otp_resend: "Resend Code",
    otp_expires_in: "Code expires in",
    otp_invalid: "Invalid code",
    otp_too_many_attempts: "Too many attempts",

    // Address
    address_title: "Address",
    address_street: "Street Address",
    address_city: "City",
    address_region: "Region",
    address_postal_code: "Postal Code",
    address_country: "Country",
    address_add: "Add Address",
    address_edit: "Edit Address",
    address_delete: "Delete Address",
    address_default: "Set as Default",
    address_required: "Address is required",

    // Password
    password_reset_title: "Reset Password",
    password_reset_desc: "Enter your email to reset your password",
    password_new: "New Password",
    password_confirm: "Confirm Password",
    password_mismatch: "Passwords do not match",
    password_reset_sent: "Reset link sent to your email",
    password_reset_success: "Password reset successfully",

    // Pagination
    pagination_previous: "Previous",
    pagination_next: "Next",
    pagination_page: "Page",
    pagination_of: "of",

    // Breadcrumb
    breadcrumb_home: "Home",
    breadcrumb_back: "Back",

    // Forms
    form_required: "This field is required",
    form_invalid: "This field is invalid",
    form_submit: "Submit",
    form_reset: "Reset",
    form_success: "Form submitted successfully",
    form_error: "Error submitting form",

    // Returns
    return_title: "Return Request",
    return_reason: "Reason for Return",
    return_description: "Return Details",
    return_submit: "Submit Return Request",
    return_approved: "Approved",
    return_pending: "Pending",
    return_rejected: "Rejected",

    // Rating
    rating_title: "Rate This Product",
    rating_please_rate: "Please rate this product",
    rating_comment: "Your Comment",
    rating_submit: "Submit Rating",
    rating_success: "Rating submitted successfully",
    rating_1_star: "1 Star",
    rating_5_stars: "5 Stars",

    // Sorting
    sort_by: "Sort by",
    results_per_page: "Results per page",
    total_results: "Total Results",

    // Home Page & Promotions
    home_featured_title: "500,000+ Products — Affordable Prices, High Quality",
    home_featured_subtitle: "Everything You're Looking For — All in One Platform",
    home_customer_promise: "Customer Satisfaction is Our Main Principle",
    home_new_products: "New Products",
    home_recently_viewed: "Recently Viewed Products",
    home_mobile_app: "📲 Mobile App iOS & Android Coming Soon",
    home_catalog: "Catalog",
    home_direct_from_china: "Products Directly from China to Azerbaijan",
    home_categories: "Categories",
    home_products_view: "View Products",
  },
};

/**
 * Usage in API Response:
 * 
 * GET /api/translates/all
 * 
 * Response:
 * {
 *   "az": { ...all azerbaijani keys },
 *   "en": { ...all english keys }
 * }
 */

/**
 * Testing with this mock:
 * 
 * import { MOCK_TRANSLATIONS_ALL } from '@/mocks/translations';
 * 
 * // Mock API response
 * const mockApiResponse = MOCK_TRANSLATIONS_ALL;
 * // { az: {...}, en: {...} }
 */

export default MOCK_TRANSLATIONS_ALL;
