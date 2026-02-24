import { useNavigate, useParams } from 'react-router-dom';
import { Order, TranslationsKeys, User, ExpargoStatus } from '../../../setting/Types';
import { ExpargoStatusColors } from '../../../setting/Types';
import GETRequest from '../../../setting/Request';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ROUTES from '../../../setting/routes';
import DelayedModal from '../../../utils/DelayedModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Phone, Clock, Truck } from 'lucide-react';

const API_URL = 'https://admin.brendoo.com';

const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  if (src.startsWith('storage/')) return API_URL + '/' + src;
  // Əgər sadəcə fayl adıdırsa
  return API_URL + '/storage/' + src;
};

const OrderMainItem = ({ order, cancellationReasons }: { order: Order | any, cancellationReasons: any[] }) => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<null | User>(null);

  const { data: translation } =
    GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);

  useEffect(() => {
    const userStr = localStorage.getItem('user-info');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUser(user.data);
    } else {
      navigate(`/${lang === 'en' ? 'en' : 'az'}/login`);
    }
  }, []);

  const getOrderDetail = () => {
    navigate(
      `/${lang}/${ROUTES.orderdetail[lang as keyof typeof ROUTES.orderdetail]
      }/${order.id}`
    );
  };

  const getLocalizedDate = (dateString: string) => {
    try {
      // "2025-06-21 12:36:13" → "2025-06-21T12:36:13"
      const isoDateString = dateString.replace(" ", "T");
      const date = new Date(isoDateString);

      return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (error) {
      console.log(error);
      return dateString;
    }
  };

  const [openCancelModal, setOpenCancelModal] = React.useState<number | null>(null);
  const [openRateModal, setOpenRateModal] = React.useState<number | null>(null);
  const handleOpenCancelModal = (id: number | null) => {
    setOpenCancelModal(id);
  }
  const handleOpenRateModal = (id: number | null) => {
    setOpenRateModal(id);
  }


  // AZADEV
  const userInfoRaw = localStorage.getItem("user-info");
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const token = userInfo?.token;

  // post reasons
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isOther, setOther] = React.useState<boolean>(false);
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [text, setText] = React.useState<string>("");

  const handleSubmitReason = async () => {
    setLoading(true);
    try {
      if (isOther && !text.trim()) {
        alert(translation?.legvetmesebebiniqeydedin ?? "");
        return;
      }

      if (!isOther && !selectedReason) {
        alert(translation?.legvetmesebebiniqeydedin ?? "");
        return;
      }

      const data: Record<string, string> = {};

      if (isOther) {
        data.cancel_text = text.trim();
      } else {
        data.cancel_id = selectedReason;
      }

      const res = await axios.post(`https://admin.brendoo.com/api/cancelOrder/${order?.id}`, data, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept-Language": lang,
        },
      });

      if (res.data) {
        setSelectedReason("");
        setText("");
        setOther(false);
        setOpenCancelModal(null);
        toast.success(translation?.sifarisinizlegvedilir ?? "", {
          position: "top-center",
        });
        window.location.reload();
      } else {
        console.log(res.status);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.response?.data?.message || translation?.xeta_bas_verdi || 'Xəta baş verdi. Yenidən cəhd edin.';
      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (selectedReason === 'is_other') {
      setOther(true);
    } else {
      setOther(false);
    }
  }, [selectedReason]);


  return (
    <div
      className="rounded-2xl border border-gray-200 p-4 bg-white space-y-4">
      {openCancelModal === order.id && (
        <div className='cancel-modal-overlay'>
          <form
            className="cancel-modal-content"
            acceptCharset='UTF-8'
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              handleSubmitReason();
            }}
          >
            <img className='close-modal' onClick={() => setOpenCancelModal(null)} src="/cixis.png" alt="çıxış" />
            <div className="text-content">
              <h3>{translation?.sifarisin_legvi}</h3>
              <p>{translation?.legv_sebebi}</p>
            </div>
            <div className="reason-cancel">
              <select
                required
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedReason(e.target.value)}
              >
                <option value="" defaultChecked>{translation?.legv_sebebi}</option>

                {cancellationReasons && cancellationReasons?.length > 0 ? (
                  cancellationReasons?.map((r) => (
                    <option value={r?.id} key={r?.id}>{r?.title ?? ""}</option>
                  ))
                ) : null}
                <option value="is_other">{translation?.diger_text}</option>
              </select>
              {isOther && (
                <textarea
                  style={{ width: "100%", padding: "8px 16px", borderRadius: "12px", height: "100px", border: "2px solid #cecece", resize: "none" }}
                  name='cancel_note'
                  required
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                  value={text}
                  placeholder={translation?.legv_sebebi ?? ""}
                ></textarea>
              )}
              <button className='close-o' type='submit'>
                {loading ? "..." : translation?.sifarisin_legvi}
              </button>
            </div>
          </form>
        </div>
      )}
      {openRateModal === order.id && (
        <div className="cancel-modal-overlay">
          <DelayedModal setOpenRateModal={setOpenRateModal} />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 gap-4">
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[600px] grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">{translation?.sifaris_date}:</div>
              <div className="font-semibold">{getLocalizedDate(order?.order_date)}</div>
            </div>
            <div>
              <div className="text-gray-500">{translation?.sifaris_detail}:</div>
              <div className="font-semibold">
                {order.order_items_count} {translation?.mehsul_title}
              </div>
            </div>
            <div>
              <div className="text-gray-500">{translation?.priced}:</div>
              <div className="font-semibold">{order.total_price} ₼</div>
            </div>
            <div>
              <div className="text-gray-500">{translation?.given_key}:</div>
              <div className="font-semibold">{user?.customer.name}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 md:flex-nowrap items-center justify-between mt-3">
          <button type='button'
            onClick={getOrderDetail}
            className="whitespace-nowrap rounded-[100px] duration-300 bg-[#3873C3] text-white px-[28px] py-[14px] border border-black border-opacity-10 text-[13px] self-end md:self-auto">
            {translation?.order_detail_title_key}
          </button>

          {/* Cancel Button - only show if can_cancel is true and not already cancelled */}
          {(order?.can_cancel === true || order?.cancelable) && !order?.isCancel ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCancelModal(order?.id);
              }}
              className="rounded-[100px] bg-red-500 hover:bg-red-600 text-white px-[24px] py-[10px] text-[13px]">
              {translation?.cancel_order || "Sifarişi ləğv et"}
            </button>
          ) : null}
        </div>

      </div>

      {/* ✅ Delivery Tracking & Pickup Point */}
      {order?.delivery && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tracking & Status */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {order.delivery.parcel?.tracking_number && (
                  <p className="text-sm text-gray-500">
                    Tracking: <span className="font-semibold text-gray-900">{order.delivery.parcel.tracking_number}</span>
                  </p>
                )}
                {order.delivery.expargo_status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    ExpargoStatusColors[order.delivery.expargo_status as ExpargoStatus]?.bg || 'bg-gray-100'
                  } ${ExpargoStatusColors[order.delivery.expargo_status as ExpargoStatus]?.text || 'text-gray-800'}`}>
                    {order.delivery.expargo_status_text || ExpargoStatusColors[order.delivery.expargo_status as ExpargoStatus]?.label || order.delivery.expargo_status}
                  </span>
                )}
                {!order.delivery.expargo_status && order.delivery.status_text && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 bg-gray-100 text-gray-800">
                    {order.delivery.status_text}
                  </span>
                )}
              </div>
            </div>

            {/* Pickup Point */}
            {order.delivery.pickup_point && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{order.delivery.pickup_point.name}</p>
                  <p className="text-gray-500 text-xs">{order.delivery.pickup_point.address}</p>
                  {order.delivery.pickup_point.working_hours && (
                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {order.delivery.pickup_point.working_hours}
                    </p>
                  )}
                  {order.delivery.pickup_point.phone && (
                    <a href={`tel:${order.delivery.pickup_point.phone}`} className="flex items-center gap-1 text-xs text-blue-600 mt-1 hover:underline">
                      <Phone className="w-3 h-3" />
                      {order.delivery.pickup_point.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Estimate & Delivery Info */}
            <div className="flex flex-col gap-1 text-sm">
              {order.delivery.estimate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-gray-600">{translation?.texmini_catdirilma || 'Təxmini'}: <strong>{order.delivery.estimate}</strong></span>
                </div>
              )}
              {order.delivery.parcel?.sent_at && (
                <p className="text-xs text-gray-500">
                  {translation?.gonderilme_tarixi || 'Göndərilmə'}: {order.delivery.parcel.sent_at}
                </p>
              )}
              {order.delivery.parcel?.delivered_at && (
                <p className="text-xs text-green-600 font-medium">
                  {translation?.tehvil_tarixi || 'Təhvil'}: {order.delivery.parcel.delivered_at}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="space-y-4">
        {order.order_items.map((item: any) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div
              className="flex gap-3 items-start cursor-pointer"
              onClick={async (e) => {
                e.stopPropagation();
                const slug = item?.product?.slug;
                const productSlug = typeof slug === 'object' ? (slug as any)?.[lang as string] || (slug as any)?.az || (slug as any)?.en : slug;
                if (productSlug) {
                  navigate(`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}/${productSlug}`);
                  return;
                }
                const productId = item?.product?.id;
                if (!productId) return;
                try {
                  const res = await axios.get(`${API_URL}/api/product/${productId}`, { headers: { 'Accept-Language': lang } });
                  const productData = res.data?.data;
                  if (productData?.slug) {
                    const s = typeof productData.slug === 'object' ? productData.slug[lang] || productData.slug.az || productData.slug.en : productData.slug;
                    if (s) { navigate(`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}/${s}`); return; }
                  }
                } catch (err) { console.error('Product fetch failed:', err); }
              }}
            >
              <img
                src={getImageUrl(item?.product?.image || item?.product?.thumbnail)}
                alt={item?.product?.title || 'Product'}
                className="w-[100px] h-[90px] object-contain rounded-md"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
              />
              <div>
                <div className="font-medium text-black hover:text-blue-600">
                  {item?.product?.title}
                </div>
                <div className="text-sm text-gray-600">
                  {item?.quantity} {translation?.mehsul_title}
                </div>
              </div>
            </div>

            <p style={{ fontSize: "14px", textWrap: "nowrap" }}>{item?.status ?? ""}</p>

            <div className="flex flex-col gap-2">
              {/* ⭐ Rate Button */}
              {order.status === 'delivered' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRateModal(order?.id);
                  }}
                  className="rounded-[100px] bg-blue-500 hover:bg-blue-800 text-white px-[24px] py-[10px] text-[13px]">
                  {translation?.mehsulu_deyerlendir || "Məhsulu dəyərləndir"}
                </button>
              )}

              {/* 🔁 Return Button */}
              {item.status === 'delivered' && !['returned', 'refund_checking', 'return_accepted'].includes(item.status) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="rounded-[100px] bg-yellow-500 hover:bg-yellow-600 text-white px-[24px] py-[10px] text-[13px]">
                  {translation?.mehsulu_iade_et || "Məhsulu geri qaytar"}
                </button>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default OrderMainItem;
