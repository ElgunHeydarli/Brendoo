import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import {
  useSearchParams,
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";
import axios from "axios";
import GETRequest, { getFilters } from "../setting/Request";
import ROUTES from "../setting/routes";
import type {
  Category,
  Filter,
  SeoApiResponse,
  TranslationsKeys,
  Product,
} from "../setting/Types";
import SEO from "../components/SEO";
import DynamicFilters from "../components/DynamicFilters";

// Components from Products
import {
  SkeletonItem,
  FilterSkeleton,
  ProductGridSkeleton,
  PriceRange,
  Pagination,
  DropdownItem,
  DropdownItemFilter,
  ProductCard,
} from "./Products/components";

// Lazy Components
const Header = lazy(() => import("../components/Header"));
const Footer = lazy(() =>
  import("../components/Footer").then((m) => ({ default: m.Footer }))
);
const MobileFilter = lazy(() => import("./Products/MobileFilter"));

// Məhsulları filter edən funksiya
const filterValidProducts = (products: Product[]): Product[] => {
  const seenIds = new Set<number>();
  return products.filter((p) => {
    if (!p.title || p.title.trim() === "") return false;
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang = "az" } = useParams<{ lang: string }>();

  const query = searchParams.get("q") || "";
  const searchType = searchParams.get("type") || "text";
  const optionsFromUrl = searchParams.get("options") ? 
    searchParams.get("options")!.split(",").map(Number) : [];

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [Sort, setSort] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(optionsFromUrl);
  const [checked, setChecked] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isLowStock, setIsLowStock] = useState(false);
  const [isTopRated, setIsTopRated] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [categoryFilters, setCategoryFilters] = useState<Filter[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // API requests
  const { data: categories, isLoading: categoriesLoading } = GETRequest<Category[]>(
    `/categories`,
    "categories",
    [lang]
  );

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    "translates",
    [lang]
  );

  const { data: filters, isLoading: filtersLoading } = GETRequest<Filter[]>(
    `/filters`,
    "filters",
    [lang]
  );
  
  // Filterləri qruplaşdır (dublikat ID-li filterləri birləşdir)
  const groupedFilters = useMemo(() => {
    if (!filters) return [];
    const uniqueFilters: Filter[] = [];
    const seenIds = new Set<number>();
    
    filters.forEach((filter) => {
      if (!seenIds.has(filter.id)) {
        seenIds.add(filter.id);
        const allOptionsForThisId = filters
          .filter(f => f.id === filter.id)
          .flatMap(f => f.options);
        const uniqueOptions = Array.from(
          new Map(allOptionsForThisId.map(opt => [opt.id, opt])).values()
        );
        uniqueFilters.push({
          id: filter.id,
          title: filter.title,
          options: uniqueOptions
        });
      }
    });
    return uniqueFilters;
  }, [filters]);

  const { data: product_hero } = GETRequest<any>(
    `/product_hero`,
    "product_hero",
    [lang]
  );

  const { data: seoSearch } = GETRequest<SeoApiResponse>(
    "/seo/search",
    "seo-search",
    [lang, query, totalProducts],
    { q: query, count: totalProducts },
    Boolean(query)
  );

  // Image/Vision Search - localStorage-dən oxu
  useEffect(() => {
    if (searchType === "image" || searchType === "vision") {
      setIsLoading(true);
      try {
        const storageKey = searchType === "vision" ? "vision_search_results" : "image_search_results";
        const imageSearchData = localStorage.getItem(storageKey);
        console.log("=== IMAGE/VISION SEARCH DEBUG ===");
        console.log("Search type:", searchType);
        console.log("Raw data:", imageSearchData);
        
        if (imageSearchData) {
          const parsedData = JSON.parse(imageSearchData);
          console.log("Parsed data:", parsedData);
          console.log("Products count:", parsedData.products?.length);
          
          // Vision search labels-ı göstər
          if (parsedData.labels) {
            setImageAnalysis({ labels: parsedData.labels });
          } else if (parsedData.analysis) {
            setImageAnalysis(parsedData.analysis);
          }
          
          if (parsedData.success && parsedData.products && parsedData.products.length > 0) {
            const validProducts = filterValidProducts(parsedData.products);
            console.log("Valid products:", validProducts.length);
            
            setProducts(validProducts);
            setTotalProducts(validProducts.length);
            setLastPage(Math.ceil(validProducts.length / 20));
          } else {
            console.log("No products found or success=false");
            setProducts([]);
            setTotalProducts(0);
          }
        } else {
          console.log("No search results in localStorage");
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error("Image search parse error:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [searchType]);

  // Text Search function - Server-side pagination ilə
  const performSearch = useCallback(async () => {
    if (searchType === "image" || searchType === "vision") return;

    if (!query || query.length < 2) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // API parametrləri
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('page', String(page));
      params.append('per_page', '24'); // Hər səhifədə 24 məhsul

      // Qiymət filterləri
      if (minPrice > 0) params.append('min_price', String(minPrice));
      if (maxPrice > 0) params.append('max_price', String(maxPrice));

      // Dinamik filtrlər (options)
      if (selectedOptions.length > 0) {
        selectedOptions.forEach((optionId) => {
          params.append('options[]', String(optionId));
        });
      }

      // Endirimli
      if (checked) params.append('discount', '1');

      // Çox satılan
      if (isBestseller) params.append('bestseller', '1');

      // Stokda az olan
      if (isLowStock) params.append('low_stock', '1');

      // 5 ulduzlu
      if (isTopRated) params.append('top_rated', '1');

      // Sıralama
      if (Sort) {
        if (Sort === "cheap-expensive") {
          params.append('sort', 'price');
          params.append('order', 'asc');
        } else if (Sort === "expensive-cheap") {
          params.append('sort', 'price');
          params.append('order', 'desc');
        } else if (Sort === "A-Z") {
          params.append('sort', 'title');
          params.append('order', 'asc');
        } else if (Sort === "Z-A") {
          params.append('sort', 'title');
          params.append('order', 'desc');
        }
      }

      console.log("=== SEARCH DEBUG ===");
      console.log("Search URL:", `https://admin.brendoo.com/api/search?${params.toString()}`);

      const res = await axios.get(
        `https://admin.brendoo.com/api/search?${params.toString()}`,
        { headers: { "Accept-Language": lang } }
      );

      console.log("API Response:", res.data);
      console.log("Response structure:", {
        hasData: !!res.data?.data,
        hasMeta: !!res.data?.meta,
        hasProducts: !!res.data?.products,
        dataLength: res.data?.data?.length || res.data?.products?.length || 0
      });

      // Backend pagination dəstəkləyirsə
      if (res.data?.data && res.data?.meta) {
        // Laravel pagination strukturu
        const validProducts = filterValidProducts(res.data.data || []);

        // Backend sıralama etmirsə, səhifə içində client-side sort et
        const sortedPageProducts = [...validProducts];
        if (Sort === "cheap-expensive") {
          sortedPageProducts.sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)));
        } else if (Sort === "expensive-cheap") {
          sortedPageProducts.sort((a, b) => parseFloat(String(b.price)) - parseFloat(String(a.price)));
        } else if (Sort === "A-Z") {
          sortedPageProducts.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (Sort === "Z-A") {
          sortedPageProducts.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        }

        setProducts(sortedPageProducts);
        setTotalProducts(res.data.meta.total || validProducts.length);
        setLastPage(res.data.meta.last_page || 1);
      } else if (res.data?.products) {
        // Köhnə struktur - client-side filtering
        let data: Product[] = filterValidProducts(res.data?.products || []);

        // Client-side filterləmə (əgər backend dəstəkləmirsə)
        if (minPrice > 0) {
          data = data.filter((p) => parseFloat(String(p.price)) >= minPrice);
        }
        if (maxPrice > 0) {
          data = data.filter((p) => parseFloat(String(p.price)) <= maxPrice);
        }
        if (checked) {
          data = data.filter((p) => Number(p.discount) > 0);
        }
        if (isBestseller) {
          data = data.filter((p: any) => p.is_bestseller === true);
        }
        if (isLowStock) {
          data = data.filter((p: any) => p.is_low_stock === true);
        }
        if (isTopRated) {
          data = data.filter((p: any) => p.is_top_rated === true);
        }

        // Client-side sıralama - TƏK BİR DƏFƏ TÜM DATA-DA TƏTBİQ ET
        const sortedData = [...data]; // Yeni array yaratmaq mühüm - orijinal data-yı dəyişmə
        if (Sort === "cheap-expensive") {
          sortedData.sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)));
        } else if (Sort === "expensive-cheap") {
          sortedData.sort((a, b) => parseFloat(String(b.price)) - parseFloat(String(a.price)));
        } else if (Sort === "A-Z") {
          sortedData.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (Sort === "Z-A") {
          sortedData.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        }

        // Total-dan pagination hesabla
        const total = res.data?.total || sortedData.length;
        setTotalProducts(total);
        setLastPage(Math.ceil(total / 24));

        // Client-side pagination - sıralanmış data-dan
        const startIndex = (page - 1) * 24;
        const paginatedData = sortedData.slice(startIndex, startIndex + 24);
        setProducts(paginatedData);
      } else {
        setProducts([]);
        setTotalProducts(0);
        setLastPage(1);
      }
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, lang, minPrice, maxPrice, checked, page, searchType, isBestseller, isLowStock, isTopRated, Sort, selectedOptions]);

  useEffect(() => {
    if (searchType === "text") {
      performSearch();
    }
  }, [performSearch, searchType]);

  // URL-dən page parametrini oxu
  useEffect(() => {
    const pageFromUrl = searchParams.get("page");
    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setPage(pageNum);
      }
    }
  }, [searchParams]);

  // Filter dəyişəndə page-i 1-ə qaytarma (yalnız URL-də page yoxdursa)
  useEffect(() => {
    const pageFromUrl = searchParams.get("page");
    if (!pageFromUrl) {
      setPage(1);
    }
  }, [query, minPrice, maxPrice, checked, Sort, isBestseller, isLowStock, isTopRated, selectedOptions]);

  // URL-dən options parametrini oxu
  useEffect(() => {
    const optionsFromUrl = searchParams.get("options") ? 
      searchParams.get("options")!.split(",").map(Number) : [];
    setSelectedOptions(optionsFromUrl);
  }, [searchParams]);



  const handlePageChange = useCallback((newPage: number) => {
    // URL-ə page parametrini əlavə et
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", newPage.toString());
    const newUrl = `/${lang}/search?${currentParams.toString()}`;

    // Yeni URL-ə keç
    window.location.href = newUrl;
  }, [lang]);

  const closeFilter = useCallback(() => {}, []);

  // Filtrlər dəyişdikdə URL-i güncəllə
  const handleFilterChange = useCallback((newOptions: number[]) => {
    const currentParams = new URLSearchParams(window.location.search);
    if (newOptions.length > 0) {
      currentParams.set("options", newOptions.join(","));
    } else {
      currentParams.delete("options");
    }
    // Page-i reset et
    currentParams.delete("page");
    const newUrl = `/${lang}/search?${currentParams.toString()}`;
    window.location.href = newUrl;
  }, [lang]);

  // Radio button handler
  const handleTypeFilter = (filterType: 'bestseller' | 'lowStock' | 'topRated') => {
    if (filterType === 'bestseller') {
      setIsBestseller(!isBestseller);
      if (!isBestseller) {
        setIsLowStock(false);
        setIsTopRated(false);
      }
    } else if (filterType === 'lowStock') {
      setIsLowStock(!isLowStock);
      if (!isLowStock) {
        setIsBestseller(false);
        setIsTopRated(false);
      }
    } else if (filterType === 'topRated') {
      setIsTopRated(!isTopRated);
      if (!isTopRated) {
        setIsBestseller(false);
        setIsLowStock(false);
      }
    }
  };

  // Filter Section Component
  const FilterSection = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={
        isMobile
          ? "space-y-4"
          : "flex flex-col mt-2 text-black whitespace-nowrap gap-4"
      }
    >
      {!isMobile && (
        <label className="text-black">
          {translation?.Kateqoriyalar || "Kateqoriyalar"}
        </label>
      )}

      {categoriesLoading ? (
        <FilterSkeleton />
      ) : (
        categories?.map((categoryItem) => (
          <DropdownItem key={categoryItem.id} data={categoryItem} />
        ))
      )}

      {/* Dinamik Filtrlər */}
      {filtersLoading ? (
        <FilterSkeleton />
      ) : groupedFilters && groupedFilters.length > 0 ? (
        <DynamicFilters
          filters={groupedFilters}
          selectedOptions={selectedOptions}
          onFilterChange={handleFilterChange}
        />
      ) : null}

      <PriceRange
        t={translation}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
      />

      {/* Endirimli məhsullar */}
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div
          onClick={() => setChecked(!checked)}
          className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${
            checked ? "bg-[#3873C3]" : ""
          }`}
        />
        <span className="self-stretch my-auto">
          {translation?.Endirimli_məhsullar || "Endirimli məhsullar"}
        </span>
      </div>

      {/* Çox satılanlar */}
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div
          onClick={() => handleTypeFilter('bestseller')}
          className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${
            isBestseller ? "bg-[#3873C3]" : ""
          }`}
        />
        <span className="self-stretch my-auto">
          {translation?.cox_satilan || 'Best Sellers'}
        </span>
      </div>

      {/* Stokda az olan */}
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div
          onClick={() => handleTypeFilter('lowStock')}
          className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${
            isLowStock ? "bg-[#3873C3]" : ""
          }`}
        />
        <span className="self-stretch my-auto">
          {translation?.stokda_az || "Stokda az olan"}
        </span>
      </div>

      {/* 5 ulduzlu */}
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div
          onClick={() => handleTypeFilter('topRated')}
          className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${
            isTopRated ? "bg-[#3873C3]" : ""
          }`}
        />
        <span className="self-stretch my-auto">
          {translation?.ulduzlu_mehsullar || "5 ulduzlu"}
        </span>
      </div>
    </div>
  );

  // SEO üçün dinamik məlumatlar
  const getSeoTitle = () => {
    if (searchType === "image" || searchType === "vision") {
      return `${translation?.sekil_axtarisi || 'Şəkil axtarışı'} | Brendoo`;
    }
    return `"${query}" ${translation?.ucun_netice || 'üçün nəticələr'} | Brendoo`;
  };

  const getSeoDescription = () => {
    if (searchType === "image" || searchType === "vision") {
      return `Şəkil ilə axtarış nəticələri. ${totalProducts} məhsul tapıldı. Brendoo - Premium brendlərdən orijinal məhsullar.`;
    }
    return `"${query}" üçün ${totalProducts} məhsul tapıldı. Brendoo mağazasında axtarış nəticələri.`;
  };

  const getSearchTitle = () => {
    if (searchType === "image" || searchType === "vision") {
      if (imageAnalysis?.labels && imageAnalysis.labels.length > 0) {
        const topLabels = imageAnalysis.labels.slice(0, 3).map((l: any) => l.name).join(", ");
        return `📷 ${translation?.sekil_axtarisi || "Şəkil axtarışı"}: ${topLabels}`;
      }
      if (imageAnalysis?.dominant_color) {
        return `📷 ${translation?.sekil_axtarisi || "Şəkil axtarışı"}: ${imageAnalysis.dominant_color}`;
      }
      return `📷 ${translation?.sekil_axtarisi || "Şəkil axtarışı"}`;
    }
    return `"${query}" ${translation?.ucun_netice || "üçün nəticələr"}`;
  };

  if (!query && searchType !== "image" && searchType !== "vision") {
    return (
      <div className="min-h-screen">
        <SEO
          seoData={seoSearch?.data}
          title={`${translation?.axtaris || 'Axtarış'} | Brendoo`}
          description="Brendoo mağazasında axtarış edin. Premium brendlərdən orijinal məhsullar."
          noindex={true}
        />
        <Suspense fallback={<div className="h-20 bg-gray-100" />}>
          <Header />
        </Suspense>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900">
              {translation?.axtaris_sorgusu_daxil_edin || "Axtarış sorğusunu daxil edin"}
            </h1>
          </div>
        </div>
        <Suspense fallback={<div className="h-32 bg-gray-100" />}>
          <Footer />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative">
      <SEO
        seoData={seoSearch?.data}
        title={getSeoTitle()}
        description={getSeoDescription()}
        keywords={`${query}, brendoo, axtarış, məhsullar`}
        url={`https://brendoo.com/${lang}/search?q=${encodeURIComponent(query)}`}
        type="website"
        noindex={true}
      />

      <Suspense fallback={<div className="h-20 bg-gray-100" />}>
        <Header />
      </Suspense>

      <main className="mt-0">
        <section className="flex overflow-hidden flex-col bg-black">
          <div
            className="flex relative flex-col pt-10 pr-20 pb-36 pl-10 w-full min-h-[324px] max-md:px-5 max-md:pb-24 max-md:max-w-full"
            style={{
              backgroundImage: `url(${product_hero?.data?.image || ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <nav className="flex relative gap-2 items-center self-start text-base" aria-label="Breadcrumb">
              <Link
                reloadDocument
                to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.home]}`}
                className="flex gap-2 items-center"
              >
                <span className="self-stretch my-auto text-white">
                  {translation?.Ana_səhifə || "Ana səhifə"}
                </span>
              </Link>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/a06e1c6285cb46f6524f6d6023531f25dabadfc0b9b5097943e091c33f26f94a"
                className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                alt=""
                aria-hidden="true"
              />
              <span className="self-stretch my-auto text-white text-opacity-80">
                {translation?.axtaris_neticeleri || "Axtarış nəticələri"}
              </span>
            </nav>

            <h1 className="relative self-center mt-20 mb-0 text-4xl font-semibold text-white max-md:mt-10 max-md:mb-2.5 max-md:max-w-full text-center">
              {getSearchTitle()}
            </h1>

            {/* Vision/Image Search Labels */}
            {(searchType === "image" || searchType === "vision") && imageAnalysis?.labels && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {imageAnalysis.labels.slice(0, 8).map((label: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      label.type === 'web'
                        ? 'bg-purple-500/30 text-white'
                        : label.type === 'object'
                        ? 'bg-green-500/30 text-white'
                        : 'bg-blue-500/30 text-white'
                    }`}
                  >
                    <span>{label.name}</span>
                    <span className="opacity-70">{label.score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col w-full max-md:px-5 max-sm:px-0">
          <div className="flex lg:flex-row flex-col mt-[20px] md:mt-[60px] lg:px-[40px] px-[10px] gap-4">
            <aside className="flex flex-col w-full lg:max-w-[280px]">
              <h2 className="text-xl font-semibold text-black">
                {translation?.Filter || "Filtr"}
              </h2>

              <div className="md:hidden">
                <Suspense fallback={<SkeletonItem className="h-12 rounded-full" />}>
                  <MobileFilter
                    translation={translation}
                    selectedItems={{
                      category: null,
                      subCategory: null,
                      thirdCategory: null,
                      options: options,
                    }}
                    onClose={closeFilter}
                  >
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        {translation?.Filter_description || "Məhsulları filtrlə"}
                      </p>
                      <FilterSection isMobile={true} />
                    </div>
                  </MobileFilter>
                </Suspense>
              </div>

              <div className="hidden md:flex overflow-hidden flex-col px-5 py-6 mt-5 w-full rounded-3xl border border-solid border-black border-opacity-10">
                <FilterSection />
              </div>
            </aside>

            <section className="flex w-full my-8 flex-col rounded-none" aria-label="Axtarış nəticələri">
              <div className="flex flex-wrap gap-5 items-center justify-between w-full max-md:max-w-full">
                <div className="flex gap-4 items-center flex-wrap">
                  <label htmlFor="sort-select" className="self-stretch my-auto text-sm text-black text-opacity-60">
                    {translation?.Sırala || "Sırala"}
                  </label>
                  <div className="flex overflow-hidden gap-10 self-stretch px-4 py-3.5 my-auto text-base font-medium text-black bg-neutral-100 rounded-[100px] lg:w-[283px] w-[200px]">
                    <select
                      id="sort-select"
                      onChange={(e) => setSort(e.target.value)}
                      value={Sort}
                      className="w-full focus:outline-none bg-[#F5F5F5]"
                    >
                      <option value="">{translation?.Sırala || "Sırala"}</option>
                      <option value="A-Z">A-Z</option>
                      <option value="Z-A">Z-A</option>
                      <option value="expensive-cheap">
                        {translation?.Expensive_Cheap || "Bahalıdan ucuza"}
                      </option>
                      <option value="cheap-expensive">
                        {translation?.Cheap_Expensive || "Ucuzdan bahalıya"}
                      </option>
                    </select>
                  </div>
                </div>
                <p>
                  <span className="mr-2">{translation?.mehsul_sayi || "Məhsul sayı"}</span>
                  : {totalProducts}
                </p>
              </div>

              <div className="flex flex-row flex-wrap gap-3 mt-5">
                <div className="flex gap-2.5 justify-center items-center px-7 py-3.5 text-base font-medium text-black border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                  <span>{(searchType === "image" || searchType === "vision") ? "📷" : "🔍"}</span>
                  <span className="self-stretch my-auto">
                    {(searchType === "image" || searchType === "vision")
                      ? translation?.sekil_axtarisi || "Şəkil axtarışı"
                      : `"${query}"`}
                  </span>
                  <button
                    onClick={() =>
                      navigate(`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`)
                    }
                    aria-label="Axtarışı sil"
                  >
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221"
                      className="object-contain cursor-pointer shrink-0 self-stretch my-auto w-5 aspect-square"
                      alt=""
                    />
                  </button>
                </div>

                {/* Aktiv filter badge-ləri */}
                {isBestseller && (
                  <div className="flex gap-2.5 justify-center items-center px-7 py-3.5 text-base font-medium text-black border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                    <span className="self-stretch my-auto">{translation?.cox_satilan || 'Best Sellers'}</span>
                    <button onClick={() => setIsBestseller(false)} aria-label="Remove best sellers filter">
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221"
                        className="object-contain cursor-pointer shrink-0 w-5 aspect-square"
                        alt=""
                      />
                    </button>
                  </div>
                )}

                {isLowStock && (
                  <div className="flex gap-2.5 justify-center items-center px-7 py-3.5 text-base font-medium text-black border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                    <span className="self-stretch my-auto">{translation?.stokda_az || "Stokda az olan"}</span>
                    <button onClick={() => setIsLowStock(false)} aria-label="Stokda az olan filterini sil">
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221"
                        className="object-contain cursor-pointer shrink-0 w-5 aspect-square"
                        alt=""
                      />
                    </button>
                  </div>
                )}

                {isTopRated && (
                  <div className="flex gap-2.5 justify-center items-center px-7 py-3.5 text-base font-medium text-black border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                    <span className="self-stretch my-auto">{translation?.ulduzlu_mehsullar || "5 ulduzlu"}</span>
                    <button onClick={() => setIsTopRated(false)} aria-label="5 ulduzlu filterini sil">
                      <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221"
                        className="object-contain cursor-pointer shrink-0 w-5 aspect-square"
                        alt=""
                      />
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <ProductGridSkeleton />
              ) : products.length > 0 ? (
                <>
                  <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5 mt-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        translation={translation}
                      />
                    ))}
                  </div>

                  {lastPage > 1 && (
                    <Pagination
                      currentPage={page}
                      lastPage={lastPage}
                      onPageChange={handlePageChange}
                      translation={translation}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm mt-6">
                  <span className="text-8xl" aria-hidden="true">{(searchType === "image" || searchType === "vision") ? "📷" : "🔍"}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-6">
                    {(searchType === "image" || searchType === "vision")
                      ? translation?.sekilde_mehsul_tapilmadi || "Şəkildə məhsul tapılmadı"
                      : translation?.netice_tapilmadi || "Heç nə tapılmadı"}
                  </h2>
                  <p className="text-gray-500 mt-2">
                    {(searchType === "image" || searchType === "vision")
                      ? translation?.basqa_sekil_sinayin || "Başqa şəkil sınayın"
                      : translation?.basqa_sozu_sinayin || "Başqa açar sözlər sınayın"}
                  </p>
                  <button
                    onClick={() => navigate(-1)}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    ← {translation?.geri_qayit || "Geri"}
                  </button>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <Suspense fallback={<div className="h-32 bg-gray-100" />}>
        <Footer />
      </Suspense>
    </div>
  );
}