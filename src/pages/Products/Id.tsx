import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import ProductCard from '../../components/ProductCArd';
import { useNavigate, useParams, Link } from 'react-router-dom';
import GETRequest, { axiosInstance } from '../../setting/Request';
import { GiHanger } from 'react-icons/gi';
import { FiHeart, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';
import { Basket, Favorite, Product, ProductDetail, TranslationsKeys } from '../../setting/Types';
import Loading from '../../components/Loading';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import ROUTES from '../../setting/routes';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import SelectSizeSidebar from './SelectSizeSidebar';
import SEO from '../../components/SEO';

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
  const [selectedSize, setSelectedSize] = useState<{ id: number; name: string } | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ id: number; name: string; code?: string; price?: number } | null>(null);
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [isliked, setisliked] = useState<boolean>(false);
  const [isinbusked, setisinbusked] = useState<boolean>(false);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');
  const [showVideo, setShowVideo] = useState(false);
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const similarScrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { lang = 'en', slug } = useParams<{ lang: string; slug: string }>();
  const userStr = localStorage.getItem('user-info');
  const parse = userStr ? JSON.parse(userStr) : null;
  const token = parse?.token;
  const collectionId = localStorage.getItem('collection_id') || '';

  const { data: Productslingle, isLoading: ProductslingleLoading } = GETRequest<ProductDetail>(`/productSingle/${slug}`, 'productSingle', [lang, slug]);
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

    const rawSizeFilter = filters.find(f => f?.filter_name && ['Size', 'Ölçü', 'Размер'].includes(f.filter_name));
    const rawColorFilter = filters.find(f => f?.filter_name && ['Color', 'Rəng', 'Цвет'].includes(f.filter_name));
    const rawOtherFilters = filters.filter(f => f?.filter_name && !['Size', 'Ölçü', 'Размер', 'Color', 'Rəng', 'Цвет'].includes(f.filter_name));

    return {
      sizeFilter: rawSizeFilter ? { ...rawSizeFilter, options: getUniqueOptions(rawSizeFilter.options) } : undefined,
      colorFilter: rawColorFilter ? { ...rawColorFilter, options: getUniqueOptions(rawColorFilter.options) } : undefined,
      otherFilters: rawOtherFilters.map(f => ({ ...f, options: getUniqueOptions(f?.options) }))
    };
  }, [Productslingle?.filters]);

  useEffect(() => {
    if (Productslingle?.id) {
      axios.get(`${API_URL}/api/more-products/${Productslingle.id}`, { headers: { 'Accept-Language': lang } })
        .then(res => { if (Array.isArray(res.data)) setSimilarProducts(res.data.filter(p => p && p.id)); })
        .catch(() => setSimilarProducts([]));
    }
  }, [Productslingle?.id, lang]);

  useEffect(() => {
    if (!sizeFilter || !sizeFilter.options?.length) {
      setSelectedSize({ id: 0, name: 'Standart' });
      setIsInStock(Productslingle?.is_stock !== false);
      return;
    }
    const def = sizeFilter.options.find(o => o?.is_default && o?.is_stock) || sizeFilter.options.find(o => o?.is_stock) || sizeFilter.options[0];
    if (def) { setSelectedSize({ id: def.option_id, name: def.name || 'Unknown' }); setIsInStock(!!def.is_stock); }
    if (colorFilter?.options?.length) {
      const defColor = colorFilter.options.find(o => o?.is_default) || colorFilter.options[0];
      if (defColor) setSelectedColor({ id: defColor.option_id, name: defColor.name || '', code: defColor.color_code || undefined });
    }
  }, [sizeFilter, colorFilter, Productslingle?.is_stock]);

  useEffect(() => { setisliked(favorites?.some(item => item?.product?.id === Productslingle?.id) || false); }, [favorites, Productslingle?.id]);

  useEffect(() => {
    if (!Productslingle || !selectedSize) { setisinbusked(false); return; }
    if (userStr && basked?.basket_items) {
      const found = basked.basket_items.some(item => {
        if (item?.product?.id !== Productslingle.id) return false;
        if (selectedSize.id === 0) return !item.options || item.options.length === 0;
        return item.options?.some((opt: any) => opt?.option?.option_id === selectedSize.id || String(opt?.option) === String(selectedSize.id));
      });
      setisinbusked(found);
      return;
    }
    if (!userStr) {
      const cart = getGuestCart();
      const found = cart.basket_items.some(ci => {
        if (ci?.product?.id !== Productslingle.id) return false;
        if (selectedSize.id === 0) return !ci.options || ci.options.length === 0;
        return ci.options?.some(o => String(o?.option) === String(selectedSize.id));
      });
      setisinbusked(found);
    }
  }, [basked, Productslingle, selectedSize, userStr]);

  useEffect(() => { 
    setSelectedImageIndex(0); 
    setShowVideo(false);
  }, [Productslingle?.id]);

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

  const handleSizeSelect = useCallback((option: any) => {
    if (!option) return;
    setSelectedSize({ id: option.option_id, name: option.name || 'Unknown' });
    setIsInStock(!!option.is_stock);
    if (!option.is_stock) setNotifyOptionId(option.option_id);
  }, []);

  const handleColorSelect = useCallback((option: any, variantPrice?: number, variantImage?: string | null) => {
    if (!option) return;
    setSelectedColor({ id: option.option_id, name: option.name || '', code: option.color_code || undefined, price: variantPrice });
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

  const handleAddToBasket = useCallback(async () => {
    if (!Productslingle || !selectedSize) { toast.error(tarnslation?.olcu_secin_title || 'Ölçü seçin'); return; }
    if (isAddingToCart || isinbusked) return;
    if (selectedSize.id !== 0) {
      const sizeOpt = sizeFilter?.options?.find(o => o?.option_id === selectedSize.id);
      if (sizeOpt && !sizeOpt.is_stock) { toast.error(tarnslation?.bu_olcude_stokda_yox || 'Bu ölçü stokda yoxdur'); return; }
    }
    setIsAddingToCart(true);
    const options = (sizeFilter && selectedSize.id !== 0) ? [{ filter_id: sizeFilter.filter_id, option_id: selectedSize.id }] : [];

    if (!userStr) {
      try {
        const cart = getGuestCart();
        const price = Number(Productslingle.discounted_price) || Number(Productslingle.price) || 0;
        const idx = cart.basket_items.findIndex(i => {
          if (i?.id !== Productslingle.id) return false;
          if (selectedSize.id === 0) return !i.options || i.options.length === 0;
          return i.options?.some(o => o?.option === String(selectedSize.id));
        });
        if (idx === -1) {
          cart.basket_items.push({ id: Productslingle.id, product: Productslingle, quantity, price: price.toFixed(2), options: options.map(o => ({ filter: String(o.filter_id), option: String(o.option_id) })) });
        } else { cart.basket_items[idx].quantity += quantity; }
        let total = 0, discount = 0, final = 0;
        cart.basket_items.forEach(i => { const orig = Number(i?.product?.price) || 0; const disc = Number(i?.product?.discounted_price) || orig; total += orig * (i?.quantity || 1); discount += (orig - disc) * (i?.quantity || 1); final += disc * (i?.quantity || 1); });
        cart.total_price = total; cart.discount = discount; cart.final_price = final;
        setGuestCart(cart);
        setisinbusked(true);
        toast.success(tarnslation?.mehsul_added ?? 'Əlavə edildi');
      } catch { toast.error('Xəta baş verdi'); }
      finally { setIsAddingToCart(false); }
      return;
    }

    try {
      await axios.post(`${API_URL}/api/basket_items`, { product_id: Productslingle.id, quantity, price: Number(Productslingle.price) || 0, options, ...(collectionId?.length && { collection_id: collectionId }) }, { headers: { Authorization: `Bearer ${token}`, 'Accept-Language': lang } });
      if (collectionId) localStorage.removeItem('collection_id');
      setisinbusked(true);
      toast.success(tarnslation?.handle_added || 'Əlavə edildi');
      queryClient.invalidateQueries({ queryKey: ['basket_items'] });
    } catch { toast.error('Xəta'); }
    finally { setIsAddingToCart(false); }
  }, [Productslingle, selectedSize, sizeFilter, quantity, userStr, token, lang, collectionId, tarnslation, queryClient, isAddingToCart, isinbusked]);

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

  const goToPrevImage = () => {
    if (showVideo) {
      setShowVideo(false);
      setSelectedImageIndex(productImages.length - 1);
    } else if (selectedImageIndex === 0 && productVideo) {
      setShowVideo(true);
    } else {
      setSelectedImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1);
    }
  };

  const goToNextImage = () => {
    if (showVideo) {
      setShowVideo(false);
      setSelectedImageIndex(0);
    } else if (selectedImageIndex === productImages.length - 1 && productVideo) {
      setShowVideo(true);
    } else {
      setSelectedImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1);
    }
  };

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
  const displayPrice = selectedColor?.price || Productslingle.discounted_price || Productslingle.price || 0;
  const originalPrice = Productslingle.price || 0;
  const hasDiscount = Productslingle.discount && Number(Productslingle.discount) > 0;
  const totalMediaCount = productImages.length + (productVideo ? 1 : 0);
  
  // Dots üçün: maksimum 5 dot göstər
  const maxDots = 5;
  const remainingCount = productImages.length > maxDots ? productImages.length - maxDots : 0;

  return (
    <div className="bg-white min-h-screen">
      <SEO title={`${Productslingle.meta_title || Productslingle.title || 'Product'} | Brendoo`} description={Productslingle.meta_description || Productslingle.short_title || ''} image={getImageUrl(currentImage)} url={`https://brendoo.com/${lang}/product/${slug}`} type="product" price={String(displayPrice)} currency="AZN" availability={isInStock ? 'in stock' : 'out of stock'} />
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
                  className="relative bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in"
                  style={{ aspectRatio: '1/1' }}
                  onMouseEnter={() => setIsZoomed(true)} 
                  onMouseLeave={() => setIsZoomed(false)} 
                  onMouseMove={handleMouseMove}
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img 
                    src={getImageUrl(currentImage)} 
                    alt={Productslingle.title || 'Product'}
                    className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
                    style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} 
                  />
                  
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-gray-600 flex items-center gap-2 shadow-lg pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <span>{tarnslation?.zoom || 'Zoom'}</span>
                  </div>

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

              {totalMediaCount > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition z-10"
                  >
                    <FiChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition z-10"
                  >
                    <FiChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* DOTS SLIDER - Köhnə stil */}
            {totalMediaCount > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {/* İlk 5 şəkil üçün dots */}
                {productImages.slice(0, maxDots).map((_, idx) => (
                  <button
                    key={`dot-${idx}`}
                    onClick={() => { setSelectedImageIndex(idx); setShowVideo(false); }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      !showVideo && safeImageIndex === idx 
                        ? 'w-6 bg-gray-800' 
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Image ${idx + 1}`}
                  />
                ))}
                
                {/* Əgər 5-dən çox şəkil varsa, +N göstər */}
                {remainingCount > 0 && (
                  <span className="text-sm text-gray-500 font-medium ml-1">
                    +{remainingCount}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="lg:w-1/2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">{Productslingle.title || 'Product'}</h1>
            <p className="text-sm text-gray-500 mb-4">SKU: {Productslingle.product_code || Productslingle.code || `PRD-${Productslingle.id}`}</p>

            <div className="flex items-baseline gap-3 mb-6">
              {selectedColor?.price ? (
                <span className="text-3xl font-bold text-gray-900">{Number(selectedColor.price).toFixed(2)}₼</span>
              ) : hasDiscount && Productslingle.discounted_price ? (
                <>
                  <span className="text-3xl font-bold text-blue-600">{Productslingle.discounted_price}₼</span>
                  <span className="text-lg text-gray-400 line-through">{originalPrice}₼</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">{Number(originalPrice).toFixed(2)}₼</span>
              )}
            </div>

            {sizeFilter && sizeFilter.options && sizeFilter.options.length > 0 ? (
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
            ) : (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">{tarnslation?.Ölçü || 'Ölçü'}</span>
                </div>
                <button className="min-w-[48px] h-10 px-4 rounded-xl border text-sm font-medium border-blue-600 bg-blue-600 text-white cursor-default">
                  {tarnslation?.standart || 'Standart'}
                </button>
              </div>
            )}

            {colorFilter && colorFilter.options && colorFilter.options.length > 0 && (
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

            {otherFilters.map((filter) => filter && (
              <div key={`filter-${filter.filter_id}`} className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{filter.filter_name || ''}:</span>
                <span className="text-sm text-gray-600">{filter.options?.map(o => o?.name).filter(Boolean).join(', ')}</span>
              </div>
            ))}

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium">−</button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium">+</button>
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${isInStock ? 'text-green-600' : 'text-red-500'}`}>
                {isInStock ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                {isInStock ? tarnslation?.Stokda_var || 'In stock' : tarnslation?.Out_of_Stock || 'Out of stock'}
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              {isInStock ? (
                <button 
                  onClick={handleAddToBasket} 
                  disabled={isinbusked || isAddingToCart}
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
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition z-10">
            <FiX className="w-6 h-6" />
          </button>
          
          {productImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); goToPrevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition">
                <FiChevronLeft className="w-7 h-7" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); goToNextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition">
                <FiChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
          
          <img 
            src={getImageUrl(currentImage)} 
            alt={Productslingle.title || ''} 
            className="max-w-[90vw] max-h-[90vh] object-contain" 
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {safeImageIndex + 1} / {productImages.length}
          </div>
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