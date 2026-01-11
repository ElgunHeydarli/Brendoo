import { Link } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import ROUTES from "../../setting/routes";
import CategoryNavigation from "../CategoryPop";
import SearchDropdown from "./SearchDropdown";
import BasketDropdown from "./BasketDropdown";
import { UseHeaderReturn } from "./types";
import GoogleTranslate from "../GoogleTranslate";

interface DesktopHeaderProps extends UseHeaderReturn {}

export default function DesktopHeader(props: DesktopHeaderProps) {
  const {
    lang,
    navigate,
    categories,
    categoriesLoading,
    translation,
    favorites,
    SearchValue,
    setSearchValue,
    handleSearchChange,
    isCatalogOpen,
    setIsClothingOpen,
    isBaskedOpen,
    setIsBaskedOpen,
    CatalogBtnRef,
    CAtalogDiv,
    BaskedBtnRef,
    BaskedDiv,
    User,
    hasItems,
    baskedLoading,
    basketItemsData,
    showSubCAtegoryes,
    setshowSubCAtegoryes,
    setCurrentSubCategoryId,
    FilteredProduct,
    productsLoading,
    disableScrolling,
    enableScrolling,
    fetchBasketItems,
    UpdateBaskedmutation,
    RemoveFromBaskedmutation,
    toggleIdInLocalStorage,
    triggerImageSearch,
    isImageSearching,
  } = props;

  const userType = localStorage.getItem("user_type");
  const hasUserType = userType && userType?.length > 0 ? userType : null;
  const userStr = localStorage.getItem("user-info");
  const isLoggedIn = !!userStr;

  // Favorit sayı - logged + guest
  const loggedFavoritesCount = favorites?.length || 0;
  const guestFavorites = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
  const guestFavoritesCount = guestFavorites.length || 0;
  const favoritesCount = isLoggedIn ? loggedFavoritesCount : guestFavoritesCount;

  return (
    <div className="lg:flex hidden flex-col relative bg-white">
      {/* Top Bar */}
      <div className="flex gap-5 justify-between items-center py-[10px] px-10 w-full text-black border-b border-black border-opacity-10 max-md:px-5 max-md:max-w-full">
        {/* Logo */}
        <Link
          reloadDocument
          className="w-[140px]"
          to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.home]}`}
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0810c4aeebbd64a3e1b72741797d34b3b9cdb99d6d6af4238830cc7f449ae1bc?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
            className="object-contain w-full"
            alt="Brendoo Logo"
          />
        </Link>

        <div className="flex flex-col-reverse gap-3 justify-center items-center w-full text-base max-md:max-w-full">
          {/* Categories Nav */}
          <div className="hidden flex-row justify-center items-center w-full gap-3">
            {categories?.map((category) => (
              <Link
                reloadDocument
                to={`/${lang}/${
                  ROUTES.product[lang as keyof typeof ROUTES.product]
                }?category=${category.id}`}
                key={category.id}
              >
                <div className="text-[14px]">{category.title}</div>
              </Link>
            ))}
            {categoriesLoading && (
              <div className="flex gap-6">
                <div className="self-stretch my-auto w-24 h-6 bg-gray-200 animate-pulse"></div>
                <div className="self-stretch my-auto w-24 h-6 bg-gray-200 animate-pulse"></div>
                <div className="self-stretch my-auto w-24 h-6 bg-gray-200 animate-pulse"></div>
              </div>
            )}
            <Link
              reloadDocument
              to={`/${lang}/${
                ROUTES.product[lang as keyof typeof ROUTES.product]
              }?discount=true`}
            >
              <div className="text-[14px]">{translation?.Endirim}</div>
            </Link>
            <Link
              reloadDocument
              to={`/${lang}/${
                ROUTES.product[lang as keyof typeof ROUTES.product]
              }`}
            >
              <div className="text-[14px]">
                {translation?.butun_mehsullar_new}
              </div>
            </Link>
          </div>

          {/* Search & Icons Row */}
          <div className="flex items-center justify-between w-full gap-[20px]">
            {/* Search Input */}
            <div className="flex items-center gap-10 h-[50px] py-1.5 pr-1.5 pl-5 whitespace-nowrap ml-auto bg-neutral-100 rounded-[100px] text-black text-opacity-60 max-w-[570px] w-full">
              {/* Google Lens Button */}
              <button
                className="lensSearch w-[24px] h-[24px] flex items-center justify-center"
                type="button"
                onClick={triggerImageSearch}
                disabled={isImageSearching}
                title={translation?.sekille_axtar || "Şəkillə axtar"}
              >
                {isImageSearching ? (
                  <svg
                    className="animate-spin h-5 w-5 text-[#3873C3]"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
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
                    <path
                      d="M21 14V11C21 8.172 21 6.757 20.121 5.879C19.243 5 17.828 5 15 5H9C6.172 5 4.757 5 3.879 5.879C3 6.757 3 8.172 3 11M13 21H9C6.172 21 4.757 21 3.879 20.121C3 19.243 3 17.828 3 15"
                      stroke="#3873C3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 3H14L15 4.5H9L10 3Z"
                      stroke="#3873C3"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
                      stroke="#3873C3"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M19 21C20.1046 21 21 20.1046 21 19C21 17.8954 20.1046 17 19 17C17.8954 17 17 17.8954 17 19C17 20.1046 17.8954 21 19 21Z"
                      stroke="#3873C3"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </button>

              <input
                type="text"
                value={SearchValue}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && SearchValue.trim()) {
                    setSearchValue("");
                    enableScrolling();
                    navigate(
                      `/${lang}/search?q=${encodeURIComponent(
                        SearchValue.trim()
                      )}`
                    );
                  }
                }}
                placeholder={translation?.axtar || "Axtar..."}
                className="bg-transparent outline-none flex-1 text-black text-opacity-60 my-auto"
              />
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f662e6db87fdef7a0f47b78d88abe073291cb9bd2390dd8047857b7fd35816f4?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                className="object-contain shrink-0 w-11 aspect-square"
                alt="Search"
              />
            </div>

            {/* User Icon */}
            <div
              className="flex gap-3 items-center cursor-pointer rounded-full w-[48px] h-[48px] bg-[#F5F5F5]"
              onClick={() => {
                const userStr = localStorage.getItem("user-info");
                if (userStr && hasUserType !== "influencer") {
                  navigate(
                    `/${lang}/${
                      ROUTES.userSettings[
                        lang as keyof typeof ROUTES.userSettings
                      ]
                    }`
                  );
                  window.location.href = `/${lang}/${
                    ROUTES.userSettings[
                      lang as keyof typeof ROUTES.userSettings
                    ]
                  }`;
                } else if (hasUserType === "influencer") {
                  window.location.href = `/${lang}/influencer/kolleksiyalar`;
                } else {
                  navigate(
                    `/${lang}/${
                      ROUTES.login[lang as keyof typeof ROUTES.login]
                    }`
                  );
                  window.location.href = `/${lang}/${
                    ROUTES.login[lang as keyof typeof ROUTES.login]
                  }`;
                }
              }}
            >
              <UserIcon className="object-contain cursor-pointer shrink-0 w-10 sm:w-12 aspect-square rounded-full" />
            </div>

            {/* Favorites Icon */}
            <div
              className="relative cursor-pointer"
              onClick={() => {
                // Hər halda Liked page-ə git (guest və logged users)
                setIsClothingOpen(false);
                setSearchValue("");
                navigate(
                  `/${lang}/${
                    ROUTES.liked[lang as keyof typeof ROUTES.liked]
                  }`
                );
              }}
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/c9a474845e97e67198e85a77d82874411bfb561b5013d0a8a987188427aa587c?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                className="object-contain shrink-0 w-10 sm:w-12 aspect-square rounded-full"
                alt="Favorites"
              />
              {favoritesCount > 0 && (
                <div className="w-[18px] h-[18px] flex justify-center items-center text-white text-[10px] font-medium bg-[#FC394C] rounded-full absolute -top-1 -right-1">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </div>
              )}
            </div>

            {/* Basket Icon */}
            <div
              ref={BaskedBtnRef}
              className="flex gap-3 cursor-pointer items-center"
              onClick={() => {
                setIsClothingOpen(false);
                setSearchValue("");
                if (!isBaskedOpen) {
                  disableScrolling();
                } else {
                  enableScrolling();
                }
                setIsBaskedOpen(!isBaskedOpen);
              }}
            >
              <div className="w-12 h-12 sm:w-[48px] sm:h-[48px] rounded-full bg-[#3873C3] flex justify-center items-center relative">
                <img
                  src="/svg/basked.svg"
                  className="w-6 h-6 sm:w-auto sm:h-auto"
                  alt="Basket"
                />
                {hasItems && hasItems.length > 0 && (
                  <div className="w-[14px] h-[14px] sm:w-[12px] sm:h-[12px] flex justify-center items-center text-white text-xs sm:text-[8px] bg-[#FC394C] rounded-full absolute top-[8px] right-[8px]">
                    {hasItems.length}
                  </div>
                )}
              </div>
            </div>
            <GoogleTranslate />
          </div>
        </div>
      </div>

      {/* Catalog & Story Row */}
      <div className="flex overflow-hidden flex-row gap-5 justify-between items-center px-10 py-4 w-full text-base bg-white max-md:px-5 max-md:max-w-full">
        <div className="w-full flex items-center justify-between gap-[30px] mx-left-auto">
          <div
            ref={CatalogBtnRef}
            className="flex flex-col min-w-[150px] justify-center self-stretch px-7 py-3 cursor-pointer my-auto font-medium text-white whitespace-nowrap bg-blue-600 min-h-[48px] rounded-[100px] max-md:px-5"
            onClick={() => {
              setIsClothingOpen(!isCatalogOpen);
              setSearchValue("");
              setIsBaskedOpen(false);
            }}
          >
            <div className="flex gap-3 items-center w-full">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/35befc4b842efe2488b26ce91bb004beac36ff324b59192df49471be348bd1ac?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                className="object-contain shrink-0 self-stretch my-auto w-6 rounded-md aspect-square"
                alt="Catalog"
              />
              <div className="self-stretch my-auto">{translation?.Kataloq}</div>
            </div>
          </div>
          <div className="flex align-center gap-[24px]">
            <Link
              reloadDocument
              to={`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}?sort=new-old`}
              className="text-[16px] font-normal leading-[24px] hover:text-[#3873C3] transition-colors"
            >
              {translation?.yeni_mallar || "Yeni mallar"}
            </Link>
            <Link
              reloadDocument
              to={`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}?type=bestsellers`}
              className="text-[16px] font-normal leading-[24px] hover:text-[#3873C3] transition-colors"
            >
              {translation?.cox_satilan || "Çox satılan"}
            </Link>
            <Link
              reloadDocument
              to={`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}?type=top_rated`}
              className="text-[16px] font-normal leading-[24px] hover:text-[#3873C3] transition-colors"
            >
              {translation?.ulduzlu_mehsullar || "5 ulduzlu məhsullar"}
            </Link>
            <Link
              reloadDocument
              to={`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`}
              className="text-[16px] font-normal leading-[24px] hover:text-[#3873C3] transition-colors"
            >
              {translation?.butun_mehsullar_new || "Bütün məhsullar"}
            </Link>
          </div>
        </div>
      </div>

      {/* Catalog Dropdown */}
      <div
        className="absolute w-full min-h-[90vh] max-h-[400px] overflow-auto no-scrollbar top-[100%] z-50 px-10 py-2"
        onClick={() => setIsClothingOpen(false)}
        style={{ display: isCatalogOpen ? "block" : "none" }}
      >
        <div ref={CAtalogDiv} className="w-full">
          {categories && (
            <CategoryNavigation handleClose={() => setIsClothingOpen(false)} />
          )}
        </div>
      </div>

      {/* Search Dropdown */}
      <SearchDropdown
        SearchValue={SearchValue}
        setSearchValue={setSearchValue}
        enableScrolling={enableScrolling}
        categories={categories}
        showSubCAtegoryes={showSubCAtegoryes}
        setshowSubCAtegoryes={setshowSubCAtegoryes}
        setCurrentSubCategoryId={setCurrentSubCategoryId}
        FilteredProduct={FilteredProduct}
        productsLoading={productsLoading}
        translation={translation}
        lang={lang}
      />

      {/* Basket Dropdown */}
      <BasketDropdown
        isBaskedOpen={isBaskedOpen}
        setIsBaskedOpen={setIsBaskedOpen}
        BaskedDiv={BaskedDiv}
        enableScrolling={enableScrolling}
        hasItems={hasItems}
        baskedLoading={baskedLoading}
        basketItemsData={basketItemsData}
        User={User}
        translation={translation}
        lang={lang}
        fetchBasketItems={fetchBasketItems}
        UpdateBaskedmutation={UpdateBaskedmutation}
        RemoveFromBaskedmutation={RemoveFromBaskedmutation}
        toggleIdInLocalStorage={toggleIdInLocalStorage}
      />
    </div>
  );
}