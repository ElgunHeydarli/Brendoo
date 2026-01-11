import { useState } from 'react';
import { TranslationsKeys } from '../../setting/Types';
import GETRequest from '../../setting/Request';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import FullscreenGallery from './FullscreenGallery';
import type { Tiktoks } from '../Header/StoryViewer';
const TiktokStories = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [loadingVideos, setLoadingVideos] = useState<
    Record<string | number, boolean>
  >({});

  const { lang = 'ru' } = useParams<{
    lang: string;
  }>();

  const { data: tarnslation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  const { data: tiktok } = GETRequest<Tiktoks>(`/tiktoks`, 'tiktok', [lang]);

  const openGallery = (id: string | number) => {
    const index = tiktok?.findIndex((item) => item.id === id) || 0;

    if (index !== -1) {
      setInitialIndex(index);
    } else {
      setInitialIndex(0);
    }

    setIsGalleryOpen(true);
  };

  const handleVideoStart = (id: number | string) => {
    setLoadingVideos((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleVideoEnd = (id: number | string) => {
    setLoadingVideos((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  return (
    <>
      <section className="mt-[40px] max-sm:mt-[24px]">
        <h2 className="lg:text-[40px] md:text-[36px] text-[28px] font-medium px-[40px] max-sm:px-[16px]">
          {tarnslation?.Tiktok}
        </h2>
        <div className="md:px-[48px] py-[16px] px-[16px]">
          <Swiper
            slidesPerView="auto"
            spaceBetween={16}
            breakpoints={{
              0: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 4,
              },
              950: {
                slidesPerView: 5,
              },
              1200: {
                slidesPerView: 6,
              },
            }}
            className="w-full !h-fit flex">
            {tiktok?.map((item) => (
              <SwiperSlide
                key={item.id}
                onClick={() => openGallery(item.id)}
                className="cursor-pointer">
                <div className="rounded-[20px] aspect-[10/16]  md:aspect-[9/16] border border-purple-200 bg-white p-1">
                  <div className="relative rounded-[20px] w-full h-full ">
                    {loadingVideos[item.id] !== false && (
                      <div className="absolute top-0 left-0 w-full h-full rounded-[20px] bg-gray-200/70 animate-pulse" />
                    )}
                    <video
                      muted
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-[20px]"
                      src={item.image}
                      onLoadStart={() => handleVideoStart(item.id)}
                      onLoadedData={() => handleVideoEnd(item.id)}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <FullscreenGallery
        images={tiktok || []}
        initialIndex={initialIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </>
  );
};

export default TiktokStories;
