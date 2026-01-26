import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecentlyViewed, RecentlyViewedProduct } from '../utils/recentlyViewed';
import ProductCard from '../pages/Products/components/ProductCard';
import type { TranslationsKeys } from '../setting/Types';
import GETRequest from '../setting/Request';

const RecentlyViewed = () => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

  const { data: translations } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  useEffect(() => {
    // LocalStorage-dan son baxılan məhsulları al
    const recentlyViewed = getRecentlyViewed();
    setProducts(recentlyViewed);
  }, []);

  // Əgər məhsul yoxdursa, komponenti göstərmə
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="px-4 md:px-10 lg:px-[40px] py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900" translate="yes">
          {translations?.Son_baxılanlar || 'Son baxılan məhsullar'}
        </h2>
      </div>

      {/* Products Grid - 6 məhsul (3 sütun x 2 sıra) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {products.slice(0, 6).map((product) => {
            // Convert RecentlyViewedProduct to Product format for ProductCard
            const productForCard = {
              id: product.id,
              title: product.title,
              price: product.price,
              discount_price: product.discount_price,
              image: product.image,
              slug: product.slug,
              category_id: product.category_id,
              images: [product.image],
              sliders: [{ image: product.image }], // ProductCard sliders-dən istifadə edir
              is_stock: true,
              description: '',
              sku: '',
              brand: null,
              category: null,
              variants: [],
              filters: [],
            } as any;

            return (
              <ProductCard
                key={`recently-viewed-${product.id}-${product.viewedAt}`}
                product={productForCard}
                translation={translations}
              />
            );
          })}
      </div>
    </section>
  );
};

export default RecentlyViewed;
