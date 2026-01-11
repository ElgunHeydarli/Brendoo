import Header from '../components/Header';
import { Footer } from '../components/Footer';
import FAQSection from '../components/Faq';
import { ConmtactItem, SocialMediaLink, TranslationsKeys } from '../setting/Types';
import GETRequest from '../setting/Request';
import Loading from '../components/Loading';
import { useParams, Link } from 'react-router-dom';
import ROUTES from '../setting/routes';

export default function Contact() {
  const { lang = 'ru' } = useParams<{ lang: string }>();

  const { data: tarnslation, isLoading: tarnslationLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  const { data: ContactInfo, isLoading: ContactInfoLoading } = GETRequest<ConmtactItem[]>(
    `/contact_items`,
    'contact_items',
    [lang]
  );

  const { data: socials } = GETRequest<SocialMediaLink[]>(`/socials`, 'socials', []);

  if (tarnslationLoading || ContactInfoLoading) {
    return <Loading />;
  }

  const titles: Record<string, string> = {
    az: 'Əlaqə Məlumatları',
    ru: 'Контактная информация',
    en: 'Contact Information',
    tr: 'İletişim Bilgileri',
  };

  const socialTitles: Record<string, string> = {
    az: 'Sosial şəbəkələr',
    ru: 'Социальные сети',
    en: 'Social Media',
    tr: 'Sosyal Medya',
  };

  const socialLinks = socials && socials.length > 0 ? socials : [];

  return (
    <div>
      <Header />
      <main className="">
        <section
          className="px-[40px] max-sm:px-4 max-sm:py-5 h-[180px] md:h-[260px] py-[40px]"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: 'url("/images/contact.jpg")',
          }}
        >
          <div className="flex items-center gap-2">
            <Link to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.home]}`}>
              <h6 className="text-black hover:text-blue-600">{tarnslation?.home}</h6>
            </Link>
            <span>/</span>
            <h6>{tarnslation?.Əlaqə}</h6>
          </div>
        </section>

        <section className="px-[40px] max-sm:px-4 mt-[-80px] mb-[40px] relative z-10">
          <div className="flex gap-8 lg:flex-row flex-col">
            
            <div className="lg:w-[35%] w-full">
              <div className="bg-[#8E98B8] rounded-3xl p-4 md:p-8 h-full">
                <h2 className="text-xl font-semibold text-white mb-6">
                  {titles[lang] || titles.ru}
                </h2>
                
                <div className="space-y-4">
                  {ContactInfo?.map((item, index) => {
                    const itemKey = item.id || index;
                    return (
                      <div
                        key={itemKey}
                        className="flex items-center gap-4 p-3 bg-white/10 rounded-full"
                      >
                        {item.icon && (
                          <img src={item.icon} alt="" className="w-10 h-10 object-contain" />
                        )}
                        <span className="text-white">{item.value}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <p className="text-white/80 text-sm mb-4">
                    {socialTitles[lang] || socialTitles.ru}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {socialLinks.map((item, index) => {
                      const key = item.id || index;
                      const iconText = item.title?.substring(0, 2) || '??';
                      
                      return (
                        <a
                          key={key}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                          {item.icon ? (
                            <img src={item.icon} alt={item.title || ''} className="w-5 h-5" />
                          ) : (
                            <span className="text-white text-xs font-medium">{iconText}</span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-[65%] w-full">
              <FAQSection Title={tarnslation?.Tez_tez_verilən_suallar} isContact={true} />
            </div>
            
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}