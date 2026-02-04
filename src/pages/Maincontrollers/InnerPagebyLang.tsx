import React from 'react';
import { useParams } from 'react-router-dom';
import ROUTES from '../../setting/routes';

import ProductId from '../Products/Id';
import ResetPasswordConfrim from '../userIn/ResetPasswordConfrim';
import OrderItemsDetail from '../userIn/OrderItemsDetail';

const InnerPageByLang: React.FC = () => {
    const { lang, page, slug } = useParams<{
        lang: string;
        page: string;
        slug: string;
    }>();
    if (page === ROUTES.product.en || page === ROUTES.product.az) {
        return <ProductId />;
    }
    if (
        page === ROUTES.password_reset_confrim.en ||
        page === ROUTES.password_reset_confrim.az
    ) {
        return <ResetPasswordConfrim />;
    }
    if (page === ROUTES.orderdetail.en || page === ROUTES.orderdetail.az) {
        return <OrderItemsDetail />;
    }
    return (
        <div>
            <h1>Language: {lang}</h1>
            <h1>Page: {page}</h1>
            <h1>Slug: {slug}</h1>
        </div>
    );
};

export default InnerPageByLang;
