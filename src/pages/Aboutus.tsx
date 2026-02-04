import Header from '../components/Header';
import { Footer } from '../components/Footer';
import FAQSection from '../components/Faq';
import GETRequest from '../setting/Request';
import { useParams } from 'react-router-dom';
import { About, TranslationsKeys } from '../setting/Types';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import ROUTES from '../setting/routes';

export default function Aboutus() {
    const { lang = 'az' } = useParams<{
        lang: string;
    }>();
    const { data: tarnslation, isLoading: tarnslationLoading } =
        GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);
    const { data: About, isLoading: AboutLoading } = GETRequest<About>(
        `/about`,
        'about',
        [lang]
    );
    if (AboutLoading || tarnslationLoading) {
        return <Loading />;
    }
    return (
        <div>
            <Header />
            <main className=" mt-0">
                <div className="px-[40px] max-sm:px-4 max-sm:pt-6 pt-[40px] mb-[28px]">
                    <div className="flex items-center gap-2">
                        <Link
                        reloadDocument
                            to={`/${lang}/${
                                ROUTES.home[lang as keyof typeof ROUTES.product]
                            }`}
                        >
                            <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
                                {tarnslation?.home}
                            </h6>
                        </Link>
                        {/* <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                        />

                        <Link
                            to={`/${lang}/${
                                ROUTES.product[
                                    lang as keyof typeof ROUTES.product
                                ]
                            }`}
                        >
                            <h6 className="text-nowrap self-stretch my-auto hover:text-blue-600">
                                {tarnslation?.Məhsullar}{' '}
                            </h6>
                        </Link> */}
                        <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                        />
                        <h6 className="text-nowrap self-stretch my-auto">
                            {tarnslation?.Şirkət_haqqında}{' '}
                        </h6>
                    </div>{' '}
                </div>
                <section className="mb-[100px] max-sm:mb-[40px] max-sm:mt-10">
                    <div
                        className="w-full h-[500px] bg-cover bg-center flex items-center lg:justify-start justify-center max-sm:h-[300px]"
                        style={{
                            backgroundImage: `url(${About?.image})`,
                        }}
                    >
                        <h1 className="text-[40px] max-sm:text-[32px] lg:ml-[50%] font-bold text-[#081D39] lg:w-[60%] w-[80%] max-sm:w-[90%]  lg:pr-[100px]">
                            {About?.title}
                        </h1>
                    </div>

                    <div
                        className="mx-[40px] mt-[40px] max-sm:mt-5 max-sm:mx-4"
                        dangerouslySetInnerHTML={
                            About?.description
                                ? { __html: About?.description }
                                : { __html: '' }
                        }
                    ></div>
                </section>
                <FAQSection Title={tarnslation?.Tez_tez_verilən_suallar} />
            </main>
            <Footer />
        </div>
    );
}
