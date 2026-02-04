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

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://admin.brendoo.com/api/influencers/stories', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': lang,
        },
      });
      if (res.data) setStories(res.data?.data ?? []);
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
  window.location.reload();
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
            stories.map(s => (
              <div key={s.id} className="item-grid">
                <div className="left-item">
                  <h2>{s.title}</h2>
                  <p>{s.description}</p>
                </div>
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
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StoryPage;
