import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import GETRequest from '../../../setting/Request';
import { RefetchBasked, RefetchLocalBasked } from '../../../setting/StateManagmant';
import ROUTES from '../../../setting/routes';
import {
  Basket,
  CatalogCategory,
  Category,
  ProductResponse,
  TranslationsKeys,
} from '../../../setting/Types';
import { UseHeaderReturn } from '../types';

const API_URL = 'https://admin.brendoo.com';
const GUEST_CART_KEY = 'guest_cart';

// Language Store
export type LanguageStore = {
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
};

const normalizeLang = (value?: string | null): 'az' | 'en' => {
  return value === 'en' ? 'en' : 'az';
};

export const useLanguageStore = create<LanguageStore>((set) => ({
  selectedLang: normalizeLang(localStorage.getItem('selectedLang')),
  setSelectedLang: (lang) => {
    const normalized = normalizeLang(lang);
    localStorage.setItem('selectedLang', normalized);
    set({ selectedLang: normalized });
  },
}));

// Scroll Functions
export function disableScrolling() {
  document.body.style.overflow = 'hidden';
}

export function enableScrolling() {
  document.body.style.overflow = '';
  document.body.style.position = '';
}

// Guest cart helper
const getGuestCart = (): Basket => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : { basket_items: [], total_price: 0, discount: 0, final_price: 0, delivered_price: 0 };
  } catch {
    return { basket_items: [], total_price: 0, discount: 0, final_price: 0, delivered_price: 0 };
  }
};

