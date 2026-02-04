import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';

interface Suggestion {
  type: 'product' | 'category' | 'brand' | 'popular';
  text: string;
  slug?: string;
  icon: string;
}

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  price: string;
  old_price?: string;
  discount?: number;
  image: string;
  brand?: string;
  category?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Məhsulları filter edən funksiya
const filterProducts = (products: SearchResult[]): SearchResult[] => {
  const seenIds = new Set<number>();
  return products.filter((p) => {
    // Title yoxdursa və ya boşdursa - çıxar
    if (!p.title || p.title.trim() === '') return false;
    // Title yalnız brand adıdırsa - çıxar
    if (p.brand && p.title.trim().toLowerCase() === p.brand.trim().toLowerCase()) return false;
    // Dublikat - çıxar
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Dil mətnləri
  const texts = {
    az: {
      placeholder: 'Məhsul, kateqoriya və ya brend axtar...',
      recent: 'Son axtarışlar',
      popular: 'Populyar axtarışlar',
      clear: 'Təmizlə',
      noResults: 'Nəticə tapılmadı',
      viewAll: 'Hamısına bax',
      searching: 'Axtarılır...',
    },
    en: {
      placeholder: 'Search products, categories or brands...',
      recent: 'Recent searches',
      popular: 'Popular searches',
      clear: 'Clear',
      noResults: 'No results found',
      viewAll: 'View all',
      searching: 'Searching...',
    },
  };
  const t = texts[lang as keyof typeof texts] || texts.az;

  // Modal açılanda focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      fetchInitialData();
    }
  }, [isOpen]);

  // ESC ilə bağla
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // İlkin data yüklə
  const fetchInitialData = async () => {
    try {
      const [recentRes, popularRes] = await Promise.all([
        axios.get('https://admin.brendoo.com/api/search/recent'),
        axios.get('https://admin.brendoo.com/api/search/popular'),
      ]);
      setRecentSearches(recentRes.data.recent_searches || []);
      setPopularSearches(popularRes.data.popular_searches || []);
    } catch (error) {
      console.log('Initial data fetch error:', error);
    }
  };

  // Debounced autocomplete
  const fetchAutocomplete = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://admin.brendoo.com/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`,
          { headers: { 'Accept-Language': lang } }
        );
        
        // Boş text-ləri filter et
        const filteredSuggestions = (res.data || []).filter(
          (s: Suggestion) => s.text && s.text.trim() !== ''
        );
        setSuggestions(filteredSuggestions);
      } catch (error) {
        console.log('Autocomplete error:', error);
      }
    }, 300),
    [lang]
  );

  // Debounced search
  const fetchSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://admin.brendoo.com/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`,
          { headers: { 'Accept-Language': lang } }
        );
        
        // Title-sız və dublikat məhsulları filter et
        const filteredProducts = filterProducts(res.data.products || []);
        setResults(filteredProducts);
        setShowResults(true);
      } catch (error) {
        console.log('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [lang]
  );

  // Input dəyişəndə
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchAutocomplete(value);
    fetchSearch(value);
  };

  // Axtarış et
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onClose();
      navigate(`/${lang}/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Enter basılanda
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  // Məhsula keç
  const handleProductClick = (slug: string) => {
    onClose();
    navigate(`/${lang}/products/${slug}`);
  };

  // Tarixçəni təmizlə
  const clearHistory = async () => {
    try {
      await axios.delete('https://admin.brendoo.com/api/search/history');
      setRecentSearches([]);
    } catch (error) {
      console.log('Clear history error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="w-full max-w-3xl mx-auto mt-20 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Axtarış input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            className="flex-1 text-lg outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setSuggestions([]); setResults([]); setShowResults(false); }} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700 font-medium">
            ESC
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">{t.searching}</span>
            </div>
          )}

          {/* Autocomplete təklifləri */}
          {suggestions.length > 0 && !showResults && !isLoading && (
            <div className="p-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSearch(suggestion.text)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="text-xl">{suggestion.icon}</span>
                  <span className="flex-1">{suggestion.text}</span>
                  <span className="text-xs text-gray-400 capitalize">
                    {suggestion.type === 'product' && '🛍️'}
                    {suggestion.type === 'category' && '📁'}
                    {suggestion.type === 'brand' && '🏷️'}
                    {suggestion.type === 'popular' && '🔥'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Axtarış nəticələri */}
          {showResults && !isLoading && (
            <div className="p-4">
              {results.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {results.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="cursor-pointer group"
                      >
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-blue-600">{product.price} ₼</span>
                          {product.old_price && (
                            <span className="text-xs text-gray-400 line-through">{product.old_price} ₼</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full mt-4 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t.viewAll} →
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl">🔍</span>
                  <p className="mt-4 text-gray-500">{t.noResults}</p>
                </div>
              )}
            </div>
          )}

          {/* İlkin vəziyyət - son və populyar axtarışlar */}
          {!query && !isLoading && (
            <div className="p-4">
              {/* Son axtarışlar */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{t.recent}</h3>
                    <button onClick={clearHistory} className="text-sm text-blue-600 hover:underline">
                      {t.clear}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => { setQuery(search); handleSearch(search); }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                      >
                        🕐 {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Populyar axtarışlar */}
              {popularSearches.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t.popular}</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => { setQuery(search); handleSearch(search); }}
                        className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full text-sm transition-colors"
                      >
                        🔥 {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
