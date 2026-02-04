import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguageStore } from './Header/hooks/useHeader';

const LANGS = ['az', 'en'] as const;

type LangCode = typeof LANGS[number];

const LANG_FLAGS: Record<LangCode, string> = {
  az: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg',
  en: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/330px-Flag_of_the_United_Kingdom.svg.png',
};

const LANG_LABELS: Record<LangCode, string> = {
  az: 'Azərbaycan',
  en: 'English',
};

const normalizeLang = (value?: string | null): LangCode => {
  return value === 'en' ? 'en' : 'az';
};

const buildPathWithLang = (path: string, targetLang: LangCode): string => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length > 0 && (parts[0] === 'az' || parts[0] === 'en')) {
    parts[0] = targetLang;
  } else {
    parts.unshift(targetLang);
  }
  return `/${parts.join('/')}`;
};

export default function LanguageSwitcher() {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = normalizeLang(lang);
  const { setSelectedLang } = useLanguageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSwitch = useCallback(
    (target: LangCode) => {
      if (target === currentLang) return;
      setSelectedLang(target);
      const newPath = buildPathWithLang(location.pathname, target);
      navigate(`${newPath}${location.search}${location.hash}`);
      setIsOpen(false);
    },
    [currentLang, location.hash, location.pathname, location.search, navigate, setSelectedLang]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-semibold text-black/80 hover:text-black"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <img 
          src={LANG_FLAGS[currentLang]} 
          alt={LANG_LABELS[currentLang]}
          className="w-6 h-4 rounded-sm object-cover"
        />
        <span>{LANG_LABELS[currentLang]}</span>
        <svg
          className="h-3 w-3 text-black/60"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg"
        >
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSwitch(code)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors ${
                currentLang === code
                  ? 'bg-[#3873C3]/10 text-[#3873C3]'
                  : 'text-black/80 hover:bg-black/5'
              }`}
              role="option"
              aria-selected={currentLang === code}
            >
              <img 
                src={LANG_FLAGS[code]} 
                alt={LANG_LABELS[code]}
                className="w-6 h-4 rounded-sm object-cover"
              />
              <span>{LANG_LABELS[code]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
