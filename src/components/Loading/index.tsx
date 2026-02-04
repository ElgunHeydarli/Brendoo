import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useMemo, memo } from 'react';

// ============================================================================
// ULTRA FAST CACHE - IN-MEMORY ONLY
// ============================================================================

const cache: Record<string, Record<string, string>> = {};
const pending: Record<string, Promise<any>> = {};

// ============================================================================
// INSTANT TRANSLATIONS HOOK
// ============================================================================

export const useQuickTranslations = (lang: string = 'az') => {
  const [t, setT] = useState<Record<string, string>>(() => cache[lang] || {});

  useEffect(() => {
    if (cache[lang]) {
      setT(cache[lang]);
      return;
    }

    if (!pending[lang]) {
      pending[lang] = axios
        .get('https://admin.brendoo.com/api/translates', {
          headers: { 'Accept-Language': lang },
          timeout: 1500,
        })
        .then((res) => {
          cache[lang] = res.data;
          setT(res.data);
        })
        .catch(() => {})
        .finally(() => delete pending[lang]);
    }

    pending[lang].then(() => setT(cache[lang] || {}));
  }, [lang]);

  return t;
};

// ============================================================================
// MAIN LOADING - ULTRA MINIMAL
// ============================================================================

const Loading: React.FC = memo(() => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const t = useQuickTranslations(lang);

  const text = useMemo(() => t?.loading_main_key_isload || 'Yüklənir...', [t]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Ultra minimal spinner */}
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        
        {/* Simple text */}
        <div className="text-sm text-gray-600 font-medium">{text}</div>
      </div>
    </div>
  );
});
Loading.displayName = 'Loading';

// ============================================================================
// COMPACT LOADING - MINIMAL
// ============================================================================

export const CompactLoading: React.FC = memo(() => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm z-50">
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  </div>
));
CompactLoading.displayName = 'CompactLoading';

// ============================================================================
// NO FIX LOADING
// ============================================================================

export const LoadingNoFix: React.FC = memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
));
LoadingNoFix.displayName = 'LoadingNoFix';

// ============================================================================
// MICRO LOADING
// ============================================================================

export const MicroLoading: React.FC = memo(() => (
  <div className="flex items-center justify-center p-2">
    <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
));
MicroLoading.displayName = 'MicroLoading';

// ============================================================================
// BUTTON LOADING
// ============================================================================

export const ButtonLoading: React.FC<{ text?: string }> = memo(({ text }) => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    {text && <span>{text}</span>}
  </div>
));
ButtonLoading.displayName = 'ButtonLoading';

// ============================================================================
// SKELETON - ULTRA FAST
// ============================================================================

export const SkeletonBox: React.FC<{
  className?: string;
}> = memo(({ className = '' }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
));
SkeletonBox.displayName = 'SkeletonBox';

// ============================================================================
// PAGE TRANSITION - TOP BAR ONLY
// ============================================================================

export const PageTransitionLoading: React.FC = memo(() => (
  <div className="fixed top-0 left-0 right-0 h-0.5 bg-blue-600 z-50 animate-progress" />
));
PageTransitionLoading.displayName = 'PageTransitionLoading';

// ============================================================================
// DOTS LOADING
// ============================================================================

export const DotsLoading: React.FC = memo(() => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
));
DotsLoading.displayName = 'DotsLoading';

// ============================================================================
// INLINE LOADING - TABLE/LIST
// ============================================================================

export const InlineLoading: React.FC = memo(() => (
  <div className="flex items-center justify-center w-full py-4">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
  </div>
));
InlineLoading.displayName = 'InlineLoading';

// ============================================================================
// AGGRESSIVE PRELOAD - NON-BLOCKING
// ============================================================================

const preload = () => {
  ['az', 'en']
    .filter((l) => !cache[l])
    .forEach((l) => {
      axios
        .get('https://admin.brendoo.com/api/translates', {
          headers: { 'Accept-Language': l },
          timeout: 3000,
        })
        .then((res) => (cache[l] = res.data))
        .catch(() => {});
    });
};

// Auto-preload after page load
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(preload, { timeout: 1000 });
  } else {
    setTimeout(preload, 100);
  }
}

// ============================================================================
// CUSTOM ANIMATIONS - ADD TO TAILWIND
// ============================================================================

// tailwind.config.js əlavə edin:
/*
module.exports = {
  theme: {
    extend: {
      animation: {
        'progress': 'progress 1s ease-in-out infinite',
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
}
*/

export default Loading;
