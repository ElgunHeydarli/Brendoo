import { useNavigate, useParams } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import ROUTES from "../../setting/routes";
import { Category, SocialMediaLink } from "../../setting/Types";
import { Link } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuickTranslations } from "../Loading";

// Simple cache for footer data (per language)
let footerCache: Record<
  string,
  {
    categories?: Category[];
    socials?: SocialMediaLink[];
    pages?: any[];
    timestamp?: number;
  }
> = {};

// Cache validity - 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Fast data hook
const useFooterData = (lang: string) => {
  const [data, setData] = useState(() => footerCache[lang] || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check cache validity
    const now = Date.now();
    const cacheForLang = footerCache[lang];
    const isValid =
      cacheForLang?.timestamp && now - cacheForLang.timestamp < CACHE_DURATION;

    if (isValid && cacheForLang?.categories?.length) {
      setData(cacheForLang);
      return;
    }

    // Load data in background
    const loadData = async () => {
      setLoading(true);
      try {
        // Parallel requests for speed
        const [categoriesRes, socialsRes, pagesRes] = await Promise.allSettled([
          axios.get("https://admin.brendoo.com/api/home_categories", {
            headers: { "Accept-Language": lang },
            timeout: 3000,
          }),
          axios.get("https://admin.brendoo.com/api/socials", {
            timeout: 3000,
          }),
          axios.get("https://admin.brendoo.com/api/pages", {
            headers: { "Accept-Language": lang },
            timeout: 3000,
          }),
        ]);

        const newData = {
          categories:
            categoriesRes.status === "fulfilled"
              ? categoriesRes.value.data
              : [],
          socials:
            socialsRes.status === "fulfilled" ? socialsRes.value.data : [],
          pages:
            pagesRes.status === "fulfilled"
              ? Object.values(pagesRes.value.data || {})
              : [],
          timestamp: Date.now(),
        };

        footerCache = { ...footerCache, [lang]: newData };
        setData(newData);
      } catch (error) {
        console.warn("Footer data load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lang]);

  return { ...data, loading };
};

// // Form types
// type FormData = {
//   name: string;
//   email: string;
//   message: string;
//   phone?: string;
// };

// Contact form hook
// const useContactForm = (translations: Record<string, string>) => {
//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     email: "",
//     message: "",
//     phone: "+7",
//   });
//   const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
//     {}
//   );
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//       const { name, value } = e.target;
// Newsletter subscription hook
const useNewsletter = (translations: Record<string, string>, lang: string) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = useCallback(async () => {
    if (isSubmitting) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEn = lang === "en";
    if (!emailRegex.test(email)) {
      setError(
        translations?.invalid_email ||
          (isEn ? "Invalid email" : "Düzgün email deyil")
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await axios.post(
        "https://admin.brendoo.com/api/subscribe",
        { email },
        { timeout: 5000 }
      );

      toast.success(
        translations?.subscribed ||
          (isEn ? "Subscribed" : "Abunəlik təsdiqləndi")
      );
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error(
        translations?.subscription_error ||
          (isEn ? "Subscription error" : "Abunəlik xətası")
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, lang, translations]);

  return {
    email,
    setEmail,
    error,
    isSubmitting,
    handleSubscribe,
  };
};

// Memoized category list
const CategoryList = React.memo(
  ({
    categories,
    lang,
    translations,
  }: {
    categories: Category[];
    lang: string;
    navigate: (path: string) => void;
    translations: Record<string, string>;
  }) => (
    <div className="flex flex-col md:max-w-[300px] w-[100%]">
      <div className="text-lg font-medium text-white">
        {translations?.Kateqoriyalar || "Kateqoriyalar"}
      </div>
      <div className="flex flex-col gap-2 mt-5 w-full text-base text-white text-opacity-80">
        {categories?.map((item: Category) => (
          <div
            key={item.id}
            className="cursor-pointer hover:text-white transition-colors"
            onClick={() =>
              (window.location.href = `/${lang}/${
                ROUTES.product[lang as keyof typeof ROUTES.product]
              }?category=${item.id}`)
            }
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  )
);

// Memoized company links
const CompanyLinks = React.memo(
  ({
    lang,
    translations,
  }: {
    lang: string;
    navigate: (path: string) => void;
    translations: Record<string, string>;
  }) => (
    <div className="flex flex-col md:max-w-[300px] w-[100%] gap-2">
      <div className="text-lg font-medium text-white">
        {translations?.Şirkət || (lang === 'en' ? 'Company' : 'Şirkət')}
      </div>
      <div className="flex flex-col mt-5 text-base text-white text-opacity-80 space-y-2 w-full">
        <div
          className="cursor-pointer hover:text-white transition-colors w-full"
          onClick={() =>
            (window.location.href = `/${lang}/${
              ROUTES.about[lang as keyof typeof ROUTES.about]
            }`)
          }
        >
          {translations?.Şirkət_haqqında || (lang === 'en' ? 'About company' : 'Şirkət haqqında')}
        </div>
        <HashLink
          to={`/${lang}/${ROUTES.about[lang as keyof typeof ROUTES.about]}#faq`}
          className="cursor-pointer hover:text-white transition-colors w-full"
          smooth
        >
          {translations?.Tez_tez_verilən_suallar || (lang === 'en' ? 'FAQ' : 'Tez-tez verilən suallar')}
        </HashLink>
      </div>
    </div>
  )
);

// Memoized other links
// Memoized other links
const OtherLinks = React.memo(
  ({
    lang,
    translations,
    pages,
  }: {
    lang: string;
    navigate: (path: string) => void;
    translations: Record<string, string>;
    pages: any[];
  }) => (
    <div className="flex flex-col md:max-w-[300px] w-[100%]">
      <div className="text-lg font-medium text-white">
        {translations?.Digər_keçidlər || "Digər keçidlər"}
      </div>
      <div className="flex flex-col gap-2 mt-5 max-w-full text-base text-white text-opacity-80 w-full">
        <div
          className="cursor-pointer hover:text-white transition-colors"
          onClick={() =>
            (window.location.href = `/${lang}/${
              ROUTES.contact[lang as keyof typeof ROUTES.contact]
            }`)
          }
        >
          {translations?.Əlaqə || "Əlaqə"}
        </div>
        {pages?.map((item: any) => {
          const slug =
            item?.slug?.[lang] || item?.slug?.["az"] || item?.slug?.["en"];
          return (
            <div
              key={item?.id}
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => (window.location.href = `/i/${lang}/${slug}`)}
            >
              {item?.title || "Untitled"}
            </div>
          );
        })}
      </div>
    </div>
  )
);

// Social links component
const SocialLinks = React.memo(
  ({ socials }: { socials: SocialMediaLink[] }) => (
    <div className="flex gap-2 items-center self-end h-[40px] w-full">
      {socials?.map((item: SocialMediaLink) => (
        <Link
          reloadDocument
          key={item.id}
          to={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[40px] h-[40px] min-w-[40px] min-h-[40px] flex items-center justify-center overflow-hidden hover:scale-110 transition-transform"
        >
          <img
            loading="lazy"
            alt={item.title}
            src={item.icon}
            className="w-full h-full object-contain rounded-full"
          />
        </Link>
      ))}
    </div>
  )
);

export function Footer() {
  const navigate = useNavigate();
  const { lang = "az" } = useParams<{ lang: string }>();

  // Fast translations
  const translations = useQuickTranslations(lang);

  // Footer data
  const {
    categories = [],
    socials = [],
    pages = [],
    loading,
  } = useFooterData(lang);

  // Form hooks
  // const { formData, errors, isSubmitting, handleChange, handleSubmit } =
  //   useContactForm(translations);

  const {
    email,
    setEmail,
    error: emailError,
    isSubmitting: isSubscribing,
    handleSubscribe,
  } = useNewsletter(translations, lang);

  // Memoized navigation handler
  const handleNavigation = useCallback(
    (path: string) => {
      window.location.href = path;
    },
    [navigate]
  );

  return (
    <div className="overflow-hidden bg-black">
      <div className="flex gap-5 max-md:flex-col">
        <div className="flex flex-col w-full max-md:ml-0 ">
          <div className="flex flex-col self-stretch my-auto max-md:mt-10 max-sm:mt-[10px] max-md:max-w-full">
            <div className="flex flex-col xl:flex-row justify-between md:gap-[40px] px-10 w-full  max-md:px-5">
              <div className="max-w-[100%] xl:max-w-[80%] 2xl:max-w-[60%] w-[100%]">
                <div className="flex gap-5 max-md:flex-col">
                  <div className="flex flex-col ml-5 w-full justify-between max-md:ml-0 max-md:w-full">
                    <div className="flex flex-col md:flex-row justify-between w-full items-start my-[48px] gap-[20px] max-md:my-10 max-sm:my-5 max-md:max-w-full max-sm:order-1">
                      {loading ? (
                        // Loading skeleton
                        <div className="flex space-x-10">
                          <div className="md:max-w-[300px] w-[100%] space-y-3">
                            <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                            <div className="space-y-2">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className="h-4 bg-gray-700 rounded animate-pulse"
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className="md:max-w-[300px] w-[100%] space-y-3">
                            <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                            </div>
                          </div>
                          <div className="md:max-w-[300px] w-[100%] space-y-3">
                            <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
                            <div className="space-y-2">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="h-4 bg-gray-700 rounded animate-pulse"
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CategoryList
                            categories={categories}
                            lang={lang}
                            navigate={handleNavigation}
                            translations={translations}
                          />
                          <CompanyLinks
                            lang={lang}
                            navigate={handleNavigation}
                            translations={translations}
                          />
                          <OtherLinks
                            lang={lang}
                            navigate={handleNavigation}
                            translations={translations}
                            pages={pages}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-[0px] xl:min-w-[400px] w-[100%] xl:w-[400px] flex flex-col order-6 gap-[20px] md:gap-[50px]">
                {/* Newsletter */}
                <div className="flex flex-col mt-5">
                  <div className="flex flex-col mt-7 w-full text-sm">
                    <div className="leading-5 text-white">
                      {translations?.Ən_son_teklifler ||
                        (lang === "en" ? "Latest offers" : "Ən son təkliflər")}
                    </div>
                    <div className="flex overflow-hidden gap-5 justify-between py-1.5 pr-1.5 pl-4 mt-5 w-full border border-solid bg-white bg-opacity-0 border-white border-opacity-10 rounded-[100px] lg:min-w-[360px]">
                      <div className="flex items-center gap-2 text-white text-opacity-60 w-full">
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/d1d54c92c55ebb5790287e2964bc3b43f1e4f8c94296eca7a946b46bc921b98d?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                          className="object-contain w-5 aspect-square"
                          alt="email icon"
                        />
                        <input
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                          type="email"
                          placeholder={translations?.Email ?? ""}
                          disabled={isSubscribing}
                          className="bg-transparent outline-none text-white placeholder-white placeholder-opacity-60 w-full disabled:opacity-50"
                          required
                        />
                      </div>
                      <button
                        onClick={handleSubscribe}
                        disabled={isSubscribing || !email}
                        className="px-6 py-3.5 font-medium text-nowrap text-white bg-blue-600 rounded-[100px] max-md:px-5 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubscribing
                          ? "..."
                          : translations?.Abunə_ol ||
                            (lang === "en" ? "Subscribe" : "Abunə ol")}
                      </button>
                    </div>
                    {emailError && (
                      <p className="text-red-400 text-sm mt-1">{emailError}</p>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <SocialLinks socials={socials} />
                <div className="self-start  mt-auto ml-auto text-sm text-white  mb-[28px] md:mb-[48px]">
                  {translations?.footer_text ?? "2025 | Brendoo"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        {/* <div className="flex flex-col ml-5 w-[40%] max-md:ml-0 max-sm:order-2 max-md:w-full">
          <div className="flex overflow-hidden flex-col grow px-10 pt-12 pb-28 w-full bg-zinc-900 max-md:px-5 max-md:pb-24 max-md:mt-2.5 max-md:max-w-full">
            <div className="col-span-1 lg:col-span-2">
              <h3 className="mb-6 text-lg font-semibold text-white">
                {translations?.have_question ||
                  (lang === "en" ? "Any questions?" : "Sualınız var?")}
              </h3>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={
                    translations?.name_surname ||
                    (lang === "en" ? "Name and surname" : "Ad və soyad")
                  }
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                />
                {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(0) (0) 000-00-00"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                />
                {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={translations?.Email ?? ''}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                />
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={
                    translations?.Qeyd ||
                    (lang === "en" ? "Message" : "Mesaj")
                  }
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-[20px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none transition-all"
                />
                {errors.message && (
                  <p className="text-red-400 text-sm">{errors.message}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[#3873C3] text-white rounded-[100px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? translations?.sending ||
                      (lang === "en" ? "Sending..." : "Göndərilir...")
                    : translations?.göndər ||
                      (lang === "en" ? "Send" : "Göndər")}
                </button>
              </form>
            </div>
          </div>
        </div> */}

        {/* Mobile copyright */}
        {/* <div className="self-start max-sm:mt-3 max-sm:mb-6 max-sm:flex hidden mt-7 ml-10 text-sm text-white max-md:ml-2.5 order-3">
          {translations?.footer_text ?? "2025 | Brendoo"}
        </div> */}
      </div>
    </div>
  );
}
