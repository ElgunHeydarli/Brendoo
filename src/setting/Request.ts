import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import type { Category } from './Types';

// Optimized Axios Instance
export const axiosInstance = axios.create({
  baseURL: 'https://admin.brendoo.com/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache for user info
let userInfoCache: {
  data: any;
  token: string | null;
  timestamp: number;
} | null = null;

const USER_CACHE_DURATION = 30000;

const getUserInfo = () => {
  const now = Date.now();

  if (userInfoCache && (now - userInfoCache.timestamp) < USER_CACHE_DURATION) {
    return userInfoCache;
  }

  try {
    const userStr = localStorage.getItem('user-info');
    const parsed = userStr ? JSON.parse(userStr) : null;

    userInfoCache = {
      data: parsed,
      token: parsed?.token || null,
      timestamp: now
    };

    return userInfoCache;
  } catch (error) {
    userInfoCache = { data: null, token: null, timestamp: now };
    return userInfoCache;
  }
};

const SUPPORTED_LANGS = ['az', 'en'] as const;
type SupportedLang = typeof SUPPORTED_LANGS[number];

const normalizeLang = (value?: string | null): SupportedLang | null => {
  if (value === 'az' || value === 'en') return value;
  return null;
};

// ✅ Dili localStorage-dan al (default: az)
const getSelectedLanguage = (): SupportedLang => {
  const stored = normalizeLang(localStorage.getItem('selectedLang'));
  return stored || 'az';
};

const isProtectedEndpoint = (api: string): boolean => {
  return api.includes('/favorites') ||
      api.includes('/basket_items') ||
      api.includes('/orders') ||
      api.includes('/user');
};

export default function GETRequest<T>(
    api: string,
    querykey: string,
    dependencies: any[] = [],
  params?: Record<string, any>,
  enabled: boolean = true
) {
  const { lang: urlLang } = useParams<{ lang: string }>();
  const lang = normalizeLang(urlLang) || getSelectedLanguage();

  const isProtected = useMemo(() => isProtectedEndpoint(api), [api]);
  const userInfo = useMemo(() => getUserInfo(), []);
  const shouldSkipQuery = useMemo(() =>
          isProtected && !userInfo.token,
      [isProtected, userInfo.token]
  );

  const shouldEnableQuery = enabled && !shouldSkipQuery && Boolean(api);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<T>({
    queryKey: [querykey, ...dependencies, params, lang], // ✅ lang əlavə edildi
    enabled: shouldEnableQuery,
    queryFn: async () => {
      if (!shouldEnableQuery) {
        return null as unknown as T;
      }

      try {
        const response = await axiosInstance.get<T>(api, {
          headers: {
            'Accept-Language': lang,
            ...(userInfo.token && { Authorization: `Bearer ${userInfo.token}` }),
          },
          params,
        });

        return response.data;
      } catch (error) {
        // /productSingle endpoint-ində az dilində 404 alırsa, en dilində cəhd et
        if (api.includes('/productSingle') && lang === 'az' && axios.isAxiosError(error) && error.response?.status === 404) {
          console.warn(`Product not found in ${lang}, trying English...`);
          try {
            const fallbackResponse = await axiosInstance.get<T>(api, {
              headers: {
                'Accept-Language': 'en',
                ...(userInfo.token && { Authorization: `Bearer ${userInfo.token}` }),
              },
              params,
            });
            return fallbackResponse.data;
          } catch (fallbackError) {
            console.warn(`API Error [${querykey}]:`, fallbackError);
            throw fallbackError;
          }
        }
        console.warn(`API Error [${querykey}]:`, error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    data: shouldSkipQuery ? (null as unknown as T) : data,
    isLoading: !shouldSkipQuery && isLoading,
    isError,
    isSkipped: shouldSkipQuery,
    refetch,
    isFetching,
  };
}

export function useFastRequest<T>(
    api: string,
    querykey: string,
    dependencies: any[] = [],
    params?: Record<string, any>
) {
  const { lang: urlLang } = useParams<{ lang: string }>();
  const lang = normalizeLang(urlLang) || getSelectedLanguage();
  const userInfo = getUserInfo();

  return useQuery<T>({
    queryKey: [querykey, ...dependencies, params, lang], // ✅ lang əlavə edildi
    queryFn: async () => {
      const response = await axiosInstance.get<T>(api, {
        headers: {
          'Accept-Language': lang,
          ...(userInfo.token && { Authorization: `Bearer ${userInfo.token}` }),
        },
        params,
      });
      return response.data;
    },
    staleTime: 30000,
    gcTime: 60000,
    retry: 1,
    refetchOnMount: true,
  });
}

export const createMutation = (
    method: 'post' | 'put' | 'delete' | 'patch',
    api: string
) => {
  return async (data?: any) => {
    const userInfo = getUserInfo();
    const lang = getSelectedLanguage();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': lang,
    };

    if (userInfo.token) {
      headers.Authorization = `Bearer ${userInfo.token}`;
    }

    const response = await axiosInstance[method](api, data, { headers });
    return response.data;
  };
};

export const clearUserCache = () => {
  userInfoCache = null;
};

// ✅ YENİ: Export et ki, başqa fayllardan da istifadə oluna bilsin
export { getSelectedLanguage };

// ========================
// EXPARGO PICKUP API
// ========================

import type { PickupPoint, PickupPointsResponse, PickupCitiesResponse, OrderTrackingResponse } from './Types';

// Pickup nöqtələrini əldə et
export const getPickupPoints = async (city?: string, lang: string = 'az'): Promise<PickupPoint[]> => {
  try {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    const response = await axiosInstance.get<PickupPointsResponse>(`/pickup-points${params}`, {
      headers: { 'Accept-Language': lang },
    });
    // API response formatını yoxla
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data) {
      return response.data.data;
    }
    if (response.data?.pickup_points) {
      return response.data.pickup_points;
    }
    return [];
  } catch (error) {
    console.error('Pickup points fetch error:', error);
    return [];
  }
};

// Şəhərlər siyahısını əldə et
export const getPickupCities = async (lang: string = 'az'): Promise<string[]> => {
  try {
    const response = await axiosInstance.get<PickupCitiesResponse>('/pickup-points/cities', {
      headers: { 'Accept-Language': lang },
    });
    // API response formatını yoxla
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data) {
      return response.data.data;
    }
    if (response.data?.cities) {
      return response.data.cities;
    }
    return [];
  } catch (error) {
    console.error('Pickup cities fetch error:', error);
    return [];
  }
};

// Bütün tərcümələri əldə et (həm Azərbaycan, həm İngilis)
// Format: { az: { key: "mətni" }, en: { key: "text" } }
export const useAllTranslations = () => {
  const { lang: urlLang } = useParams<{ lang: string }>();
  const lang = normalizeLang(urlLang) || getSelectedLanguage();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['all-translations'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/translates/all', {
          headers: {
            'Accept-Language': lang,
          },
        });
        // Response formatı: { az: {...}, en: {...} }
        return response.data as {
          az: Record<string, string>;
          en: Record<string, string>;
        };
      } catch (error) {
        console.error('All translations fetch error:', error);
        return { az: {}, en: {} };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 dəqiqə cache
    gcTime: 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Cari dil üçün tərcümələri filtrə et
  const currentLanguageTranslations = useMemo(() => {
    if (!data) return {};
    const langData = lang === 'az' ? data.az : data.en;
    return langData || {};
  }, [data, lang]);

  // Hər iki dili birlikdə döndər
  return {
    translations: data || { az: {}, en: {} },
    currentLanguage: currentLanguageTranslations,
    isLoading,
    isError,
    refetch,
    lang,
  };
};

// Helper: Tərcümə key-indən mətn almaq
export const getTranslationValue = (
  translations: Record<string, string>,
  key: string,
  fallback: string = ''
): string => {
  return translations[key] || fallback;
};

// Helper: Həm az, həm en dillərindən ayrı ayrı mətnləri almaq
export const getTranslationInBothLanguages = (
  allTranslations: { az: Record<string, string>; en: Record<string, string> },
  key: string
): { az: string; en: string } => {
  return {
    az: allTranslations.az?.[key] || '',
    en: allTranslations.en?.[key] || '',
  };
};

// Sifariş tracking məlumatlarını əldə et
export const getOrderTracking = async (orderNumber: string, lang: string = 'az'): Promise<OrderTrackingResponse | null> => {
  try {
    const userInfo = getUserInfo();
    const response = await axiosInstance.get<OrderTrackingResponse>(`/orders/${orderNumber}/tracking`, {
      headers: {
        'Accept-Language': lang,
        ...(userInfo.token && { Authorization: `Bearer ${userInfo.token}` }),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Order tracking fetch error:', error);
    return null;
  }
};

// Kateqoriyanın filtrlərini əldə et
export const getFilters = async (categoryId: number, lang: string = 'az'): Promise<Category | null> => {
  try {
    const response = await axiosInstance.get<Category>(`/category/${categoryId}/get-filters`, {
      headers: {
        'Accept-Language': lang,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Filters fetch error for category ${categoryId}:`, error);
    return null;
  }
};