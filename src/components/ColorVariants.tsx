import { Link, useParams } from 'react-router-dom';
import ROUTES from '../setting/routes';

interface ColorVariant {
  id: number;
  slug: {
    en: string;
    az: string;
  } | string;
  title?: string;  // Optional etdim
  color_name: string;
  color_code: string | null;
  image: string;
  price: number | string;
  discount: number | null;
  discounted_price: number | string | null;
  is_current?: boolean;  // Optional etdim
}

interface ColorVariantsProps {
  variants?: ColorVariant[] | null;
  currentColorName?: string;
}

const ColorVariants: React.FC<ColorVariantsProps> = ({
  variants,
  currentColorName,
}) => {
  const { lang = 'az' } = useParams<{ lang: string }>();

  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return null;
  }

  const getSlugValue = (slug: { en: string; az: string } | string): string => {
    if (typeof slug === 'string') {
      return slug;
    }
    if (slug && typeof slug === 'object') {
      return slug[lang as keyof typeof slug] || slug.az || slug.en || '';
    }
    return '';
  };

  const getProductUrl = (variant: ColorVariant): string => {
    const slugValue = getSlugValue(variant.slug);
    const productRoute = ROUTES.product?.[lang as keyof typeof ROUTES.product] || 'product';
    return `/${lang}/${productRoute}/${slugValue}`;
  };

  const currentVariant = variants.find(v => v.is_current);
  const displayColorName = currentColorName || currentVariant?.color_name || '';

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">Rənglər:</span>
        <span className="text-sm text-gray-500">{displayColorName}</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {variants.filter(variant => {
          // Boş variantları filtrə
          if (!variant || !variant.id || !variant.image) return false;
          if (variant.image.includes('no-image')) return false;
          
          // Qara və boş/placeholder rəngləri çıxar
          const colorCode = variant.color_code?.toLowerCase() || '';
          if (colorCode === '#000000' || colorCode === '#ffffff' || colorCode === '') return false;
          
          return true;
        }).map((variant) => {
          if (!variant || !variant.id) return null;
          
          const slugValue = getSlugValue(variant.slug);
          if (!slugValue) return null;

          if (variant.is_current) {
            return (
              <div
                key={variant.id}
                className="relative cursor-default ring-2 ring-blue-500 ring-offset-2 rounded-lg"
                title={variant.color_name || variant.title || ''}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-400">
                  <img
                    src={variant.image || '/images/no-image.png'}
                    alt={variant.color_name || variant.title || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/no-image.png';
                    }}
                  />
                  {variant.color_code && (
                    <div
                      className="absolute bottom-1 right-1 w-4 h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: variant.color_code }}
                    />
                  )}
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          }
          
          return (
            <Link
              key={variant.id}
              to={getProductUrl(variant)}
              className="relative group cursor-pointer rounded-lg hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 transition-all"
              title={variant.color_name || variant.title || ''}
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all">
                <img
                  src={variant.image || '/images/no-image.png'}
                  alt={variant.color_name || variant.title || ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/no-image.png';
                  }}
                />
                {variant.color_code && (
                  <div
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: variant.color_code }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ColorVariants;