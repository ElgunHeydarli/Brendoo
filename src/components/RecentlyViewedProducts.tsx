import { useRef } from 'react';
import { Product, TranslationsKeys } from '../setting/Types';
import GETRequest from '../setting/Request';
import { useParams } from 'react-router-dom';
import Loading from './Loading';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from './ProductCArd';
import { Navigation, Pagination } from 'swiper/modules';

const RecentlyViewedProducts = () => {
  const isHome = true;
  const { lang = 'az' } = useParams<{
    lang: string;
  }>();

  const swiperRef = useRef(null);

  const { data: translation, isLoading: tarnslationLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const { data: recentProducts } = GETRequest<Product[]>(
    `/get-recently-viewed-products`,
    'products',
    [lang],
  );

  if (tarnslationLoading) {
    return <Loading />;
  }

  if (!recentProducts || recentProducts.length === 0) {
    return null;
  }

  return (
    <>
      <section className="md:py-[40px] py-[20px] lg:py-[50px] relative">
        <div className="px-4 sm:px-6 md:px-10 lg:px-[40px] mx-auto">
          <div className="self-stretch mb-4 sm:mb-6 md:mb-8 text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900">
            {translation?.Recently_Viewed}
          </div>

          <div className="relative">
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{
                clickable: true,
                el: '.swiper-pagination-custom',
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
              className="recently-viewed-swiper"
            >
              {recentProducts &&
                recentProducts.map((product: any) => (
                  <SwiperSlide key={product.id}>
                    <ProductCard isHome={isHome} bg="grey" data={product} />
                  </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Pagination */}
            <div className="swiper-pagination-custom"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RecentlyViewedProducts;
