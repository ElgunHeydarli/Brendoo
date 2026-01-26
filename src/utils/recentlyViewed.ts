// Recently Viewed Products Helper
import { Product, ProductDetail } from "../setting/Types";

const STORAGE_KEY = "brendoo_recently_viewed";
const MAX_ITEMS = 12; // Maksimum 12 məhsul saxla

export interface RecentlyViewedProduct {
  id: number;
  title: string;
  price: number;
  discount_price?: number;
  image: string;
  slug: string;
  category_id?: number;
  viewedAt: number; // Timestamp
}

/**
 * Məhsulu "son baxılanlar" siyahısına əlavə et
 */
export const addToRecentlyViewed = (product: Product | ProductDetail): void => {
  try {
    const existing = getRecentlyViewed();

    // Əgər məhsul artıq varsa, onu siyahıdan sil (yenidən əvvələ əlavə edəcəyik)
    const filtered = existing.filter((item) => item.id !== product.id);

    // ProductDetail və ya Product type-a görə düzgün field-ləri götür
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const discountPrice = 'discounted_price' in product
      ? (typeof product.discounted_price === 'string' ? parseFloat(product.discounted_price) : product.discounted_price)
      : undefined;
    const slug = typeof product.slug === 'string' ? product.slug : product.slug?.en || '';
    const categoryId = 'category_id' in product ? product.category_id : product.category?.id;

    // Yeni məhsulu əlavə et
    const newItem: RecentlyViewedProduct = {
      id: product.id,
      title: product.title,
      price: price || 0,
      discount_price: discountPrice,
      image: product.image || "",
      slug: slug,
      category_id: categoryId,
      viewedAt: Date.now(),
    };

    // Yeni siyahı: yeni məhsul əvvəldə, sonra qalanlar
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error adding to recently viewed:", error);
  }
};

/**
 * "Son baxılanlar" siyahısını al
 */
export const getRecentlyViewed = (): RecentlyViewedProduct[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as RecentlyViewedProduct[];

    // 30 gündən köhnə məhsulları sil
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filtered = parsed.filter((item) => item.viewedAt > thirtyDaysAgo);

    // Əgər filterdən sonra dəyişiklik varsa, yenilə
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    return filtered;
  } catch (error) {
    console.error("Error getting recently viewed:", error);
    return [];
  }
};

/**
 * "Son baxılanlar" siyahısını təmizlə
 */
export const clearRecentlyViewed = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing recently viewed:", error);
  }
};

/**
 * Müəyyən məhsulu siyahıdan sil
 */
export const removeFromRecentlyViewed = (productId: number): void => {
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((item) => item.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing from recently viewed:", error);
  }
};
