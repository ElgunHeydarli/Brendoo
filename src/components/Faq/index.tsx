import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request';
import { FaqCategory, FaqItem, TranslationsKeys } from '../../setting/Types';

function FAQItem({
  question,
  description,
  isOpen,
  onClick,
}: {
  question: string;
  description: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`flex overflow-hidden flex-col justify-center px-6 py-4 w-full bg-white rounded-2xl cursor-pointer transition-all duration-200 ${
        isOpen ? 'shadow-md' : 'hover:shadow-sm'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-expanded={isOpen}
    >
      <div className="flex gap-4 items-center justify-between">
        <p className="text-[15px] max-sm:text-[13px] text-black font-medium leading-snug">
          {question}
        </p>
        <button
          className={`bg-[#F5F5F5] flex justify-center items-center rounded-full min-w-[36px] h-[36px] transition-transform duration-200 ${
            isOpen ? 'rotate-45 bg-blue-100' : ''
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13M1 7H13" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="pt-3 mt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
}

function FAQSection({
  Title,
  isContact,
}: {
  Title?: string;
  isContact?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [CurrentFaqCategory, setCurrentFaqCategory] = useState<number>(-1);
  const navigate = useNavigate();
  const { lang = 'az' } = useParams<{ lang: string }>();

  const { data: faqCategory } = GETRequest<FaqCategory[]>(
    `/faqCategory`,
    'faqCategory',
    [lang]
  );

  const { data: faqs } = GETRequest<FaqItem[]>(
    `/faqs${CurrentFaqCategory === -1 ? '' : `?faq_category_id=${CurrentFaqCategory}`}`,
    'faqs',
    [lang, CurrentFaqCategory]
  );

  const { data: tarnslation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={`rounded-3xl bg-[#F8F8F8] p-6 lg:p-10 ${
        isContact ? '' : 'mx-[40px] max-sm:mx-4 mb-[60px]'
      }`}
    >
      <div className="flex lg:flex-row flex-col gap-8 lg:gap-12">
        {/* Sol tərəf - Başlıq */}
        <div className="lg:w-[280px] flex-shrink-0">
          <h3 className="text-3xl lg:text-[36px] font-semibold text-slate-900 leading-tight">
            {Title}
          </h3>
          {!isContact && (
            <>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {tarnslation?.faqDec}
              </p>
              <button
                onClick={() => navigate(`/${lang}/contact`)}
                className="mt-6 px-8 py-3 text-sm font-medium text-white bg-[#3873C3] hover:bg-[#2d5fa3] rounded-full transition-colors"
              >
                {tarnslation?.Bizimlə_əlaqə}
              </button>
            </>
          )}
        </div>

        {/* Sağ tərəf - Kateqoriyalar və FAQ */}
        <div className="flex-1">
          {/* Kateqoriyalar - Səliqəli Grid */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentFaqCategory(-1)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  CurrentFaqCategory === -1
                    ? 'bg-[#3873C3] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tarnslation?.All || (lang === 'en' ? 'All' : 'Hamısı')}
              </button>
              {faqCategory?.map((faq: FaqCategory) => (
                <button
                  key={faq.id}
                  onClick={() => setCurrentFaqCategory(faq.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                    CurrentFaqCategory === faq.id
                      ? 'bg-[#3873C3] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {faq.title}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqs?.map((item) => (
              <FAQItem
                key={item.id}
                question={item.title}
                description={item.description}
                isOpen={openIndex === item.id}
                onClick={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;