// Main Hook
export function useHeader(): UseHeaderReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang = 'az' } = useParams<{ lang: string }>();

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const CatalogBtnRef = useRef<HTMLDivElement>(null);
  const CAtalogDiv = useRef<HTMLDivElement>(null);
  const BaskedBtnRef = useRef<HTMLDivElement>(null);
  const BaskedDiv = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // States
  const [isCatalogOpen, setIsClothingOpen] = useState(false);
  const [isBaskedOpen, setIsBaskedOpen] = useState(false);
  const [, setRefetcLocalBasked] = useRecoilState(RefetchLocalBasked);
  const [SearchValue, setSearchValue] = useState('');
  const [User, setUser] = useState<any | null>(null);
  const [debouncedValue, setDebouncedValue] = useState(SearchValue);
  const [showaside, setShowAside] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSubCAtegoryes, setshowSubCAtegoryes] = useState(-1);
  const [CurrentCategory, setCurrentCategory] = useState(-1);
  const [currentSubCategoryId, setCurrentSubCategoryId] = useState(0);
  const [, setRefetchBaskedState] = useRecoilState<boolean>(RefetchBasked);
  const [isMobileSearchLoading, setIsMobileSearchLoading] = useState(false);
  const [isImageSearching, setIsImageSearching] = useState(false);
  
  // Guest cart üçün force update trigger
  const [guestCartTrigger, setGuestCartTrigger] = useState(0);

  // User & Token
  const userStr = localStorage.getItem('user-info');
  const parsed = userStr ? JSON.parse(userStr) : null;
  const token = parsed?.token;

  // Route calculations
  const productsRoute = ROUTES.product[lang as keyof typeof ROUTES.product];
  const pathParts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const isProductsListPage = pathParts[0] === lang && pathParts[1] === productsRoute && pathParts.length === 2;
  const isDetail = pathParts.length === 3;

  // ✅ Basket Items - useQuery ilə real-time
  const { data: basketItemsData, isLoading: baskedLoading, refetch: refetchBasket } = useQuery({
    queryKey: ['basket_items', lang, guestCartTrigger],
    queryFn: async () => {
      // Guest user
      if (!token) {
        return getGuestCart();
      }
      // Logged-in user
      const res = await axios.get(`${API_URL}/api/basket_items`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': lang,
        },
      });
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ✅ Favorites - useQuery ilə real-time
  const { data: favorites, refetch: refetchFavorites } = useQuery({
    queryKey: ['favorites', lang],
    queryFn: async () => {
      if (!token) return [];
      const res = await axios.get(`${API_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': lang,
        },
      });
      return res.data;
    },
    staleTime: 0,
    enabled: !!token,
  });

  // API Queries
  const { data: categories, isLoading: categoriesLoading } = GETRequest<Category[]>(
    `/home_categories`,
    'home_categories',
    [lang]
  );

  const { data: FilteredProduct, isLoading: productsLoading } = GETRequest<ProductResponse>(
    `/products${
      debouncedValue
        ? `?search=${debouncedValue}${currentSubCategoryId === 0 ? '' : `&sub_category_id=${currentSubCategoryId}`}`
        : ``
    }`,
    'products',
    [lang, debouncedValue, currentSubCategoryId]
  );

  const { data: translation } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);

  const { data: catalog_categories } = GETRequest<CatalogCategory[]>(
    `/catalog_categories`,
    'catalog_categories',
    [lang]
  );

  // ✅ hasItems - real-time hesablanır
  const hasItems = basketItemsData?.basket_items?.length > 0 ? basketItemsData.basket_items : null;

  // ✅ Guest cart & favorites event listeners
  useEffect(() => {
    const handleGuestCartUpdate = () => {
      setGuestCartTrigger(prev => prev + 1);
    };

    const handleFavoritesUpdate = () => {
      refetchFavorites();
    };

    const handleGuestFavoritesUpdate = () => {
      // Force re-render to update favorites count
      window.location.reload();
    };

    window.addEventListener('guest_cart_updated', handleGuestCartUpdate);
    window.addEventListener('favorites_updated', handleFavoritesUpdate);
    window.addEventListener('guest_favorites_updated', handleGuestFavoritesUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === GUEST_CART_KEY) {
        handleGuestCartUpdate();
      }
      if (e.key === 'guest_favorites') {
        handleGuestFavoritesUpdate();
      }
    });

    return () => {
      window.removeEventListener('guest_cart_updated', handleGuestCartUpdate);
      window.removeEventListener('favorites_updated', handleFavoritesUpdate);
      window.removeEventListener('guest_favorites_updated', handleGuestFavoritesUpdate);
    };
  }, [refetchFavorites]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedValue(value);
      if (value !== '') {
        disableScrolling();
      } else {
        enableScrolling();
      }
    }, 600);
  };

  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setIsMobileSearchLoading(value !== '');

    debounceTimeout.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsMobileSearchLoading(false);
    }, 600);
  };

  // Image Search
// Image Search - Google Vision API
const handleImageSearch = async (file: File) => {
  if (!file) return;
  setIsImageSearching(true);

  try {
    // Faylı base64-ə çevir
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await axios.post(
      `${API_URL}/api/vision-search`,
      { image: base64 },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang,
        },
      }
    );

    if (response.data.success && response.data.products.length > 0) {
      // Nəticələri localStorage-da saxla
      localStorage.setItem('vision_search_results', JSON.stringify(response.data));
      navigate(`/${lang}/search?type=vision`);
      window.location.href = `/${lang}/search?type=vision`;
    } else {
      toast.error(translation?.sekilde_mehsul_tapilmadi || 'Şəkildə məhsul tapılmadı');
    }
  } catch (error: any) {
    console.error('Vision search error:', error);
    toast.error(error.response?.data?.message || translation?.xeta_bas_verdi || 'Xəta baş verdi');
  } finally {
    setIsImageSearching(false);
  }
};

  const triggerImageSearch = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleImageSearch(file);
    };
    input.click();
  };

  const toggleIdInLocalStorage = (id: number) => {
    setRefetcLocalBasked((prev) => !prev);
    // Guest cart-dan sil (yeni sistem)
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (raw) {
        const cart = JSON.parse(raw);
        cart.basket_items = (cart.basket_items || []).filter((item: any) => item.id !== id);
        let total = 0, discount = 0, final = 0;
        cart.basket_items.forEach((i: any) => {
          const orig = Number(i?.product?.price) || 0;
          const disc = Number(i?.price) || Number(i?.product?.discounted_price) || orig;
          total += orig * (i?.quantity || 1);
          discount += (orig - disc) * (i?.quantity || 1);
          final += disc * (i?.quantity || 1);
        });
        cart.total_price = total; cart.discount = discount; cart.final_price = final;
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event('guest_cart_updated'));
        setGuestCartTrigger(prev => prev + 1);
        return;
      }
    } catch { /* ignore */ }
    // Köhnə sistem fallback
    const storedIds = localStorage.getItem('ids') || '';
    const idArray = storedIds.split(',').filter(Boolean);
    const index = idArray.indexOf(`${id}`);
    if (index === -1) {
      idArray.push(`${id}`);
    } else {
      idArray.splice(index, 1);
    }
    localStorage.setItem('ids', idArray.join(','));
  };

  const fetchBasketItems = useCallback(async () => {
    await refetchBasket();
  }, [refetchBasket]);

  // Mutations
  const RemoveFromBasked = async (id: number) => {
    if (userStr) {
      const User = JSON.parse(userStr);
      await axios.delete(`${API_URL}/api/basket_items/${id}`, {
        headers: {
          Authorization: `Bearer ${User.token}`,
          Accept: 'application/json',
        },
      });
    }
  };

  const UpdateBasked = async (id: number, price: string, quantity: number) => {
    if (userStr) {
      const User = JSON.parse(userStr);
      await axios.put(
        `${API_URL}/api/basket_items/${id}`,
        { price, quantity },
        {
          headers: {
            Authorization: `Bearer ${User.token}`,
            Accept: 'application/json',
          },
        }
      );
    }
  };

  const RemoveFromBaskedmutation = useMutation({
    mutationFn: RemoveFromBasked,
    onSuccess: () => {
      toast.success(translation?.mehsul_silindi || '');
      refetchBasket();
    },
    onError: (error) => {
      toast.error('Something went wrong');
      console.error(error);
    },
  });

  const UpdateBaskedmutation = useMutation({
    mutationFn: ({ id, price, quantity }: { id: number; price: string; quantity: number }) =>
      UpdateBasked(id, price, quantity),
    onSuccess: () => {
      toast.success(translation?.say_artirildi || '');
      refetchBasket();
    },
    onError: (error) => {
      toast.error('An error occurred.');
      console.error(error);
    },
  });

  // Effects
  useEffect(() => {
    if (inputRef.current && isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleOutsideClicked = (e: any) => {
      if (
        CatalogBtnRef.current &&
        !CatalogBtnRef.current.contains(e.target as Node) &&
        CAtalogDiv.current &&
        !CAtalogDiv.current.contains(e.target as Node)
      ) {
        setIsClothingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClicked);
    return () => document.removeEventListener('mousedown', handleOutsideClicked);
  }, []);

  useEffect(() => {
    const handleOutsideClicked = (e: any) => {
      if (
        BaskedBtnRef.current &&
        !BaskedBtnRef.current.contains(e.target as Node) &&
        BaskedDiv.current &&
        !BaskedDiv.current.contains(e.target as Node)
      ) {
        setIsBaskedOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClicked);
    return () => document.removeEventListener('mousedown', handleOutsideClicked);
  }, []);

  useEffect(() => {
    if (!isCatalogOpen && !isBaskedOpen && SearchValue === '') {
      enableScrolling();
    }
  }, [isBaskedOpen, isCatalogOpen, SearchValue]);

  useEffect(() => {
    setRefetchBaskedState((prev) => !prev);
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen) setIsMobileSearchLoading(false);
  }, [FilteredProduct, isSearchOpen]);

  return {
    // States
    isCatalogOpen,
    isBaskedOpen,
    SearchValue,
    debouncedValue,
    showaside,
    isSearchOpen,
    showSubCAtegoryes,
    CurrentCategory,
    currentSubCategoryId,
    User,
    baskedLoading,
    basketItemsData,
    hasItems,
    isMobileSearchLoading,
    isImageSearching,

    // Refs
    inputRef,
    CatalogBtnRef,
    CAtalogDiv,
    BaskedBtnRef,
    BaskedDiv,

    // Setters
    setIsClothingOpen,
    setIsBaskedOpen,
    setSearchValue,
    setShowAside,
    setIsSearchOpen,
    setshowSubCAtegoryes,
    setCurrentCategory,
    setCurrentSubCategoryId,
    setIsMobileSearchLoading,

    // Handlers
    handleSearchChange,
    handleMobileSearchChange,
    toggleIdInLocalStorage,
    fetchBasketItems,
    disableScrolling,
    enableScrolling,
    triggerImageSearch,

    // Data
    categories,
    categoriesLoading,
    favorites,
    FilteredProduct,
    productsLoading,
    translation,
    catalog_categories,

    // Mutations
    RemoveFromBaskedmutation,
    UpdateBaskedmutation,

    // Route helpers
    lang,
    navigate,
    isProductsListPage,
    isDetail,
  };
}