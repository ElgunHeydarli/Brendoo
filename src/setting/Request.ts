import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

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

// ✅ YENİ: Google Translate-dən seçilmiş dili al
const getSelectedLanguage = (): string => {
  // 1. Əvvəlcə localStorage-dan Google Translate dilini yoxla
  const googleLang = localStorage.getItem('selectedGoogleLangCode');
  if (googleLang && ['az', 'en', 'ru', 'tr'].includes(googleLang)) {
    return googleLang;
  }
  
  // 2. Cookie-dən googtrans yoxla
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'googtrans' && value) {
      // Format: /en/az veya /en/ru
      const parts = value.split('/');
      if (parts.length >= 3) {
        const targetLang = parts[2];
        if (['az', 'en', 'ru', 'tr'].includes(targetLang)) {
          return targetLang;
        }
      }
    }
  }
  
  // 3. Default: en
  return 'en';
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
    params?: Record<string, any>
) {
  // ✅ DÜZƏLDİLDİ: Default 'en' və Google Translate dilini istifadə et
  const { lang: urlLang } = useParams<{ lang: string }>();
  const lang = urlLang || getSelectedLanguage();

  const isProtected = useMemo(() => isProtectedEndpoint(api), [api]);
  const userInfo = useMemo(() => getUserInfo(), []);
  const shouldSkipQuery = useMemo(() =>
          isProtected && !userInfo.token,
      [isProtected, userInfo.token]
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery<T>({
    queryKey: [querykey, ...dependencies, params, lang], // ✅ lang əlavə edildi
    queryFn: async () => {
      if (shouldSkipQuery) {
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
    enabled: !shouldSkipQuery,
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
  // ✅ DÜZƏLDİLDİ: Default 'en' və Google Translate dilini istifadə et
  const { lang: urlLang } = useParams<{ lang: string }>();
  const lang = urlLang || getSelectedLanguage();
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
    // ✅ YENİ: Mutation-larda da düzgün dili istifadə et
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