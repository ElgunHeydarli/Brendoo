// pages/Products/index.tsx

"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  lazy,
  Suspense,
  useState,
} from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import type {
  Category,
  Filter,
  Product,
  ProductResponse,
  TranslationsKeys,
} from "../../setting/Types";
import GETRequest from "../../setting/Request";
import Loading from "../../components/Loading";
import ROUTES from "../../setting/routes";
import axios from "axios";
import DropdownItemC from "./DropdownItemC";
import SEO from "../../components/SEO";

import type { NewFiltersInterface } from "./types";

import {
  SkeletonItem,
  FilterSkeleton,
  ProductGridSkeleton,
  PriceRange,
  Pagination,
  DropdownItem,
  DropdownItemFilter,
  ProductCard,
} from "./components";

const Header = lazy(() => import("../../components/Header"));
const Footer = lazy(() =>
  import("../../components/Footer").then((module) => ({
    default: module.Footer,
  }))
);
const MobileFilter = lazy(() => import("./MobileFilter"));

export default function Products({
  collectionProducts,
  slug,
}: {
  collectionProducts?: Product[];
  slug?: string;
}) {
  const [checked, setChecked] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isLowStock, setIsLowStock] = useState(false);
  const [isTopRated, setIsTopRated] = useState(false);
  const [Sort, setSort] = useState<string>("");
  const [minPrice, setminPrice] = useState<number>(0);
  const [maxPrice, setmaxPrice] = useState<number>(0);
  const [options, setoptions] = useState<number[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [collectionProductsData, setColProdData] = useState<Product[]>([]);
  const [newFiltersData, setNewFiltersData] = useState<NewFiltersInterface | null>(null);
  const [newFiltersLoading, setNewFiltersLoading] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { lang = "ru" } = useParams<{ lang: string }>();

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  
  const subCategory = queryParams.get("subCategory");
  const category = queryParams.get("category");
  const brand_id = queryParams.get("brand_id");
  const max_price = queryParams.get("max_price");
  const min_price = queryParams.get("min_price");
  const is_season = queryParams.get("is_season");
  const is_popular = queryParams.get("is_popular");
  const is_discount = queryParams.get("discount");
  const third_category_id = queryParams.get("third_category_id");
  const type = queryParams.get("type");

  const brandQuery = useMemo(
    () =>
      selectedBrandIds.length
        ? selectedBrandIds.map((id) => `brand_id[]=${id}`).join("&")
        : "",
    [selectedBrandIds]
  );

  const apiQuery = useMemo(() => {
    let typeParam = "";
    if (isBestseller) typeParam = "bestsellers";
    else if (isLowStock) typeParam = "low_stock";
    else if (isTopRated) typeParam = "top_rated";
    else if (type) typeParam = type;

    const params = [
      `page=${page}`,
      category ? `category_id=${category}` : "",
      subCategory ? `sub_category_id=${subCategory}` : "",
      checked ? `discount=1` : "",
      Sort ? `sort=${Sort}` : "",
      minPrice > 0 ? `min_price=${minPrice}` : "",
      maxPrice > 0 ? `max_price=${maxPrice}` : "",
      is_popular ? `is_popular=${is_popular}` : "",
      is_season ? `is_season=${is_season}` : "",
      third_category_id ? `third_category_id=${third_category_id}` : "",
      typeParam ? `type=${typeParam}` : "",
      brandQuery || "",
    ].filter(Boolean);

    return `/products?${params.join("&")}`;
  }, [
    page, category, subCategory, checked, Sort,
    minPrice, maxPrice, is_popular, is_season, third_category_id, 
    type, brandQuery, isBestseller, isLowStock, isTopRated,
  ]);

  const token = useMemo(() => {
    try {
      const userStr = localStorage.getItem("user-info");
      const parsed = userStr ? JSON.parse(userStr) : null;
      return parsed?.token || "";
    } catch {
      return "";
    }
  }, []);

  const { data: categories, isLoading: categoriesLoading } = GETRequest<Category[]>(
    `/categories`, "categories", [lang]
  );
  
  const { data: translation, isLoading: translationLoading } =
    GETRequest<TranslationsKeys>(`/translates`, "translates", [lang]);
  
  const { data: filters, isLoading: filtersLoading } = GETRequest<Filter[]>(
    `/filters`, "filters", [lang]
  );
  
  const { data: product_hero, isLoading: product_heroLoading } =
    GETRequest<any>(`/product_hero`, "product_hero", [lang]);

  const { data: products, isLoading: productsLoading } =
    GETRequest<ProductResponse>(
      apiQuery, "products",
      [lang, page, category, subCategory, checked, options, Sort,
       minPrice, maxPrice, is_popular, is_season, third_category_id, 
       selectedBrandIds, isBestseller, isLowStock, isTopRated],
      { "option_ids[]": options }
    );

  const fetchNewFilters = useCallback(async () => {
    if (!category) return;
    setNewFiltersLoading(true);
    try {
      const res = await axios.get(
        `https://admin.brendoo.com/api/category/${category}/get-filters`,
        {
          headers: {
            "Accept-Language": lang,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) setNewFiltersData(res.data);
    } catch (error) {
      console.error('Filters fetch error:', error);
    } finally {
      setNewFiltersLoading(false);
    }
  }, [category, lang, token]);

  useEffect(() => {
    if (type === "bestsellers") {
      setIsBestseller(true);
      setIsLowStock(false);
      setIsTopRated(false);
    } else if (type === "low_stock") {
      setIsBestseller(false);
      setIsLowStock(true);
      setIsTopRated(false);
    } else if (type === "top_rated") {
      setIsBestseller(false);
      setIsLowStock(false);
      setIsTopRated(true);
    } else {
      setIsBestseller(false);
      setIsLowStock(false);
      setIsTopRated(false);
    }
  }, [type]);

  useEffect(() => {
    setoptions([]);
    if (min_price && +min_price > 0) setminPrice(+min_price);
    if (max_price && +max_price > 0) setmaxPrice(+max_price);
    if (is_discount) setChecked(true);
    
    // URL-dən sort parametrini oxu
    const sortFromUrl = queryParams.get("sort");
    if (sortFromUrl) {
      setSort(sortFromUrl);
    } else if (category && !sortFromUrl) {
      // Kategoriya varsa və URL-də sort yoxdursa, random sırala
      setSort("random");
      const currentParams = new URLSearchParams(location.search);
      currentParams.set("sort", "random");
      navigate(
        `/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}?${currentParams.toString()}`,
        { replace: true }
      );
    }
  }, [category, subCategory, max_price, min_price, brand_id, is_discount, queryParams, location.search, navigate, lang]);

  useEffect(() => {
    if (brand_id) {
      const ids = brand_id.split(",").map(Number).filter((n) => !isNaN(n));
      setSelectedBrandIds(ids);
    } else {
      setSelectedBrandIds([]);
    }
  }, [brand_id]);

  // URL-dən page parametrini oxu
  useEffect(() => {
    const pageFromUrl = queryParams.get("page");
    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setPage(pageNum);
      }
    } else {
      setPage(1);
    }
  }, [location.search]);

  // Filter dəyişəndə page-i 1-ə qaytarma (yalnız URL-də page yoxdursa)
  useEffect(() => {
    const pageFromUrl = queryParams.get("page");
    if (!pageFromUrl) {
      setPage(1);
    }
  }, [category, subCategory, checked, options, Sort, minPrice, maxPrice,
      is_popular, is_season, third_category_id, selectedBrandIds,
      isBestseller, isLowStock, isTopRated, queryParams]);


  useEffect(() => {
    if (collectionProducts && collectionProducts.length > 0) {
      setColProdData(collectionProducts);
    } else {
      setColProdData([]);
    }
  }, [collectionProducts]);

  useEffect(() => {
    fetchNewFilters();
  }, [fetchNewFilters]);

  useEffect(() => {
    // Clean up previous preload links first
    const existingPreloads = document.querySelectorAll('link[rel="preload"][as="image"][data-product-preload]');
    existingPreloads.forEach(link => link.remove());

    if (products?.data && Array.isArray(products.data) && products.data.length > 0) {
      const priorityProducts = products.data.slice(0, 4);
      priorityProducts.forEach((product) => {
        if (product?.thumbnail || product?.image) {
          const imageUrl = product.thumbnail || product.image;
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = imageUrl;
          link.setAttribute('data-product-preload', 'true');
          document.head.appendChild(link);
        }
      });
    }

    return () => {
      // Cleanup on unmount
      const preloads = document.querySelectorAll('link[rel="preload"][as="image"][data-product-preload]');
      preloads.forEach(link => link.remove());
    };
  }, [products?.data]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const currentParams = new URLSearchParams(location.search);
      currentParams.set("page", newPage.toString());
      const newUrl = `/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}?${currentParams.toString()}`;
      
      // Google Translate cookie-lərini düzgün təyin et
      const savedLangCode = localStorage.getItem("selectedGoogleLangCode");
      if (savedLangCode && savedLangCode !== "en") {
        const domain = window.location.hostname;
        const cookieValue = `/en/${savedLangCode}`;
        
        // Cookie-ləri müxtəlif domain variantları ilə təyin et
        document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}; max-age=31536000`;
        if (domain.includes('.')) {
          const rootDomain = domain.substring(domain.indexOf('.'));
          document.cookie = `googtrans=${cookieValue}; path=/; domain=${rootDomain}; max-age=31536000`;
        }
        
        // sessionStorage flag-ını təmizlə ki, yeni səhifədə tərcümə tətbiq olunsun
        sessionStorage.removeItem("languageAutoApplied");
      }
      
      // Səhifəni yenilə
      window.location.href = newUrl;
    },
    [location.search, lang]
  );

  const closeFilter = useCallback(() => {}, []);

  const renderProducts = useMemo(
    () =>
      collectionProductsData && collectionProductsData.length > 0
        ? collectionProductsData
        : products?.data || [],
    [collectionProductsData, products]
  );

  const isInitialLoading = translationLoading || product_heroLoading;

  // Hero data with null safety
  const heroImage = product_hero?.data?.image || null;
  const heroTitle = product_hero?.data?.title || translation?.Məhsullar || 'Məhsullar';

  const getSeoTitle = useMemo(() => {
    if (slug) return `${slug} | Brendoo`;
    const categoryName = categories?.find((c: Category) => c.id === Number(category))?.title;
    if (categoryName) return `${categoryName} | Brendoo`;
    if (isBestseller) return `${translation?.cox_satilan || 'Çox satılanlar'} | Brendoo`;
    if (isLowStock) return `${translation?.stokda_az || 'Stokda az olan'} | Brendoo`;
    if (isTopRated) return `${translation?.ulduzlu_mehsullar || '5 ulduzlu məhsullar'} | Brendoo`;
    if (checked) return `${translation?.Endirimli_məhsullar || 'Endirimli məhsullar'} | Brendoo`;
    return `${translation?.Məhsullar || 'Məhsullar'} | Brendoo`;
  }, [slug, category, categories, translation, isBestseller, isLowStock, isTopRated, checked]);

  const getSeoDescription = useMemo(() => {
    const categoryName = categories?.find((c: Category) => c.id === Number(category))?.title;
    if (categoryName) {
      return `${categoryName} - Brendoo mağazasından orijinal məhsullar. Sürətli çatdırılma, keyfiyyət zəmanəti.`;
    }
    return `Premium brendlərdən orijinal məhsullar. Brendoo-da ən yaxşı qiymətlərlə alış-veriş edin. ${products?.meta?.total || ''} məhsul mövcuddur.`;
  }, [category, categories, products?.meta?.total]);

  if (isInitialLoading) {
    return <Loading />;
  }

  const handleTypeFilter = (filterType: 'bestseller' | 'lowStock' | 'topRated') => {
    if (filterType === 'bestseller') {
      setIsBestseller(!isBestseller);
      if (!isBestseller) { setIsLowStock(false); setIsTopRated(false); }
    } else if (filterType === 'lowStock') {
      setIsLowStock(!isLowStock);
      if (!isLowStock) { setIsBestseller(false); setIsTopRated(false); }
    } else if (filterType === 'topRated') {
      setIsTopRated(!isTopRated);
      if (!isTopRated) { setIsBestseller(false); setIsLowStock(false); }
    }
  };

  const FilterSection = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "space-y-4" : "flex flex-col mt-2 text-black whitespace-nowrap gap-4"}>
      {!isMobile && <label className="text-black">{translation?.Kateqoriyalar || "Kateqoriyalar"}</label>}
      {category && category.length > 0 ? (
        newFiltersLoading ? <FilterSkeleton /> : newFiltersData?.subCategories?.map((categoryItem) => (
          <DropdownItemC key={categoryItem.id} data={categoryItem} />
        ))
      ) : (
        categoriesLoading ? <FilterSkeleton /> : categories?.map((categoryItem) => (
          <DropdownItem key={categoryItem.id} data={categoryItem} />
        ))
      )}
      {category && category.length > 0 ? (
        newFiltersData?.filters?.map((item) => (
          <DropdownItemFilter key={item.id} options={options} setoptions={setoptions} data={item as any} />
        ))
      ) : filtersLoading ? <FilterSkeleton /> : (
        filters?.map((item) => (
          <DropdownItemFilter key={item.id} options={options} setoptions={setoptions} data={item} />
        ))
      )}
      <PriceRange t={translation} minPrice={minPrice} maxPrice={maxPrice} setMinPrice={setminPrice} setMaxPrice={setmaxPrice} />
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div onClick={() => setChecked(!checked)} className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${checked ? "bg-[#3873C3]" : ""}`} />
        <div className="self-stretch my-auto">{translation?.Endirimli_məhsullar || "Endirimli məhsullar"}</div>
      </div>
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div onClick={() => handleTypeFilter('bestseller')} className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${isBestseller ? "bg-[#3873C3]" : ""}`} />
        <div className="self-stretch my-auto">{translation?.cox_satilan || "Çox satılanlar"}</div>
      </div>
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div onClick={() => handleTypeFilter('lowStock')} className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${isLowStock ? "bg-[#3873C3]" : ""}`} />
        <div className="self-stretch my-auto">{translation?.stokda_az || "Stokda az olan"}</div>
      </div>
      <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
        <div onClick={() => handleTypeFilter('topRated')} className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${isTopRated ? "bg-[#3873C3]" : ""}`} />
        <div className="self-stretch my-auto">{translation?.ulduzlu_mehsullar || "5 ulduzlu"}</div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <SEO title={getSeoTitle} description={getSeoDescription} keywords="brendoo, məhsullar, geyim, moda, online alış-veriş, premium brend" url={`https://brendoo.com/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}${location.search}`} type="website" />
      <Suspense fallback={<div className="h-20 bg-gray-100" />}><Header /></Suspense>
      <main className="mt-0">
        <section className="flex overflow-hidden flex-col bg-black">
          <div className="flex relative flex-col pt-10 pr-20 pb-36 pl-10 w-full min-h-[324px] max-md:px-5 max-md:pb-24 max-md:max-w-full" style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'linear-gradient(to right, #1a1a2e, #16213e)', backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            <nav className="flex relative gap-2 items-center self-start text-base" aria-label="Breadcrumb">
              <Link reloadDocument to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.home]}`} className="flex gap-2 items-center">
                <span className="self-stretch my-auto text-white">{translation?.Ana_səhifə || 'Ana səhifə'}</span>
              </Link>
              <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/a06e1c6285cb46f6524f6d6023531f25dabadfc0b9b5097943e091c33f26f94a?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099" className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" alt="" aria-hidden="true" />
              <span className="self-stretch my-auto text-white text-opacity-80">{translation?.Məhsullar || 'Məhsullar'}</span>
            </nav>
            <h1 className="relative self-center mt-20 mb-0 text-4xl font-semibold text-white max-md:mt-10 max-md:mb-2.5 max-md:max-w-full">
              {slug && slug.length > 0 ? slug : heroTitle}
            </h1>
          </div>
        </section>
        <section className="flex flex-col w-full max-md:px-5 max-sm:px-0">
          <div className="flex lg:flex-row flex-col mt-[20px] md:mt-[60px] lg:px-[40px] px-[10px] gap-4">
            <aside className="flex flex-col w-full lg:max-w-[280px]">
              <h2 className="text-xl font-semibold text-black">{translation?.Filter || "Filtr"}</h2>
              <div className="md:hidden">
                <Suspense fallback={<SkeletonItem className="h-12 rounded-full" />}>
                  <MobileFilter translation={translation} selectedItems={{ category: category, subCategory: null, thirdCategory: null, options: options }} onClose={closeFilter}>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-4">{translation?.Filter_description || "Məhsulları filtrlə"}</p>
                      <FilterSection isMobile={true} />
                    </div>
                  </MobileFilter>
                </Suspense>
              </div>
              <div className="hidden md:flex overflow-hidden flex-col px-5 py-6 mt-5 w-full rounded-3xl border border-solid border-black border-opacity-10">
                <FilterSection />
              </div>
            </aside>
            <section className="flex w-full my-2 sm:my-8 flex-col rounded-none" aria-label="Məhsullar">
              <div style={{ display: slug && slug.length > 0 ? "none" : "" }} className="flex flex-wrap gap-5 items-center justify-between w-full max-md:max-w-full">
                <div className="flex gap-4 items-center flex-wrap">
                  <label htmlFor="sort-select" className="self-stretch my-auto text-sm text-black text-opacity-60">{translation?.Sırala || 'Sırala'}</label>
                  <div className="flex overflow-hidden gap-10 self-stretch px-4 py-3.5 my-auto text-base font-medium text-black bg-neutral-100 rounded-[100px] lg:w-[283px] w-[200px]">
                    <select id="sort-select" onChange={(e) => setSort(e.target.value)} value={Sort} className="w-full focus:outline-none bg-[#F5F5F5]">
                      <option value="">{translation?.Sırala || 'Sırala'}</option>
                      <option value="random">{translation?.Random || "Təsadüfi"}</option>
                      <option value="A-Z">A-Z</option>
                      <option value="Z-A">Z-A</option>
                      <option value="expensive-cheap">{translation?.Expensive_Cheap || 'Bahalıdan ucuza'}</option>
                      <option value="cheap-expensive">{translation?.Cheap_Expensive || 'Ucuzdan bahalıya'}</option>
                      <option value="old-new">{translation?.Old_New || 'Köhnədən yeniyə'}</option>
                      <option value="new-old">{translation?.New_Old || 'Yenidən köhnəyə'}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex flex-row flex-wrap gap-3">
                {category && categories?.filter((item: Category) => +category === item.id).map((item) => (
                  <div key={item.id} className="flex gap-2.5 justify-center items-center self-start px-7 py-3.5 max-sm:mt-1 mt-5 text-base font-medium text-black whitespace-nowrap border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                    <span className="self-stretch my-auto">{item.title}</span>
                    <Link reloadDocument to={`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`} aria-label={`${item.title} filterini sil`}>
                      <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099" className="object-contain cursor-pointer shrink-0 self-stretch my-auto w-5 aspect-square" alt="" />
                    </Link>
                  </div>
                ))}
                {isBestseller && (
                  <div className="flex gap-2.5 justify-center items-center self-start px-7 py-3.5 max-sm:mt-1 mt-5 text-base font-medium text-black border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                    <span className="self-stretch my-auto">{translation?.cox_satilan || "Çox satılanlar"}</span>
                    <button onClick={() => setIsBestseller(false)} aria-label="Çox satılanlar filterini sil">
                      <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221" className="object-contain cursor-pointer shrink-0 self-stretch my-auto w-5 aspect-square" alt="" />
                    </button>
                  </div>
                )}
                {isLowStock && (
                  <div className="flex gap-2.5 justify-center items-center self-start px-7 py-3.5 max-sm:mt-1 mt-5 text-base font-medium text-black border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                    <span className="self-stretch my-auto">{translation?.stokda_az || "Stokda az olan"}</span>
                    <button onClick={() => setIsLowStock(false)} aria-label="Stokda az olan filterini sil">
                      <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221" className="object-contain cursor-pointer shrink-0 self-stretch my-auto w-5 aspect-square" alt="" />
                    </button>
                  </div>
                )}
                {isTopRated && (
                  <div className="flex gap-2.5 justify-center items-center self-start px-7 py-3.5 max-sm:mt-1 mt-5 text-base font-medium text-black border border-solid border-black border-opacity-10 rounded-[100px] max-md:px-5">
                    <span className="self-stretch my-auto">{translation?.ulduzlu_mehsullar || "5 ulduzlu"}</span>
                    <button onClick={() => setIsTopRated(false)} aria-label="5 ulduzlu filterini sil">
                      <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/4cb50113a191ac3232ff04e9cd73f88231de4b607b8e1436abe0365b70e6b221" className="object-contain cursor-pointer shrink-0 self-stretch my-auto w-5 aspect-square" alt="" />
                    </button>
                  </div>
                )}
              </div>
              {productsLoading ? (
                <ProductGridSkeleton />
              ) : (
                <>
                  <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5 mt-2 sm:mt-4">
                    {renderProducts?.filter(Boolean).map((product) => product && <ProductCard key={product.id} product={product} translation={translation} />)}
                  </div>
                  {!slug && products?.meta && (
                    <Pagination currentPage={products.meta.current_page} lastPage={products.meta.last_page} onPageChange={handlePageChange} translation={translation} />
                  )}
                </>
              )}
            </section>
          </div>
        </section>
      </main>
      <Suspense fallback={<div className="h-32 bg-gray-100" />}><Footer /></Suspense>
    </div>
  );
}