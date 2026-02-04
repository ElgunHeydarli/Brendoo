import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../setting/Request';
import type { TranslationsKeys, Product } from '../setting/Types';
import ROUTES from '../setting/routes';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';

import { ProductCard } from '../pages/Products/components';

interface FeaturedData {
  bestsellers: Product[];
  on_sale: Product[];
  low_stock: Product[];
  top_rated: Product[];
  all_products: Product[];
}

interface Props {
  translation?: TranslationsKeys;
}

const sectionTexts = {
  az: {
    bestsellers: 'Ən çox satılanlar',
    on_sale: 'Endirimdə olanlar',
    low_stock: 'Tükənmək üzrədir',
    top_rated: 'Ən yaxşı reytinqli',
    all_products: 'Bütün məhsullar',
    viewAll: 'Hamısına bax',
  },
  en: {
    bestsellers: 'Bestsellers',
    on_sale: 'On Sale',
    low_stock: 'Low Stock',
    top_rated: 'Top Rated',
    all_products: 'All Products',
    viewAll: 'View All',
  },
};

export default function FeaturedProducts({ translation }: Props) {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const t = sectionTexts[lang as keyof typeof sectionTexts] || sectionTexts.az;
  const navigate = useNavigate();

  const [data, setData] = useState<FeaturedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
    const res = await axiosInstance.get('/featured-products/all?limit=8&all_products_limit=100', {
  headers: { 'Accept-Language': lang },
});
        setData(res.data);
      } catch (error) {
        console.error('Featured products error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lang]);

  if (loading) {
    return (
      <section className="px-4 md:px-10 lg:px-[40px] py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden">
              <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!data) return null;

  const sections = [
    { key: 'bestsellers', title: t.bestsellers, products: data.bestsellers },
    { key: 'on_sale', title: t.on_sale, products: data.on_sale },
    { key: 'low_stock', title: t.low_stock, products: data.low_stock },
    { key: 'top_rated', title: t.top_rated, products: data.top_rated },
    { key: 'all_products', title: t.all_products, products: data.all_products },
  ];

  return (
    <section className="px-4 md:px-10 lg:px-[40px] py-8 space-y-8">
      {sections.map((section) =>
        section.products && section.products.length > 0 ? (
          <div key={section.key} className="w-full">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 notranslate">
                {section.title}
              </h2>
              <button
                onClick={() => {
                  if (section.key === 'all_products') {
                    navigate(
                      `/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`
                    );
                  } else {
                    navigate(
                      `/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}?type=${section.key}`
                    );
                  }
                }}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-black transition-colors notranslate"
              >
                {t.viewAll}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Products Swiper - Hamısı eyni stil */}
       {/* Products Swiper - Hamısı eyni stil */}
<Swiper
  modules={[Navigation, FreeMode]}
  spaceBetween={16}
  slidesPerView={2}
  freeMode={true}
  breakpoints={{
    640: { slidesPerView: 3 },
    768: { slidesPerView: 4 },
    1024: { slidesPerView: 5 },
    1280: { slidesPerView: 6 },
  }}
>
  {section.products.map((product) => (
    <SwiperSlide key={product.id}>
      <ProductCard product={product} translation={translation} />
    </SwiperSlide>
  ))}
</Swiper>
          </div>
        ) : null
      )}
    </section>
  );
}