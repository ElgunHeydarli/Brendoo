import React from 'react';
import TopTitle from './TopTitle';
import { useParams, useNavigate } from 'react-router-dom';
import GETRequest from '../../../../setting/Request';
import { TranslationsKeys } from '../../../../setting/Types';
import axios from 'axios';
import Loading from '../../../../components/Loading';

export interface MediaStoryItem {
  id: number;
  type: 'image' | 'video';
  file_url: string;
  mime_type: string;
}

export interface StoryItem {
  id: number;
  title: string;
  description: string | null;
  media: MediaStoryItem[];
}

const StoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang = 'az' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const userStr = localStorage.getItem('user-info');
  const parsedUser = userStr ? JSON.parse(userStr) : null;
  const token = parsedUser?.token || '';

  const [stories, setStories] = React.useState<StoryItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const normalizeStory = (raw: any): StoryItem => {
    let mediaItems: MediaStoryItem[] = [];
    if (Array.isArray(raw?.media) && raw.media.length > 0) {
      mediaItems = raw.media;
    } else {
      if (Array.isArray(raw?.images)) {
        raw.images.forEach((img: any) => {
          mediaItems.push({
            id: img.id,
            type: 'image',
            file_url: img.url,
            mime_type: img.mime_type,
          });
        });
      }
      if (Array.isArray(raw?.videos)) {
        raw.videos.forEach((vid: any) => {
          mediaItems.push({
            id: vid.id,
            type: 'video',
            file_url: vid.url,
            mime_type: vid.mime_type,
          });
        });
      }
    }
    return {
      id: raw.id,
      title: raw.title ?? '',
      description: raw.description ?? null,
      media: mediaItems,
    };
  };

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://admin.brendoo.com/api/influencers/stories', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': lang,
        },
      });
      if (res.data) {
        const rawList = res.data?.data ?? [];
        setStories(rawList.map(normalizeStory));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStories();
  }, [lang]);

  const goDetail = (s: StoryItem) => {
    navigate(`/${lang}/influencer/story/${s.id}`, { state: { story: s } });
  };


  return (
    <div className="story-wrapper">
      <TopTitle>
        <div className="left">
          <h3>{translation?.storiler_key_key ?? ''}</h3>
          <p>{translation?.storiler_text_text ?? ''}</p>
        </div>
        {/* <button type="button" className="delete-all-button">
          <img src="/trash.svg" alt="trash" />
          <span>{translation?.hamisini_sil_key ?? ''}</span>
        </button> */}
      </TopTitle>

      <div className="container-stories-orders">
        <p className="mini-title">{translation?.stori_teklifleri ?? ''}</p>

        <div className="grid-contains">
          {loading ? (
            <Loading />
          ) : stories && stories.length > 0 ? (
            stories.map(s => {
              const firstImage = s.media.find(m => m.type === 'image');
              const firstVideo = s.media.find(m => m.type === 'video');
              const thumbnail = firstImage?.file_url || firstVideo?.file_url;
              return (
                <div key={s.id} className="item-grid" style={{ gap: '16px' }}>
                  <div className="left-item">
                    <h2>{s.title}</h2>
                    <p>{s.description}</p>
                  </div>
                  {thumbnail && (
                    <div
                      onClick={() => goDetail(s)}
                      style={{
                        width: '120px',
                        minWidth: '120px',
                        height: '80px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      {firstVideo && !firstImage ? (
                        <video
                          src={thumbnail}
                          muted
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <img
                          src={thumbnail}
                          alt={s.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  )}
                  <div className="right-buttons">
                    <button
                      onClick={() => goDetail(s)}
                      type="button"
                      className="main-button"
                    >
                      <img src="/eyee.svg" alt="eye icon" />
                      <p>{translation?.show_key ?? ''}</p>
                    </button>

                    <button
                      type="button"
                      className="main-button"
                      onClick={() => goDetail(s)}
                    >
                      <img src="/mmn.svg" alt="download icon" />
                      <p>{translation?.yukle_title ?? ''}</p>
                    </button>
                  </div>
                </div>
              );
            })
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
