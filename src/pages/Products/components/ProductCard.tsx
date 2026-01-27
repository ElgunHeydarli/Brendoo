// pages/Products/components/ProductCard.tsx

import { memo, useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import type { Product, TranslationsKeys } from "../../../setting/Types";
import ROUTES from "../../../setting/routes";
import OptimizedImage from "./OptimizedImage";
import CountdownTimer from "./CountdownTimer";
import { formatPrice } from "../../../utils/currency";
import { axiosInstance } from "../../../setting/Request";
import { useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
  translation: TranslationsKeys | undefined;
}

const ProductCard = memo(({ product, translation }: ProductCardProps) => {
  const { lang = "az" } = useParams<{ lang: string }>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDiscountExpired, setIsDiscountExpired] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const queryClient = useQueryClient();

  // Simple user check - read once on mount
  const userInfo = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user-info');
      const parsed = userStr ? JSON.parse(userStr) : null;
      return { token: parsed?.token, isLoggedIn: !!parsed?.token };
    } catch {
      return { token: null, isLoggedIn: false };
    }
  }, []);

  // Single effect for favorites - check on mount and listen for updates
  useEffect(() => {
    const checkFavorite = () => {
      if (userInfo.isLoggedIn) {
        const cachedFavorites = queryClient.getQueryData<any[]>(['favorites']);
        if (cachedFavorites) {
          setIsFavorite(cachedFavorites.some((item: any) => item?.product?.id === product?.id));
        }
      } else {
        try {
          const guestFavs = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
          setIsFavorite(guestFavs.some((fav: any) => fav?.id === product?.id));
        } catch {
          setIsFavorite(false);
        }
      }
    };

    // Check on mount
    checkFavorite();

    // Listen for updates
    window.addEventListener('favorites_updated', checkFavorite);
    window.addEventListener('guest_favorites_updated', checkFavorite);

    return () => {
      window.removeEventListener('favorites_updated', checkFavorite);
      window.removeEventListener('guest_favorites_updated', checkFavorite);
    };
  }, [userInfo.isLoggedIn, product?.id, queryClient]);

  // Null check - əgər product yoxdursa, heç nə göstərmə
  if (!product) {
    return null;
  }

  // Memoized values
  const productSlug = useMemo(() =>
    typeof product.slug === 'object'
      ? product.slug?.[lang as keyof typeof product.slug] || ''
      : product.slug || ''
  , [product.slug, lang]);

  const hasDiscount = useMemo(() =>
    Number(product.discount || 0) > 0 && !isDiscountExpired
  , [product.discount, isDiscountExpired]);

  const hasDiscountTimer = hasDiscount && product.discount_ends_at;

  // Memoized images array - only compute once
  const images = useMemo(() => {
    if (product.sliders && product.sliders.length > 0) {
      return product.sliders.map((slider: any) => slider?.image || slider).filter(Boolean);
    }
    return [product.image].filter(Boolean);
  }, [product.sliders, product.image]);

  const hasMultipleImages = images.length > 1;

  const toggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (userInfo.isLoggedIn && userInfo.token) {
      // Logged in user - API call
      try {
        await axiosInstance.post(
          '/favorites/toggleFavorite',
          { product_id: product.id },
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
              Accept: 'application/json',
            },
          }
        );

        // State optimistically update
        setIsFavorite(prev => !prev);

        // Invalidate favorites cache
        queryClient.invalidateQueries({ queryKey: ['favorites'] });

        // Header-ə əmr ver
        window.dispatchEvent(new Event('favorites_updated'));

      } catch (error) {
        console.error('Xəta:', error);
      }
    } else {
      // Guest user - localStorage-da saxla
      try {
        const guestFavKey = 'guest_favorites';
        let guestFavs = JSON.parse(localStorage.getItem(guestFavKey) || '[]');

        const index = guestFavs.findIndex((fav: any) => fav?.id === product.id);

        if (index > -1) {
          guestFavs.splice(index, 1);
        } else {
          guestFavs.push(product);
        }

        localStorage.setItem(guestFavKey, JSON.stringify(guestFavs));
        setIsFavorite(prev => !prev);
        window.dispatchEvent(new Event('guest_favorites_updated'));

      } catch (error) {
        console.error('Xəta:', error);
      }
    }
  }, [userInfo.isLoggedIn, userInfo.token, product.id, queryClient, product]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      } else {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  }, [images.length]);

  // Endirim vaxtı bitdikdə
  const handleDiscountExpire = useCallback(() => {
    setIsDiscountExpired(true);
  }, []);

  // ✅ YENİ: Dilə görə "Yeni" yazısı
  const getNewLabel = () => {
    if (translation?.Yeni) return translation.Yeni;
    switch (lang) {
      case 'az': return 'Yeni';
      case 'en': return 'New';
      case 'ru': return 'Новый';
      default: return 'Yeni';
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg bg-[#F5F5F5] group">
      {/* Image Container with Slider */}
      <div 
        className="relative w-full aspect-[1/1] overflow-hidden"
        onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
        onTouchMove={hasMultipleImages ? handleTouchMove : undefined}
        onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
      >
        <Link
          to={`/${lang}/${ROUTES.productSingle[lang as keyof typeof ROUTES.productSingle]}/${productSlug}`}
          className="block w-full h-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Only render current image - not all slides for better performance */}
          {images.length > 0 ? (
            <OptimizedImage
              src={images[currentSlide]}
              thumbnail={currentSlide === 0 ? product.thumbnail : undefined}
              alt={`${product.title || 'Product'} - ${currentSlide + 1}`}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </Link>

        {/* Countdown Timer - Sol üst künc */}
        {hasDiscountTimer && (
          <div className="absolute top-2 left-2 z-20">
            <CountdownTimer 
              endDate={product.discount_ends_at!} 
              onExpire={handleDiscountExpire}
            />
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-transform duration-200 hover:scale-110 active:scale-95"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF4444" stroke="#FF4444" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 md:flex hidden"
              aria-label="Previous image"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 md:flex hidden"
              aria-label="Next image"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {hasMultipleImages && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {images.slice(0, 5).map((_: string, index: number) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={`h-1 rounded-full transition-all duration-200 ${
                  currentSlide === index 
                    ? 'bg-white w-2.5' 
                    : 'bg-white/50 w-1 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
            {images.length > 5 && (
              <span className="text-white text-nowrap text-[10px] ml-1 bg-black/30 px-1 rounded">
                +{images.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <Link 
        to={`/${lang}/${ROUTES.productSingle[lang as keyof typeof ROUTES.productSingle]}/${productSlug}`}
        className="flex flex-col p-3 flex-grow"
      >
        {/* Badges - yalnız "Yeni" badge */}
        {product.is_new && (
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-[#3873C3] text-white px-[8px] py-[2px] rounded-full text-[10px] font-medium">
              {getNewLabel()}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-[12px] font-medium text-black mb-2 line-clamp-2 flex-grow">
          {product.title || 'Untitled Product'}
        </h3>

        {/* Price - faiz, endirimli qiymət və köhnə qiymət bir sətirdə */}
        <div className="flex items-center gap-1 mt-auto flex-nowrap overflow-hidden">
          {hasDiscount ? (
            <>
              <span className="bg-[#FF4444] text-white px-1 py-[1px] rounded text-[9px] font-medium shrink-0">
                -{Number(product.discount || 0)}%
              </span>
              <span className="text-[12px] font-bold text-[#3873C3] shrink-0">
                {formatPrice(product.discounted_price || 0)}
              </span>
              <span className="text-[10px] text-gray-400 line-through truncate">
                {formatPrice(product.price || 0)}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-bold text-black">
              {formatPrice(product.price || 0)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;