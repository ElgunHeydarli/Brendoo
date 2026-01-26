// pages/Products/components/OptimizedImage.tsx

import { memo } from "react";

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
  const imageSrc = getImageUrl(thumbnail || src);
  const fallbackSrc = getImageUrl(src);

  return (
    <div className="relative overflow-hidden w-full h-full bg-gray-100">
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-300 ${className}`}
        onError={(e: any) => {
          if (e.target.src !== fallbackSrc) {
            e.target.src = fallbackSrc;
          }
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
