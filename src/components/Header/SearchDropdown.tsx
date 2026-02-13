import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';

const API_URL = 'https://admin.brendoo.com';
const RECENT_SEARCHES_KEY = 'brendoo_recent_searches';
const MAX_RECENT_SEARCHES = 8;

const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  if (src.startsWith('storage/')) return API_URL + '/' + src;
  return API_URL + '/storage/' + src;
};

interface SearchItem {
  id: number;
  type: 'product' | 'category' | 'subcategory' | 'brand';
  title: string;
  slug: string;
  price?: number;
  discount?: number;
  discounted_price?: number;
  image?: string;
  brand?: string;
  category?: string;
  parent_title?: string;
  category_id?: number;
  products_count?: number;
}

interface SearchResponse {
  products: SearchItem[];
  categories: SearchItem[];
  subcategories: SearchItem[];
  brands: SearchItem[];
  suggestions: { text: string; type: string }[];
  total: number;
  query: string;
}



interface Props {
  SearchValue: string;
  setSearchValue: (value: string) => void;
  enableScrolling: () => void;
  lang: string;
  isInputFocused?: boolean;
  [key: string]: any;
}

const texts: Record<string, Record<string, string>> = {
  az: {
    products: 'Məhsullar',
    categories: 'Kateqoriyalar',
    subcategories: 'Alt kateqoriyalar',
    brands: 'Brendlər',
    noResults: 'Nəticə tapılmadı',
    viewAll: 'Bütün nəticələrə bax',
    searching: 'Axtarılır...',
    inCategory: 'kateqoriyasında',
    productCount: 'məhsul',
    recentSearches: 'Son axtarışlar',
    popularNow: 'İndi populyar',
    clearAll: 'Hamısını sil',
  },
  en: {
    products: 'Products',
    categories: 'Categories',
    subcategories: 'Subcategories',
    brands: 'Brands',
    noResults: 'No results found',
    viewAll: 'View all results',
    searching: 'Searching...',
    inCategory: 'in',
    productCount: 'products',
    recentSearches: 'Recent searches',
    popularNow: 'Popular now',
    clearAll: 'Clear all',
  },
};

// localStorage helpers
const getRecentSearches = (): string[] => {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string) => {
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
};

const clearRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore
  }
};

