import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RecoilRoot } from 'recoil';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

import Loading from './components/Loading';
import Header from './components/Header';
import CookieConsent from './components/CookieConsent'; // ✅ YENİ: Cookie Consent
import { useCollectionModal } from './contexts/CollectionModalProvider';
import { CollectionProvider } from './pages/influencer_dashboard/CollectionProvider';
import ResetPasswordConfrim from './pages/userIn/ResetPasswordConfrim';
import SearchResults from './pages/SearchResults';

// Lazy load pages
const Products = lazy(() => import('./pages/Products'));
const ProductId = lazy(() => import('./pages/Products/Id'));
const Aboutus = lazy(() => import('./pages/Aboutus'));
const Liked = lazy(() => import('./pages/Liked'));
const Brends = lazy(() => import('./pages/Brends'));
const Contact = lazy(() => import('./pages/Contact'));
const UserRules = lazy(() => import('./pages/UserRules'));
const DeliveryRules = lazy(() => import('./pages/DeliveryRules'));
const RefundRules = lazy(() => import('./pages/RefundRules'));
const Login = lazy(() => import('./pages/userIn/login'));
const Register = lazy(() => import('./pages/userIn/register'));
const UserSettings = lazy(() => import('./pages/userIn'));
const UserLiked = lazy(() => import('./pages/userIn/Liked'));
const Order = lazy(() => import('./pages/userIn/Order'));
const BaskedConfirm = lazy(() => import('./pages/userIn/BaskedConfirm'));
const Basked = lazy(() => import('./pages/userIn/Basked'));
const Password = lazy(() => import('./pages/userIn/Pasword'));
const Notification = lazy(() => import('./pages/userIn/Nptifications'));
const ReturnPage = lazy(() => import('./pages/userIn/ReturnPage'));
const OrderItemsDetail = lazy(() => import('./pages/userIn/OrderItemsDetail'));
const ChangeAddress = lazy(() => import('./pages/userIn/ChangeAddress'));
const PageByLang = lazy(() => import('./pages/Maincontrollers/PageByLang'));
const InnerPageByLang = lazy(() => import('./pages/Maincontrollers/InnerPagebyLang'));
const Sucses = lazy(() => import('./pages/Sucses'));
const FailPage = lazy(() => import('./pages/FailPage'));
const DynamicPage = lazy(() => import('./featurePages/DynamicPage'));
const RulesPage = lazy(() => import('./featurePages/RulesPage'));
const CollectionPage = lazy(() => import('./CollectionPage'));
const MainDashboard = lazy(() => import('./pages/influencer_dashboard/MainDashboard'));
const CreateCollectionModal = lazy(
  () => import('./pages/influencer_dashboard/ui/CreateCollectionModal'),
);
const AddProductCollection = lazy(
  () => import('./pages/influencer_dashboard/ui/AddProductCollection'),
);

// QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const GOOGLE_CLIENT_ID =
  '676362303569-egd9urrld33gs13hbpo2mks4i73jr19n.apps.googleusercontent.com';

