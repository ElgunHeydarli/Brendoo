import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import type { Swiper as SwiperType } from 'swiper';
import { Product } from '../../setting/Types';

// Optimized navigation icons component
const NavigationIcon = ({ direction = 'next' }: { direction?: 'next' | 'prev' }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={direction === 'prev' ? 'rotate-180' : ''}
    >
        <path
            d="M9.5 6L15.5 12L9.5 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Memoized slide component
const ProductSlide = ({ item, isActive, isNext }: {
    item: Product;
    isActive: boolean;
    isNext: boolean;
}) => {
    return (
        <SwiperSlide className="!h-full !relative">
            <div className="w-full h-full relative overflow-hidden">
                {/* Lazy loading with priority for active and next slides */}
                <img
                    src={item.image}
                    alt={item.title || 'Product image'}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading={isActive || isNext ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={(e) => {
                        // Fallback image
                        e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                />

                {/* Product info overlay */}
                <div className="absolute bottom-2 left-0 right-0 mx-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 transition-all duration-300 hover:bg-white/90">
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-base font-medium text-gray-900 line-clamp-1">
                                {item?.title}
                            </h3>

                            {/* Price section */}
                            <div className="flex items-center gap-2">
                                {item?.price && item?.discounted_price && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {item.price}
                                    </span>
                                )}
                                <span className="text-base font-semibold text-rose-500">
                                    {item?.discounted_price || item?.price}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SwiperSlide>
    );
};

// Main component
export default function ImageSwiper({ data }: { data: Product[] | undefined }) {
    const swiperRef = useRef<SwiperType | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isBeginning, setIsBeginning] = useState<boolean>(true);
    const [isEnd, setIsEnd] = useState<boolean>(false);

    // Memoized data processing
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.filter(item => item && item.image); // Filter out invalid items
    }, [data]);

    const totalSlides = processedData.length;

    // Navigation handlers with bounds checking
    const handleNext = useCallback(() => {
        if (swiperRef.current && !isEnd) {
            swiperRef.current.slideNext();
        }
    }, [isEnd]);

    const handlePrev = useCallback(() => {
        if (swiperRef.current && !isBeginning) {
            swiperRef.current.slidePrev();
        }
    }, [isBeginning]);

    // Swiper event handlers
    const handleSlideChange = useCallback((swiper: SwiperType) => {
        setCurrentIndex(swiper.activeIndex);
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    }, []);

    const handleSwiperInit = useCallback((swiper: SwiperType) => {
        swiperRef.current = swiper;
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev]);

    // Loading state
    if (!data || data.length === 0) {
        return (
            <div className="slider-container lg:w-[60%] w-full lg:aspect-square aspect-auto rounded-[20px] overflow-hidden bg-gray-100 flex items-center justify-center">
                <div className="text-gray-500">No images available</div>
            </div>
        );
    }

    // Single image without swiper
    if (totalSlides === 1) {
        const item = processedData[0];
        return (
            <div className="slider-container lg:w-[60%] w-full lg:aspect-square aspect-auto rounded-[20px] overflow-hidden relative">
                <img
                    src={item.image}
                    alt={item.title || 'Product image'}
                    className="w-full h-full object-cover"
                    loading="eager"
                />

                <div className="absolute bottom-2 left-0 right-0 mx-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4">
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-base font-medium text-gray-900">
                                {item?.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                {item?.price && item?.discounted_price && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {item.price}
                                    </span>
                                )}
                                <span className="text-base font-semibold text-rose-500">
                                    {item?.discounted_price || item?.price}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="slider-container lg:w-[60%] w-full lg:aspect-square aspect-auto rounded-[20px] overflow-hidden relative">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                loop={totalSlides > 1}
                watchSlidesProgress={true}
                speed={300}
                grabCursor={true}
                onSlideChange={handleSlideChange}
                onSwiper={handleSwiperInit}
                className="mySwiper rounded-[20px] overflow-hidden lg:!h-full !h-[500px]"
            >
                {processedData.map((item: Product, index: number) => (
                    <ProductSlide
                        key={`${item.id}-${index}`}
                        item={item}
                        isActive={index === currentIndex}
                        isNext={index === currentIndex + 1}
                    />
                ))}
            </Swiper>

            {/* Custom Navigation */}
            {totalSlides > 1 && (
                <div className="absolute bottom-6 right-4 z-10">
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
                        {/* Previous button */}
                        <button
                            onClick={handlePrev}
                            disabled={isBeginning}
                            className={`
                                w-11 h-11 rounded-full flex items-center justify-center
                                transition-all duration-200 text-white
                                ${isBeginning
                                ? 'bg-white/20 cursor-not-allowed opacity-50'
                                : 'bg-white/30 hover:bg-white/50 hover:scale-105 active:scale-95'
                            }
                            `}
                            aria-label="Previous image"
                        >
                            <NavigationIcon direction="prev" />
                        </button>

                        {/* Counter */}
                        <span className="text-white font-medium text-sm min-w-[3rem] text-center">
                            {currentIndex + 1}/{totalSlides}
                        </span>

                        {/* Next button */}
                        <button
                            onClick={handleNext}
                            disabled={isEnd}
                            className={`
                                w-11 h-11 rounded-full flex items-center justify-center
                                transition-all duration-200 text-white
                                ${isEnd
                                ? 'bg-white/20 cursor-not-allowed opacity-50'
                                : 'bg-white/30 hover:bg-white/50 hover:scale-105 active:scale-95'
                            }
                            `}
                            aria-label="Next image"
                        >
                            <NavigationIcon direction="next" />
                        </button>
                    </div>
                </div>
            )}

            {/* Pagination dots */}
            {totalSlides > 1 && totalSlides <= 5 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center gap-2">
                        {processedData.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => swiperRef.current?.slideTo(index)}
                                className={`
                                    w-2 h-2 rounded-full transition-all duration-200
                                    ${index === currentIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 hover:bg-white/70'
                                }
                                `}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
