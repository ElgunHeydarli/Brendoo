import { Link } from "react-router-dom";
import { AiFillProduct } from "react-icons/ai";
import ROUTES from "../../setting/routes";
import LanguageSwitcher from "../LanguageSwitcher";

interface MobileMenuProps {
  showaside: boolean;
  setShowAside: (val: boolean) => void;
  CurrentCategory: number;
  setCurrentCategory: (val: number) => void;
  catalog_categories: any[] | undefined;
  translation: any;
  lang: string;
  navigate: (path: string) => void;
}

export default function MobileMenu({
  showaside,
  setShowAside,
  CurrentCategory,
  setCurrentCategory,
  catalog_categories,
  translation,
  lang,
  navigate,
}: MobileMenuProps) {
  if (!showaside) return null;

  return (
    <div
      className={`w-[100vw] min-h-screen bg-black fixed top-0 left-0 z-[99999999999] duration-200 ${
        showaside ? "bg-opacity-40" : "bg-opacity-40 z-[-99999999]"
      }`}
    >
      <div
        className={`w-[100vw] md:w-[80vw] min-h-screen overflow-y-auto fixed top-0 duration-300 right-0 z-[99999999999] bg-white ${
          !showaside ? "translate-x-[100%]" : "translate-x-[0%]"
        }`}
      >
        <div className="relative">
          {/* Header */}
          <div className="flex flex-row justify-between items-center px-4 py-[16px] border-b mb-2 border-black w-full border-opacity-10 duration-300 left-0 min-h-[96px]">
            {CurrentCategory === -1 ? (
              <Link
                reloadDocument
                className="w-[140px]"
                to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.home]}`}
              >
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/0810c4aeebbd64a3e1b72741797d34b3b9cdb99d6d6af4238830cc7f449ae1bc?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                  className="object-contain w-[140px]"
                />
              </Link>
            ) : (
              <div
                onClick={() => setCurrentCategory(-1)}
                className="flex flex-row gap-4 cursor-pointer"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="black"
                    strokeOpacity="0.8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {translation?.Geri}
              </div>
            )}
            <div className="flex flex-col items-end gap-4">
              <svg
                onClick={() => setShowAside(false)}
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
              >
                <rect width="40" height="40" rx="20" fill="#F5F5F5" />
                <path
                  d="M25 15L15 25"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 15L25 25"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="sm:hidden">
                <LanguageSwitcher />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="w-full bg-red h-[calc(100vh-141px)] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {/* Endirim */}
            <Link
              reloadDocument
              to={`/${lang}/${
                ROUTES.product[lang as keyof typeof ROUTES.product]
              }?discount=true`}
            >
              <div className="h-[60px] px-[16px] w-full bg-[#FDE4EE] flex flex-row gap-3 border-opacity-10 items-center justify-between">
                <div className="flex flex-row items-center gap-3 text-[#FD0769]">
                  <DiscountIcon />
                  {translation?.Endirim}
                </div>
                <ChevronRightIcon color="#FD0769" />
              </div>
            </Link>

            {/* Bütün məhsullar */}
            <div
              onClick={() => {
                navigate(
                  `/${lang}/${
                    ROUTES.product[lang as keyof typeof ROUTES.product]
                  }`
                );
                setShowAside(false);
              }}
              className="h-[60px] w-full bg-white hover:bg-slate-200 flex flex-row gap-3 border-b-2 border-black border-opacity-10 items-center justify-between px-[16px] cursor-pointer"
            >
              <div className="flex flex-row items-center gap-3">
                <div className="w-10 aspect-square rounded-full bg-[#F0F6FF] flex justify-center items-center">
                  <AiFillProduct />
                </div>
                {translation?.butun_mehsullar_new || (lang === 'az' ? 'Bütün məhsullar' : 'All products')}
              </div>
              <ChevronRightIcon />
            </div>

            {/* Kateqoriyalar */}
            {catalog_categories?.map((item) => (
              <div
                onClick={() => setCurrentCategory(item.id)}
                className="h-[60px] w-full bg-white hover:bg-slate-200 flex flex-row gap-3 border-b-2 border-black border-opacity-10 items-center justify-between px-[16px] cursor-pointer"
                key={item.id}
              >
                <Link
                  reloadDocument
                  to={`/${lang}/${
                    ROUTES.product[lang as keyof typeof ROUTES.product]
                  }?category=${item.id}`}
                >
                  <div className="flex flex-row items-center gap-3">
                    <div className="w-10 aspect-square rounded-full bg-[#F0F6FF] flex justify-center items-center">
                      <img
                        className="object-contain shrink-0 w-[24px] aspect-square rounded-[100px]"
                        src={item.image}
                      />
                    </div>
                    {item.title}
                  </div>
                </Link>
                <ChevronRightIcon />
              </div>
            ))}
          </div>

          {/* Subcategories Panel */}
          <div
            className={`h-[calc(100vh-130px)] w-full bg-white fixed top-[130px] h-[100%] duration-300 ${
              CurrentCategory === -1 ? "right-[-100%]" : "right-0"
            }`}
          >
            {catalog_categories
              ?.find((item) => item.id === CurrentCategory)
              ?.subCategories?.map((item: any) => (
                <Link
                  reloadDocument
                  onClick={() => setShowAside(false)}
                  to={`/${lang}/${
                    ROUTES.product[lang as keyof typeof ROUTES.product]
                  }?category=${CurrentCategory}&subCategory=${item.id}`}
                  key={item.id}
                >
                  <div className="h-[60px] w-full bg-white hover:bg-slate-200 flex flex-row gap-3 border-b-2 border-black border-opacity-10 items-center justify-between px-[16px] cursor-pointer">
                    <div className="flex flex-row items-center gap-3">
                      {item.title}
                    </div>
                    <ChevronRightIcon />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon({ color = "black" }: { color?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke={color}
        strokeOpacity={color === "black" ? "0.8" : "1"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiscountIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.78133 3.89076C10.3452 3.41023 10.6271 3.16997 10.9219 3.02907C11.6037 2.7032 12.3963 2.7032 13.0781 3.02907C13.3729 3.16997 13.6548 3.41023 14.2187 3.89076C14.4431 4.08201 14.5553 4.17764 14.6752 4.25796C14.9499 4.44209 15.2584 4.56988 15.5828 4.63393C15.7244 4.66188 15.8713 4.6736 16.1653 4.69706C16.9038 4.75599 17.273 4.78546 17.5811 4.89427C18.2936 5.14594 18.8541 5.7064 19.1058 6.41893C19.2146 6.72699 19.244 7.09625 19.303 7.83475C19.3264 8.12868 19.3381 8.27564 19.3661 8.41718C19.4301 8.74163 19.5579 9.05014 19.7421 9.32485C19.8224 9.44469 19.918 9.55691 20.1093 9.78133C20.5898 10.3452 20.8301 10.6271 20.971 10.9219C21.2968 11.6037 21.2968 12.3963 20.971 13.0781C20.8301 13.3729 20.5898 13.6548 20.1093 14.2187C19.918 14.4431 19.8224 14.5553 19.7421 14.6752C19.5579 14.9499 19.4301 15.2584 19.3661 15.5828C19.3381 15.7244 19.3264 15.8713 19.303 16.1653C19.244 16.9038 19.2146 17.273 19.1058 17.5811C18.8541 18.2936 18.2936 18.8541 17.5811 19.1058C17.273 19.2146 16.9038 19.244 16.1653 19.303C15.8713 19.3264 15.7244 19.3381 15.5828 19.3661C15.2584 19.4301 14.9499 19.5579 14.6752 19.7421C14.5553 19.8224 14.4431 19.918 14.2187 20.1093C13.6548 20.5898 13.3729 20.8301 13.0781 20.971C12.3963 21.2968 11.6037 21.2968 10.9219 20.971C10.6271 20.8301 10.3452 20.5898 9.78133 20.1093C9.55691 19.918 9.44469 19.8224 9.32485 19.7421C9.05014 19.5579 8.74163 19.4301 8.41718 19.3661C8.27564 19.3381 8.12868 19.3264 7.83475 19.303C7.09625 19.244 6.72699 19.2146 6.41893 19.1058C5.7064 18.8541 5.14594 18.2936 4.89427 17.5811C4.78546 17.273 4.75599 16.9038 4.69706 16.1653C4.6736 15.8713 4.66188 15.7244 4.63393 15.5828C4.56988 15.2584 4.44209 14.9499 4.25796 14.6752C4.17764 14.5553 4.08201 14.4431 3.89076 14.2187C3.41023 13.6548 3.16997 13.3729 3.02907 13.0781C2.7032 12.3963 2.7032 11.6037 3.02907 10.9219C3.16997 10.6271 3.41023 10.3452 3.89076 9.78133C4.08201 9.55691 4.17764 9.4447 4.25796 9.32485C4.44209 9.05014 4.56988 8.74163 4.63393 8.41718C4.66188 8.27564 4.6736 8.12868 4.69706 7.83475C4.75599 7.09625 4.78546 6.72699 4.89427 6.41893C5.14594 5.7064 5.7064 5.14594 6.41893 4.89427C6.72699 4.78546 7.09625 4.75599 7.83475 4.69706C8.12868 4.6736 8.27564 4.66188 8.41718 4.63393C8.74163 4.56988 9.05014 4.44209 9.32485 4.25796C9.4447 4.17764 9.55691 4.08201 9.78133 3.89076Z"
        stroke="#FF3C79"
        strokeWidth="1.5"
      />
      <path
        d="M9 15L15 9"
        stroke="#FF3C79"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 14.5C15.5 15.0523 15.0523 15.5 14.5 15.5C13.9477 15.5 13.5 15.0523 13.5 14.5C13.5 13.9477 13.9477 13.5 14.5 13.5C15.0523 13.5 15.5 13.9477 15.5 14.5Z"
        fill="#FF3C79"
      />
      <path
        d="M10.5 9.5C10.5 10.0523 10.0523 10.5 9.5 10.5C8.94772 10.5 8.5 10.0523 8.5 9.5C8.5 8.94772 8.94772 8.5 9.5 8.5C10.0523 8.5 10.5 8.94772 10.5 9.5Z"
        fill="#FF3C79"
      />
    </svg>
  );
}
