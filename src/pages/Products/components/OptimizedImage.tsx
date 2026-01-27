// pages/Products/components/OptimizedImage.tsx

import { memo, useState, useCallback } from "react";

const API_URL = 'https://admin.brendoo.com';

const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  if (src.startsWith('storage/')) return API_URL + '/' + src;
  return API_URL + '/storage/' + src;
};

interface OptimizedImageProps {
  src: string;
  thumbnail?: string;
  alt: string;
  className?: string;
}

const OptimizedImage = memo(({
  src,
  thumbnail,
  alt,
  className = ''
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageSrc = getImageUrl(thumbnail || src);
  const fallbackSrc = getImageUrl(src);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (!hasError && target.src !== fallbackSrc) {
      target.src = fallbackSrc;
      setHasError(true);
    }
  }, [fallbackSrc, hasError]);

  return (
    <div className="relative overflow-hidden w-full h-full bg-gray-100">
      {/* Placeholder skeleton - shows until image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {/* Image with native lazy loading */}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
