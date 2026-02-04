import Header from '../components/Header';
import { Footer } from '../components/Footer';
import ProductCard from '../components/ProductCArd';

import Loading from '../components/Loading';
import { useParams } from 'react-router-dom';
import { Favorite, TranslationsKeys, Product } from '../setting/Types';
import GETRequest from '../setting/Request';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Liked() {
    const { lang = 'az' } = useParams<{
        lang: string;
    }>();

    const [guestFavoriteProducts, setGuestFavoriteProducts] = useState<Product[]>([]);
    const [guestLoading, setGuestLoading] = useState(false);

    const { data: favorites, isLoading: loading } = GETRequest<Favorite[]>(
        `/favorites`,
        'favorites',
        [lang]
    );
    const { data: tarnslation, isLoading: tarnslationLoading } =
        GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);

    // Check if guest or logged in
    const userStr = localStorage.getItem('user-info');
    const isLoggedIn = !!userStr;

    // Load guest favorites from localStorage
    useEffect(() => {
        if (!isLoggedIn) {
            const guestFavs = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
            
            if (guestFavs.length > 0) {
                // Filtrə - yalnız düzgün product objectləri saxla
                const validProducts = guestFavs.filter((p: any) => 
                    p && p.id && (p.image || p.sliders)
                );
                console.log('Valid guest products:', validProducts);
                setGuestFavoriteProducts(validProducts);
            } else {
                setGuestFavoriteProducts([]);
            }
            setGuestLoading(false);
        }
    }, [isLoggedIn, lang]);

    if (loading || tarnslationLoading || guestLoading) {
        return <Loading />;
    }

    return (
        <div className="">
            <Header />
            <main className=" lg:mt-[40px] mt-0">
                <div className="px-[40px] max-sm:px-4">
                    <div className="flex items-center gap-2">
                        <Link reloadDocument to={`${lang}`}>
                            <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
                                {tarnslation?.home}{' '}
                            </h6>
                        </Link>
                        <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                        />
                        <h6 className="text-nowrap self-stretch my-auto">
                            {tarnslation?.Bəyəndiklərim}{' '}
                        </h6>
                    </div>{' '}
                </div>

                <section className="lg:px-[40px] px-4">
                    <h3 className="text-[40px] font-semibold mt-[28px]">
                        {tarnslation?.Bəyəndiklərim}{' '}
                    </h3>{' '}
                    <div className="grid  w-full justify-self-center max-sm:w-full gap-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mb-[100px] mt-[40px]">
                        {isLoggedIn ? (
                            // Logged in user
                            favorites && favorites.length > 0 ? (
                                favorites.map((item: Favorite) => (
                                    <ProductCard key={item.id} bg="white" data={item.product} />
                                ))
                            ) : (
                                <p>{tarnslation?.Bəyəndikləriniz_yoxdur}</p>
                            )
                        ) : (
                            // Guest user
                            guestFavoriteProducts && guestFavoriteProducts.length > 0 ? (
                                guestFavoriteProducts.map((product: Product) => (
                                    <ProductCard key={product.id} bg="white" data={product} />
                                ))
                            ) : (
                                <p>{tarnslation?.Bəyəndikləriniz_yoxdur}</p>
                            )
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
