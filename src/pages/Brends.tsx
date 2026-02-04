import Header from '../components/Header';
import { Footer } from '../components/Footer';
import AlphabeticalList from '../components/AlphabeticalList';
import { Link, useParams } from 'react-router-dom';
import GETRequest from '../setting/Request';
import { Brand, TranslationsKeys } from '../setting/Types';
import Loading from '../components/Loading';
import ROUTES from '../setting/routes';

export default function Brends() {
    const { lang = 'az' } = useParams<{ lang: string }>();
    const { data: Brends, isLoading: BrendsLoading } = GETRequest<Brand[]>(
        `/brands`,
        'brands',
        [lang]
    );
    const { data: tarnslation, isLoading: tarnslationLoading } =
        GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);
    if (BrendsLoading || tarnslationLoading) {
        return <Loading />;
    }
    const englishAlphabet = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
    ];
    return (
        <div className="">
            <Header />
            <main className=" lg:mt-[40px] mt-0 max-sm:mb-10 mb-[100px]">
                <div className="px-[40px] max-sm:px-4">
                    <div className="flex items-center gap-2">
                        <Link
                        reloadDocument
                            to={`/${lang}/${
                                ROUTES.home[lang as keyof typeof ROUTES.home]
                            }`}
                        >
                            <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
                                {tarnslation?.home}{' '}
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
                            {tarnslation?.Brendlər}{' '}
                        </h6>
                    </div>{' '}
                </div>

                <section className="px-[40px] max-sm:px-4">
                    <h3 className="text-[40px] max-sm:text-[32px] font-semibold mt-[28px] mb-[40px]">
                        {tarnslation?.Brendlər}{' '}
                    </h3>{' '}
                    <AlphabeticalList Brends={Brends} letters={englishAlphabet} />
                </section>
            </main>
            <Footer />
        </div>
    );
}
