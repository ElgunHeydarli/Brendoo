import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Link, useParams } from 'react-router-dom';
import { Basket, TranslationsKeys, PickupPoint } from '../../setting/Types';
import GETRequest, { axiosInstance } from '../../setting/Request';
import ROUTES from '../../setting/routes';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import Loading from '../../components/Loading';
import PickupPointSelector from '../../components/PickupPointSelector';

interface Gift {
  id: number;
  name: string;
  description: string;
  image: string | null;
  minimum_amount: number;
  stock: number;
  is_in_stock: boolean;
}

export default function BaskedConfirm() {
  const queryClient = useQueryClient();
const { lang = 'en' } = useParams<{ lang: string }>();
  const [_Body, _setBody] = useState<any>(null);
  const [FINAL_price, setFINAL_price] = useState(0);
  const user = localStorage.getItem("user-info");
  const parsed = user ? JSON.parse(user) : null;
  const token = parsed?.token;

  const [minimumOrder, setMinimumOrder] = useState<{ minimum_amount: number; message: string; current_amount_text: string } | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftLocked, setGiftLocked] = useState(false);
  const [loadingorder, setLoadingOrder] = useState<boolean>(false);

  // ✅ YENİ: Expargo Pickup state-ləri
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  // FIN kod və şəxsiyyət seriyası qeydiyyatdan gəlir - dəyişdirilə bilməz
  const finCode = parsed?.customer?.fin_code || '';
  const idSerialNumber = parsed?.customer?.id_serial || '';
  const [pickupError, setPickupError] = useState<string>('');

  const { data: tarnslation, isLoading: tarnslationLoading } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);
  const { data: basked, isLoading: baskedLoading } = GETRequest<Basket>(`/basket_items`, 'basket_items', [lang]);

  const currentTotal = FINAL_price === 0 ? (basked?.final_price || 0) : FINAL_price;

  useEffect(() => {
    const savedGift = localStorage.getItem('selected_gift');
    if (savedGift) {
      try {
        setSelectedGift(JSON.parse(savedGift));
        setGiftLocked(true);
      } catch (e) {
        console.log('Gift parse error:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchMinimumOrder = async () => {
      try {
        const res = await axios.get('https://admin.brendoo.com/api/settings/minimum-order', {
          headers: { 'Accept-Language': lang },
        });
        setMinimumOrder(res.data);
      } catch (error) {
        console.log('Minimum order settings fetch error:', error);
      }
    };
    fetchMinimumOrder();
  }, [lang]);

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const res = await axios.get(`https://admin.brendoo.com/api/gifts?amount=${currentTotal}`, {
          headers: { 'Accept-Language': lang },
        });
        setGifts(res.data.gifts || []);
      } catch (error) {
        console.log('Gifts fetch error:', error);
      }
    };
    if (currentTotal > 0) {
      fetchGifts();
    }
  }, [currentTotal, lang]);

  const handleSelectGift = (gift: Gift | null) => {
    setSelectedGift(gift);
    setShowGiftModal(false);
    if (gift) {
      localStorage.setItem('selected_gift', JSON.stringify(gift));
      setGiftLocked(true);
      toast.success(`🎁 ${gift.name}`);
    } else {
      localStorage.removeItem('selected_gift');
    }
  };

  const isUnderMinimum = minimumOrder && minimumOrder.minimum_amount > 0 && currentTotal < minimumOrder.minimum_amount;
  const minimumMessage = minimumOrder?.message?.replace(':amount', String(minimumOrder.minimum_amount)) || '';

  // ✅ EPOINT ÖDƏNIŞ
  const handleOrder = async () => {
    // Validation sıfırla
    setPickupError('');

    if (isUnderMinimum) {
      toast.error(minimumMessage);
      return;
    }

    // ✅ Pickup nöqtəsi yoxlaması
    if (!selectedPickupPoint) {
      setPickupError(tarnslation?.pickup_secilmeyib || 'Pickup nöqtəsi seçilməyib');
      toast.error(tarnslation?.pickup_secilmeyib || 'Pickup nöqtəsi seçilməyib');
      return;
    }

    // ✅ FIN kod yoxlaması (qeydiyyatdan gəlir)
    if (!finCode) {
      toast.error(tarnslation?.fin_kod_yoxdur || 'FIN kod qeydiyyat zamanı daxil edilməyib. Zəhmət olmasa dəstək ilə əlaqə saxlayın.');
      return;
    }

    // ✅ Vəsiqə seriya № yoxlaması (qeydiyyatdan gəlir)
    if (!idSerialNumber) {
      toast.error(tarnslation?.vesiqe_seriya_yoxdur || 'Şəxsiyyət seriyası qeydiyyat zamanı daxil edilməyib. Zəhmət olmasa dəstək ilə əlaqə saxlayın.');
      return;
    }

    const formSubmitTrigger = document.getElementById('formSubmitTrigger') as HTMLButtonElement;
    if (formSubmitTrigger) {
      formSubmitTrigger.click();
    }

    // Artıq address yerinə pickup nöqtəsini yoxlayırıq (yuxarıda yoxlanılır)

    if (basked && basked?.basket_items?.length < 1) {
      toast.error(tarnslation?.sebet_bosdur || 'Səbət boşdur');
      return;
    }

    setLoadingOrder(true);

    try {
      // 1. Sifariş yarat - Expargo məlumatları ilə
      const orderResponse = await axios.post(
        'https://admin.brendoo.com/api/storeOrder',
        {
          is_deliver: true, // Pickup üçün
          shop: selectedPickupPoint.name, // Pickup nöqtəsinin adı
          payment_type: 'online',
          total_price: basked?.total_price,
          discount: basked?.discount,
          delivered_price: basked?.delivered_price,
          final_price: FINAL_price === 0 ? basked?.final_price : FINAL_price,
          address: selectedPickupPoint.address, // Pickup nöqtəsinin ünvanı
          additional_info: `Pickup nöqtəsi: ${selectedPickupPoint.name}`,
          cityId: 1, // Pickup üçün default
          regionId: 1, // Pickup üçün default
          gift_id: selectedGift?.id || null,
          // ✅ YENİ: Expargo Pickup məlumatları
          pickup_point_id: selectedPickupPoint.pickup_id || selectedPickupPoint.id,
          fin_code: finCode.toUpperCase(),
          id_serial: idSerialNumber.toUpperCase(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'Accept-Language': lang,
          },
        },
      );

      const orderId = orderResponse.data.order.id;
      localStorage.setItem('order_ID', orderId);

      // 2. Epoint ödənişi yarat
      const paymentResponse = await axios.post(
        'https://admin.brendoo.com/api/epoint/create-payment',
        { order_id: orderId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'Accept-Language': lang,
          },
        },
      );

      if (paymentResponse.data.success && paymentResponse.data.redirect_url) {
        localStorage.removeItem('selected_gift');
        queryClient.invalidateQueries({ queryKey: ['basket_items'] });
        window.location.href = paymentResponse.data.redirect_url;
      } else {
        // ✅ DÜZƏLDİLDİ: Hardcode rus əvəzinə translation
        toast.error(paymentResponse.data.error || tarnslation?.odenis_yaradila_bilmedi || 'Ödəniş yaradıla bilmədi');
        setLoadingOrder(false);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error;
      toast.error(
        typeof errorMessage === 'string'
          ? errorMessage
          : (Array.isArray(errorMessage) ? errorMessage[0] : (tarnslation?.xeta_bas_verdi || 'Xəta baş verdi'))
      );
      setLoadingOrder(false);
    }
  };

  // ✅ DÜZƏLDİLDİ: Hədiyyə mətnləri translation-dan
  const giftText = {
    title: tarnslation?.hediyye_secin || 'Hədiyyə seçin',
    select: tarnslation?.sec || 'Seç',
    selected: tarnslation?.secildi || 'Seçildi',
    close: tarnslation?.bagla || 'Bağla',
    warning: tarnslation?.hediyye_xeberdarliq || 'Diqqət! Hədiyyə seçildikdən sonra dəyişdirilə bilməz.',
  };

  if (baskedLoading || tarnslationLoading) return <Loading />;

  return (
    <div>
      <Header />
      <main className="mt-0">
        <div className="px-[40px] max-sm:px-4 pt-[40px] mb-[28px]">
          <div className="flex items-center gap-2">
            <Link reloadDocument to={`/${lang}`}>
              <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">{tarnslation?.home}</h6>
            </Link>
            <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb" className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" />
            <Link reloadDocument to={`/${lang}/${ROUTES.order[lang as keyof typeof ROUTES.order]}`}>
              <h6 className="text-nowrap self-stretch my-auto hover:text-blue-600">{tarnslation?.basked}</h6>
            </Link>
            <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb" className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" />
            <h6 className="text-nowrap self-stretch my-auto">{tarnslation?.basked}</h6>
          </div>
        </div>
        <section className="lg:px-[40px] px-4">
          <h3 className="text-[40px] font-semibold max-sm:text-[32px] mt-[28px] mb-[40px]">{tarnslation?.Sifariş_et}</h3>
        </section>
        <section className="flex max-sm:px-4 lg:flex-row flex-col h-fit px-[40px] justify-between mb-[100px] max-sm:gap-8 gap-8">
          {/* Sol tərəf - Form */}
          <div className="flex flex-col gap-5 lg:w-[65%] w-full">
            {/* Şəxsi məlumatlar */}
            <div className="flex overflow-hidden flex-col p-6 lg:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <h4 className="text-base font-semibold text-gray-800">
                  {tarnslation?.Şəxsi_məlumatlarım || 'Şəxsi məlumatlarım'}
                </h4>
              </div>
              
              <div className="space-y-3">
                <div className="px-4 py-3.5 bg-gray-50 rounded-xl text-gray-700 font-medium">
                  {parsed?.customer?.name || 'İstifadəçi adı'}
                </div>
                <div className="flex lg:flex-row flex-col gap-3">
                  <div className="flex-1 px-4 py-3.5 bg-gray-50 rounded-xl text-gray-600">
                    {parsed?.customer?.email || 'email@example.com'}
                  </div>
                  <div className="flex-1 px-4 py-3.5 bg-gray-50 rounded-xl text-gray-600">
                    +994 {parsed?.customer?.phone || '00 000 00 00'}
                  </div>
                </div>
              </div>
            </div>

            {/* Çatdırılma üsulu - Pickup */}
            <div className="flex overflow-hidden flex-col p-6 lg:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <span className="text-xl">📦</span>
                </div>
                <h4 className="text-base font-semibold text-gray-800">
                  {tarnslation?.catdirilma_usulu || 'Çatdırılma üsulu'}
                </h4>
              </div>
              <PickupPointSelector
                selectedPickupPoint={selectedPickupPoint}
                onSelect={setSelectedPickupPoint}
                lang={lang}
                translation={tarnslation}
                error={pickupError}
              />
            </div>

            {/* Şəxsiyyət məlumatları */}
            <div className="flex overflow-hidden flex-col p-6 lg:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <span className="text-xl">🪪</span>
                </div>
                <h4 className="text-base font-semibold text-gray-800">
                  {tarnslation?.sexsiyyet_melumatlari || 'Şəxsiyyət məlumatları'}
                </h4>
              </div>
              <p className="text-sm text-gray-500 mb-5 ml-[52px]">
                {tarnslation?.fin_kod_izah || 'Pickup zamanı şəxsiyyət yoxlaması üçün lazımdır'}
              </p>

              <div className="flex lg:flex-row flex-col gap-4">
                {/* FIN Kod - read-only, qeydiyyatdan gəlir */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    {tarnslation?.fin_kod || 'FIN kod'}
                  </label>
                  <div className="px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 font-medium tracking-wider text-gray-700 uppercase">
                    {finCode || <span className="text-red-400 normal-case">{tarnslation?.melumat_yoxdur || 'Məlumat yoxdur'}</span>}
                  </div>
                </div>

                {/* Vəsiqə Seriya Nömrəsi - read-only, qeydiyyatdan gəlir */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    {tarnslation?.vesiqe_seriya || 'Vəsiqə seriya №'}
                  </label>
                  <div className="px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 font-medium tracking-wider text-gray-700 uppercase">
                    {idSerialNumber || <span className="text-red-400 normal-case">{tarnslation?.melumat_yoxdur || 'Məlumat yoxdur'}</span>}
                  </div>
                </div>
              </div>

              {(!finCode || !idSerialNumber) && (
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <span>⚠️</span>
                  {tarnslation?.fin_kod_xeberdarliq || 'Bu məlumatlar qeydiyyat zamanı daxil edilməlidir'}
                </p>
              )}
            </div>
          </div>
          
          {/* Sağ tərəf - Sifariş xülasəsi */}
          <div className="lg:w-[35%] w-full lg:sticky lg:top-6 h-fit">
            <div className="flex flex-col gap-4">
              {/* Sifariş xülasəsi kartı */}
              <div className="flex overflow-hidden flex-col p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-xl">🛒</span>
                  </div>
                  <h4 className="text-base font-semibold text-gray-800">
                    {tarnslation?.Ümumi_sifariş || 'Sifariş xülasəsi'}
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{tarnslation?.Məbləğ || 'Məbləğ'}:</span>
                    <span className="font-medium text-gray-800">{basked?.total_price} ₼</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{tarnslation?.Endirim || 'Endirim'}:</span>
                    <span className="font-medium text-green-600">-{basked?.discount}₼</span>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">{tarnslation?.Cəmi_məbləğ || 'Cəmi'}:</span>
                    <span className="text-xl font-bold text-blue-600">{currentTotal}₼</span>
                  </div>
                </div>

                {isUnderMinimum && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                      <span>⚠️</span> {minimumMessage}
                    </p>
                    <p className="text-red-400 text-xs mt-1 ml-6">{minimumOrder?.current_amount_text}: {currentTotal}₼</p>
                  </div>
                )}

                {gifts.length > 0 && (
                  <div className={`mt-4 p-3 rounded-xl border ${
                    selectedGift 
                      ? 'bg-green-50 border-green-100' 
                      : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        <span className={`font-medium text-sm ${
                          selectedGift ? 'text-green-700' : 'text-amber-700'
                        }`}>
                          {selectedGift ? selectedGift.name : giftText.title}
                        </span>
                      </div>
                      {!giftLocked ? (
                        <button 
                          onClick={() => setShowGiftModal(true)} 
                          className="text-blue-600 text-sm font-medium hover:underline"
                        >
                          {giftText.select}
                        </button>
                      ) : (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          ✓ {giftText.selected}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  disabled={loadingorder || !!isUnderMinimum}
                  onClick={handleOrder}
                  className={`mt-6 w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    isUnderMinimum 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200'
                  }`}
                >
                  {loadingorder ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      {tarnslation?.is_loading || 'Yüklənir...'}
                    </span>
                  ) : (
                    tarnslation?.sifarish_et || 'Sifariş et'
                  )}
                </button>
              </div>

              {/* Kupon kartı */}
              <div className="flex overflow-hidden flex-col p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                    <span className="text-base">🎟️</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    {tarnslation?.coupon_add || 'Kupon kodu'}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="couponInput"
                    placeholder={tarnslation?.Kupon || 'Kodu daxil edin'} 
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-100 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-all" 
                  />
                  <button
                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-all"
                    onClick={async () => {
                      const couponValue = (document.getElementById('couponInput') as HTMLInputElement).value;
                      if (parsed) {
                        try {
                          const res = await axiosInstance.post('applyCoupon', { coupon_code: couponValue, total_price: basked?.final_price }, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
                          setFINAL_price(res.data.discounted_total_price);
                          toast.success(tarnslation?.kupon_ugurla_tetbiq_edildi || 'Kupon uğurla tətbiq edildi');
                        } catch (error: any) {
                          toast.error(error.response?.data?.error || tarnslation?.xeta_bas_verdi || 'Xəta');
                        }
                      }
                    }}
                  >
                    {tarnslation?.Confirm || 'Tətbiq et'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showGiftModal && !giftLocked && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">🎁 {giftText.title}</h3>
                <button onClick={() => setShowGiftModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">⚠️ {giftText.warning}</p>
              </div>
              <div className="space-y-3">
                {gifts.map((gift) => (
                  <div key={gift.id} onClick={() => handleSelectGift(gift)} className="p-4 border-2 rounded-xl cursor-pointer transition-all border-gray-200 hover:border-green-300 hover:bg-green-50">
                    <div className="flex items-center gap-3">
                      {gift.image ? <img src={gift.image} alt={gift.name} className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">🎁</div>}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{gift.name}</h4>
                        {gift.description && <p className="text-sm text-gray-500 mt-1">{gift.description}</p>}
                        <p className="text-xs text-green-600 mt-1">min {gift.minimum_amount}₼</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowGiftModal(false)} className="mt-4 w-full py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200">{giftText.close}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}