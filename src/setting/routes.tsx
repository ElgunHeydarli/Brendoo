type Route = {
    en: string;
    az: string;
};

const ROUTES: { [key: string]: Route } = {
    home: {
        en: 'home',
        az: 'home',
    },
    about: {
        en: 'about',
        az: 'about',
    },
    contact: {
        en: 'contact',
        az: 'contact',
    },
    product: {
        en: 'product',
        az: 'product',
    },
    productSingle: {
        en: 'product',
        az: 'product',
    },
    login: {
        en: 'login',
        az: 'login',
    },
    brends: {
        en: 'brends',
        az: 'brends',
    },
    rules: {
        en: 'rules',
        az: 'rules',
    },
    deliveryRules: {
        en: 'deliveryRules',
        az: 'deliveryRules',
    },
    refundRules: {
        en: 'refundRules',
        az: 'refundRules',
    },
    userSettings: {
        en: 'userSettings',
        az: 'userSettings',
    },
    orders: {
        en: 'orders',
        az: 'orders',
    },
    orderdetail: {
        en: 'orderdetail',
        az: 'orderdetail',
    },
    ordersConfirm: {
        en: 'ordersConfirm',
        az: 'ordersConfirm',
    },
    liked: {
        en: 'liked',
        az: 'liked',
    },
    likedUser: {
        en: 'userliked',
        az: 'userliked',
    },
    notification: {
        en: 'notification',
        az: 'notification',
    },
    return: {
        en: 'return',
        az: 'return',
    },
    address: {
        en: 'address',
        az: 'address',
    },
    order: {
        en: 'order',
        az: 'order',
    },
    register: {
        en: 'register',
        az: 'register',
    },
    resetPasword: {
        en: 'resetPasword',
        az: 'resetPasword',
    },
    resetPaswordSucses: {
        en: 'resetPaswordSucses',
        az: 'resetPaswordSucses',
    },
    BaskedSucses: {
        en: 'BaskedSucses',
        az: 'BaskedSucses',
    },
    password_reset_confrim: {
        en: 'password-reset',
        az: 'password-reset',
    },
};

export const getRouteKey = (searchString: string): string | null => {
    for (const key in ROUTES) {
        if (
            ROUTES[key].en === searchString ||
            ROUTES[key].az === searchString
        ) {
            return key;
        }
    }
    return null;
};

export default ROUTES;