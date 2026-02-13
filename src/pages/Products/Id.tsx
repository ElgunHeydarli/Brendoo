import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import ProductCard from '../../components/ProductCArd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import GETRequest, { axiosInstance } from '../../setting/Request';
import { GiHanger } from 'react-icons/gi';
import { FiHeart, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';
import { Basket, Favorite, Product, ProductDetail, SeoApiResponse, TranslationsKeys } from '../../setting/Types';
import Loading from '../../components/Loading';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import ROUTES from '../../setting/routes';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import SelectSizeSidebar from './SelectSizeSidebar';
import SEO from '../../components/SEO';
import H1 from '../../components/Headings';

const GUEST_CART_KEY = 'guest_cart';
const API_URL = 'https://admin.brendoo.com';

type GuestCartItem = { 
  id: number; 
  product: ProductDetail; 
  quantity: number; 
  price: string; 
  options: { filter: string; option: string }[] 
};

type GuestCart = { 
  basket_items: GuestCartItem[]; 
  total_price: number; 
  discount: number; 
  final_price: number 
};

const getGuestCart = (): GuestCart => {
  try { 
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '{"basket_items":[],"total_price":0,"discount":0,"final_price":0}'); 
  } catch { 
    return { basket_items: [], total_price: 0, discount: 0, final_price: 0 }; 
  }
};

const setGuestCart = (cart: GuestCart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('guest_cart_updated'));
};

const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  return '/placeholder.png';
};

const getVideoUrl = (src: string | null | undefined): string | null => {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  return `${API_URL}/storage/${src}`;
};

// Option type-dan singular forma çevir (colors -> color)
const getSingularOptionType = (pluralType: string): string => {
  const map: Record<string, string> = {
    colors: 'color',
    sizes: 'size',
    lengths: 'length',
    styles: 'style',
    specifications: 'specifications',
    capacities: 'capacity',
    materials: 'material',
  };
  return map[pluralType] || pluralType;
};

