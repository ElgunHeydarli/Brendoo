import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Home from '../Home';
import ROUTES from '../../setting/routes';
import Aboutus from '../Aboutus';
import Products from '../Products';
import UserRules from '../UserRules';
import DeliveryRules from '../DeliveryRules';
import Contact from '../Contact';
import Brends from '../Brends';
import Login from '../userIn/login';
import UserSettings from '../userIn';
import Notification from '../userIn/Nptifications';
import Basked from '../userIn/Basked';
import Liked from '../Liked';
import UserLiked from '../userIn/Liked';
import BaskedConfirm from '../userIn/BaskedConfirm';
import ORder from '../userIn/Order';
import Register from '../userIn/register';
import Password from '../userIn/Pasword';
import SucsesPassword from '../userIn/sucsesPasword';
import Sucses from '../Sucses';
import GETRequest from '../../setting/Request';
import { Seo } from '../../setting/Types';
import RefundRules from '../RefundRules';
import ReturnPage from '../userIn/ReturnPage';
import ChangeAddress from '../userIn/ChangeAddress';

// SEO Wrapper Component
const PageWrapper = ({
  children,
  metaType,
  Metas,
  favicon,
}: {
  children: React.ReactNode;
  metaType: string;
  Metas?: Seo[];
  favicon?: { image: string };
}) => {
  const meta = useMemo(
    () => Metas?.find((m) => m.type === metaType),
    [Metas, metaType]
  );

  return (
    <div>
      <Helmet>
        <title>{meta?.meta_title || 'Brendoo'}</title>
        <meta name="description" content={meta?.meta_description || ''} />
        <meta name="keywords" content={meta?.meta_keywords || ''} />
        {favicon?.image && (
          <link rel="icon" href={favicon.image} type="image/svg+xml" />
        )}
      </Helmet>
      {children}
    </div>
  );
};

// Route Map - sadə versiya, type annotation yoxdur
const ROUTE_MAP = {
  [ROUTES.home.en]: { Component: Home, metaType: 'home_page' },
  [ROUTES.home.ru]: { Component: Home, metaType: 'home_page' },
  [ROUTES.about.en]: { Component: Aboutus, metaType: 'about_page' },
  [ROUTES.about.ru]: { Component: Aboutus, metaType: 'about_page' },
  [ROUTES.product.en]: { Component: Products, metaType: 'product_page' },
  [ROUTES.product.ru]: { Component: Products, metaType: 'product_page' },
  [ROUTES.rules.en]: { Component: UserRules, metaType: 'using_rules_page' },
  [ROUTES.rules.ru]: { Component: UserRules, metaType: 'using_rules_page' },
  [ROUTES.deliveryRules.en]: {
    Component: DeliveryRules,
    metaType: 'delivery_rules_page',
  },
  [ROUTES.deliveryRules.ru]: {
    Component: DeliveryRules,
    metaType: 'delivery_rules_page',
  },
  [ROUTES.refundRules.en]: {
    Component: RefundRules,
    metaType: 'delivery_rules_page',
  },
  [ROUTES.refundRules.ru]: {
    Component: RefundRules,
    metaType: 'delivery_rules_page',
  },
  [ROUTES.contact.en]: { Component: Contact, metaType: 'contact_page' },
  [ROUTES.contact.ru]: { Component: Contact, metaType: 'contact_page' },
  [ROUTES.brends.en]: { Component: Brends, metaType: 'brends_page' },
  [ROUTES.brends.ru]: { Component: Brends, metaType: 'brends_page' },
  [ROUTES.login.en]: { Component: Login, metaType: 'login_page' },
  [ROUTES.login.ru]: { Component: Login, metaType: 'login_page' },
  [ROUTES.userSettings.en]: {
    Component: UserSettings,
    metaType: 'settings_page',
  },
  [ROUTES.userSettings.ru]: {
    Component: UserSettings,
    metaType: 'settings_page',
  },
  [ROUTES.orders.en]: { Component: ORder, metaType: 'order_page' },
  [ROUTES.orders.ru]: { Component: ORder, metaType: 'order_page' },
  [ROUTES.liked.en]: { Component: Liked, metaType: 'Liked_page' },
  [ROUTES.liked.ru]: { Component: Liked, metaType: 'Liked_page' },
  [ROUTES.notification.en]: {
    Component: Notification,
    metaType: 'Notification_page',
  },
  [ROUTES.notification.ru]: {
    Component: Notification,
    metaType: 'Notification_page',
  },
  [ROUTES.order.en]: { Component: Basked, metaType: 'Basked_page' },
  [ROUTES.order.ru]: { Component: Basked, metaType: 'Basked_page' },
  [ROUTES.return.en]: { Component: ReturnPage, metaType: '' },
  [ROUTES.return.ru]: { Component: ReturnPage, metaType: '' },
  [ROUTES.likedUser.en]: { Component: UserLiked, metaType: 'User_liked_page' },
  [ROUTES.likedUser.ru]: { Component: UserLiked, metaType: 'User_liked_page' },
  [ROUTES.ordersConfirm.en]: {
    Component: BaskedConfirm,
    metaType: 'Basked_confrim_page',
  },
  [ROUTES.ordersConfirm.ru]: {
    Component: BaskedConfirm,
    metaType: 'Basked_confrim_page',
  },
  [ROUTES.register.en]: { Component: Register, metaType: 'register_page' },
  [ROUTES.register.ru]: { Component: Register, metaType: 'register_page' },
  [ROUTES.resetPasword.en]: { Component: Password, metaType: 'password_page' },
  [ROUTES.resetPasword.ru]: { Component: Password, metaType: 'password_page' },
  [ROUTES.resetPaswordSucses.en]: {
    Component: SucsesPassword,
    metaType: 'sucses_password',
  },
  [ROUTES.resetPaswordSucses.ru]: {
    Component: SucsesPassword,
    metaType: 'sucses_password',
  },
  [ROUTES.BaskedSucses.en]: { Component: Sucses, metaType: 'sucses' },
  [ROUTES.BaskedSucses.ru]: { Component: Sucses, metaType: 'sucses' },
  [ROUTES.address.en]: { Component: ChangeAddress, metaType: '' },
  [ROUTES.address.ru]: { Component: ChangeAddress, metaType: '' },
};

const PageByLang: React.FC = () => {
  const { lang, page } = useParams<{ lang: string; page: string }>();

  // API calls - yalnız 1 dəfə
  const { data: Metas } = GETRequest<Seo[]>(`/seo_pages`, 'seo_pages', [lang]);
  const { data: favicon } = GETRequest<{ image: string }>(`/favicon`, 'favicon', [
    lang,
  ]);

  // Route lookup
  const route = useMemo(() => {
    // Special case: home
    if (
      page === '/' ||
      page === '/en' ||
      page === '/az' ||
      !page ||
      page === ROUTES.home.en ||
      page === ROUTES.home.ru
    ) {
      return ROUTE_MAP[ROUTES.home.en];
    }

    return ROUTE_MAP[page || ''];
  }, [page]);

  // Əgər route tapılmayıbsa
  if (!route) {
    return (
      <div>
        <h1>Language: {lang}</h1>
        <h1>Page: {page}</h1>
      </div>
    );
  }

  const { Component, metaType } = route;

  return (
    <PageWrapper metaType={metaType} Metas={Metas} favicon={favicon}>
      <Component />
    </PageWrapper>
  );
};

export default PageByLang;
