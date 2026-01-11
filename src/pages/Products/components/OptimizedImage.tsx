// pages/Products/components/OptimizedImage.tsx

import { memo } from "react";

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
  const imageSrc = thumbnail || src;

  return (
    <div className="relative overflow-hidden w-full h-full bg-gray-100">
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-300 ${className}`}
        onError={(e: any) => {
          if (e.target.src !== src) {
            e.target.src = src;
          }
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
