import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Fancybox } from '@fancyapps/ui';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import 'swiper/swiper-bundle.css';
import ImageMagnifier from '../magnifyImage';
import { useShowMagnify } from '../../hooks/useShowMagnify';
import { createPortal } from 'react-dom';

interface ProductGalleryProps {
  images: string[];
  video?: string | null;
}

export default function ProductGallery({ images, video }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [index, setindex] = useState<number>(0);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const { showMagnifier, x, y } = useShowMagnify();
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = !!video;
  const allMedia = hasVideo ? [video, ...images] : images;

  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]', {
      Toolbar: {
        display: {
          left: ['prev'],
          middle: ['counter'],
          right: ['next', 'close'],
        },
      },
    });
    return () => {
      Fancybox.destroy();
    };
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (videoRef.current && index !== 0) {
      videoRef.current.pause();
    }
  }, [index]);

  const isVideoSlide = (idx: number) => hasVideo && idx === 0;

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      <div className="mb-4 group relative">
        <Swiper
          spaceBetween={10}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            // @ts-expect-error prevRef.current
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-expect-error nextRef.current
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          onSlideChange={(swiper) => {
            setindex(swiper.activeIndex);
          }}
          className="aspect-square rounded-lg"
        >
          {allMedia.map((media, idx) => {
            if (isVideoSlide(idx)) {
              return (
                <SwiperSlide key={`video-${idx}`} className="!overflow-visible">
                  <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
                    <video
                      ref={videoRef}
                      src={media}
                      controls
                      playsInline
                      className="w-full h-full object-contain rounded-lg"
                      poster={images[0]}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </SwiperSlide>
              );
            }

            const img = media;
            return (
              <SwiperSlide key={idx} className="!overflow-visible">
                <a
                  href={img}
                  data-fancybox="gallery"
                  className="block w-full h-full relative object-contain"
                  style={{ objectFit: 'contain' }}
                >
                  {!isMobile && <ImageMagnifier src={img} width={'100%'} height={'100%'} />}
                  {isMobile && (
                    <img
                      src={img}
                      alt={`Product view ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  )}
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {!isMobile &&
          showMagnifier &&
          !isVideoSlide(index) &&
          createPortal(
            <div
              className="fixed z-[9999] top-[100px] left-[650px] w-[500px] h-[500px] rounded-lg shadow-lg"
              style={{
                backgroundImage: `url('${allMedia[index]}')`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '400% 400%',
                backgroundPositionX: `${-x * 4 + 100}px`,
                backgroundPositionY: `${-y * 4 + 100}px`,
                border: '1px solid lightgray',
              }}
            ></div>,
            document.body
          )}

        <button
          ref={prevRef}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-0"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          ref={nextRef}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-0"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbs-swiper"
      >
        {allMedia.map((media, idx) => (
          <SwiperSlide key={idx}>
            <button className="w-full relative aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary">
              {isVideoSlide(idx) ? (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                  {images[0] && (
                    <img
                      src={images[0]}
                      alt="Video thumbnail"
                      className="w-full h-full object-contain opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={media || '/placeholder.svg'}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                  style={{ objectFit: 'contain' }}
                />
              )}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}