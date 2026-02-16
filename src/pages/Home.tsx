import { lazy, Suspense } from 'react';
import Header from '../components/Header';
import { Footer } from '../components/Footer/index.tsx';
import { useEffect, useState, useMemo, memo } from 'react';
import GETRequest from '../setting/Request.ts';
import { HomeHero, ItemList, Seo, SeoApiResponse, TranslationsKeys } from '../setting/Types.ts';
import Loading from '../components/Loading/index.tsx';
import ROUTES from '../setting/routes.tsx';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import H1 from '../components/Headings';

// Lazy load edilən komponentlər
const Story = lazy(() => import('../components/Header/story.tsx'));
const TimedSpecialNotification = lazy(
  () => import('../components/TimedNotification/index.tsx'),
);
const TiktokStories = lazy(() => import('../components/TiktokStories/index.tsx'));

const FeaturedProducts = lazy(() => import('../components/FeaturedProducts.tsx'));
const TimedDiscountSlider = lazy(() => import('../components/TimedDiscountSlider/index.tsx'));
// ✅ YENİ: RecentlyViewed lazy load
const RecentlyViewed = lazy(() => import('../components/RecentlyViewed.tsx'));

// Memoized BannerCard komponenti
const BannerCard = memo(
  ({
    item,
    lang,
    navigate,
    translation,
  }: {
    item: any;
    lang: string;
    navigate: any;
    translation: any;
  }) => {
    const handleClick = useMemo(
      () => () => {
        const filterParams = Object.entries(item.filter_conditions)
          .filter(([_, value]) => value)
          .map(([key, value]) => {
            switch (key) {
              case 'category_id':
                return `category=${value}`;
              case 'sub_category_id':
                return `subCategory=${value}`;
              default:
                return `${key}=${value}`;
            }
          })
          .join('&');

        navigate(
          `/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}?page=1${
            filterParams ? '&' + filterParams : ''
          }`,
        );
      },
      [item.filter_conditions, lang, navigate],
    );

    return (
      <div className="md:rounded-[16px] relative overflow-hidden h-[160px] md:h-[220px] lg:h-[280px]">
        <img
          src={item.image || '/placeholder.svg'}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />

        <div className="flex relative z-[10] flex-col justify-center items-start h-full p-3 md:p-4 lg:p-6">
          <span className="font-medium mb-1 md:mb-2 text-[10px] md:text-[12px] lg:text-[14px] text-[#FFFFFF99]">
            {item.description}
          </span>

          <h3 className="text-white font-semibold text-[12px] md:text-[16px] lg:text-[20px] mb-2 md:mb-3">
            {item.title}
          </h3>

          <button
            onClick={handleClick}
            className="text-[10px] md:text-[12px] lg:text-[14px] font-medium text-white hover:bg-white hover:text-black duration-300 border border-white border-solid rounded-full px-3 py-1.5 md:px-4 md:py-2 lg:px-5 lg:py-2.5 transition-colors"
          >
            {translation?.Məhsullara_bax_new}
          </button>
        </div>
      </div>
    );
  },
);

