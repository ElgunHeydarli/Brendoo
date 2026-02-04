// src/components/TopHeader.tsx
import React from 'react';
import { axiosInstance } from './setting/Request';
import { TopLine } from './setting/Types';
import { useParams } from 'react-router-dom';
import { useLanguageStore } from './components/Header';
import Loading from './components/Loading';

const TopHeader: React.FC = () => {
  const { lang = 'az' } = useParams<{ lang: string; page: string }>();
  const { selectedLang: newLang } = useLanguageStore();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [top_line, setData] = React.useState<TopLine | null>(null);

  const resolveLang = () => {
    if (lang === 'az' || lang === 'en') return lang;
    if (newLang === 'az' || newLang === 'en') return newLang;
    return 'az';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/top_line', {
        headers: {
          'Accept-Language': resolveLang(),
        },
      });

      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [lang, newLang]);

  const defaultText = 'Original products. Free delivery to your address.';

  if (loading) return <Loading />;

  return (
    <div className="w-full bg-[#3873C3] h-[40px] text-[14px] font-normal text-white flex items-center justify-between px-4 md:px-10">
      {/* Sol tərəf - balans üçün */}
      <div className="hidden md:block w-[120px]" />

      {/* Orta - Mətn */}
      <div className="flex-1 text-center truncate px-2">
        {top_line?.data?.title || defaultText}
      </div>

    </div>
  );
};

export default TopHeader;
