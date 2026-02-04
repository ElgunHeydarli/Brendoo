import { useNavigate, useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request';
import { TranslationsKeys } from '../../setting/Types';
import { useEffect } from 'react';
import ROUTES from '../../setting/routes';

export default function SucsesPassword() {
    const navigate = useNavigate();

    const { lang = 'az' } = useParams<{ lang: string }>();

    const { data: tarnslation } = GETRequest<TranslationsKeys>(
        `/translates`,
        'translates',
        [lang]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate(
                `/${lang}/${ROUTES.login[lang as keyof typeof ROUTES.lang]}`
            );
        }, 3000); // 300 seconds

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex overflow-hidden flex-col bg-white">
            <div className="flex relative flex-col w-full h-[100vh] max-md:max-w-full justify-center items-center px-[40px] max-sm:px-4">
                <img
                    loading="lazy"
                    srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/9f57b393c120b19ab9db1e7a4aa3dc11e48fdaa0526b775a0fd5a02c9292e45c?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                    className="object-cover absolute inset-0 size-full"
                />
                <div
                    onClick={() => navigate(-1)}
                    className="rounded-full bg-white lg:w-[56px] lg:h-[56px] w-[35px] h-[35px] bg-opacity-60 z-50 absolute top-5 left-5 cursor-pointer"
                >
                    <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d1d01662ce302f4f64e209cc8ecd0540b6f0e5fb3d4ccd79eead1b316a272d11?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                        className="object-contain w-14 aspect-square rounded-full"
                    />
                </div>

                <div className="flex overflow-hidden relative z-[50] flex-col justify-center self-center p-[60px]  max-w-full rounded-3xl bg-white bg-opacity-20 w-[560px] max-md:px-5  max-sm:py-[28px]">
                    <div className="flex flex-col justify-center items-center max-md:max-w-full">
                        <svg
                            width="141"
                            height="140"
                            viewBox="0 0 141 140"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="70.5" cy="70" r="69.5" stroke="white" />
                            <g clipPath="url(#clip0_159_3786)">
                                <path
                                    d="M54.666 69.9999L66.3327 81.6666L89.666 58.3333"
                                    stroke="white"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_159_3786">
                                    <rect
                                        width="56"
                                        height="56"
                                        fill="white"
                                        transform="translate(43 42)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                        <h1 className="text-[20px] font-semibold text-white mt-7 text-center ">
                            {tarnslation?.email_ünvanına_link_göndərildi}.
                        </h1>
                    </div>
                </div>
            </div>
            
        </div>
    );
}
