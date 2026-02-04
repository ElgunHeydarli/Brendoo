import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { Footer } from "../components/Footer";
import Header, { useLanguageStore } from "../components/Header";
import { TranslationsKeys } from "../setting/Types";
import GETRequest from "../setting/Request";
import ROUTES from "../setting/routes";
import Loading from "../components/Loading";

const DynamicPageTwo: React.FC = () => {
  const navigate = useNavigate();
  const { lang = "az", slug } = useParams<{ lang: string; slug: string }>();
  const { selectedLang: newLang } = useLanguageStore(); 

  const [dataPages, setDataPages] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const { data: translation, isLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    "translates",
    [lang]
  );

  const fetchPagesFeature = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://admin.brendoo.com/api/pages", {
        headers: {
          "Accept-Language": lang,
        },
      });

      if (res.data) {
        setDataPages(res.data);
        const pagesArray = Object.values(res.data) as any[];

        const match = pagesArray.find(
          (page) => page.slug[lang as keyof typeof page.slug] === slug
        );

        if (!match) {
          const fallback = pagesArray.find((page) =>
            Object.values(page.slug).includes(slug || "")
          );

          if (fallback) {
            const correctSlug = fallback.slug[lang as keyof typeof fallback.slug];
            navigate(`/${lang}/${correctSlug}`, { replace: true });
          }
        }
      }
    } catch (error) {
      console.error("Dynamic Page Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPagesFeature();
  }, [lang, slug]);

  const pagesArray = dataPages ? Object.values(dataPages) : [];
  const currentPage:any = pagesArray.find(
    (page: any) => page.slug[lang as keyof typeof page.slug] === slug
  );

  React.useEffect(() => {
    if (currentPage) {
      const newSlug = currentPage.slug[newLang as keyof typeof currentPage.slug];
      navigate(`/i/${newLang}/${newSlug}`, { replace: true });
    }
  }, [newLang, currentPage]);

  if (loading || isLoading || !dataPages) return <Loading />;
  if (!currentPage) return <div>not found page</div>;

  return (
    <div>
      <Header />
      <main className="lg:mt-[40px] px-[40px] max-sm:px-4 mb-[100px] mt-6">
        <div className="px-[40px] max-sm:px-4">
          <div className="flex items-center gap-2">
            <Link reloadDocument to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.home]}`}>
              <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
                {translation?.home || ""}
              </h6>
            </Link>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            />
            <h6 className="text-nowrap self-stretch my-auto">{currentPage.title}</h6>
          </div>
        </div>

        <section className="px-[40px] max-sm:px-4">
          <h3 className="text-[40px] max-sm:text-[32px] font-semibold mt-[28px] mb-[40px]">
            {currentPage?.title}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: currentPage?.description ?? "" }} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPageTwo;
