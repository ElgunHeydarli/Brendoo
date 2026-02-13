import { Link } from "react-router-dom";
import { BiShoppingBag } from "react-icons/bi";
import { useState, useEffect } from "react";
import ROUTES from "../../setting/routes";
import MobileMenu from "./MobileMenu";
import { UseHeaderReturn } from "./types";
import LanguageSwitcher from "../LanguageSwitcher";

const RECENT_SEARCHES_KEY = 'brendoo_recent_searches';
const MAX_RECENT_SEARCHES = 8;



const mobileTexts: Record<string, Record<string, string>> = {
  az: {
    recentSearches: 'Son axtarışlar',
    popularNow: 'İndi populyar',
    clearAll: 'Hamısını sil',
  },
  en: {
    recentSearches: 'Recent searches',
    popularNow: 'Popular now',
    clearAll: 'Clear all',
  },
};

// localStorage helpers
const getRecentSearches = (): string[] => {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (query: string) => {
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
};

const clearRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore
  }
};

const removeRecentSearch = (query: string) => {
  try {
    const searches = getRecentSearches();
    const updated = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
};

interface MobileHeaderProps extends UseHeaderReturn {}

export default function MobileHeader(props: MobileHeaderProps) {
  const {
    lang,
    navigate,
    translation,
    catalog_categories,
    favorites,
    isSearchOpen,
    setIsSearchOpen,
    handleMobileSearchChange,
    isMobileSearchLoading,
    setIsMobileSearchLoading,
    showaside,
    setShowAside,
    CurrentCategory,
    setCurrentCategory,
    hasItems,
    FilteredProduct,
    inputRef,
    isProductsListPage,
    isDetail,
    setIsClothingOpen,
    setSearchValue,
    triggerImageSearch,
    isImageSearching,
  } = props;

  // Mobil axtarış dəyəri üçün local state
  const [mobileSearchValue, setMobileSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const t = mobileTexts[lang] || mobileTexts.az;

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Favorit sayı - logged + guest
  const userStr = localStorage.getItem("user-info");
  const isLoggedIn = !!userStr;
  const loggedFavoritesCount = favorites?.length || 0;
  const guestFavorites = JSON.parse(localStorage.getItem('guest_favorites') || '[]');
  const guestFavoritesCount = guestFavorites.length || 0;
  const favoritesCount = isLoggedIn ? loggedFavoritesCount : guestFavoritesCount;

  // Axtarış səhifəsinə yönləndir
  const handleMobileSearch = () => {
    if (mobileSearchValue.trim()) {
      saveRecentSearch(mobileSearchValue.trim());
      setRecentSearches(getRecentSearches());
      setIsSearchOpen(false);
      setMobileSearchValue("");
      navigate(`/${lang}/search?q=${encodeURIComponent(mobileSearchValue.trim())}`);
    }
  };

  // Sorğu ilə axtarış
  const handleSearchQuery = (query: string) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    setIsSearchOpen(false);
    setMobileSearchValue("");
    navigate(`/${lang}/search?q=${encodeURIComponent(query)}`);
  };

  // Son axtarışları təmizlə
  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Tək axtarışı sil
  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  };

  // Input dəyişəndə həm local state-i həm də parent handler-i çağır
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileSearchValue(e.target.value);
    handleMobileSearchChange(e);
  };

  return (
    <>
      <div className="lg:hidden items-center flex h-[68px] px-4 justify-between w-screen bg-white z-50">
        {/* Logo */}
        {!isSearchOpen && (
          <Link reloadDocument to={"/"}>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/0810c4aeebbd64a3e1b72741797d34b3b9cdb99d6d6af4238830cc7f449ae1bc?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 self-stretch aspect-[1.4] duration-300 w-[70px]"
              alt="Brendoo Logo"
            />
          </Link>
        )}

        <div className="flex flex-row gap-2 w-full justify-end items-center">
          {/* Search + Language Icon */}
          <div className="flex items-center gap-1">
            <div
              className={`flex items-center justify-between ease-in-out duration-500 z-[40] ${
                isSearchOpen
                  ? "h-[40px] w-full bg-[#F5F5F5] rounded-[100px]"
                  : "w-fit"
              }`}
            >
              <button onClick={() => setIsSearchOpen(true)}>
                <SearchIcon />
              </button>

            <input
              ref={inputRef}
              type="text"
              value={mobileSearchValue}
              placeholder={translation?.axtar ?? "Axtar..."}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleMobileSearch();
                }
              }}
              className={`h-full w-full bg-transparent outline-none ${
                isSearchOpen ? "opacity-100" : "hidden"
              }`}
            />

            {/* Axtar Button - yalnız mətn daxil edildikdə görünür */}
            {isSearchOpen && mobileSearchValue.trim() && (
              <button
                type="button"
                onClick={handleMobileSearch}
                className="bg-[#3873C3] text-white text-xs px-3 py-1.5 rounded-full mr-2 whitespace-nowrap"
              >
                {translation?.axtar || "Axtar"}
              </button>
            )}

            {/* Google Lens Button */}
            <button
              className={`lensSearch w-[22px] h-[22px] mr-[12px] flex items-center justify-center ${
                !isSearchOpen ? "hidden" : ""
              }`}
              type="button"
              onClick={triggerImageSearch}
              disabled={isImageSearching}
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

            <button
              className={`flex pr-2 justify-center items-center ${
                isSearchOpen ? "opacity-100" : "hidden"
              }`}
              onClick={() => setIsSearchOpen(false)}
            >
              <CloseIcon />
            </button>

            {/* Search Results */}
            {isSearchOpen && (
              <div
                className={`bg-white rounded-md absolute w-[100%] left-0 z-1000 max-h-[70vh] shadow-lg ${
                  isProductsListPage
                    ? "top-[68px] rounded-none"
                    : isDetail
                    ? "top-[110px]"
                    : "top-[70px]"
                } overflow-y-auto`}
              >
                {/* Temu-style: Recent + Popular when no search */}
                {mobileSearchValue.length < 2 && (
                  <div className="p-4">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <span>🕐</span> {t.recentSearches}
                          </h3>
                          <button
                            onClick={handleClearRecent}
                            className="text-[10px] text-gray-400 hover:text-red-500"
                          >
                            🗑️ {t.clearAll}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.slice(0, 6).map((query, idx) => (
                            <button
                              key={`recent-${idx}`}
                              onClick={() => handleSearchQuery(query)}
                              className="group px-3 py-1.5 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-full text-xs transition-all flex items-center gap-1"
                            >
                              <span className="text-gray-400 group-hover:text-blue-100">🔍</span>
                              <span>{query}</span>
                              <span
                                onClick={(e) => handleRemoveRecent(e, query)}
                                className="text-gray-300 hover:text-red-500 group-hover:text-white ml-0.5"
                              >
                                ✕
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Loading state for search results */}
                {mobileSearchValue.length >= 2 && isMobileSearchLoading && (
                  <div className="w-full flex items-center justify-center py-6">
                    <svg
                      className="animate-spin h-6 w-6 text-[#3873C3]"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  </div>
                )}

                {/* Search Results */}
                {mobileSearchValue.length >= 2 && FilteredProduct?.data?.map((item: any) => (
                  <p
                    className="w-full px-[16px] py-[14px] text-[14px] font-normal border-b border-[#E5E5E5] cursor-pointer hover:bg-gray-50"
                    key={item.id}
                    onClick={() => {
                      saveRecentSearch(item.title);
                      setRecentSearches(getRecentSearches());
                      navigate(
                        `/${lang}/${
                          ROUTES.product[lang as keyof typeof ROUTES.product]
                        }/${item.slug[lang as keyof typeof item.slug]}`
                      );
                      setIsSearchOpen(false);
                      setIsMobileSearchLoading(false);
                    }}
                  >
                    {item.title}
                  </p>
                ))}
              </div>
            )}
          </div>

          </div>

          {!isSearchOpen && <LanguageSwitcher />}

          {/* User Icon */}
          {!isSearchOpen && (
            <div className="relative">
              <div
                onClick={() => {
                  const userStr = localStorage.getItem("user-info");
                  if (userStr) {
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
                className="w-[40px] h-[40px] aspect-square rounded-full duration-300 bg-opacity-40 bg-blur-[4px] flex justify-center items-center"
              >
                <UserIcon />
              </div>
            </div>
          )}

          {/* Favorites Icon */}
          {!isSearchOpen && (
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
                className="object-contain w-[40px] h-[40px] aspect-square rounded-full"
                alt="Favorites"
              />
              {favoritesCount > 0 && (
                <div className="w-[16px] h-[16px] flex justify-center items-center text-white text-[9px] font-medium bg-[#FC394C] rounded-full absolute -top-1 -right-1">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </div>
              )}
            </div>
          )}

          {/* Basket Icon */}
          {!isSearchOpen && (
            <button
              className="flex gap-3 items-center"
              onClick={() => {
                const userStr = localStorage.getItem("user-info");
                if (userStr) {
                  navigate("/basked/sifarislerim");
                  window.location.href = "/basked/sifarislerim";
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
              <div className="w-[40px] h-[40px] aspect-square rounded-full duration-300 bg-blur-[4px] bg-[#F5F5F5] flex justify-center items-center relative">
                <BiShoppingBag />
                {hasItems && hasItems.length > 0 && (
                  <div className="w-[14px] h-[14px] sm:w-[12px] sm:h-[12px] flex justify-center items-center text-white text-xs sm:text-[8px] bg-[#FC394C] rounded-full absolute top-[0px] right-[0px]">
                    {hasItems?.length}
                  </div>
                )}
              </div>
            </button>
          )}

          {/* Menu Icon */}
          {!isSearchOpen && (
            <div className="relative">
              <div
                onClick={() => setShowAside(true)}
                className="w-[40px] h-[40px] aspect-square rounded-full duration-300 bg-[#3873C3] bg-opacity-40 bg-blur-[4px] flex justify-center items-center cursor-pointer"
              >
                <MenuIcon />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!isSearchOpen && (
        <MobileMenu
          showaside={showaside}
          setShowAside={setShowAside}
          CurrentCategory={CurrentCategory}
          setCurrentCategory={setCurrentCategory}
          catalog_categories={catalog_categories}
          translation={translation}
          lang={lang}
          navigate={navigate}
        />
      )}
    </>
  );
}

// Icons
function SearchIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="20" fill="#F5F5F5" />
      <g clipPath="url(#clip0_921_3507)">
        <circle
          cx="19.1667"
          cy="19.1665"
          r="7.5"
          stroke="black"
          strokeWidth="1.5"
        />
        <path
          d="M28.1767 27.4791C28.1244 27.558 28.03 27.6525 27.8411 27.8413C27.6523 28.0302 27.5579 28.1246 27.479 28.1768C27.0168 28.4829 26.3916 28.3251 26.1299 27.8365C26.0853 27.7531 26.0469 27.6252 25.9703 27.3693C25.8865 27.0898 25.8446 26.95 25.8365 26.8517C25.7889 26.2725 26.2723 25.789 26.8515 25.8367C26.9498 25.8448 27.0896 25.8867 27.3691 25.9704C27.625 26.0471 27.7529 26.0854 27.8363 26.1301C28.325 26.3918 28.4827 27.017 28.1767 27.4791Z"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_921_3507">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(10 10)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 5L5 15"
        stroke="black"
        strokeOpacity="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 5L15 15"
        stroke="black"
        strokeOpacity="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="20" fill="#F5F5F5" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9998 11.0417C17.8137 11.0417 16.0415 12.814 16.0415 15.0001C16.0415 17.1862 17.8137 18.9584 19.9998 18.9584C22.186 18.9584 23.9582 17.1862 23.9582 15.0001C23.9582 12.814 22.186 11.0417 19.9998 11.0417ZM17.2915 15.0001C17.2915 13.5043 18.5041 12.2917 19.9998 12.2917C21.4956 12.2917 22.7082 13.5043 22.7082 15.0001C22.7082 16.4959 21.4956 17.7084 19.9998 17.7084C18.5041 17.7084 17.2915 16.4959 17.2915 15.0001Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9998 20.2084C18.3004 20.2084 16.7311 20.6007 15.565 21.2671C14.4165 21.9233 13.5415 22.9252 13.5415 24.1667C13.5415 25.4083 14.4165 26.4102 15.565 27.0664C16.7311 27.7328 18.3004 28.1251 19.9998 28.1251C21.6993 28.1251 23.2686 27.7328 24.4347 27.0664C25.5832 26.4102 26.4582 25.4083 26.4582 24.1667C26.4582 22.9252 25.5832 21.9233 24.4347 21.2671C23.2686 20.6007 21.6993 20.2084 19.9998 20.2084ZM14.7915 24.1667C14.7915 23.5674 15.2223 22.9025 16.1851 22.3524C17.1302 21.8123 18.4776 21.4584 19.9998 21.4584C21.5221 21.4584 22.8694 21.8123 23.8145 22.3524C24.7773 22.9025 25.2082 23.5674 25.2082 24.1667C25.2082 24.7661 24.7773 25.431 23.8145 25.9811C22.8694 26.5212 21.5221 26.8751 19.9998 26.8751C18.4776 26.8751 17.1302 26.5212 16.1851 25.9811C15.2223 25.431 14.7915 24.7661 14.7915 24.1667Z"
        fill="black"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="20" fill="#3873C3" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.9585 15.8333C28.9585 16.1784 28.6787 16.4583 28.3335 16.4583L11.6668 16.4583C11.3217 16.4583 11.0418 16.1784 11.0418 15.8333C11.0418 15.4881 11.3217 15.2083 11.6668 15.2083L28.3335 15.2083C28.6787 15.2083 28.9585 15.4881 28.9585 15.8333Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.4585 20C26.4585 20.3452 26.1787 20.625 25.8335 20.625H14.1668C13.8217 20.625 13.5418 20.3452 13.5418 20C13.5418 19.6548 13.8217 19.375 14.1668 19.375H25.8335C26.1787 19.375 26.4585 19.6548 26.4585 20Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.9585 24.1667C23.9585 24.5119 23.6787 24.7917 23.3335 24.7917H16.6668C16.3217 24.7917 16.0418 24.5119 16.0418 24.1667C16.0418 23.8216 16.3217 23.5417 16.6668 23.5417H23.3335C23.6787 23.5417 23.9585 23.8216 23.9585 24.1667Z"
        fill="white"
      />
    </svg>
  );
}