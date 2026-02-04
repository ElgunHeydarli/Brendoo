import React, { useState } from 'react';
import { Category, SubCategory, Translation } from '../../setting/Types';
import { Link, useParams } from 'react-router-dom';
import ROUTES from '../../setting/routes';

interface CategoryProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
}

export const CategoryHeader: React.FC<CategoryProps> = ({
    title,
    isOpen,
    onToggle,
}) => (
    <div
        className="flex gap-10 min-w-[360px] justify-between items-center w-full hover:bg-slate-50 rounded-md px-2 "
        onClick={onToggle}
    >
        <h2 className="self-stretch my-auto text-lg font-medium text-black">
            {title}
        </h2>
        <button
            className="flex overflow-hidden flex-col justify-center self-stretch px-1.5 py-3 my-auto w-6"
            aria-label={isOpen ? 'Close category' : 'Open category'}
        >
            <span
                className={`flex  transform font-medium text-[30px] transition-transform`}
            >
                {!isOpen ? (
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M14 7.99805H8V13.998H6V7.99805H0V5.99805H6V-0.00195312H8V5.99805H14V7.99805Z"
                            fill="black"
                            fillOpacity="0.8"
                        />
                    </svg>
                ) : (
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M19 12.998H5V10.998H19V12.998Z" fill="black" />
                    </svg>
                )}
            </span>
        </button>
    </div>
);

interface ClothingListProps {
    item: Category;
}

export const ClothingList: React.FC<ClothingListProps> = ({ item }) => {
    const { lang = 'az' } = useParams<{ lang: string }>();
    return (
        <ul
            className="custom-scrollbar flex flex-col  py-3 items-center max-md:px-0 max-md:rounded-none px-5 mt-4 w-full text-base text-black whitespace-nowrap rounded-3xl aspect-square bg-stone-50 max-h-[150px] overflow-y-scroll"
            style={{
                scrollbarWidth: 'thin', // For Firefox
                scrollbarColor: '#a0aec0 #edf2f7', // thumb color and track color for Firefox
            }}
        >
            {' '}
            {item?.subCategories?.map(
                (subcategory: SubCategory, index: number) => (
                    <Link
                    reloadDocument
                        className="w-full flex "
                        to={`/${lang}/${
                            ROUTES.product[lang as keyof typeof ROUTES.product]
                        }?category=${item.id}&subCategory=${subcategory.id}`}
                        key={index}
                    >
                        <li key={index} className="flex flex-col w-full">
                            <span>{subcategory.title}</span>
                            <div className="mt-3 max-w-full border border-solid border-black border-opacity-10 min-h-[1px] w-[312px]" />
                        </li>
                    </Link>
                )
            )}
        </ul>
    );
};

interface ClothingMenuProps {
    setIsCatalogOpen: (value: boolean) => void;
    ref: any;
    data: Category[];
    translation: Translation | undefined;
}

const ClothingMenu: React.FC<ClothingMenuProps> = ({ data, translation }) => {
    const [isClothingOpen, setIsClothingOpen] = useState<number>(-1);
    const { lang = 'az' } = useParams<{ lang: string }>();

    const toggleClothingCategory = (i: number) => {
        if (isClothingOpen === i) {
            setIsClothingOpen(-1);
        } else {
            setIsClothingOpen(i);
        }
    };

    return (
        <section
            style={{
                scrollbarWidth: 'none',
            }}
            className="catalog-bar  scrollbar-hide max-h-[60vh] overflow-y-scroll flex overflow-hidden flex-col px-7 py-10 bg-white rounded-3xl max-md:max-w-full max-md:w-full max-md:mx-4 max-md:px-4 max-md:py-6 max-md:mt-2 max-md:bg-[#F9F9F9] max-w-[408px] bg-opacity-100 shadow-[0px_0px_12px_rgba(6,27,62,0.12)] !z-[1000] "
        >
            {data.map((item, index) => (
                <>
                    <CategoryHeader
                        title={item.title}
                        isOpen={isClothingOpen === index}
                        onToggle={() => toggleClothingCategory(index)}
                    />
                    {isClothingOpen === index && (
                        <ClothingList item={data[index]} />
                    )}
                </>
            ))}
            <Link
            reloadDocument
                to={`/${lang}/${
                    ROUTES.product[lang as keyof typeof ROUTES.product]
                }?discount=true`}
            >
                <h2 className="self-start mt-6 text-lg font-medium text-rose-500">
                    {translation?.Endirimli_məhsullar}
                </h2>
            </Link>
            <Link
            reloadDocument
                to={`/${lang}/${
                    ROUTES.brends[lang as keyof typeof ROUTES.brends]
                }`}
            >
                <h2 className="self-start mt-6 text-lg font-medium text-black">
                    {translation?.Brendlər}
                </h2>
            </Link>
        </section>
    );
};

export default ClothingMenu;
