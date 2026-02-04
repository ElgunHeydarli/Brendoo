import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Footer } from '../components/Footer';
import Header, { useLanguageStore } from '../components/Header';
import { TranslationsKeys } from '../setting/Types';
import GETRequest from '../setting/Request';
import ROUTES from '../setting/routes';
import Loading from '../components/Loading';

const DynamicPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang = 'az', slug } = useParams<{ lang: string; slug: string }>();
  const { selectedLang: newLang } = useLanguageStore();

  const [currentPage, setCurrentPage] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const { data: translation, isLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://admin.brendoo.com/api/pages?slug=${slug}`, {
        headers: { 'Accept-Language': lang },
      });

      // API nəticəsi birbaşa obyekt və ya array ola bilər
      let pageData: any = null;

      if (Array.isArray(res.data)) {
        // əgər array qaytarırsa, ilk elementi götür
        pageData = res.data[0] || null;
      } else if (typeof res.data === 'object' && res.data !== null) {
        pageData = res.data;
      }

      if (!pageData) {
        // uyğun slug tapılmayıb
        navigate('/404', { replace: true });
        return;
      }

      // Əgər gələn slug istədiyin dillə uyğun deyilsə — yönləndir
      if (pageData.slug[lang as keyof typeof pageData.slug] !== slug) {
        navigate(`/i/${lang}/${pageData.slug[lang as keyof typeof pageData.slug]}`, {
          replace: true,
        });
        return;
      }

      setCurrentPage(pageData);
    } catch (error) {
      console.error('Dynamic Page Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPage();
  }, [lang, slug]);

  // Dil dəyişəndə avtomatik yönləndirmə
  React.useEffect(() => {
    if (currentPage) {
      const newSlug = currentPage.slug[newLang as keyof typeof currentPage.slug];
      if (newSlug && newSlug !== slug) {
        navigate(`/i/${newLang}/${newSlug}`, { replace: true });
      }
    }
  }, [newLang, currentPage, slug, navigate]);

  if (loading || isLoading) return <Loading />;
  if (!currentPage) return <div>not found page</div>;

  return (
    <div>
      <Header />
      <main className="lg:mt-[40px] px-[40px] max-sm:px-4 mb-[100px] mt-6">
        <div className="px-[40px] max-sm:px-4">
          <div className="flex items-center gap-2">
            <Link reloadDocument to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.home]}`}>
              <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
                {translation?.home || ''}
              </h6>
            </Link>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb"
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
              alt=""
            />
            <h6 className="text-nowrap self-stretch my-auto">{currentPage.title}</h6>
          </div>
        </div>

        <section className="px-[40px] max-sm:px-4">
          <h3 className="text-[40px] max-sm:text-[32px] font-semibold mt-[28px] mb-[40px]">
            {currentPage.title}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: currentPage.description }} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
