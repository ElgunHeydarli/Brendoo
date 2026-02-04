import React from 'react';
import TopTitle from './TopTitle';
import { useLocation } from 'react-router-dom';
import GETRequest from '../../../../setting/Request';
import { TranslationsKeys } from '../../../../setting/Types';
import axios from 'axios';
import Loading from '../../../../components/Loading';

type MediaStoryItem = {
  id: number;
  type: 'image' | 'video';
  file_url: string;
  mime_type: string;
};

type StoryItem = {
  id: number;
  title: string;
  description: string | null;
  media: MediaStoryItem[];
};

interface Props {
  storyId: number;
}

const StoryInner: React.FC<Props> = ({ storyId }) => {
  const location = useLocation() as any;

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [],
  );

  const preloaded: StoryItem | undefined = location?.state?.story;

  const userStr = localStorage.getItem('user-info');
  const parsedUser = userStr ? JSON.parse(userStr) : null;
  const token = parsedUser?.token || '';

  const [story, setStory] = React.useState<StoryItem | null>(preloaded ?? null);
  const [loading, setLoading] = React.useState<boolean>(true);
  // const [zipping, setZipping] = React.useState(false);
  const lang = React.useMemo(
    () => location.pathname.split('/')[1] || 'az',
    [location.pathname],
  );

  const fetchStory = React.useCallback(async () => {
    if (!Number.isFinite(storyId) || storyId <= 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `https://admin.brendoo.com/api/influencers/stories/${storyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Accept-Language': lang,
            'Cache-Control': 'no-cache',
          },
        },
      );
      const payload = res.data?.data ?? res.data?.story ?? res.data;
      const normalized: StoryItem = {
        id: payload?.id,
        title: payload?.title ?? '',
        description: payload?.description ?? null,
        media: Array.isArray(payload?.media) ? payload.media : [],
      };
      setStory(normalized);
    } catch (e) {
      console.error('detail fetch error:', e);
      setStory(prev => prev ?? preloaded ?? null);
    } finally {
      setLoading(false);
    }
  }, [storyId, token, preloaded, lang]);

  React.useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  const images = React.useMemo(
    () => (story?.media ?? []).filter(m => m.type === 'image'),
    [story],
  );
  const videos = React.useMemo(
    () => (story?.media ?? []).filter(m => m.type === 'video'),
    [story],
  );

  const extFromMime = (mime?: string, fallback?: string) => {
    if (!mime) return fallback || 'bin';
    const parts = mime.split('/');
    return parts[1] || fallback || 'bin';
  };

  const download = (url: string, filename?: string) => {
    const a = document.createElement('a');
    a.href = url;
    if (filename) a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // const getBlob = async (url: string): Promise<Blob> => {
  //   try {
  //     const r = await fetch(url, { credentials: 'include' });
  //     if (!r.ok) throw new Error(`fetch failed ${r.status}`);
  //     return await r.blob();
  //   } catch {
  //     const r2 = await axios.get(url, {
  //       responseType: 'blob',
  //       headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  //     });
  //     return r2.data as Blob;
  //   }
  // };

  // const downloadAll = async () => {
  //   if (!story) return;
  //   const all = story.media ?? [];
  //   if (all.length === 0) return;

  //   setZipping(true);
  //   try {
  //     const { default: JSZip } = await import('jszip');
  //     const zip = new JSZip();
  //     const folder = zip.folder(`story-${story.id}`)!;

  //     for (let idx = 0; idx < all.length; idx++) {
  //       const m = all[idx];
  //       const ext = extFromMime(m.mime_type, m.type === 'image' ? 'jpg' : 'mp4');
  //       const filename = `story-${story.id}-${m.type}-${idx + 1}.${ext}`;

  //       try {
  //         const blob = await getBlob(m.file_url);
  //         folder.file(filename, blob);
  //       } catch (e) {
  //         console.warn(
  //           'blob fetch fail, skipping in zip, fallback single:',
  //           m.file_url,
  //           e,
  //         );
  //         download(m.file_url, filename);
  //       }
  //     }

  //     const zipBlob = await zip.generateAsync({ type: 'blob' });
  //     const a = document.createElement('a');
  //     const url = URL.createObjectURL(zipBlob);
  //     a.href = url;
  //     a.download = `story-${story.id}.zip`;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(url);
  //   } catch (zipErr) {
  //     console.error('zip error, fallback to sequential downloads:', zipErr);
  //     all.forEach((m, idx) => {
  //       const ext = extFromMime(m.mime_type, m.type === 'image' ? 'jpg' : 'mp4');
  //       const filename = `story-${story.id}-${m.type}-${idx + 1}.${ext}`;
  //       setTimeout(() => download(m.file_url, filename), idx * 400);
  //     });
  //   } finally {
  //     setZipping(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="story-wrapper">
        <TopTitle>
          <div className="left">
            <button
              type="button"
              className="get-back"
              onClick={() => {
                window.location.pathname = `/${lang}/influencer/story`;
              }}
            >
              <img src="/Frame.svg" alt="Frame" />
              <p>{translation?.geri_key ?? ''}</p>
            </button>
            <h3>{translation?.story_keys_keys ?? ''}</h3>
          </div>
        </TopTitle>
        <Loading />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-wrapper">
        <TopTitle>
          <div className="left">
            <button
              type="button"
              className="get-back"
              onClick={() => {
                window.location.pathname = `/${lang}/influencer/story`;
              }}
            >
              <img src="/Frame.svg" alt="Frame" />
              <p>{translation?.geri_key ?? ''}</p>
            </button>
            <h3>{translation?.story_keys_keys ?? ''}</h3>
          </div>
        </TopTitle>
      </div>
    );
  }

  return (
    <div className="story-wrapper">
      <TopTitle>
        <div className="left">
          <button
            type="button"
            className="get-back"
            onClick={() => {
              window.location.pathname = `/${lang}/influencer/story`;
            }}
          >
            <img src="/Frame.svg" alt="Frame" />
            <p>{translation?.geri_key ?? ''}</p>
          </button>
          <div>
            <h3>{story.title}</h3>
            {story.description && <p>{story.description}</p>}
          </div>
        </div>

        {/* <button
          type="button"
          className="download-all-button"
          onClick={downloadAll}
          disabled={zipping}
          title={zipping ? translation?.hazirlanir ?? '' : ''}
        >
          <img
            src="/Download Minimalistic.svg"
            role="button"
            alt="download-all-button"
            style={{ opacity: zipping ? 0.6 : 1 }}
          />
          <span>
            {zipping
              ? translation?.hazirlanir
              : translation?.hamisini_yukle_key ?? 'Hamısını yüklə'}
          </span>
        </button> */}
      </TopTitle>

      <div className="container-stories">
        {/* Şəkillər */}
        <div className="images">
          <p className="title-mini">{translation?.sekiller_title ?? 'Şəkillər'}</p>
          <div className="grid-items">
            {images.length === 0 ? (
              <p className="empty-text"></p>
            ) : (
              images.map(item => (
                <div key={item.id} className="item">
                  <div className="image-container">
                    <img
                      className="main-image"
                      src={item.file_url}
                      alt={`image-${item.id}`}
                    />
                  </div>
                  <button
                    type="button"
                    className="download"
                    onClick={() => {
                      const ext = extFromMime(item.mime_type, 'jpg');
                      download(
                        item.file_url,
                        `story-${story.id}-image-${item.id}.${ext}`,
                      );
                    }}
                  >
                    <img
                      src="/Download Minimalistic.svg"
                      alt="download-video"
                      role="button"
                    />
                    <span>Yüklə</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Videolar */}
        <div className="videos">
          <p className="title-mini">
            {translation?.videolar_title_title ?? 'Videolar'}
          </p>
          <div className="grid-items">
            {videos.length === 0 ? (
              <p className="empty-text"></p>
            ) : (
              videos.map(item => (
                <div key={item.id} className="item">
                  <div className="video-container relative">
                    <video
                      src={item.file_url}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full"
                    />
                  </div>
                  <button
                    type="button"
                    className="download"
                    onClick={() => {
                      const ext = extFromMime(item.mime_type, 'mp4');
                      download(
                        item.file_url,
                        `story-${story.id}-video-${item.id}.${ext}`,
                      );
                    }}
                  >
                    <img
                      src="/Download Minimalistic.svg"
                      alt="download-video"
                      role="button"
                    />
                    <span>Yüklə</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryInner;
