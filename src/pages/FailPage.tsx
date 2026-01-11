import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { useEffect } from 'react';

const FailPage = () => {
  const navigate = useNavigate();
  const { lang = 'ru' } = useParams<{ lang: string }>();

  useEffect(() => {
    localStorage.removeItem('order_ID');
    localStorage.removeItem('selected_gift');
  }, []);

  const texts = {
    az: {
      title: 'Ödəniş uğursuz oldu!',
      desc: 'Ödəniş zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
      home: 'Ana səhifəyə qayıt',
      retry: 'Yenidən cəhd et',
    },
    ru: {
      title: 'Платеж не прошёл!',
      desc: 'Произошла ошибка при оплате. Пожалуйста, попробуйте снова.',
      home: 'Вернуться на домашнюю страницу',
      retry: 'Попробовать снова',
    },
    en: {
      title: 'Payment Failed!',
      desc: 'An error occurred during payment. Please try again.',
      home: 'Return to home page',
      retry: 'Try again',
    },
  };

  const t = texts[lang as keyof typeof texts] || texts.ru;

  return (
    <>
      <Header />
      <section className="py-[50px]">
        <div className="w-full min-h-[50vh] flex items-center justify-center bg-white p-4">
          <div className="max-w-md w-full mx-auto text-center space-y-6">
            <div className="flex items-center justify-center w-full aspect-square max-w-[200px] mx-auto">
              <svg width="160" height="160" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="179" height="179" rx="89.5" stroke="#FB6D6D" />
                <path d="M105 75L75 105" stroke="#FB6D6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M75 75L105 105" stroke="#FB6D6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center justify-center flex-col space-y-3">
              <h1 className="text-2xl font-bold text-black">{t.title}</h1>
              <p className="text-gray-500 text-sm">{t.desc}</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  className="gap-2 border px-[30px] rounded-full text-white bg-[#3873C3] py-[14px] flex items-center justify-center hover:bg-[#2d5fa3] transition-colors"
                  onClick={() => navigate(`/${lang}/basked/sifarislerim`)}
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.retry}
                </button>
                <button
                  className="gap-2 border px-[30px] rounded-full text-[#3873C3] border-[#3873C3] py-[14px] flex items-center justify-center hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/${lang}/home`)}
                >
                  {t.home}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default FailPage;