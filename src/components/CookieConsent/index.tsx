// src/components/CookieConsent/index.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function CookieConsent() {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const [isVisible, setIsVisible] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsLoading, setTermsLoading] = useState(false);

  // Tərcümələr
  const texts = {
    az: {
      message:
        'Bu sayt təcrübənizi yaxşılaşdırmaq üçün cookie fayllarından istifadə edir.',
      accept: 'Qəbul edirəm',
      decline: 'Rədd et',
      terms: 'Şərtlər və Qaydalar',
      close: 'Bağla',
    },
    en: {
      message: 'This site uses cookies to improve your experience.',
      accept: 'Accept',
      decline: 'Decline',
      terms: 'Terms and Conditions',
      close: 'Close',
    },
  };

  const t = texts[lang as keyof typeof texts] || texts.az;

  useEffect(() => {
    // Cookie consent yoxla
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // 1 saniyə sonra göstər
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  // Şərtləri yüklə
  const fetchTerms = async () => {
    setTermsLoading(true);
    try {
      const response = await axios.get('https://admin.brendoo.com/api/pages?page_id=4', {
        headers: { 'Accept-Language': lang }
      });
      setTermsContent(response.data?.description || '');
    } catch (error) {
      console.error('Terms fetch error:', error);
      setTermsContent(
        lang === 'en' ? 'Failed to load terms' : 'Şərtlər yüklənə bilmədi'
      );
    } finally {
      setTermsLoading(false);
    }
  };

  const handleOpenTerms = () => {
    setShowTermsModal(true);
    if (!termsContent) fetchTerms();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slideUp">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 11.39 21.94 10.79 21.82 10.21C21.13 10.72 20.3 11 19.4 11C17.07 11 15.18 9.21 15.02 6.91C14.15 7.6 13.03 8 11.82 8C9.12 8 6.91 5.95 6.7 3.3C4.03 4.62 2 7.09 2 12" stroke="#3873C3" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="8" cy="14" r="1.5" fill="#3873C3"/>
                  <circle cx="12" cy="11" r="1" fill="#3873C3"/>
                  <circle cx="16" cy="14" r="1.5" fill="#3873C3"/>
                  <circle cx="11" cy="16" r="1" fill="#3873C3"/>
                </svg>
              </div>
              
              {/* Text */}
              <div className="flex-1">
                <p className="text-gray-700 text-sm sm:text-base">
                  {t.message}
                </p>
                <button
                  onClick={handleOpenTerms}
                  className="text-[#3873C3] text-sm font-medium hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  {t.terms}
                </button>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDecline}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {t.decline}
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white bg-[#3873C3] hover:bg-[#2d5fa3] rounded-full transition-colors shadow-lg shadow-blue-500/25"
                >
                  {t.accept}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-modalIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3873C3" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {t.terms}
              </h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {termsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-3 border-gray-200 border-t-[#3873C3] rounded-full animate-spin mb-4"></div>
                  <span className="text-gray-500">Yüklənir...</span>
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: termsContent }}
                />
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 bg-[#3873C3] text-white rounded-full font-medium hover:bg-[#2d5fa3] transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes modalIn {
          from {
            transform: scale(0.95) translateY(10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-modalIn {
          animation: modalIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}