// src/components/GoogleTranslate/index.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

// Bayraq SVG-ləri
const flags: Record<string, JSX.Element> = {
  en: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-6 rounded-sm">
      <clipPath id="s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
      <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  ),
  ru: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" className="w-6 h-6 rounded-sm">
      <rect fill="#fff" width="9" height="3" />
      <rect fill="#0039A6" y="2" width="9" height="2" />
      <rect fill="#D52B1E" y="4" width="9" height="2" />
    </svg>
  ),
  az: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" className="w-6 h-6 rounded-sm">
      <rect fill="#0092BC" width="1200" height="200" />
      <rect fill="#E4002B" y="200" width="1200" height="200" />
      <rect fill="#00B140" y="400" width="1200" height="200" />
      <circle fill="#fff" cx="580" cy="300" r="90" />
      <circle fill="#E4002B" cx="600" cy="300" r="75" />
      <polygon fill="#fff" points="700,300 720,340 680,315 720,315 680,340" transform="translate(20,-5)" />
    </svg>
  ),
  tr: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className="w-6 h-6 rounded-sm">
      <rect fill="#E30A17" width="1200" height="800" />
      <circle fill="#fff" cx="425" cy="400" r="200" />
      <circle fill="#E30A17" cx="475" cy="400" r="160" />
      <polygon fill="#fff" points="583,400 764,481 648,400 764,319" transform="rotate(18,583,400)" />
    </svg>
  ),
};

const languages = [
  { code: "en", name: "English", short: "EN" },
  { code: "ru", name: "Русский", short: "RU" },
  { code: "az", name: "Azərbaycan", short: "AZ" },
  { code: "tr", name: "Türkçe", short: "TR" },
];

// LocalStorage-dan dili oxu
const getSavedLanguage = (): { code: string; short: string } => {
  const savedCode = localStorage.getItem("selectedGoogleLangCode");
  const savedShort = localStorage.getItem("selectedGoogleLang");
  if (savedCode && savedShort) {
    return { code: savedCode, short: savedShort };
  }
  return { code: "en", short: "EN" };
};

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => getSavedLanguage());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  // ✅ Səhifə yüklənəndə saxlanmış dili tətbiq et
  const applyStoredLanguage = useCallback(() => {
    const savedLangCode = localStorage.getItem("selectedGoogleLangCode");
    
    if (savedLangCode && savedLangCode !== "en") {
      // Cookie-ni yenilə
      const domain = window.location.hostname;
      const cookieValue = `/en/${savedLangCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}; max-age=31536000`;
      if (domain.includes('.')) {
        const rootDomain = domain.substring(domain.indexOf('.'));
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${rootDomain}; max-age=31536000`;
      }
      
      // Google Translate select-i tap və dəyiş
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select && select.value !== savedLangCode) {
        select.value = savedLangCode;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }, []);

  // ✅ YENİ: Səhifə yüklənəndə saxlanmış dili avtomatik tətbiq et
  useEffect(() => {
    const savedLangCode = localStorage.getItem("selectedGoogleLangCode");
    
    // Əgər Azərbaycan (və ya başqa dil) seçilibsə, amma səhifə hələ tərcümə olunmayıbsa
    if (savedLangCode && savedLangCode !== "en") {
      const hasReloaded = sessionStorage.getItem("languageAutoApplied");
      
      // Əgər bu session-da hələ reload olmayıbsa
      if (!hasReloaded) {
        const domain = window.location.hostname;
        const cookieValue = `/en/${savedLangCode}`;
        
        // Cookie-ni set et
        document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}; max-age=31536000`;
        if (domain.includes('.')) {
          const rootDomain = domain.substring(domain.indexOf('.'));
          document.cookie = `googtrans=${cookieValue}; path=/; domain=${rootDomain}; max-age=31536000`;
        }
        
        // Flag qoy ki, bir daha reload olmasın
        sessionStorage.setItem("languageAutoApplied", "true");
        
        // Səhifəni reload et ki, tərcümə tətbiq olunsun
        window.location.reload();
      } else {
        // Əgər artıq reload olubsa, sadəcə Google Translate-i yenilə
        const timeouts = [
          setTimeout(applyStoredLanguage, 300),
          setTimeout(applyStoredLanguage, 600),
          setTimeout(applyStoredLanguage, 1000),
        ];
        
        return () => timeouts.forEach(clearTimeout);
      }
    }
  }, [applyStoredLanguage]);

  // Body style-ı təmizlə
  useEffect(() => {
    const cleanBodyStyle = () => {
      document.body.style.top = "";
      document.body.style.position = "";
    };

    const observer = new MutationObserver(cleanBodyStyle);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    cleanBodyStyle();
    return () => observer.disconnect();
  }, []);

  // Google Translate iframe banner-ini gizlət
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .goog-te-banner-frame, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame {
        display: none !important;
      }
      body { top: 0 !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // Google Translate yüklə
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "az,en,ru,tr",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
              gaTrack: false,
            },
            "google_translate_element"
          );

          // Saxlanmış dili tətbiq et
          setTimeout(applyStoredLanguage, 500);
          setTimeout(applyStoredLanguage, 1500);
        }
      } catch (e) {
        console.error("Google Translate init error:", e);
      }
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, [applyStoredLanguage]);

  // Dropdown xaricində klik
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dil dəyişdir
  const changeLanguage = useCallback((langCode: string, langShort: string) => {
    setCurrentLang({ code: langCode, short: langShort });
    setIsOpen(false);

    // LocalStorage-a saxla
    localStorage.setItem("selectedGoogleLang", langShort);
    localStorage.setItem("selectedGoogleLangCode", langCode);

    // Cookie təyin et
    const domain = window.location.hostname;
    const cookieValue = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}; max-age=31536000`;
    if (domain.includes('.')) {
      const rootDomain = domain.substring(domain.indexOf('.'));
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${rootDomain}; max-age=31536000`;
    }

    // Səhifəni reload et ki, tərcümə düzgün tətbiq olunsun
    window.location.reload();
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-[99999]">
      {/* Gizli Google Translate elementi */}
      <div
        id="google_translate_element"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          opacity: 0,
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
          visibility: "hidden",
          zIndex: 2,
        }}
      />

      {/* Custom Button - yalnız bayraq */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="notranslate flex items-center gap-1.5 h-[40px] lg:h-[48px] px-3 py-1.5 bg-[#F5F5F5] rounded-full text-black text-sm font-medium transition-all duration-200"
        translate="no"
      >
        <span className="flex items-center justify-center overflow-hidden">
          {flags[currentLang.code]}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu - yalnız bayraqlar */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200 notranslate" translate="no">
          <div className="flex flex-col p-2 gap-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code, lang.short)}
                className={`p-2 rounded-lg transition-all duration-150 flex items-center justify-center ${
                  currentLang.code === lang.code
                    ? "bg-blue-50 ring-2 ring-blue-400"
                    : "hover:bg-gray-100"
                }`}
                title={lang.name}
              >
                <span className="flex items-center justify-center w-8 h-6">{flags[lang.code]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;