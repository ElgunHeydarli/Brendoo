import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import GETRequest from '../../setting/Request';
import type { TranslationsKeys } from '../../setting/Types';

interface InfluencerInfo {
  id: number;
  name: string;
  image: string;
}

interface InfluencerStory {
  id: number;
  title: string;
  description: string | null;
  influencer: InfluencerInfo;
  images: string[];
  videos: string[];
  created_at: string;
}

interface InfluencerStoriesResponse {
  data: InfluencerStory[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const API_URL = 'https://admin.brendoo.com';

const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  if (src.startsWith('storage/')) return API_URL + '/' + src;
  return API_URL + '/storage/' + src;
};

const InfluencerStories = () => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const [activeStory, setActiveStory] = useState<InfluencerStory | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const { data: storiesData } = GETRequest<InfluencerStoriesResponse>(
    `/influencer-stories?per_page=20`,
    'influencer-stories',
    [lang],
  );

  const stories = storiesData?.data || [];

  if (!stories.length) return null;

  const getStoryMedia = (story: InfluencerStory) => {
    const media: { type: 'image' | 'video'; url: string }[] = [];
    story.images?.forEach((img) => media.push({ type: 'image', url: getImageUrl(img) }));
    story.videos?.forEach((vid) => media.push({ type: 'video', url: getImageUrl(vid) }));
    return media;
  };

  const openStory = (story: InfluencerStory) => {
    setActiveStory(story);
    setActiveMediaIndex(0);
  };

  const closeStory = () => {
    setActiveStory(null);
    setActiveMediaIndex(0);
  };

  return (
    <>
      <section className="mt-[40px] max-sm:mt-[24px]">
        <h2 className="lg:text-[40px] md:text-[36px] text-[28px] font-medium px-[40px] max-sm:px-[16px]">
          {translation?.influencer_stories || (lang === 'az' ? 'Influencer Hekayələri' : 'Influencer Stories')}
        </h2>
        <div className="md:px-[48px] py-[16px] px-[16px]">
          <Swiper
            slidesPerView="auto"
            spaceBetween={16}
            breakpoints={{
              0: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              950: { slidesPerView: 5 },
              1200: { slidesPerView: 6 },
            }}
            className="w-full !h-fit flex"
          >
            {stories.map((story) => {
              const coverImage =
                story.images?.[0] || story.videos?.[0] || story.influencer?.image;
              return (
                <SwiperSlide
                  key={story.id}
                  onClick={() => openStory(story)}
                  className="cursor-pointer"
                >
                  <div className="rounded-[20px] aspect-[10/16] md:aspect-[9/16] border border-blue-200 bg-white p-1">
                    <div className="relative rounded-[20px] w-full h-full overflow-hidden">
                      {coverImage ? (
                        story.videos?.[0] ? (
                          <video
                            muted
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-[20px]"
                            src={getImageUrl(coverImage)}
                          />
                        ) : (
                          <img
                            src={getImageUrl(coverImage)}
                            alt={story.title}
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-[20px]"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="absolute top-0 left-0 w-full h-full rounded-[20px] bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-4xl">
                            {story.influencer?.name?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      {/* Influencer info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent rounded-b-[20px]">
                        <div className="flex items-center gap-2">
                          {story.influencer?.image && (
                            <img
                              src={getImageUrl(story.influencer.image)}
                              alt={story.influencer.name}
                              className="w-6 h-6 rounded-full object-cover border border-white"
                              loading="lazy"
                            />
                          )}
                          <span className="text-white text-xs font-medium truncate">
                            {story.influencer?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>

      {/* Fullscreen Story Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center"
          onClick={closeStory}
        >
          <div
            className="relative max-w-[500px] w-full max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeStory}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Influencer header */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              {activeStory.influencer?.image && (
                <img
                  src={getImageUrl(activeStory.influencer.image)}
                  alt={activeStory.influencer.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              )}
              <div>
                <p className="text-white font-semibold text-sm">{activeStory.influencer?.name}</p>
                {activeStory.title && (
                  <p className="text-white/70 text-xs">{activeStory.title}</p>
                )}
              </div>
            </div>

            {/* Media content */}
            {(() => {
              const media = getStoryMedia(activeStory);
              if (!media.length) return null;
              const current = media[activeMediaIndex] || media[0];
              return (
                <div className="relative rounded-2xl overflow-hidden aspect-[9/16]">
                  {/* Media indicators */}
                  {media.length > 1 && (
                    <div className="absolute top-16 left-4 right-4 z-10 flex gap-1">
                      {media.map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full transition-colors ${
                            i === activeMediaIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {current.type === 'video' ? (
                    <video
                      key={current.url}
                      src={current.url}
                      autoPlay
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      key={current.url}
                      src={current.url}
                      alt={activeStory.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Navigation arrows */}
                  {media.length > 1 && (
                    <>
                      {activeMediaIndex > 0 && (
                        <button
                          onClick={() => setActiveMediaIndex((p) => p - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                      )}
                      {activeMediaIndex < media.length - 1 && (
                        <button
                          onClick={() => setActiveMediaIndex((p) => p + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}

                  {/* Description overlay */}
                  {activeStory.description && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm">{activeStory.description}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
};

export default InfluencerStories;