const removeRecentSearch = (query: string) => {
  try {
    const searches = getRecentSearches();
    const updated = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
};

// ============================================================================
// AZERBAIJANI CHARACTER NORMALIZATION FOR BETTER SEARCH
// ============================================================================

// Axtarış sorğusunu normallaşdır - bütün mümkün variantları yarat
const normalizeAzerbaijaniQuery = (query: string): string[] => {
  const lowerQuery = query.toLowerCase().trim();
  const variants: Set<string> = new Set([lowerQuery]);

  // Original query
  variants.add(query);

  // Variant 1: Latin → Azərbaycan
  let azVariant = lowerQuery;
  azVariant = azVariant.replace(/e/g, 'ə');
  azVariant = azVariant.replace(/i/g, 'ı');
  azVariant = azVariant.replace(/o/g, 'ö');
  azVariant = azVariant.replace(/u/g, 'ü');
  azVariant = azVariant.replace(/s/g, 'ş');
  azVariant = azVariant.replace(/c/g, 'ç');
  azVariant = azVariant.replace(/g/g, 'ğ');
  variants.add(azVariant);

  // Variant 2: Azərbaycan → Latin
  let latinVariant = lowerQuery;
  latinVariant = latinVariant.replace(/ə/g, 'e');
  latinVariant = latinVariant.replace(/ı/g, 'i');
  latinVariant = latinVariant.replace(/ö/g, 'o');
  latinVariant = latinVariant.replace(/ü/g, 'u');
  latinVariant = latinVariant.replace(/ş/g, 's');
  latinVariant = latinVariant.replace(/ç/g, 'c');
  latinVariant = latinVariant.replace(/ğ/g, 'g');
  variants.add(latinVariant);

  // Variant 3: Qarışıq - ən çox istifadə edilən hərflər
  let mixedVariant = lowerQuery;
  mixedVariant = mixedVariant.replace(/e/g, 'ə');
  mixedVariant = mixedVariant.replace(/i/g, 'ı');
  variants.add(mixedVariant);

  // Variant 4: Yalnız "ə" dəyişikliyi (ən çox səhv edilən)
  variants.add(lowerQuery.replace(/e/g, 'ə'));
  variants.add(lowerQuery.replace(/ə/g, 'e'));

  // Variant 5: Yalnız "ı" dəyişikliyi
  variants.add(lowerQuery.replace(/i/g, 'ı'));
  variants.add(lowerQuery.replace(/ı/g, 'i'));

  return Array.from(variants).filter(v => v.length >= 2);
};

// Nəticələri Azərbaycan dilində sırala - daha yaxşı uyğunluqlar üstdə
const sortByAzerbaijaniRelevance = <T extends { title?: string }>(items: T[], query: string): T[] => {
  const variants = normalizeAzerbaijaniQuery(query);

  return [...items].sort((a, b) => {
    const titleA = (a.title || '').toLowerCase();
    const titleB = (b.title || '').toLowerCase();

    // Tam uyğunluq - ən yüksək prioritet
    const exactMatchA = variants.some(v => titleA === v);
    const exactMatchB = variants.some(v => titleB === v);
    if (exactMatchA && !exactMatchB) return -1;
    if (exactMatchB && !exactMatchA) return 1;

    // Başlanğıcda uyğunluq
    const startsWithA = variants.some(v => titleA.startsWith(v));
    const startsWithB = variants.some(v => titleB.startsWith(v));
    if (startsWithA && !startsWithB) return -1;
    if (startsWithB && !startsWithA) return 1;

    // İçəridə uyğunluq
    const containsA = variants.some(v => titleA.includes(v));
    const containsB = variants.some(v => titleB.includes(v));
    if (containsA && !containsB) return -1;
    if (containsB && !containsA) return 1;

    return 0;
  });
};

const filterProducts = (products: SearchItem[], query?: string): SearchItem[] => {
  const seenIds = new Set<number>();
  const filtered = products.filter((p) => {
    if (!p.title || p.title.trim() === '') return false;
    if (p.brand && p.title.trim().toLowerCase() === p.brand.trim().toLowerCase()) return false;
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  }).map(p => ({ ...p, type: 'product' as const }));

  // Azərbaycan dilində sırala
  if (query) {
    return sortByAzerbaijaniRelevance(filtered, query);
  }

  return filtered;
};

export default function SearchDropdown({ SearchValue, setSearchValue, enableScrolling, lang, isInputFocused = false }: Props) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = texts[lang] || texts.az;

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Open dropdown when input is focused
  useEffect(() => {
    if (isInputFocused) {
      setIsOpen(true);
    }
  }, [isInputFocused]);

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);

      try {
        // Azərbaycan dili üçün bütün variantları yarat
        const queryVariants = lang === 'az' ? normalizeAzerbaijaniQuery(query) : [query];

        // Paralel sorğular göndər (maksimum 3 variant)
        const searchPromises = queryVariants.slice(0, 3).map(variant =>
          axios.get<SearchResponse>(
            `${API_URL}/api/search?q=${encodeURIComponent(variant)}&limit=20`,
            { headers: { 'Accept-Language': lang } }
          ).catch(() => null)
        );

        const responses = await Promise.all(searchPromises);

        // Bütün nəticələri birləşdir
        const allProducts: SearchItem[] = [];
        const allCategories: SearchItem[] = [];
        const allSubcategories: SearchItem[] = [];
        const allBrands: SearchItem[] = [];
        const seenProductIds = new Set<number>();
        const seenCategoryIds = new Set<number>();
        const seenSubcategoryIds = new Set<number>();
        const seenBrandIds = new Set<number>();

        responses.forEach(response => {
          if (!response?.data) return;
          const data = response.data;

          // Məhsulları əlavə et (dublikatları yoxla)
          (data.products || []).forEach(p => {
            if (!seenProductIds.has(p.id)) {
              seenProductIds.add(p.id);
              allProducts.push(p);
            }
          });

          // Kateqoriyaları əlavə et
          (data.categories || []).forEach(c => {
            if (!seenCategoryIds.has(c.id)) {
              seenCategoryIds.add(c.id);
              allCategories.push(c);
            }
          });

          // Alt kateqoriyaları əlavə et
          (data.subcategories || []).forEach(s => {
            if (!seenSubcategoryIds.has(s.id)) {
              seenSubcategoryIds.add(s.id);
              allSubcategories.push(s);
            }
          });

          // Brendləri əlavə et
          (data.brands || []).forEach(b => {
            if (!seenBrandIds.has(b.id)) {
              seenBrandIds.add(b.id);
              allBrands.push(b);
            }
          });
        });

        // Filtrlə və Azərbaycan dilinə görə sırala
        const filteredProducts = filterProducts(allProducts, query);
        const categoriesWithType = allCategories.map(c => ({ ...c, type: 'category' as const }));
        const subcategoriesWithType = allSubcategories.map(s => ({ ...s, type: 'subcategory' as const }));
        const brandsWithType = allBrands.map(b => ({ ...b, type: 'brand' as const }));

        setResults({
          products: filteredProducts,
          categories: categoriesWithType,
          subcategories: subcategoriesWithType,
          brands: brandsWithType,
          suggestions: [],
          total: filteredProducts.length,
          query: query
        });
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 200), // Debounce artırıldı - paralel sorğular üçün
    [lang]
  );

  useEffect(() => {
    if (SearchValue && SearchValue.length >= 2) {
      setIsOpen(true);
      performSearch(SearchValue);
    } else {
      setResults(null);
    }
  }, [SearchValue, performSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: SearchItem) => {
    setIsOpen(false);
    setSearchValue('');
    enableScrolling();

    const itemType = item.type || 'product';
    const productSlug = item.slug || item.id;

    switch (itemType) {
      case 'product':
        navigate(`/${lang}/product/${productSlug}`);
        break;
      case 'category':
        navigate(`/${lang}/product?category_id=${item.id}`);
        break;
      case 'subcategory':
        navigate(`/${lang}/product?sub_category_id=${item.id}`);
        break;
      case 'brand':
        navigate(`/${lang}/product?brand_id=${item.id}`);
        break;
      default:
        navigate(`/${lang}/product/${productSlug}`);
    }
  };

  const handleSearchQuery = (query: string) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    setIsOpen(false);
    setSearchValue('');
    enableScrolling();
    navigate(`/${lang}/search?q=${encodeURIComponent(query)}`);
  };

  const handleViewAll = () => {
    if (SearchValue && SearchValue.length >= 2) {
      handleSearchQuery(SearchValue);
    }
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  };

  const formatPrice = (price: number) => price.toLocaleString('az-AZ');

  if (!isOpen) return null;

  const hasSearchResults = SearchValue.length >= 2 && results && (
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.subcategories?.length > 0 ||
    results.brands.length > 0
  );

  const showInitialState = SearchValue.length < 2;

  return (
    <div
      ref={dropdownRef}
      className="fixed top-[180px] left-1/2 -translate-x-1/2 w-[95%] max-w-[900px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[99999] max-h-[70vh] overflow-hidden"
    >
      {/* Initial State - Recent + Popular */}
      {showInitialState && (
        <div className="overflow-y-auto max-h-[70vh]">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>🕐</span> {t.recentSearches}
                </h3>
                <button
                  onClick={handleClearRecent}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <span>🗑️</span> {t.clearAll}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, idx) => (
                  <button
                    key={`recent-${idx}`}
                    onClick={() => handleSearchQuery(query)}
                    className="group px-3 py-2 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-full text-sm transition-all flex items-center gap-2"
                  >
                    <span className="text-gray-500 group-hover:text-blue-100">🔍</span>
                    <span>{query}</span>
                    <span
                      onClick={(e) => handleRemoveRecent(e, query)}
                      className="text-gray-400 hover:text-red-500 group-hover:text-white ml-1"
                    >
                      ✕
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Loading State */}
      {SearchValue.length >= 2 && isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3">{t.searching}</p>
        </div>
      )}

      {/* No Results */}
      {SearchValue.length >= 2 && !isLoading && !hasSearchResults && (
        <div className="p-10 text-center">
          <div className="text-7xl mb-4">🔍</div>
          <p className="text-xl text-gray-600 font-medium">{t.noResults}</p>
          <p className="text-gray-400 mt-2">"{SearchValue}"</p>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && hasSearchResults && (
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {(results!.categories.length > 0 || results!.subcategories?.length > 0 || results!.brands.length > 0) && (
            <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4">
              {results!.categories.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t.categories}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results!.categories.map((cat) => (
                      <button
                        key={`cat-${cat.id}`}
                        onClick={() => handleItemClick(cat)}
                        className="px-3 py-1.5 bg-white hover:bg-blue-500 hover:text-white rounded-lg text-sm transition-all shadow-sm flex items-center gap-2 group"
                      >
                        <span className="text-blue-500 group-hover:text-white">📁</span>
                        <span className="font-medium">{cat.title}</span>
                        <span className="text-xs text-gray-400 group-hover:text-blue-100">
                          ({cat.products_count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results!.subcategories?.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t.subcategories}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results!.subcategories.map((sub) => (
                      <button
                        key={`sub-${sub.id}`}
                        onClick={() => handleItemClick(sub)}
                        className="px-3 py-1.5 bg-white hover:bg-green-500 hover:text-white rounded-lg text-sm transition-all shadow-sm flex items-center gap-2 group"
                      >
                        <span className="text-green-500 group-hover:text-white">📂</span>
                        <span className="font-medium">{sub.title}</span>
                        {sub.parent_title && (
                          <span className="text-xs text-gray-400 group-hover:text-green-100">
                            {t.inCategory} {sub.parent_title}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results!.brands.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t.brands}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results!.brands.map((brand) => (
                      <button
                        key={`brand-${brand.id}`}
                        onClick={() => handleItemClick(brand)}
                        className="px-3 py-1.5 bg-white hover:bg-purple-500 hover:text-white rounded-lg text-sm transition-all shadow-sm flex items-center gap-2 group"
                      >
                        <span className="text-purple-500 group-hover:text-white">🏷️</span>
                        <span className="font-medium">{brand.title}</span>
                        <span className="text-xs text-gray-400 group-hover:text-purple-100">
                          ({brand.products_count})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {results!.products.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                {t.products} ({results!.products.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results!.products.slice(0, 12).map((product) => (
                  <button
                    key={`prod-${product.id}`}
                    onClick={() => handleItemClick(product)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left group border border-transparent hover:border-gray-200"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                        {product.title}
                      </p>
                      {product.brand && (
                        <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {product.discount && product.discount > 0 ? (
                          <>
                            <span className="text-sm font-bold text-red-500">
                              {formatPrice(product.discounted_price || 0)} ₼
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(product.price || 0)} ₼
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                              -{product.discount}%
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(product.price || 0)} ₼
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View All Button */}
      {hasSearchResults && (
        <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 border-t">
          <button
            onClick={handleViewAll}
            className="w-full py-3 px-6 bg-white hover:bg-gray-50 text-blue-600 font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <span>{t.viewAll}</span>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
              {results?.total || results?.products.length}+ {t.productCount}
            </span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
