import type React from 'react';
import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = 'https://admin.brendoo.com';

// Şəkil URL-ini düzgün formata çevir
const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '/placeholder.svg';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) {
    return API_URL + src;
  }
  return src;
};

type Slide = {
  id: number;
  image: string;
};

interface ImageSliderProps {
  isHome: boolean;
  slides: Slide[];
  onClick: () => void;
  className?: string;
}

export default function ImageSlider({ slides, onClick, className = '' }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    },
    [slides.length],
  );

  const goToNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex(prev => (prev + 1) % slides.length);
    },
    [slides.length],
  );

  if (!slides || slides.length === 0) {
    return (
      <img
        onClick={onClick}
        className={`${className} object-cover w-full h-full`}
        src="/placeholder.svg"
        alt="No image available"
        loading="lazy"
        draggable={false}
        onDragStart={e => e.preventDefault()}
      />
    );
  }

  if (slides.length === 1) {
    return (
      <img
        onClick={onClick}
        className={`${className} object-cover w-full h-full`}
        src={getImageUrl(slides[0].image)}
        alt="Product"
        loading="lazy"
        draggable={false}
        onDragStart={e => e.preventDefault()}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <div
        className="w-full h-full overflow-hidden"
        style={{ backgroundColor: '#ececec' }}
        aria-live="polite"
      >
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <img
              key={slide.id ?? index}
              src={getImageUrl(slide.image)}
              alt={`Product slide ${index + 1}`}
              className={`${className} min-w-full object-contain`}
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
              onDragStart={e => e.preventDefault()}
              onClick={onClick}
            />
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md hover:bg-white/90 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 shadow-md hover:bg-white/90 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={e => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}