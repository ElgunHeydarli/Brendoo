import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';

const API_URL = 'https://admin.brendoo.com';

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
  },
  ru: {
    products: 'Продукты',
    categories: 'Категории',
    subcategories: 'Подкатегории',
    brands: 'Бренды',
    noResults: 'Ничего не найдено',
    viewAll: 'Смотреть все результаты',
    searching: 'Поиск...',
    inCategory: 'в категории',
    productCount: 'товаров',
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
  },
  tr: {
    products: 'Ürünler',
    categories: 'Kategoriler',
    subcategories: 'Alt kategoriler',
    brands: 'Markalar',
    noResults: 'Sonuç bulunamadı',
    viewAll: 'Tüm sonuçları gör',
    searching: 'Aranıyor...',
    inCategory: 'kategorisinde',
    productCount: 'ürün',
  },
};

const filterProducts = (products: SearchItem[]): SearchItem[] => {
  const seenIds = new Set<number>();
  return products.filter((p) => {
    if (!p.title || p.title.trim() === '') return false;
    if (p.brand && p.title.trim().toLowerCase() === p.brand.trim().toLowerCase()) return false;
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });
};

export default function SearchDropdown({ SearchValue, setSearchValue, enableScrolling, lang }: Props) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = texts[lang] || texts.ru;
  
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setResults(null);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      
      try {
        const { data } = await axios.get<SearchResponse>(
          `${API_URL}/api/search?q=${encodeURIComponent(query)}&limit=12`,
          { headers: { 'Accept-Language': lang } }
        );
        
        const filteredProducts = filterProducts(data.products || []);
        
        setResults({
          ...data,
          products: filteredProducts,
          total: filteredProducts.length
        });
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 150),
    [lang]
  );

  useEffect(() => {
    if (SearchValue && SearchValue.length >= 2) {
      performSearch(SearchValue);
    } else {
      setResults(null);
      setIsOpen(false);
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
    
    switch (item.type) {
      case 'product':
        navigate(`/${lang}/product/${item.slug}`);
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
    }
  };

  const handleViewAll = () => {
    if (SearchValue && SearchValue.length >= 2) {
      const query = SearchValue;
      setIsOpen(false);
      setSearchValue('');
      enableScrolling();
      navigate(`/${lang}/search?q=${encodeURIComponent(query)}`);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('ru-RU');

  if (!isOpen || SearchValue.length < 2) return null;

  const hasResults = results && (
    results.products.length > 0 || 
    results.categories.length > 0 || 
    results.subcategories?.length > 0 ||
    results.brands.length > 0
  );

  return (
    <div 
      ref={dropdownRef}
      className="fixed top-[180px] left-1/2 -translate-x-1/2 w-[95%] max-w-[900px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[99999] max-h-[70vh] overflow-hidden"
    >
      {isLoading && (
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3">{t.searching}</p>
        </div>
      )}

      {!isLoading && !hasResults && (
        <div className="p-10 text-center">
          <div className="text-7xl mb-4">🔍</div>
          <p className="text-xl text-gray-600 font-medium">{t.noResults}</p>
          <p className="text-gray-400 mt-2">"{SearchValue}"</p>
        </div>
      )}

      {!isLoading && hasResults && (
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {(results.categories.length > 0 || results.subcategories?.length > 0 || results.brands.length > 0) && (
            <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4">
              {results.categories.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t.categories}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((cat) => (
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

              {results.subcategories?.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t.subcategories}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.subcategories.map((sub) => (
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

              {results.brands.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t.brands}</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.brands.map((brand) => (
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

          {results.products.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                {t.products} ({results.products.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.products.slice(0, 9).map((product) => (
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

      {hasResults && (
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