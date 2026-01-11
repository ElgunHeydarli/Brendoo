import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import BaskedForum from '../../components/Basked';
import { Link, useParams } from 'react-router-dom';
import { Basket, TranslationsKeys } from '../../setting/Types';
import GETRequest, { axiosInstance } from '../../setting/Request';
import ROUTES from '../../setting/routes';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import Loading from '../../components/Loading';

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
  const [Body, setBody] = useState<any>(null);
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
    if (isUnderMinimum) {
      toast.error(minimumMessage);
      return;
    }

    const formSubmitTrigger = document.getElementById('formSubmitTrigger') as HTMLButtonElement;
    if (formSubmitTrigger) {
      formSubmitTrigger.click();
    }

    if (!Body?.address) {
      // ✅ DÜZƏLDİLDİ: Hardcode rus əvəzinə translation
      toast.error(tarnslation?.unvani_duzgun_daxil_edin || 'Ünvanı düzgün daxil edin');
      return;
    }

    if (basked && basked?.basket_items?.length < 1) {
      // ✅ DÜZƏLDİLDİ: Hardcode rus əvəzinə translation
      toast.error(tarnslation?.sebet_bosdur || 'Səbət boşdur');
      return;
    }

    setLoadingOrder(true);

    try {
      // 1. Sifariş yarat
      const orderResponse = await axios.post(
        'https://admin.brendoo.com/api/storeOrder',
        {
          is_deliver: Body?.deliveryType,
          shop: Body?.address,
          payment_type: 'online',
          total_price: basked?.total_price,
          discount: basked?.discount,
          delivered_price: basked?.delivered_price,
          final_price: FINAL_price === 0 ? basked?.final_price : FINAL_price,
          address: Body?.address,
          additional_info: Body?.additionalInfo,
          cityId: Number(Body?.cityId),
          regionId: Number(Body.regionId),
          gift_id: selectedGift?.id || null,
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
        <section className="flex max-sm:px-4 lg:flex-row flex-col h-fit px-[40px] justify-between mb-[100px] max-sm:gap-10 gap-[65px]">
          <BaskedForum
            onSubmit={(values) => setBody(values)}
            Name={parsed?.customer?.name || 'user name'}
            Number={parsed?.customer?.phone || 'user phone'}
            Email={parsed?.customer?.email || 'user email'}
          />
          <div className="w-[2px] h-[500px] bg-black lg:block hidden opacity-10" />
          <div className="flex flex-col max-sm:flex-col-reverse gap-4 rounded-3xl min-w-[306px]">
            <div className="flex overflow-hidden flex-col justify-center p-7 w-full rounded-3xl bg-stone-50">
              <div className="flex flex-col">
                <div className="text-base font-semibold text-black">{tarnslation?.Ümumi_sifariş}</div>
                <div className="flex flex-col mt-6 w-full">
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col w-full text-sm">
                      <div className="flex gap-10 justify-between items-center w-full">
                        <div className="self-stretch my-auto text-black text-opacity-60">{tarnslation?.Məbləğ}:</div>
                        <div className="self-stretch my-auto text-right text-black">{basked?.total_price} ₼</div>
                      </div>
                      <div className="flex gap-10 justify-between items-center mt-4 w-full text-rose-500">
                        <div className="self-stretch my-auto">{tarnslation?.Endirim}:</div>
                        <div className="self-stretch my-auto text-right">{basked?.discount}₼</div>
                      </div>
                    </div>
                    <div className="mt-3 w-full border border-solid border-zinc-300 min-h-[1px]" />
                    <div className="flex gap-10 justify-between items-center mt-3">
                      <div className="self-stretch my-auto text-sm text-black text-opacity-80">{tarnslation?.Cəmi_məbləğ}:</div>
                      <div className="self-stretch my-auto text-base font-semibold text-blue-600">{currentTotal}₼</div>
                    </div>
                  </div>

                  {isUnderMinimum && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-medium">⚠️ {minimumMessage}</p>
                      <p className="text-red-500 text-xs mt-1">{minimumOrder?.current_amount_text}: {currentTotal}₼</p>
                    </div>
                  )}

                  {gifts.length > 0 && (
                    <div className={`mt-4 p-3 border rounded-lg ${selectedGift ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎁</span>
                          <span className={`font-medium text-sm ${selectedGift ? 'text-green-700' : 'text-yellow-700'}`}>
                            {selectedGift ? selectedGift.name : giftText.title}
                          </span>
                        </div>
                        {!giftLocked ? (
                          <button onClick={() => setShowGiftModal(true)} className="text-blue-600 text-sm font-medium hover:underline">{giftText.select}</button>
                        ) : (
                          <span className="text-green-600 text-sm font-medium flex items-center gap-1">✓ {giftText.selected}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    disabled={loadingorder || !!isUnderMinimum}
                    className={`flex overflow-hidden h-[48px] flex-col justify-center items-center px-16 py-3.5 mt-6 w-full text-base font-medium text-white rounded-[100px] ${isUnderMinimum ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3873C3]'}`}
                    onClick={handleOrder}
                  >
                    {loadingorder ? tarnslation?.is_loading : tarnslation?.sifarish_et}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex overflow-hidden flex-col justify-center p-7 mt-5 w-full rounded-3xl bg-stone-50">
              <div className="flex flex-col">
                <div className="text-base font-medium text-black">{tarnslation?.coupon_add}</div>
                <div className="flex flex-col mt-5 w-full text-sm">
                  <input type="text" placeholder={tarnslation?.Kupon} className="overflow-hidden px-4 py-3.5 w-full whitespace-nowrap bg-white rounded-[100px] text-black text-opacity-60" id="couponInput" />
                  <button
                    className="gap-2.5 self-stretch px-10 py-4 mt-3 w-full font-medium text-black border border-solid bg-[#B1C7E4] border-[#B1C7E4] rounded-[100px]"
                    onClick={async () => {
                      const couponValue = (document.getElementById('couponInput') as HTMLInputElement).value;
                      if (parsed) {
                        try {
                          const res = await axiosInstance.post('applyCoupon', { coupon_code: couponValue, total_price: basked?.final_price }, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
                          setFINAL_price(res.data.discounted_total_price);
                          // ✅ DÜZƏLDİLDİ
                          toast.success(tarnslation?.kupon_ugurla_tetbiq_edildi || 'Kupon uğurla tətbiq edildi');
                        } catch (error: any) {
                          toast.error(error.response?.data?.error || tarnslation?.xeta_bas_verdi || 'Xəta');
                        }
                      }
                    }}
                  >
                    {tarnslation?.Confirm}
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