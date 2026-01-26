import { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../../setting/Types';

export interface TiktokItem {
  id: number;
  image: string;
  products?: Product[];
}

export type Tiktoks = TiktokItem[];

export default function StoryViewer({ stories, initialIndex, onClose }: any) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const autoAdvanceInterval = useRef<NodeJS.Timeout | null>(null);
  const storyContainerRef = useRef<HTMLDivElement>(null);
  const storyDuration = 5000; // 5 seconds per story

  const currentStory = stories[currentIndex];

  // Handle auto-advancing stories
  useEffect(() => {
    // Clear any existing interval
    if (autoAdvanceInterval.current) {
      clearInterval(autoAdvanceInterval.current);
    }

    // Set up new interval for auto-advancing
    const interval = setInterval(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Close viewer if we're at the last story
        onClose();
      }
    }, storyDuration);

    autoAdvanceInterval.current = interval;

    return () => {
      if (autoAdvanceInterval.current) {
        clearInterval(autoAdvanceInterval.current);
      }
    };
  }, [currentIndex, stories.length, onClose]);

  // Handle touch events for swiping
  useEffect(() => {
    const container = storyContainerRef.current;
    if (!container) return;

    let startX: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      // Threshold for swipe detection
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < stories.length - 1) {
          // Swipe left - go to next story
          setCurrentIndex(currentIndex + 1);
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe right - go to previous story
          setCurrentIndex(currentIndex - 1);
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, stories.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, stories.length, onClose]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <section
      className="fixed inset-0 bg-black z-[99999] flex items-center justify-center"
      ref={storyContainerRef}>
      {/* Close button */}
      <button
        className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center"
        onClick={onClose}>
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Main story container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Main story - Phone-shaped container */}
        <div className="relative max-w-[400px] w-full h-[80vh] flex items-center justify-center">
          <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-white">
            <img
              src={currentStory.image || '/placeholder.svg'}
              alt={`Story ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Product info at bottom */}
            {currentStory.products && currentStory.products.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white p-4 flex items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {currentStory.products[0].image && (
                      <img
                        src={
                          currentStory.products[0].image || '/placeholder.svg'
                        }
                        alt="Product"
                        className="w-12 h-12 object-cover border border-gray-200"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {currentStory.products[0].name ||
                          'İki tərəfli zara qalın pencək'}
                      </p>
                      <p className="font-bold">
                        {currentStory.products[0].price || '298 ₼'}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-400 text-white px-4 py-2 rounded-full text-sm">
                  İndi al
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Left/Right navigation arrows */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-30 flex items-center justify-center z-10"
          onClick={goToPrevious}
          style={{ display: currentIndex === 0 ? 'none' : 'flex' }}>
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black bg-opacity-30 flex items-center justify-center z-10"
          onClick={goToNext}
          style={{
            display: currentIndex === stories.length - 1 ? 'none' : 'flex',
          }}>
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}
