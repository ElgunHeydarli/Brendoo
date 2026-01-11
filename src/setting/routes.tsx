type Route = {
    en: string;
    ru: string;
    az: string;
};

const ROUTES: { [key: string]: Route } = {
    home: {
        en: 'home',
        ru: 'home',
        az: 'home',
    },
    about: {
        en: 'about',
        ru: 'about',
        az: 'about',
    },
    contact: {
        en: 'contact',
        ru: 'contact',
        az: 'contact',
    },
    product: {
        en: 'product',
        ru: 'product',
        az: 'product',
    },
    productSingle: {
        en: 'product',
        ru: 'product',
        az: 'product',
    },
    login: {
        en: 'login',
        ru: 'login',
        az: 'login',
    },
    brends: {
        en: 'brends',
        ru: 'brends',
        az: 'brends',
    },
    rules: {
        en: 'rules',
        ru: 'rules',
        az: 'rules',
    },
    deliveryRules: {
        en: 'deliveryRules',
        ru: 'deliveryRules',
        az: 'deliveryRules',
    },
    refundRules: {
        en: 'refundRules',
        ru: 'refundRules',
        az: 'refundRules',
    },
    userSettings: {
        en: 'userSettings',
        ru: 'userSettings',
        az: 'userSettings',
    },
    orders: {
        en: 'orders',
        ru: 'orders',
        az: 'orders',
    },
    orderdetail: {
        en: 'orderdetail',
        ru: 'orderdetail',
        az: 'orderdetail',
    },
    ordersConfirm: {
        en: 'ordersConfirm',
        ru: 'ordersConfirm',
        az: 'ordersConfirm',
    },
    liked: {
        en: 'liked',
        ru: 'liked',
        az: 'liked',
    },
    likedUser: {
        en: 'userliked',
        ru: 'userliked',
        az: 'userliked',
    },
    notification: {
        en: 'notification',
        ru: 'notification',
        az: 'notification',
    },
    return: {
        en: 'return',
        ru: 'return',
        az: 'return',
    },
    address: {
        en: 'address',
        ru: 'address',
        az: 'address',
    },
    order: {
        en: 'order',
        ru: 'order',
        az: 'order',
    },
    register: {
        en: 'register',
        ru: 'register',
        az: 'register',
    },
    resetPasword: {
        en: 'resetPasword',
        ru: 'resetPasword',
        az: 'resetPasword',
    },
    resetPaswordSucses: {
        en: 'resetPaswordSucses',
        ru: 'resetPaswordSucses',
        az: 'resetPaswordSucses',
    },
    BaskedSucses: {
        en: 'BaskedSucses',
        ru: 'BaskedSucses',
        az: 'BaskedSucses',
    },
    password_reset_confrim: {
        en: 'password-reset',
        ru: 'password-reset',
        az: 'password-reset',
    },
};

export const getRouteKey = (searchString: string): string | null => {
    for (const key in ROUTES) {
        if (
            ROUTES[key].en === searchString ||
            ROUTES[key].ru === searchString ||
            ROUTES[key].az === searchString
        ) {
            return key;
        }
    }
    return null;
};

export default ROUTES;