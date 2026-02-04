import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { Link, useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request';
import { Product, TranslationsKeys } from '../../setting/Types';
import ROUTES from '../../setting/routes';
import { formatPrice } from '../../utils/currency';

interface TimedDiscountSliderProps {
  translation: TranslationsKeys | undefined;
}

// Countdown Timer - useReducer ilə
function CountdownBadge({ endDate }: { endDate: string }) {
  const [, forceRender] = useReducer(x => x + 1, 0);
  
  useEffect(() => {
    const timer = setInterval(forceRender, 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = new Date(endDate).getTime() - Date.now();
  
  if (diff <= 0) return null;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-1 bg-[#22C55E] text-white px-3 py-1.5 rounded-full text-xs font-medium">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {d > 0 && `${d}d : `}{pad(h)}h : {pad(m)}m : {pad(s)}s
      </span>
    </div>
  );
}

// Product Card
function DiscountProductCard({ product, lang }: { product: Product; lang: string }) {
  const slug = typeof product.slug === 'object' 
    ? product.slug[lang as keyof typeof product.slug] 
    : product.slug;

  const discount = Number(product.discount || 0);

  return (
    <div className="flex-shrink-0 w-[200px] md:w-[240px] lg:w-[280px]">
      <Link 
        to={`/${lang}/${ROUTES.productSingle[lang as keyof typeof ROUTES.productSingle]}/${slug}`}
        className="flex flex-col w-full h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl bg-white group border border-gray-100 hover:border-gray-200"
      >
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5F5F5]">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-[#FF4444] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                -{discount}%
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col p-3 flex-grow">
          {product.discount_ends_at && (
            <div className="mb-2">
              <CountdownBadge endDate={product.discount_ends_at} />
            </div>
          )}

          <h3 className="text-sm md:text-base font-medium text-black mb-2 line-clamp-2 flex-grow">
            {product.title}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            {discount > 0 ? (
              <>
                <span className="text-lg md:text-xl font-bold text-[#3873C3]">
                  {formatPrice(product.discounted_price)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg md:text-xl font-bold text-black">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// Main Slider
export default function TimedDiscountSlider({ translation }: TimedDiscountSliderProps) {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: products, isLoading } = GETRequest<Product[]>(
    '/products/timed-discounts?limit=20',
    'timed-discount-products',
    [lang]
  );

  const checkScroll = useCallback(() => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = sliderRef.current;
    el?.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [checkScroll, products]);

  const scroll = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollBy({
      left: dir === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  if (!isLoading && (!products || products.length === 0)) return null;

  return (
    <section className="py-[24px] max-sm:py-[14px] bg-white">
      <div className="mx-4 md:mx-10 lg:mx-16">
        <div className="flex items-center justify-between mb-5">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800">
  <span translate="yes">
    {translation?.Limitli_təkliflər || (lang === 'en' ? 'Limited offers' : 'Limitli təkliflər')}
  </span>
</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                canScrollLeft ? 'bg-[#F5F5F5] hover:bg-gray-200' : 'bg-gray-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                canScrollRight ? 'bg-[#F5F5F5] hover:bg-gray-200' : 'bg-gray-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex-shrink-0 w-[200px] md:w-[240px] lg:w-[280px] aspect-[3/5] bg-[#F5F5F5] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products?.map(product => (
              <DiscountProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}