import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import Header, { useLanguageStore } from "../components/Header";
import { TranslationsKeys } from "../setting/Types";
import GETRequest, { axiosInstance } from "../setting/Request";
import ROUTES from "../setting/routes";
import Loading from "../components/Loading";

export interface DataRulesPage {
  id: number;
  title: string;
  description: string;
  image1: string;
  image2: string;
  slug: {
    en: string;
    az: string;
  };
}

const RulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, slug } = useParams<{ lang: string; slug: string }>();
  const { selectedLang: newLang } = useLanguageStore();

  const { data: translation } = GETRequest<TranslationsKeys>(`/translates`, "translates", [lang]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<DataRulesPage | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/pages?page_id=13", {
        headers: {
          "Accept-Language": lang,
        },
      });

      if (res.data) {
        setData(res.data);
        const correctSlug = res.data.slug[lang as keyof typeof res.data.slug];
        if (slug !== correctSlug) {
          navigate(`/terms/${lang}/${correctSlug}`, { replace: true });
        }
      }
    } catch (error) {
      console.error("Rules Page Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on lang or slug change
  React.useEffect(() => {
    fetchData();
  }, [lang, slug]);

  // Language slug switch
  React.useEffect(() => {
    if (data) {
      const newSlug = data.slug[newLang as keyof typeof data.slug];
      navigate(`/terms/${newLang}/${newSlug}`, { replace: true });
    }
  }, [newLang, data]);

  if (loading || !data) return <Loading />;

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
            <h6 className="text-nowrap self-stretch my-auto">{data.title}</h6>
          </div>
        </div>

        <section className="w-full flex align-center justify-between gap-2 mt-10" style={{ overflow: "hidden" }}>
          <img className="w-full h-[300px]" src={data.image1} alt="Image 1" />
          <img className="w-full h-[300px]" src={data.image2} alt="Image 2" />
        </section>

        <section className="px-[40px] max-sm:px-4">
          <h3 className="text-[40px] max-sm:text-[32px] font-semibold mt-[28px] mb-[40px]">
            {data.title}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: data.description }} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RulesPage;