export default function ProductId() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [notifyOptionId, setNotifyOptionId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<{ id: number; name: string; price?: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ id: number; name: string; code?: string; price?: number; image?: string } | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<number, { id: number; name: string; price?: number }>>({});
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [isliked, setisliked] = useState<boolean>(false);
  const [isinbusked, setisinbusked] = useState<boolean>(false);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');
  const [showVideo, setShowVideo] = useState(false);

  // CJ Variant seçimləri - yeni API strukturu üçün
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, string>>({});
  const [selectedDerivedSize, setSelectedDerivedSize] = useState<string | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const similarScrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const defaultsInitializedRef = useRef<number | null>(null); // ✅ Track initialized product ID

  // Lightbox swipe/drag üçün
  const [lightboxDragStart, setLightboxDragStart] = useState<number | null>(null);
  const [lightboxDragOffset, setLightboxDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Main image swipe üçün (mobil)
  const [mainSwipeStart, setMainSwipeStart] = useState<number | null>(null);
  const [mainSwipeOffset, setMainSwipeOffset] = useState(0);
  const [isMainSwiping, setIsMainSwiping] = useState(false);

  const { lang = 'az', slug } = useParams<{ lang: string; slug: string }>();
  const userStr = localStorage.getItem('user-info');
  const parse = userStr ? JSON.parse(userStr) : null;
  const token = parse?.token;
  const collectionId = localStorage.getItem('collection_id') || '';

  // Slug ya da ID-dən məhsul tapa bilərik
  const productParam = slug; // Burada ID da ola bilərik

  // İlk olaraq /productSingle cəhd et, əgər olmadısa /products/:id cəhd et
  const { data: Productslingle, isLoading: ProductslingleLoading } = GETRequest<ProductDetail>(
    `/productSingle/${productParam}`, 
    'productSingle', 
    [lang, productParam]
  );
  const { data: seoProduct } = GETRequest<SeoApiResponse>(
    `/seo/product/${productParam}`,
    'seo-product',
    [lang, productParam]
  );
  const { data: tarnslation, isLoading: tarnslationLoading } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);
  const { data: favorites } = GETRequest<Favorite[]>(`/favorites`, 'favorites', [lang]);
  const { data: basked } = GETRequest<Basket>(`/basket_items`, 'basket_items', [lang]);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const productVideo = useMemo(() => {
    return getVideoUrl(Productslingle?.video);
  }, [Productslingle?.video]);

  const productImages = useMemo(() => {
    const images: string[] = [];
    const addedFileNames = new Set<string>();
    
    // Fayl adını çıxar - güclü deduplikasiya
    const getFileName = (url: string): string => {
      if (!url) return '';
      // Query params sil
      const cleanUrl = url.split('?')[0];
      // Son slash-ları sil
      const trimmed = cleanUrl.replace(/\/+$/, '');
      // Fayl adını al
      const parts = trimmed.split('/');
      const fileName = parts[parts.length - 1] || '';
      // Extension-sız fayl adı (bəzi şəkillər .jpg, bəziləri .jpeg ola bilər)
      const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toLowerCase();
      return nameWithoutExt;
    };
    
    const addImage = (img: string | null | undefined) => {
      if (!img) return;
      if (!img.startsWith('http') && !img.startsWith('/storage/')) return;
      if (img.includes('placeholder')) return;
      
      const fileName = getFileName(img);
      
      // Çox qısa və ya boş fayl adlarını keç
      if (!fileName || fileName.length < 3) return;
      
      // Artıq əlavə edilib?
      if (addedFileNames.has(fileName)) return;
      
      addedFileNames.add(fileName);
      images.push(img);
    };
    
    if (Productslingle) {
      // Əsas şəkil
      addImage(Productslingle.image);
      
      // Slider şəkilləri
      if (Productslingle.sliders && Array.isArray(Productslingle.sliders)) {
        Productslingle.sliders.forEach(item => addImage(item?.image));
      }
      
      // Variant şəkilləri
      if (Productslingle.variants && Array.isArray(Productslingle.variants)) {
        Productslingle.variants.forEach(v => addImage(v?.image));
      }
      
      // Thumbnail (əgər heç şəkil yoxdursa)
      if (images.length === 0 && Productslingle.thumbnail) {
        addImage(Productslingle.thumbnail);
      }
      
      // Description-dan şəkilləri ƏLAVƏ ETMƏ - çox təkrar olur
      // Bu hissə silinib
    }
    
    if (images.length === 0) images.push('/placeholder.png');
    return images;
  }, [Productslingle]);

  const safeImageIndex = useMemo(() => {
    if (selectedImageIndex >= productImages.length) return 0;
    if (selectedImageIndex < 0) return 0;
    return selectedImageIndex;
  }, [selectedImageIndex, productImages.length]);

  const { sizeFilter, colorFilter, otherFilters } = useMemo(() => {
    const filters = Productslingle?.filters || [];
    
    const getUniqueOptions = (options: any[] | undefined) => {
      if (!options) return [];
      const seen = new Map();
      return options.filter(opt => {
        if (!opt) return false;
        const key = opt.option_id || opt.name;
        if (seen.has(key)) return false;
        seen.set(key, true);
        return true;
      });
    };

    const rawSizeFilter = filters.find(f => f?.filter_name && ['Size', 'Ölçü'].includes(f.filter_name));
    const rawColorFilter = filters.find(f => f?.filter_name && ['Color', 'Rəng'].includes(f.filter_name));
    const rawOtherFilters = filters.filter(f => f?.filter_name && !['Size', 'Ölçü', 'Color', 'Rəng'].includes(f.filter_name));

    return {
      sizeFilter: rawSizeFilter ? { ...rawSizeFilter, options: getUniqueOptions(rawSizeFilter.options) } : undefined,
      colorFilter: rawColorFilter ? { ...rawColorFilter, options: getUniqueOptions(rawColorFilter.options) } : undefined,
      otherFilters: rawOtherFilters.map(f => ({ ...f, options: getUniqueOptions(f?.options) }))
    };
  }, [Productslingle?.filters]);

  // Variant key-lərdən ölçüləri çıxar (variant_options-da sizes olmayanda)
  // Məs: "Khaki-37yards" -> "37yards", "Bright black-22mm" -> "22mm"
  const derivedSizesFromVariants = useMemo(() => {
    if (!Productslingle?.variant_options || !Productslingle?.variants?.length) return [];
    // Əgər variant_options-da artıq sizes varsa, derive etmə
    if (Productslingle.variant_options.sizes) return [];
    // Əgər filter-based size varsa, derive etmə
    if (sizeFilter?.options?.length) return [];

    const colorValues = (Productslingle.variant_options.colors || []).map(
      (c: { value: string }) => c.value.toLowerCase()
    );
    if (colorValues.length === 0) return [];

    const sizeSet = new Set<string>();
    Productslingle.variants.forEach(v => {
      if (!v?.variantKey) return;
      const parts = v.variantKey.split(/[-]/);
      // Rəng hissəsini çıxar, qalan ölçüdür
      const nonColorParts = parts.filter(
        p => !colorValues.some(c => c === p.toLowerCase().trim())
      );
      if (nonColorParts.length > 0) {
        sizeSet.add(nonColorParts.join('-').trim());
      }
    });

    return Array.from(sizeSet);
  }, [Productslingle?.variant_options, Productslingle?.variants, sizeFilter?.options?.length]);

  useEffect(() => {
    if (Productslingle?.id) {
      axios.get(`${API_URL}/api/more-products/${Productslingle.id}`, { headers: { 'Accept-Language': lang } })
        .then(res => { if (Array.isArray(res.data)) setSimilarProducts(res.data.filter(p => p && p.id)); })
        .catch(() => setSimilarProducts([]));
    }
  }, [Productslingle?.id, lang]);

  // ✅ Default seçimləri yalnız ID dəyişəndə et - filter-lər hazır olandan sonra
  useEffect(() => {
    if (!Productslingle?.id) return;
    if (defaultsInitializedRef.current === Productslingle.id) return;

    defaultsInitializedRef.current = Productslingle.id;
    
    // Size filter varsa, default seç
    if (sizeFilter && sizeFilter.options?.length) {
      const def = sizeFilter.options.find(o => o?.is_default && o?.is_stock) || sizeFilter.options.find(o => o?.is_stock) || sizeFilter.options[0];
      if (def) {
        setSelectedSize({ id: def.option_id, name: def.name || 'Unknown', price: def.price ? Number(def.price) : undefined }); 
        setIsInStock(!!def.is_stock); 
      }
    } else {
      setSelectedSize(null);
      setIsInStock(Productslingle?.is_stock !== false);
    }

    // Color filter
    if (colorFilter?.options?.length) {
      const defColor = colorFilter.options.find(o => o?.is_default) || colorFilter.options[0];
      if (defColor) {
        // Variant şəklini tap
        const variant = Productslingle?.variants?.find(v => 
          v?.color?.toLowerCase() === defColor.name?.toLowerCase() || 
          v?.variantKey?.toLowerCase().includes(defColor.name?.toLowerCase() || '')
        );
        const variantImage = variant?.image || null;
        const variantPrice = variant?.price;
        
        setSelectedColor({ 
          id: defColor.option_id, 
          name: defColor.name || '', 
          code: defColor.color_code || undefined,
          price: variantPrice,
          image: variantImage || undefined
        });
      }
    }

    // Digər filtrlər üçün default seçimlər
    if (otherFilters?.length) {
      const newSelectedFilters: Record<number, { id: number; name: string; price?: number }> = {};
      otherFilters.forEach(filter => {
        if (filter?.options?.length) {
          const defOpt = filter.options.find(o => o?.is_default === '1' || o?.is_default === true) || filter.options[0];
          if (defOpt) {
            newSelectedFilters[filter.filter_id] = {
              id: defOpt.option_id,
              name: defOpt.name || 'Unknown',
              price: defOpt.price ? Number(defOpt.price) : undefined
            };
          }
        }
      });
      setSelectedFilters(newSelectedFilters);
    }

    // CJ variant_options üçün default seçimlər
    if (Productslingle?.variant_options) {
      const defaults: Record<string, string> = {};
      Object.entries(Productslingle.variant_options).forEach(([optionType, options]) => {
        if (options && options.length > 0) {
          const singularType = getSingularOptionType(optionType);
          defaults[singularType] = options[0].value;
        }
      });
      if (Object.keys(defaults).length > 0) {
        setSelectedVariantOptions(defaults);
      }
    }

    // Derived size default (variant key-lərdən çıxarılan ölçülər)
    if (derivedSizesFromVariants.length > 0) {
      setSelectedDerivedSize(derivedSizesFromVariants[0]);
    } else {
      setSelectedDerivedSize(null);
    }
  }, [Productslingle?.id]);

  useEffect(() => { setisliked(favorites?.some(item => item?.product?.id === Productslingle?.id) || false); }, [favorites, Productslingle?.id]);

  // CJ variant seçimləri eyni mi? - key-value müqayisəsi
  const areOptionsEqual = useCallback((current: Record<string, string>, saved: Record<string, string> | undefined): boolean => {
    if (!saved) return false;
    const currentKeys = Object.keys(current).sort();
    const savedKeys = Object.keys(saved).sort();
    if (currentKeys.length !== savedKeys.length) return false;
    return currentKeys.every(key =>
      String(current[key] || '').toLowerCase() === String(saved[key] || '').toLowerCase()
    );
  }, []);

  // Cari variant səbətdə var mı? - CJ variantlar və rəng/ölçü dəstəyi
  useEffect(() => {
    if (!Productslingle) { setisinbusked(false); return; }

    // CJ variant məhsullar üçün
    if (Productslingle.variant_options && Object.keys(selectedVariantOptions).length > 0) {
      if (!userStr) {
        const cart = getGuestCart();
        const found = cart.basket_items.some(ci => {
          if (ci?.id !== Productslingle.id) return false;
          return areOptionsEqual(selectedVariantOptions, (ci as any).selected_options);
        });
        setisinbusked(found);
      } else if (basked?.basket_items) {
        const found = basked.basket_items.some(item => {
          if (item?.product?.id !== Productslingle.id) return false;
          return areOptionsEqual(selectedVariantOptions, (item as any).selected_options);
        });
        setisinbusked(found);
      }
      return;
    }

    // Adi məhsullar üçün (size/color filter ilə)
    if (!selectedSize && !selectedColor) { setisinbusked(false); return; }

    if (!userStr) {
      const cart = getGuestCart();
      const found = cart.basket_items.some(ci => {
        if (ci?.id !== Productslingle.id) return false;
        const sizeMatch = !selectedSize || selectedSize.id === 0 ||
          ci.options?.some(o => String((o as any)?.option_id || o?.option) === String(selectedSize.id));
        const colorMatch = !selectedColor || selectedColor.id === 0 ||
          ci.options?.some(o => String((o as any)?.option_id || o?.option) === String(selectedColor.id));
        return sizeMatch && colorMatch;
      });
      setisinbusked(found);
    } else if (basked?.basket_items) {
      const found = basked.basket_items.some(item => {
        if (item?.product?.id !== Productslingle.id) return false;
        const sizeMatch = !selectedSize || selectedSize.id === 0 ||
          item.options?.some((opt: any) => String(opt?.option_id || opt?.option) === String(selectedSize.id));
        const colorMatch = !selectedColor || selectedColor.id === 0 ||
          item.options?.some((opt: any) => String(opt?.option_id || opt?.option) === String(selectedColor.id));
        return sizeMatch && colorMatch;
      });
      setisinbusked(found);
    }
  }, [basked, Productslingle, selectedSize, selectedColor, selectedVariantOptions, userStr, areOptionsEqual]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setShowVideo(false);
    // NOT: setSelectedVariantOptions({}) buradan silindi - defaults useEffect artıq bunu idarə edir
  }, [Productslingle?.id]);

  // Şəkilləri əvvəlcədən yüklə (preload)
  useEffect(() => {
    if (productImages.length > 0) {
      // İlk 3 şəkili preload et
      productImages.slice(0, 3).forEach((img, idx) => {
        const link = document.createElement('link');
        link.rel = idx === 0 ? 'preload' : 'prefetch';
        link.as = 'image';
        link.href = getImageUrl(img);
        // Dublikat yoxla
        if (!document.querySelector(`link[href="${link.href}"]`)) {
          document.head.appendChild(link);
        }
      });
    }
  }, [productImages]);

  useEffect(() => {
    if (!showVideo && videoRef.current) {
      videoRef.current.pause();
    }
  }, [showVideo]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    setZoomPosition({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }, []);

  const scrollSimilar = useCallback((dir: 'left' | 'right') => {
    similarScrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  }, []);

  // Lightbox navigation
  const goToNextLightboxImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev + 1) % productImages.length);
  }, [productImages.length]);

  const goToPrevLightboxImage = useCallback(() => {
    setSelectedImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
  }, [productImages.length]);

  // Lightbox touch handlers
  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    setLightboxDragStart(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleLightboxTouchMove = useCallback((e: React.TouchEvent) => {
    if (lightboxDragStart === null) return;
    const currentX = e.touches[0].clientX;
    setLightboxDragOffset(currentX - lightboxDragStart);
  }, [lightboxDragStart]);

  const handleLightboxTouchEnd = useCallback(() => {
    if (lightboxDragStart === null) return;
    const threshold = 50;
    if (lightboxDragOffset > threshold) {
      goToPrevLightboxImage();
    } else if (lightboxDragOffset < -threshold) {
      goToNextLightboxImage();
    }
    setLightboxDragStart(null);
    setLightboxDragOffset(0);
    setIsDragging(false);
  }, [lightboxDragStart, lightboxDragOffset, goToPrevLightboxImage, goToNextLightboxImage]);

  // Lightbox mouse handlers (desktop drag)
  const handleLightboxMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setLightboxDragStart(e.clientX);
    setIsDragging(true);
  }, []);

  const handleLightboxMouseMove = useCallback((e: React.MouseEvent) => {
    if (lightboxDragStart === null || !isDragging) return;
    const currentX = e.clientX;
    setLightboxDragOffset(currentX - lightboxDragStart);
  }, [lightboxDragStart, isDragging]);

  const handleLightboxMouseUp = useCallback(() => {
    if (lightboxDragStart === null) return;
    const threshold = 50;
    if (lightboxDragOffset > threshold) {
      goToPrevLightboxImage();
    } else if (lightboxDragOffset < -threshold) {
      goToNextLightboxImage();
    }
    setLightboxDragStart(null);
    setLightboxDragOffset(0);
    setIsDragging(false);
  }, [lightboxDragStart, lightboxDragOffset, goToPrevLightboxImage, goToNextLightboxImage]);

  const handleLightboxMouseLeave = useCallback(() => {
    if (isDragging) {
      setLightboxDragStart(null);
      setLightboxDragOffset(0);
      setIsDragging(false);
    }
  }, [isDragging]);

  // Main image swipe handlers (mobil üçün)
  const handleMainTouchStart = useCallback((e: React.TouchEvent) => {
    setMainSwipeStart(e.touches[0].clientX);
    setIsMainSwiping(true);
  }, []);

  const handleMainTouchMove = useCallback((e: React.TouchEvent) => {
    if (mainSwipeStart === null) return;
    const currentX = e.touches[0].clientX;
    const offset = currentX - mainSwipeStart;
    setMainSwipeOffset(offset);
  }, [mainSwipeStart]);

  const handleMainTouchEnd = useCallback(() => {
    if (mainSwipeStart === null) return;
    const threshold = 50; // 50px swipe threshold
    if (mainSwipeOffset > threshold && productImages.length > 1) {
      // Sağa swipe - əvvəlki şəkil
      setSelectedImageIndex(prev => (prev - 1 + productImages.length) % productImages.length);
      setShowVideo(false);
    } else if (mainSwipeOffset < -threshold && productImages.length > 1) {
      // Sola swipe - növbəti şəkil
      setSelectedImageIndex(prev => (prev + 1) % productImages.length);
      setShowVideo(false);
    }
    setMainSwipeStart(null);
    setMainSwipeOffset(0);
    setIsMainSwiping(false);
  }, [mainSwipeStart, mainSwipeOffset, productImages.length]);

  const handleSizeSelect = useCallback((option: any) => {
    if (!option) return;
    setSelectedSize({ id: option.option_id, name: option.name || 'Unknown', price: option.price ? Number(option.price) : undefined });
    setIsInStock(!!option.is_stock);
    if (!option.is_stock) setNotifyOptionId(option.option_id);
  }, []);

  const handleColorSelect = useCallback((option: any, variantPrice?: number, variantImage?: string | null) => {
    if (!option) return;
    setSelectedColor({ id: option.option_id, name: option.name || '', code: option.color_code || undefined, price: variantPrice, image: variantImage || undefined });
    if (variantImage && productImages.length > 0) {
      const normalizedVariant = variantImage.split('?')[0].replace(/\/+$/, '').toLowerCase();
      const imgIdx = productImages.findIndex(img => {
        const normalizedImg = img.split('?')[0].replace(/\/+$/, '').toLowerCase();
        return normalizedImg === normalizedVariant || normalizedImg.includes(normalizedVariant.split('/').pop() || '___');
      });
      if (imgIdx >= 0 && imgIdx < productImages.length) {
        setSelectedImageIndex(imgIdx);
        setShowVideo(false);
      }
    }
  }, [productImages]);

  // CJ variant_options varsa, seçilmiş variantı tap - handleAddToBasket-dan əvvəl olmalıdır
  const selectedCJVariant = useMemo(() => {
    if (!Productslingle?.variant_options || !Productslingle?.variants?.length) return null;
    if (Object.keys(selectedVariantOptions).length === 0) return null;

    const selectedValues = Object.values(selectedVariantOptions).filter(Boolean);
    if (selectedValues.length === 0) return null;

    // Filter ölçüsünü yalnız variant_options-da sizes OLMAYANDA nəzərə al
    // (hybrid məhsullar: CJ colors + filter sizes)
    const filterSizeName = (!Productslingle.variant_options?.sizes && selectedSize?.name) || null;
    // Derived size (variant key-lərdən çıxarılan ölçü)
    const derivedSize = selectedDerivedSize || null;
    const extraSize = derivedSize || filterSizeName;
    const allMatchValues = extraSize ? [...selectedValues, extraSize] : selectedValues;

    // variantKey hissələrini müqayisə edən helper
    const nameMatchesParts = (name: string, parts: string[]): boolean => {
      const n = name.toLowerCase();
      if (parts.includes(n)) return true;
      if (n.length >= 3) return parts.some(p => p.includes(n) || n.includes(p));
      return false;
    };

    // 1. Əvvəlcə direct property match cəhd et (case-insensitive) + filter ölçüsü
    let matched = Productslingle.variants.find(v => {
      const optionMatch = Object.entries(selectedVariantOptions).every(([key, value]) => {
        if (!value) return true;
        const variantValue = v[key as keyof typeof v];
        if (typeof variantValue === 'string' && typeof value === 'string') {
          return variantValue.toLowerCase() === value.toLowerCase();
        }
        return variantValue === value;
      });
      if (!optionMatch) return false;
      // Ölçü (derived və ya filter) varsa, variantKey-də yoxla
      if (extraSize && v.variantKey) {
        const parts = v.variantKey.toLowerCase().split(/[-_/\s]+/).map(s => s.trim()).filter(Boolean);
        return nameMatchesParts(extraSize, parts);
      }
      return true;
    });

    // 2. Tapılmadısa, variantKey ilə match cəhd et (bütün dəyərlər + filter ölçüsü)
    if (!matched) {
      matched = Productslingle.variants.find(v => {
        if (!v?.variantKey) return false;
        const parts = v.variantKey.toLowerCase().split(/[-_/\s]+/).map(s => s.trim()).filter(Boolean);
        return allMatchValues.every(val => nameMatchesParts(val, parts));
      });
    }

    // 3. Hələ də tapılmadısa, partial match cəhd et (ən çox uyğun gələni tap)
    if (!matched && allMatchValues.length > 0) {
      let bestMatch: typeof Productslingle.variants[0] | null = null;
      let bestMatchCount = 0;

      Productslingle.variants.forEach(v => {
        if (!v?.variantKey) return;
        const parts = v.variantKey.toLowerCase().split(/[-_/\s]+/).map(s => s.trim()).filter(Boolean);
        const matchCount = allMatchValues.filter(val => nameMatchesParts(val, parts)).length;
        if (matchCount > bestMatchCount) {
          bestMatchCount = matchCount;
          bestMatch = v;
        }
      });

      if (bestMatch && bestMatchCount > 0) {
        matched = bestMatch;
      }
    }

    return matched || null;
  }, [Productslingle?.variant_options, Productslingle?.variants, selectedVariantOptions, selectedSize?.name, selectedDerivedSize]);

  const handleAddToBasket = useCallback(async () => {
    if (!Productslingle) { toast.error('Məhsul tapılmadı'); return; }

    // CJ variant_options varsa və seçim tamamlanmayıbsa
    if (Productslingle.variant_options) {
      const requiredOptions = Object.keys(Productslingle.variant_options);
      const missingOptions = requiredOptions.filter(opt => {
        const singularType = getSingularOptionType(opt);
        return !selectedVariantOptions[singularType];
      });
      if (missingOptions.length > 0) {
        toast.error(tarnslation?.variant_secin || 'Zəhmət olmasa variant seçin');
        return;
      }
      // CJ variant stokda yoxdursa
      if (selectedCJVariant && selectedCJVariant.in_stock === false) {
        toast.error(tarnslation?.stokda_yoxdur || 'Bu variant stokda yoxdur');
        return;
      }
    }

    // Size filter varsa, seçilməlidir
    if (sizeFilter && sizeFilter.options?.length && !selectedSize) {
      toast.error(tarnslation?.olcu_secin_title || 'Ölçü seçin');
      return;
    }
    if (isAddingToCart) return; // isinbusked yoxlamasını sildim - fərqli variantlar əlavə oluna bilsin
    if (selectedSize && selectedSize.id !== 0) {
      const sizeOpt = sizeFilter?.options?.find(o => o?.option_id === selectedSize.id);
      if (sizeOpt && !sizeOpt.is_stock) { toast.error(tarnslation?.bu_olcude_stokda_yox || 'Bu ölçü stokda yoxdur'); return; }
    }
    setIsAddingToCart(true);

    // Bütün seçilmiş filtrləri topla
    const options: { filter_id: number; option_id: number }[] = [];

    // CJ variant məhsulları üçün options array-ı BOŞ saxla
    // (çünki CJ sistemində filter_id və option_id yoxdur, yalnız selected_options var)
    if (!Productslingle.variant_options) {
      // Adi filter sistemi
      // Size filter
      if (sizeFilter && selectedSize && selectedSize.id !== 0) {
        options.push({ filter_id: sizeFilter.filter_id, option_id: selectedSize.id });
      }

      // Color filter - ƏHƏMİYYƏTLİ: rəng də options-a əlavə olunmalıdır
      if (colorFilter && selectedColor && selectedColor.id !== 0) {
        options.push({ filter_id: colorFilter.filter_id, option_id: selectedColor.id });
      }
      
      // Digər filtrlər (Style, Material və s.)
      Object.entries(selectedFilters).forEach(([filterId, selected]) => {
        if (selected && selected.id) {
          options.push({ filter_id: Number(filterId), option_id: selected.id });
        }
      });
    } else {
    }

    // CJ variant_key və selected_options hazırla - DƏRİN KOPYA et!
    const variantKey = selectedCJVariant?.variantKey || null;
    const cjSelectedOptions = Object.keys(selectedVariantOptions).length > 0
      ? JSON.parse(JSON.stringify(selectedVariantOptions))
      : null;
    // Derived size-ı da selected options-a əlavə et (səbətdə fərqləndirmək üçün)
    if (cjSelectedOptions && selectedDerivedSize) {
      cjSelectedOptions._derivedSize = selectedDerivedSize;
    }

    // Qiyməti müəyyən et - CJ variant qiymətinə endirimi tətbiq et
    let finalPrice = Number(Productslingle.discounted_price) || Number(Productslingle.price) || 0;

    if (selectedCJVariant?.price) {
      const variantPrice = Number(selectedCJVariant.price);
      const baseDiscountedPrice = Number(Productslingle.discounted_price) || 0;
      const variants = Productslingle.variants || [];
      const variantPrices = variants.filter(v => v?.price != null && v?.in_stock !== false).map(v => Number(v.price));
      const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : null;

      if (baseDiscountedPrice && minVariantPrice) {
        // displayPrice ilə eyni formula: discounted_price + (variant - min)
        finalPrice = baseDiscountedPrice + (variantPrice - minVariantPrice);
      } else {
        finalPrice = variantPrice;
      }
    }

    if (!userStr) {
      try {
        const cart = getGuestCart();
        const idx = cart.basket_items.findIndex(i => {
          if (i?.id !== Productslingle.id) return false;

          // CJ variant məhsulları üçün - selected_options key-value müqayisəsi
          if (cjSelectedOptions) {
            const savedOptions = (i as any).selected_options;
            if (!savedOptions) return false;

            // Hər key-value cütünü müqayisə et
            const currentKeys = Object.keys(cjSelectedOptions).sort();
            const savedKeys = Object.keys(savedOptions).sort();

            // Key sayı fərqlidirsə - fərqli variant
            if (currentKeys.length !== savedKeys.length) return false;

            // Hər key və value-nu yoxla
            return currentKeys.every(key => {
              const currentVal = String(cjSelectedOptions[key] || '').toLowerCase();
              const savedVal = String(savedOptions[key] || '').toLowerCase();
              return currentVal === savedVal;
            });
          }

          // Seçim yoxdursa
          if (options.length === 0) return !i.options || i.options.length === 0;
          // Options sayı fərqlidirsə, fərqli məhsuldur
          if (i.options?.length !== options.length) return false;
          // TAMAMILƏ eyni option_id-lərlə məhsul varmı? - iki tərəfli müqayisə
          const currentOptionIds = options.map(o => String(o.option_id)).sort();
          const savedOptionIds = (i.options || []).map((o: any) => String(o?.option_id || o?.option)).sort();
          // Hər iki array tam eyni olmalıdır
          if (currentOptionIds.length !== savedOptionIds.length) return false;
          return currentOptionIds.every((id, idx) => id === savedOptionIds[idx]);
        });
        if (idx === -1) {
          // Seçilmiş variantın şəklini al (CJ variant və ya rəng variantı)
          const selectedImage = selectedCJVariant?.image || selectedColor?.image || Productslingle.image;

          // Product-u kopyala və seçilmiş şəkillə yenilə
          const productWithSelectedImage = {
            ...Productslingle,
            image: selectedImage
          };

          // Options-u adlarla birlikdə saxla (səbətdə göstərmək üçün)
          const optionsWithNames = options.map(o => {
            let filterName = String(o.filter_id);
            let optionName = String(o.option_id);

            // Size filter
            if (sizeFilter && o.filter_id === sizeFilter.filter_id) {
              filterName = sizeFilter.filter_name || tarnslation?.Ölçü || 'Ölçü';
              const sizeOpt = sizeFilter.options?.find(opt => opt.option_id === o.option_id);
              optionName = sizeOpt?.name || String(o.option_id);
            }
            // Color filter
            else if (colorFilter && o.filter_id === colorFilter.filter_id) {
              filterName = colorFilter.filter_name || tarnslation?.Rəng || 'Rəng';
              optionName = selectedColor?.name || String(o.option_id);
            }
            // Other filters
            else {
              const otherFilter = otherFilters?.find(f => f.filter_id === o.filter_id);
              if (otherFilter) {
                filterName = otherFilter.filter_name || String(o.filter_id);
                const opt = otherFilter.options?.find(opt => opt.option_id === o.option_id);
                optionName = opt?.name || String(o.option_id);
              }
            }

            return { filter: filterName, option: optionName, filter_id: o.filter_id, option_id: o.option_id };
          });

          const cartItem: any = {
            id: Productslingle.id,
            product: productWithSelectedImage,
            quantity,
            price: finalPrice.toFixed(2),
            options: optionsWithNames
          };
          if (variantKey) cartItem.variant_key = variantKey;
          if (cjSelectedOptions) cartItem.selected_options = cjSelectedOptions;
          if (selectedImage) cartItem.selected_image = selectedImage;
          cart.basket_items.push(cartItem);
        } else { cart.basket_items[idx].quantity += quantity; }
        let total = 0, discount = 0, final = 0;
        cart.basket_items.forEach(i => {
          const orig = Number(i?.product?.price) || 0;
          const disc = Number(i?.price) || Number(i?.product?.discounted_price) || orig;
          total += orig * (i?.quantity || 1);
          discount += (orig - disc) * (i?.quantity || 1);
          final += disc * (i?.quantity || 1);
        });
        cart.total_price = total; cart.discount = discount; cart.final_price = final;
        setGuestCart(cart);
        // Event dispatch et ki, Header səbəti yeniləsin
        window.dispatchEvent(new Event('guest_cart_updated'));
        setisinbusked(true);
        toast.success(tarnslation?.mehsul_added ?? 'Əlavə edildi');
      } catch { toast.error('Xəta baş verdi'); }
      finally { setIsAddingToCart(false); }
      return;
    }

    try {
      // Seçilmiş variantın şəklini al
      const selectedImage = selectedCJVariant?.image || selectedColor?.image || Productslingle?.image || null;

      const payload: any = {
        product_id: Productslingle.id,
        quantity,
        price: finalPrice,
        options,
        selected_image: selectedImage // ✅ Həmişə göndər
      };
      // CJ variant məlumatlarını əlavə et
      if (variantKey) payload.variant_key = variantKey;
      if (cjSelectedOptions) payload.selected_options = cjSelectedOptions;
      if (collectionId?.length) payload.collection_id = collectionId;

      await axios.post(`${API_URL}/api/basket_items`, payload, { headers: { Authorization: `Bearer ${token}`, 'Accept-Language': lang } });
      
      if (collectionId) localStorage.removeItem('collection_id');
      setisinbusked(true);
      toast.success(tarnslation?.handle_added || 'Əlavə edildi');
      queryClient.invalidateQueries({ queryKey: ['basket_items'] });
      // Event dispatch et ki, bütün komponentlər yeniləsin
      window.dispatchEvent(new Event('basket_items_updated'));
    } catch { toast.error('Xəta'); }
    finally { setIsAddingToCart(false); }
  }, [Productslingle, selectedSize, selectedFilters, sizeFilter, colorFilter, otherFilters, quantity, userStr, token, lang, collectionId, tarnslation, queryClient, isAddingToCart, isinbusked, selectedCJVariant, selectedVariantOptions, selectedColor, selectedDerivedSize]);

  const handleNotifyMe = useCallback(async () => {
    if (!notifyOptionId || !Productslingle?.id) return;
    try {
      await axiosInstance.post('/notify-me', { product_id: Productslingle.id, option_id: notifyOptionId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(tarnslation?.Notification_is_success ?? 'Bildiriş qeydə alındı');
      setIsModalOpen(false);
    } catch { toast.error(tarnslation?.Notification_is_Error ?? 'Xəta'); }
  }, [notifyOptionId, Productslingle?.id, token, tarnslation]);

  const toggleFavorite = useCallback(async () => {
    if (!userStr) return navigate(`/${lang}/${ROUTES.login[lang as keyof typeof ROUTES.login]}`);
    if (isTogglingFavorite || !Productslingle?.id) return;
    setIsTogglingFavorite(true);
    try {
      await axiosInstance.post('/favorites/toggleFavorite', { product_id: Productslingle.id }, { headers: { Authorization: `Bearer ${token}` } });
      setisliked(prev => !prev);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      window.dispatchEvent(new Event('favorites_updated'));
    } catch { }
    finally { setIsTogglingFavorite(false); }
  }, [userStr, lang, navigate, Productslingle?.id, token, queryClient, isTogglingFavorite]);

  // Variants massivindən kombinasiya qiymətini tap - HOOK MUST BE BEFORE EARLY RETURN
  // Ölçü, rəng və digər filtrləri birlikdə nəzərə alır
  // variantKey hissələrə bölünür (məs. "Blue-S" → ["blue","s"]) və dəqiq müqayisə edilir
  const getVariantPrice = useMemo(() => {
    if (!Productslingle?.variants?.length) return null;

    // Bütün seçilmiş adları topla: ölçü + rəng + digər filtrlər
    const allSelectedNames: string[] = [];
    if (selectedSize?.name) allSelectedNames.push(selectedSize.name);
    if (selectedColor?.name) allSelectedNames.push(selectedColor.name);
    Object.values(selectedFilters).forEach(f => {
      if (f?.name) allSelectedNames.push(f.name);
    });

    if (allSelectedNames.length === 0) return null;

    // variantKey-i hissələrə böl (delimiterlər: "-", "_", "/", " ")
    const splitKey = (key: string): string[] =>
      key.toLowerCase().split(/[-_/\s]+/).map(s => s.trim()).filter(Boolean);

    // Adın variantKey hissələrindən birində DƏQIQ olub-olmadığını yoxla
    const nameMatchesParts = (name: string, parts: string[]): boolean => {
      const n = name.toLowerCase();
      // Dəqiq uyğunluq: "S" === "s", "Blue" === "blue"
      if (parts.includes(n)) return true;
      // Uzun adlar üçün (2+ hərf): hissənin daxilində axtara bilərik
      if (n.length >= 3) {
        return parts.some(p => p.includes(n) || n.includes(p));
      }
      return false;
    };

    // 1. Əvvəlcə BÜTÜN seçilmiş adları variantKey-də dəqiq axtar
    const fullMatch = Productslingle.variants.find(v => {
      if (!v?.variantKey) return false;
      const parts = splitKey(v.variantKey);
      return allSelectedNames.every(name => nameMatchesParts(name, parts));
    });
    if (fullMatch?.price) return Number(fullMatch.price);

    // 2. Alternativ: variant-ın öz field-lərini yoxla (size, color field-ləri)
    const fieldMatch = Productslingle.variants.find(v => {
      if (!v) return false;
      let matches = true;
      if (selectedSize?.name) {
        matches = matches && (v.size?.toLowerCase() === selectedSize.name.toLowerCase());
      }
      if (selectedColor?.name) {
        matches = matches && (v.color?.toLowerCase() === selectedColor.name.toLowerCase());
      }
      return matches && (!!selectedSize?.name || !!selectedColor?.name);
    });
    if (fieldMatch?.price) return Number(fieldMatch.price);

    // 3. Ölçü+rəng kombinasiyası ilə variantKey yoxla
    const sizeColorNames: string[] = [];
    if (selectedSize?.name) sizeColorNames.push(selectedSize.name);
    if (selectedColor?.name) sizeColorNames.push(selectedColor.name);
    if (sizeColorNames.length > 0) {
      const sizeColorMatch = Productslingle.variants.find(v => {
        if (!v?.variantKey) return false;
        const parts = splitKey(v.variantKey);
        return sizeColorNames.every(name => nameMatchesParts(name, parts));
      });
      if (sizeColorMatch?.price) return Number(sizeColorMatch.price);
    }

    return null;
  }, [Productslingle?.variants, selectedSize?.name, selectedColor?.name, selectedFilters]);

  // Mövcud variant opsiyalarını filtrələ - seçilmiş opsiyalara görə
  const getAvailableOptions = useCallback((optionType: string): string[] => {
    if (!Productslingle?.variants?.length) return [];

    // Digər seçilmiş opsiyalara uyğun variantları tap
    const filtered = Productslingle.variants.filter(v => {
      return Object.entries(selectedVariantOptions).every(([key, value]) => {
        if (key === optionType || !value) return true;
        const variantValue = v[key as keyof typeof v];
        return variantValue === value;
      });
    });

    // Bu tip üçün unikal dəyərləri çıxar
    const uniqueValues = [...new Set(
      filtered
        .map(v => v[optionType as keyof typeof v] as string)
        .filter(Boolean)
    )];
    return uniqueValues;
  }, [Productslingle?.variants, selectedVariantOptions]);

  // CJ variant seçimi handler
  const handleVariantOptionSelect = useCallback((optionType: string, value: string) => {
    setSelectedVariantOptions(prev => {
      const newSelected = { ...prev, [optionType]: value };

      // Eyni dəyərli digər option type-ları da sinxronizasiya et (size/capacity kimi)
      // Bu dublikat Ölçü/Həcm problemini həll edir
      const equivalentTypes: Record<string, string[]> = {
        size: ['capacity'],
        capacity: ['size'],
      };
      const equivTypes = equivalentTypes[optionType] || [];
      equivTypes.forEach(eqType => {
        // Eyni dəyər variantda mövcuddursa, onu da seç
        if (Productslingle?.variants?.some(v => {
          const eqValue = v[eqType as keyof typeof v];
          return typeof eqValue === 'string' && eqValue.toLowerCase() === value.toLowerCase();
        })) {
          newSelected[eqType] = value;
        }
      });

      // Şəkil dəyişdirmə - əgər color seçilibsə
      if (optionType === 'color' && Productslingle?.variants) {
        const variantWithImage = Productslingle.variants.find(v =>
          v.color === value && v.image
        );
        if (variantWithImage?.image) {
          const imgIdx = productImages.findIndex(img =>
            img.includes(variantWithImage.image?.split('/').pop() || '___')
          );
          if (imgIdx >= 0) {
            setSelectedImageIndex(imgIdx);
            setShowVideo(false);
          }
        }
      }

      return newSelected;
    });
  }, [Productslingle?.variants, productImages]);

  // Variant option label-lərini Azərbaycan dilinə çevir
  const getVariantOptionLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      colors: tarnslation?.Rəng || 'Rəng',
      sizes: tarnslation?.Ölçü || 'Ölçü',
      lengths: tarnslation?.Uzunluq || 'Uzunluq',
      styles: tarnslation?.Stil || 'Stil',
      specifications: tarnslation?.Xüsusiyyət || 'Xüsusiyyət',
      capacities: tarnslation?.Həcm || 'Həcm',
      materials: tarnslation?.Material || 'Material',
    };
    return labels[type] || type;
  }, [tarnslation]);

  // ✅ useMemo MUST be before early returns (Rules of Hooks)
  const sizeVariantPrice = useMemo(() => {
    if (!selectedSize?.name || !Productslingle?.variants?.length) return null;
    const sizeName = selectedSize.name.toLowerCase();
    // Əvvəlcə variant.size field-i ilə dəqiq match
    const fieldMatch = Productslingle.variants.find(v =>
      v?.size?.toLowerCase() === sizeName
    );
    if (fieldMatch?.price) return Number(fieldMatch.price);
    // Sonra variantKey-i hissələrə bölüb dəqiq match
    const keyMatch = Productslingle.variants.find(v => {
      if (!v?.variantKey) return false;
      const parts = v.variantKey.toLowerCase().split(/[-_/\s]+/);
      return parts.includes(sizeName);
    });
    return keyMatch?.price ? Number(keyMatch.price) : null;
  }, [selectedSize?.name, Productslingle?.variants]);

  if (ProductslingleLoading || tarnslationLoading) return <Loading />;

  if (!Productslingle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Məhsul tapılmadı</h1>
          <Link to={`/${lang}`} className="text-blue-600 hover:underline">Ana səhifəyə qayıt</Link>
        </div>
      </div>
    );
  }

  const cleanDescription = Productslingle.description?.replace(/<img[^>]*>/gi, '') || '';
  const filteredSimilar = similarProducts.filter(p => p && p.id && p.id !== Productslingle.id).slice(0, 15);
  const currentImage = productImages[safeImageIndex] || productImages[0] || '/placeholder.png';

  // CJ variant qiymətini prioritet ver
  const cjVariantPrice = selectedCJVariant?.price ? Number(selectedCJVariant.price) : null;

  // CJ variant sistemi aktivdirsə, discounted_price əsaslı qiymət göstər (kart ilə eyni olsun)
  // Ölçü/rəng dəyişəndə variant qiymət fərqi əlavə olunur
  const hasCJVariants = !!Productslingle.variant_options && Object.keys(selectedVariantOptions).length > 0;
  const displayPrice = (() => {
    if (hasCJVariants && Productslingle.variants?.length && Productslingle.discounted_price) {
      const baseDiscounted = Number(Productslingle.discounted_price);
      // Ən ucuz variant qiymətini tap (baza/default variant)
      const variantPrices = Productslingle.variants
        .filter(v => v?.price != null && v?.in_stock !== false)
        .map(v => Number(v.price));
      const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : null;
      const currentVariantPrice = cjVariantPrice || getVariantPrice || sizeVariantPrice || null;

      if (minVariantPrice && currentVariantPrice) {
        // discounted_price + (seçilmiş variant qiyməti - ən ucuz variant qiyməti)
        return baseDiscounted + (currentVariantPrice - minVariantPrice);
      }
      return baseDiscounted;
    }
    if (hasCJVariants) {
      return cjVariantPrice || getVariantPrice || sizeVariantPrice || selectedColor?.price || Number(Productslingle.discounted_price) || Number(Productslingle.price) || 0;
    }
    return getVariantPrice || sizeVariantPrice || selectedSize?.price || cjVariantPrice || selectedColor?.price || Number(Productslingle.discounted_price) || Number(Productslingle.price) || 0;
  })();
  const hasDiscount = Productslingle.discount && Number(Productslingle.discount) > 0;
  const cjVariantInStock = selectedCJVariant ? selectedCJVariant.in_stock !== false : true;

  return (
    <div className="bg-white min-h-screen">
      <SEO
        seoData={seoProduct?.data}
        title={`${Productslingle.meta_title || Productslingle.title || 'Product'} | Brendoo`}
        description={Productslingle.meta_description || Productslingle.short_title || ''}
        image={getImageUrl(currentImage)}
        url={`https://brendoo.com/${lang}/product/${productParam}`}
        type="product"
        price={String(displayPrice)}
        currency="AZN"
        availability={isInStock ? 'in stock' : 'out of stock'}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to={`/${lang}`} className="hover:text-blue-600">{tarnslation?.home || 'Home'}</Link>
          <span>/</span>
          <Link to={`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}`} className="hover:text-blue-600">{tarnslation?.Məhsullar || 'Products'}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]">{Productslingle.title || 'Product'}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          <div className="lg:w-1/2 flex flex-col notranslate" translate="no">
            <div className="relative mb-4">
              {showVideo && productVideo ? (
                <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                  <video ref={videoRef} src={productVideo} controls playsInline autoPlay className="w-full h-full object-contain" poster={getImageUrl(currentImage)}>
                    Brauzeriniz video dəstəkləmir.
                  </video>
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
                    <FiPlay className="w-4 h-4" />
                    Video
                  </div>
                </div>
              ) : (
                <div
                  ref={imageContainerRef}
                  className="relative bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in touch-pan-y"
                  style={{ aspectRatio: '1/1' }}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                  onClick={() => !isMainSwiping && setIsLightboxOpen(true)}
                  onTouchStart={handleMainTouchStart}
                  onTouchMove={handleMainTouchMove}
                  onTouchEnd={handleMainTouchEnd}
                >
                  <img
                    src={getImageUrl(currentImage)}
                    alt={Productslingle.title || 'Product'}
                    className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
                    style={{
                      ...(isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}),
                      transform: isMainSwiping ? `translateX(${mainSwipeOffset}px)` : undefined,
                      transition: isMainSwiping ? 'none' : 'transform 0.3s ease-out'
                    }}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    draggable={false}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                  
                  <div className="hidden sm:flex absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-gray-600 items-center gap-2 shadow-lg pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <span>{tarnslation?.zoom || 'Zoom'}</span>
                  </div>

                  {/* Mobil üçün swipe dots indikatoru */}
                  {productImages.length > 1 && (
                    <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                      {productImages.slice(0, 7).map((_, idx) => (
                        <button
                          key={`dot-${idx}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); setShowVideo(false); }}
                          className={`rounded-full transition-all ${
                            safeImageIndex === idx
                              ? 'w-2.5 h-2.5 bg-white'
                              : 'w-1.5 h-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                      {productImages.length > 7 && (
                        <span className="text-white/70 text-[10px] ml-0.5">+{productImages.length - 7}</span>
                      )}
                    </div>
                  )}

                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{Productslingle.discount}%
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={toggleFavorite} 
                disabled={isTogglingFavorite}
                className="absolute top-4 right-4 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition z-10"
              >
                <FiHeart className={`w-5 h-5 ${isliked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>

            </div>

            {/* THUMBNAIL SLIDER */}
            {(productImages.length > 1 || productVideo) && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* VIDEO THUMBNAIL - ƏN ƏVVƏLDƏ */}
                {productVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                      showVideo
                        ? 'border-red-500 shadow-md ring-2 ring-red-300'
                        : 'border-red-400 hover:border-red-500'
                    }`}
                  >
                    <img
                      src={getImageUrl(productImages[0])}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <FiPlay className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
                      </div>
                    </div>
                  </button>
                )}

                {productImages.map((img, idx) => (
                  <button
                    key={`thumb-${idx}`}
                    onClick={() => { setSelectedImageIndex(idx); setShowVideo(false); }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      !showVideo && safeImageIndex === idx
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/2">
            <H1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{Productslingle.title || 'Product'}</H1>
            <p className="text-sm text-gray-500 mb-4">SKU: {Productslingle.product_code || Productslingle.code || `PRD-${Productslingle.id}`}</p>

            <div className="flex items-baseline gap-3 mb-6 notranslate" translate="no" key={`price-${displayPrice}-${cjVariantPrice}-${selectedSize?.name}-${selectedColor?.name}-${selectedDerivedSize}`}>
              {(() => {
                const baseOriginalPrice = Number(Productslingle.price) || 0;

                if (hasDiscount && baseOriginalPrice > displayPrice) {
                  return (
                    <>
                      <span className="text-3xl font-bold text-blue-600">{Number(displayPrice).toFixed(2)}₼</span>
                      <span className="text-lg text-gray-400 line-through">{baseOriginalPrice.toFixed(2)}₼</span>
                    </>
                  );
                }
                return <span className="text-3xl font-bold text-gray-900">{Number(displayPrice).toFixed(2)}₼</span>;
              })()}
            </div>

            {/* Size Filter - yalnız varsa göstər, CJ sizes varsa gizlət */}
            {sizeFilter && sizeFilter.options && sizeFilter.options.length > 0 && !Productslingle.variant_options?.sizes && (
              <div className="mb-5 notranslate" translate="no">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">{tarnslation?.Ölçü || 'Ölçü'}</span>
                  <span className="text-sm text-gray-500">( {selectedSize?.name || ''} )</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeFilter.options.map((option) => option && (
                    <button
                      key={`size-${option.option_id}`}
                      onClick={() => handleSizeSelect(option)}
                      disabled={!option.is_stock}
                      className={`min-w-[48px] h-10 px-4 rounded-xl border text-sm font-medium transition ${
                        selectedSize?.id === option.option_id
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : option.is_stock
                            ? 'border-gray-300 hover:border-blue-400 text-gray-700'
                            : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {option.name || 'Unknown'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Filter - CJ colors varsa gizlət */}
            {colorFilter && colorFilter.options && colorFilter.options.length > 0 && !Productslingle.variant_options?.colors && (
              <div className="mb-5 notranslate" translate="no">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">{tarnslation?.Rəng || 'Rəng'}</span>
                  <span className="text-sm text-gray-500">( {selectedColor?.name || ''} )</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colorFilter.options.map((option) => {
                    if (!option) return null;
                    const variant = Productslingle.variants?.find(v => v?.color?.toLowerCase() === option.name?.toLowerCase() || v?.variantKey?.toLowerCase().includes(option.name?.toLowerCase() || ''));
                    const variantImage = variant?.image || null;
                    const variantPrice = variant?.price;
                    return (
                      <button 
                        key={`color-${option.option_id}`} 
                        onClick={() => handleColorSelect(option, variantPrice, variantImage)} 
                        title={option.name || ''}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${selectedColor?.id === option.option_id ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        {variantImage ? (
                          <img src={getImageUrl(variantImage)} alt={option.name || ''} className="w-full h-full object-cover" onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; if (t.parentElement) t.parentElement.style.backgroundColor = option.color_code || '#e5e7eb'; }} />
                        ) : (
                          <div className="w-full h-full" style={{ backgroundColor: option.color_code || '#e5e7eb' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Digər filtrlər (Style, Material, və s.) - CJ variant_options varsa gizlət */}
            {!Productslingle.variant_options && otherFilters.map((filter) => filter && filter.options && filter.options.length > 0 && (
              <div key={`filter-${filter.filter_id}`} className="mb-5 notranslate" translate="no">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">{filter.filter_name || ''}</span>
                  <span className="text-sm text-gray-500">( {selectedFilters[filter.filter_id]?.name || ''} )</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filter.options.map((option) => option && (
                    <button
                      key={`filter-${filter.filter_id}-opt-${option.option_id}`}
                      onClick={() => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          [filter.filter_id]: {
                            id: option.option_id,
                            name: option.name || 'Unknown',
                            price: option.price ? Number(option.price) : undefined
                          }
                        }));
                      }}
                      disabled={option.is_stock === false}
                      className={`min-w-[48px] h-10 px-4 rounded-xl border text-sm font-medium transition ${
                        selectedFilters[filter.filter_id]?.id === option.option_id
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : option.is_stock !== false
                            ? 'border-gray-300 hover:border-blue-400 text-gray-700'
                            : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {option.name || 'Unknown'}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* CJ Variant Options - yeni API strukturu */}
            {Productslingle.variant_options && (() => {
              // Dublikat dəyərlər olan option type-ları filtrələ (daha güclü normallaşdırma)
              const entries = Object.entries(Productslingle.variant_options);
              const seenValues = new Set<string>();
              const filteredEntries = entries.filter(([_optionType, options]) => {
                if (!options || options.length === 0) return false;
                // Dəyərləri normallaşdır: kiçik hərf, yalnız rəqəm və hərf, sırala
                const normalizedValues = options
                  .map((o: { value?: string }) => (o.value || '').toLowerCase().replace(/[^a-z0-9]/g, ''))
                  .filter(Boolean)
                  .sort();
                const valuesKey = normalizedValues.join('|');
                if (seenValues.has(valuesKey)) return false;
                seenValues.add(valuesKey);
                return true;
              });

              return filteredEntries.map(([optionType, options]) => {
                if (!options || options.length === 0) return null;
                const singularType = getSingularOptionType(optionType);
                const availableValues = getAvailableOptions(singularType);
                const selectedValue = selectedVariantOptions[singularType] || '';

                return (
                <div key={`cj-variant-${optionType}`} className="mb-5 notranslate" translate="no">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">{getVariantOptionLabel(optionType)}</span>
                    <span className="text-sm text-gray-500">( {selectedValue || ''} )</span>
                  </div>

                  {optionType === 'colors' ? (
                    // Rəng swatches
                    <div className="flex flex-wrap gap-3">
                      {options.map((opt: { value: string; label: string; image?: string }) => {
                        const isAvailable = availableValues.length === 0 || availableValues.includes(opt.value);
                        const isSelected = selectedValue === opt.value;
                        return (
                          <button
                            key={`cj-color-${opt.value}`}
                            onClick={() => handleVariantOptionSelect(singularType, opt.value)}
                            disabled={!isAvailable}
                            title={opt.label}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                              isSelected
                                ? 'border-blue-600 shadow-lg'
                                : isAvailable
                                  ? 'border-gray-200 hover:border-gray-400'
                                  : 'border-gray-200 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            {opt.image ? (
                              <img
                                src={getImageUrl(opt.image)}
                                alt={opt.label}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const t = e.target as HTMLImageElement;
                                  t.style.display = 'none';
                                  if (t.parentElement) t.parentElement.style.backgroundColor = '#e5e7eb';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                {opt.label.substring(0, 2)}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Chip selector (sizes, lengths, styles, specifications, capacities, materials)
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt: { value: string; label: string; image?: string }) => {
                        const isAvailable = availableValues.length === 0 || availableValues.includes(opt.value);
                        const isSelected = selectedValue === opt.value;
                        return (
                          <button
                            key={`cj-opt-${optionType}-${opt.value}`}
                            onClick={() => handleVariantOptionSelect(singularType, opt.value)}
                            disabled={!isAvailable}
                            className={`min-w-[48px] h-10 px-4 rounded-xl border text-sm font-medium transition ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : isAvailable
                                  ? 'border-gray-300 hover:border-blue-400 text-gray-700'
                                  : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
            })()}

            {/* Derived sizes - variant key-lərdən çıxarılan ölçülər (CJ sizes olmayanda) */}
            {derivedSizesFromVariants.length > 0 && (
              <div className="mb-5 notranslate" translate="no">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">{tarnslation?.Ölçü || 'Ölçü'}</span>
                  <span className="text-sm text-gray-500">( {selectedDerivedSize || ''} )</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {derivedSizesFromVariants.map((size) => {
                    const isSelected = selectedDerivedSize === size;
                    // Bu ölçü + seçilmiş rəng üçün variant var mı?
                    const selectedColor = selectedVariantOptions.color || '';
                    const hasVariant = Productslingle?.variants?.some(v => {
                      if (!v?.variantKey) return false;
                      const key = v.variantKey.toLowerCase();
                      return key.includes(size.toLowerCase()) &&
                             (!selectedColor || key.includes(selectedColor.toLowerCase()));
                    });
                    const inStock = Productslingle?.variants?.find(v => {
                      if (!v?.variantKey) return false;
                      const key = v.variantKey.toLowerCase();
                      return key.includes(size.toLowerCase()) &&
                             (!selectedColor || key.includes(selectedColor.toLowerCase()));
                    })?.in_stock !== false;

                    return (
                      <button
                        key={`derived-size-${size}`}
                        onClick={() => setSelectedDerivedSize(size)}
                        disabled={!hasVariant}
                        className={`min-w-[48px] h-10 px-4 rounded-xl border text-sm font-medium transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : hasVariant && inStock
                              ? 'border-gray-300 hover:border-blue-400 text-gray-700'
                              : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium">−</button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium">+</button>
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${isInStock && cjVariantInStock ? 'text-green-600' : 'text-red-500'}`}>
                {isInStock && cjVariantInStock ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                {isInStock && cjVariantInStock
                  ? (tarnslation?.product_in_stock || (lang === 'az' ? 'Stokda var' : 'In stock'))
                  : (tarnslation?.product_out_of_stock || (lang === 'az' ? 'Stokda yoxdur' : 'Out of stock'))}
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {isInStock && cjVariantInStock ? (
                <button 
                  onClick={handleAddToBasket} 
                  disabled={isAddingToCart}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${isinbusked ? 'bg-green-500' : isAddingToCart ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isAddingToCart && <span>{tarnslation?.loading || 'Loading'}...</span>}
                  {!isAddingToCart && isinbusked && (<><FiCheck className="w-5 h-5" /><span>{tarnslation?.added_to_cart || 'Added'}</span></>)}
                  {!isAddingToCart && !isinbusked && <span>{tarnslation?.add_to_cart || 'Add to cart'}</span>}
                </button>
              ) : (
                <button onClick={() => setIsModalOpen(true)} className="flex-1 py-3.5 rounded-xl font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition">
                  {tarnslation?.Notify_Me || 'Notify me'}
                </button>
              )}
              <button onClick={() => setOpenSideBar(true)} className="w-14 h-14 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition">
                <GiHanger className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {Productslingle.is_return === false && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
                <p className="text-red-600 text-sm font-medium">⚠️ {tarnslation?.qaytarilmir_text || 'Bu məhsul geri qaytarılmır'}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex gap-6 border-b mb-4">
                <button onClick={() => setActiveTab('description')} className={`pb-3 text-sm font-medium transition ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                  {tarnslation?.Təsvir || 'Description'}
                </button>
                <button onClick={() => setActiveTab('details')} className={`pb-3 text-sm font-medium transition ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                  {tarnslation?.Məlumatlar || 'Details'}
                </button>
              </div>
              {activeTab === 'description' && cleanDescription && (
                <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
              )}
              {activeTab === 'details' && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">{tarnslation?.product_code || 'Product code'}</span>
                    <span className="font-medium">{Productslingle.product_code || Productslingle.code || '-'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredSimilar.length > 0 && (
          <section className="mt-16 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">{tarnslation?.Tövsiyyələr || 'Similar products'}</h2>
              <div className="flex gap-2">
                <button onClick={() => scrollSimilar('left')} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => scrollSimilar('right')} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div ref={similarScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {filteredSimilar.map((product, index) => (
                <div key={`similar-${product.id}-${index}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                  <ProductCard data={product} bg="grey" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isLightboxOpen && !showVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center select-none"
          onClick={() => !isDragging && setIsLightboxOpen(false)}
          onMouseMove={handleLightboxMouseMove}
          onMouseUp={handleLightboxMouseUp}
          onMouseLeave={handleLightboxMouseLeave}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
            className="absolute top-16 right-4 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition z-20"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Sol ok - Yalnız Desktop */}
          {productImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevLightboxImage(); }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full items-center justify-center text-white hover:bg-white/20 transition z-20"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Sağ ok - Yalnız Desktop */}
          {productImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToNextLightboxImage(); }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full items-center justify-center text-white hover:bg-white/20 transition z-20"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Şəkil - swipe/drag dəstəyi */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] cursor-grab active:cursor-grabbing"
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
            onMouseDown={handleLightboxMouseDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translateX(${lightboxDragOffset}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
          >
            <img
              src={getImageUrl(currentImage)}
              alt={Productslingle.title || ''}
              className="max-w-[90vw] max-h-[90vh] object-contain pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Sayğac */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm z-20">
            {safeImageIndex + 1} / {productImages.length}
          </div>

          {/* Thumbnail dots - mobil üçün */}
          {productImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {productImages.slice(0, 10).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    safeImageIndex === idx ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
              {productImages.length > 10 && (
                <span className="text-white/60 text-xs">+{productImages.length - 10}</span>
              )}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">{tarnslation?.Out_of_Stock || 'Out of stock'}</h3>
            <p className="text-gray-600 text-sm mb-4">{tarnslation?.notify_text || 'Notify me when this item is back in stock'}</p>
            <button onClick={handleNotifyMe} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition mb-2">
              {tarnslation?.Notify_Me || 'Notify me'}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition">
              {tarnslation?.Cancel || 'Cancel'}
            </button>
          </div>
        </div>
      )}

      <SelectSizeSidebar onClose={() => setOpenSideBar(false)} openSidebar={openSideBar} />
      <Footer />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}