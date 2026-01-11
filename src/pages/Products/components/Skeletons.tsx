// pages/Products/components/Skeletons.tsx

import { memo } from "react";

const FILTER_SKELETON_ITEMS = Array.from({ length: 4 }, (_, i) => i);
const PRODUCT_SKELETON_ITEMS = Array.from({ length: 8 }, (_, i) => i);

export const SkeletonItem = memo(({ className }: { className: string }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`} />
));
SkeletonItem.displayName = 'SkeletonItem';

export const FilterSkeleton = memo(() => (
  <div className="space-y-4">
    {FILTER_SKELETON_ITEMS.map((i) => (
      <SkeletonItem key={i} className="h-12 rounded-full" />
    ))}
  </div>
));
FilterSkeleton.displayName = 'FilterSkeleton';

export const ProductGridSkeleton = memo(() => (
  <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5 mt-6">
    {PRODUCT_SKELETON_ITEMS.map((i) => (
      <SkeletonItem key={i} className="w-full h-64 rounded-lg" />
    ))}
  </div>
));
ProductGridSkeleton.displayName = 'ProductGridSkeleton';
