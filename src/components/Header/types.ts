import { Favorite } from '../../setting/Types';

export interface HeaderProps {
  // əlavə proplar lazım olsa
}

export interface UseHeaderReturn {
  // States
  isCatalogOpen: boolean;
  isBaskedOpen: boolean;
  SearchValue: string;
  debouncedValue: string;
  showaside: boolean;
  isSearchOpen: boolean;
  showSubCAtegoryes: number;
  CurrentCategory: number;
  currentSubCategoryId: number;
  User: any | null;
  baskedLoading: boolean;
  basketItemsData: any;
  hasItems: any[] | null;
  isMobileSearchLoading: boolean;
  isImageSearching: boolean;

  // Refs
  inputRef: React.RefObject<HTMLInputElement>;
  CatalogBtnRef: React.RefObject<HTMLDivElement>;
  CAtalogDiv: React.RefObject<HTMLDivElement>;
  BaskedBtnRef: React.RefObject<HTMLDivElement>;
  BaskedDiv: React.RefObject<HTMLDivElement>;

  // Setters
  setIsClothingOpen: (val: boolean) => void;
  setIsBaskedOpen: (val: boolean) => void;
  setSearchValue: (val: string) => void;
  setShowAside: (val: boolean) => void;
  setIsSearchOpen: (val: boolean) => void;
  setshowSubCAtegoryes: (val: number) => void;
  setCurrentCategory: (val: number) => void;
  setCurrentSubCategoryId: (val: number) => void;
  setIsMobileSearchLoading: (val: boolean) => void;

  // Handlers
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMobileSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleIdInLocalStorage: (id: number) => void;
  fetchBasketItems: () => Promise<void>;
  disableScrolling: () => void;
  enableScrolling: () => void;
  triggerImageSearch: () => void;

  // Data
  categories: any[] | undefined;
  categoriesLoading: boolean;
  favorites: Favorite[] | undefined;
  FilteredProduct: any;
  productsLoading: boolean;
  translation: any;
  catalog_categories: any[] | undefined;

  // Mutations
  RemoveFromBaskedmutation: any;
  UpdateBaskedmutation: any;

  // Route helpers
  lang: string;
  navigate: (path: string) => void;
  isProductsListPage: boolean;
  isDetail: boolean;
}