// Hero Section komponenti
const HeroSection = memo(
  ({
    hero,
    lang,
    navigate,
    translation,
  }: {
    hero: HomeHero | undefined;
    lang: string;
    navigate: any;
    translation: any;
  }) => (
    <section className="relative rounded-[20px] max-sm:rounded-none max-sm:overflow-visible overflow-hidden mx-[40px] max-sm:mx-[16px] mt-[16px]">
      {(hero?.video || hero?.image) && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover rounded-[12px]"
          poster={hero?.image}
          webkit-playsinline="true"
          controls={false}
          x5-playsinline="true"
        >
          <source src={hero?.video || hero?.image} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <div className="flex overflow-hidden flex-col justify-center items-center px-20 py-52 max-sm:rounded-none rounded-3xl bg-opacity-20 max-md:px-5 max-md:py-24 max-sm:aspect-square relative z-10">
        <div className="flex flex-col max-w-full w-[497px]">
          <div className="flex flex-col w-full text-center text-neutral-100 max-md:max-w-full">
            <H1 className="self-center text-5xl font-bold max-md:max-w-full max-md:text-4xl max-sm:text-[24px] text-neutral-100">
              {hero?.title || <div className="h-10 bg-gray-300 rounded animate-pulse w-3/4" />}
            </H1>
            <div className="mt-5 text-lg font-medium max-md:max-w-full max-sm:text-[14px] max-sm:mt-10">
              {hero?.description || (
                <div className="h-10 bg-gray-300 rounded animate-pulse w-full" />
              )}
            </div>
          </div>

          <button
            className="gap-2.5 leading-[24px] h-fit self-center px-10 py-4 mt-10 text-xl font-medium text-white border border-white hover:bg-[#FFFFFF] hover:text-black duration-300 border-solid rounded-[100px] max-md:px-5 transition-colors"
            onClick={() =>
              navigate(`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`)
            }
          >
            {translation?.Yeni_məhsullar}
          </button>
        </div>
      </div>
    </section>
  ),
);

export default function Home() {
  const [, setIsSpecialOpen] = useState(false);
  const navigate = useNavigate();
  const { lang = 'az' } = useParams<{ lang: string }>();

  const { data: hero, isLoading: heroLoading } = GETRequest<HomeHero>(`/hero`, 'HOMEhero', [
    lang,
  ]);

  const { data: translation, isLoading: translationLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const { data: metas } = GETRequest<Seo[]>(`/seo_pages`, 'seo_pages', [lang]);

  const { data: seoHome } = GETRequest<SeoApiResponse>(
    `/seo/home`,
    'seo-home',
    [lang]
  );

  const { data: banners, isLoading: bannersLoading } = GETRequest<ItemList>(
    `/banners`,
    'banners',
    [lang],
  );

  const { data: favicon } = GETRequest<{
    image: string;
  }>(`/favicon`, 'favicon', [lang]);

  const { data: special } = GETRequest<{
    data: {
      id: number;
      discount: string;
      description: string;
      image: string;
    } | null;
    is_special: boolean;
  }>(`/special`, 'special', [lang]);

  const homePageMeta = useMemo(() => metas?.find(meta => meta.type === 'home_page'), [metas]);

  useEffect(() => {
    if (special?.is_special) {
      const hasShownModal = localStorage.getItem('isSpecialShown');
      if (!hasShownModal) {
        setIsSpecialOpen(true);
        localStorage.setItem('isSpecialShown', 'true');
      }
    }
  }, [special?.is_special]);

  const isInitialLoading = heroLoading || translationLoading;

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <div className="relative">
      <SEO
        seoData={seoHome?.data}
        title={homePageMeta?.meta_title}
        description={homePageMeta?.meta_description}
        keywords={homePageMeta?.meta_keywords}
      />
      <Helmet>
        {favicon?.image && <link rel="icon" href={favicon.image} type="image/svg+xml" />}
        <link rel="preload" as="video" href={hero?.video || hero?.image} />
      </Helmet>

      <Header />

      <main className="flex flex-col justify-center mb-[100px] max-sm:mb-[40px]">
        <Suspense fallback={<div className="h-4" />}>
          <TimedSpecialNotification
            special={special}
            lang={lang}
            translation={translation}
            ROUTES={ROUTES}
          />
        </Suspense>

        <Suspense fallback={<div className="h-16 hidden" />}>
          <section className="hidden">
            <Story />
          </section>
        </Suspense>

        <HeroSection hero={hero} lang={lang} navigate={navigate} translation={translation} />

        <Suspense fallback={<div className="h-32" />}>
          <TiktokStories />
        </Suspense>


        <Suspense fallback={<div className="h-64 bg-gradient-to-r from-red-50 to-orange-50 animate-pulse" />}>
          <TimedDiscountSlider translation={translation} />
        </Suspense>

        <section className="md:py-[20px]">
          <div className="mx-[15px]">
            {bannersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[8px]">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-[160px] md:h-[220px] lg:h-[280px] bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[8px]">
                {banners?.map(item => (
                  <BannerCard
                    key={item.id || item.title}
                    item={item}
                    lang={lang}
                    navigate={navigate}
                    translation={translation}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ✅ YENİ: Son Baxılan Məhsullar - FeaturedProducts-dan ƏVVƏL */}
        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
          <RecentlyViewed />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
          <FeaturedProducts translation={translation} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}