const App = () => {
  const location = useLocation();
  const {
    createCollectionModal,
    setCreateCollectionModal,
    setAddProductCollection,
    addProductCollection,
  } = useCollectionModal();

  const type = localStorage.getItem('user_type');

  const [favicon, setFavicon] = useState<{ image: string }>({ image: '' });
  const [faviconLoading, setFaviconLoading] = useState(false);

  // Favicon yükləmə
  useEffect(() => {
    let isMounted = true;
    const getFavicon = async () => {
      setFaviconLoading(true);
      try {
        const res = await axios.get('https://admin.brendoo.com/api/favicon');
        if (isMounted && res.data?.image) {
          setFavicon({ image: res.data.image });
        }
      } catch (error) {
        console.log('Favicon yüklənə bilmədi:', error);
      } finally {
        if (isMounted) setFaviconLoading(false);
      }
    };
    getFavicon();
    return () => {
      isMounted = false;
    };
  }, []);

  // Favicon DOM-a əlavə etmə
  useEffect(() => {
    if (favicon?.image) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.setAttribute('href', favicon.image);
    }
  }, [favicon.image]);

  // Scroll to top
  useEffect(() => {
    if (
      !location.pathname.includes('онас#faq') &&
      !location.pathname.includes('about#faq')
    ) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Favicon yüklənərkən çox uzun gözləməyək
  if (faviconLoading) {
    setTimeout(() => {
      if (faviconLoading) {
        setFaviconLoading(false);
      }
    }, 3000);

    return <Loading />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HelmetProvider>
        <CollectionProvider>
          <RecoilRoot>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools initialIsOpen={false} />

              {/* Influencer modallar */}
              {type === 'influencer' && (
                <Suspense fallback={<Loading />}>
                  <CreateCollectionModal
                    opener={createCollectionModal}
                    onClose={() => setCreateCollectionModal(false)}
                  />
                  <AddProductCollection
                    opener={addProductCollection}
                    onClose={() => setAddProductCollection(false)}
                  />
                </Suspense>
              )}

              {/* Routing */}
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* ✅ "/" URL-ə girsə "/en/home"-a redirect et */}
                  <Route path="/" element={<Navigate to="/en/home" replace />} />
                  
                  {/* ✅ Search Results Page */}
                  <Route path="/:lang/search" element={<SearchResults />} />
                  
                  {!location.pathname?.includes('influencer') && (
                    <Route path="/:lang/:page" element={<PageByLang />} />
                  )}
                  <Route path="/:lang/:page/:slug" element={<InnerPageByLang />} />
                  <Route path="/poducts" element={<Products />} />
                  <Route path="/products/:id" element={<ProductId />} />
                  <Route path="/aboutus" element={<Aboutus />} />
                  <Route path="/liked" element={<Liked />} />
                  <Route path="/brends" element={<Brends />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/userrules" element={<UserRules />} />
                  <Route path="/deliveryrules" element={<DeliveryRules />} />
                  <Route path="/refund" element={<RefundRules />} />

                  {/* User */}
                  <Route path="/user/login" element={<Login />} />
                  <Route path="/user/register" element={<Register />} />
                  <Route path="/user/newPassword" element={<Password />} />
                  <Route path="/user" element={<UserSettings />} />
                  <Route path="/user/liked" element={<UserLiked />} />
                  <Route path="/user/notifications" element={<Notification />} />
                  <Route path="/user/return" element={<ReturnPage />} />
                  <Route path="/user/address" element={<ChangeAddress />} />
                  <Route path="/user/orders" element={<Order />} />
                  <Route path="/user/orders/:id" element={<OrderItemsDetail />} />
                  <Route path="/user/basked/confirm" element={<BaskedConfirm />} />
                  <Route path="/basked/sifarislerim" element={<Basked />} />

                  {/* General */}
                  <Route path="/success" element={<Sucses />} />
                  <Route path="/fail" element={<FailPage />} />
                  <Route path="/i/:lang/:slug" element={<DynamicPage />} />
                  <Route path="/:lang/collections/:slug" element={<CollectionPage />} />
                  <Route
                    path="/условия-и-положения/:lang/:slug"
                    element={<RulesPage />}
                  />

                  {/* Influencer */}
                  {type === 'influencer' && (
                    <Route
                      path="/:lang/influencer/*"
                      element={
                        <div style={{ paddingTop: '40px' }}>
                          <Header />
                          <MainDashboard />
                        </div>
                      }
                    />
                  )}

                  <Route
                    path="/:lang/influencers/password-reset/:slug"
                    element={<ResetPasswordConfrim />}
                  />
                </Routes>
              </Suspense>

              {/* ✅ YENİ: Cookie Consent Banner */}
              <CookieConsent />

              {/* Toast */}
              <Toaster containerStyle={{ zIndex: 100000000 }} />
            </QueryClientProvider>
          </RecoilRoot>
        </CollectionProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
};

export default React.memo(App);