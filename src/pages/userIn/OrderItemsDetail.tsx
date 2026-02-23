import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import UserAside from '../../components/userAside';
import GETRequest from '../../setting/Request';
import Loading from '../../components/Loading';
import { useNavigate, useParams } from 'react-router-dom';
import ROUTES from '../../setting/routes';
import { Order, TranslationsKeys, ExpargoStatus, ExpargoStatusColors } from '../../setting/Types';
import { CheckCircle2, Package, Download, Truck, MapPin, Clock, Phone, Circle } from 'lucide-react';
import { IoClose } from 'react-icons/io5';
import RatingModal from '../../components/rating-modal/rating-modal';
import RestoreModal from './RestoreModal';
import SearchableSelect from '../../components/Basked/SearchableSelect';
import SearchableSelectCity from '../../components/Basked/SearchableSelectCity';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'https://admin.brendoo.com';

const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  if (src.startsWith('storage/')) return API_URL + '/' + src;
  return API_URL + '/storage/' + src;
};

export interface NewOrd extends Order {
  statuses: [{ id: number; created_at: string; status: string }];
}

const OrderItemsDetail = () => {
  const navigate = useNavigate();
  const [, setProductCommit] = useState<number>(0);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const userStr = localStorage.getItem('user-info');
  const parsedUser = userStr ? JSON.parse(userStr) : null;
  const token =
    parsedUser?.token ||
    parsedUser?.access_token ||
    parsedUser?.api_token ||
    parsedUser?.bearer ||
    parsedUser?.user?.token ||
    '';

  // Bölge ve şehir dataları
  const [regionData, setRegionData] = useState<{ id: number; regionId: number; regionName: string }[]>([]);
  const [cityData, setCityData] = useState<{ id: number; cityId: number; cityName: string }[]>([]);
  const [regionId, setRegionId] = useState<number | ''>('');
  const [cityId, setCityId] = useState<number | ''>('');

  const { lang, slug } = useParams<{ lang: string; page: string; slug: string }>();
  const labels = {
    az: {
      changeAddress: 'Ünvanı dəyiş',
      newAddress: 'Yeni ünvan',
      orderNumber: 'Sifariş nömrəsi',
      orderHistory: 'Sifariş tarixi',
      productCount: 'Məhsul sayı',
      product: 'məhsul',
      downloadInvoice: 'Faktura yüklə',
      rateProduct: 'Məhsulu qiymətləndir',
      discount: 'Endirim',
      delivery: 'Çatdırılma',
      total: 'Ümumi məbləğ',
      loginPath: 'az',
    },
    en: {
      changeAddress: 'Change address',
      newAddress: 'New address',
      orderNumber: 'Order number',
      orderHistory: 'Order history',
      productCount: 'Product count',
      product: 'product',
      downloadInvoice: 'Download invoice',
      rateProduct: 'Rate product',
      discount: 'Discount',
      delivery: 'Delivery',
      total: 'Total',
      loginPath: 'en',
    },
  } as const;
  const ui = labels[lang === 'en' ? 'en' : 'az'];

  // API'den bölgeleri çek
  const getRegions = async () => {
    try {
      const res = await axios.get('https://admin.brendoo.com/api/regions', {
        headers: { 'Accept-Language': lang, Authorization: `Bearer ${token}` },
      });
      if (res.data) setRegionData(res.data);
    } catch (e) {
      console.error('Regions fetch error:', e);
    }
  };

  // Seçilen bölgeye göre şehirleri çek
  const getCities = async (regId: number) => {
    try {
      const res = await axios.get(`https://admin.brendoo.com/api/cities/${regId}`, {
        headers: { 'Accept-Language': lang, Authorization: `Bearer ${token}` },
      });
      if (res.data) setCityData(res.data);
    } catch (e) {
      console.error('Cities fetch error:', e);
    }
  };

  useEffect(() => {
    getRegions();
  }, []);

  useEffect(() => {
    if (regionId) {
      getCities(regionId as number);
    } else {
      setCityData([]);
      setCityId('');
    }
  }, [regionId]);

  useEffect(() => {
    const s = localStorage.getItem('user-info');
    const p = s ? JSON.parse(s) : null;
    if (p?.customer?.region_id) setRegionId(Number(p.customer.region_id));
    if (p?.customer?.city_id) setCityId(Number(p.customer.city_id));
  }, []);

  // Address change modal state
  const [changeAddress, setChangeAddress] = useState<boolean>(false);
  const [addressInput, setAddressInput] = useState<string>('');
  const [savingAddress, setSavingAddress] = useState<boolean>(false);
  const [addrError, setAddrError] = useState<string>('');

  // auth check
  useEffect(() => {
    const uStr = localStorage.getItem('user-info');
    if (!uStr) {
      navigate(`/${ui.loginPath}/login`);
    }
  }, [navigate]);

  // data fetch
  const { data: order, isLoading: OrderLoading, refetch }: any = GETRequest<Order | any>(
    `/getOrderItem/${slug}`,
    `getOrderItem-${slug}`,
    [lang, slug]
  );

  useEffect(() => {
    refetch?.();
    setChangeAddress(false);
    setAddrError('');
    setAddressInput('');
  }, [slug, refetch]);

  const { data: tarnslation, isLoading: tarnslationLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  // 14 gün yoxlanışı
  const isWithin14Days = (orderDate: string): boolean => {
    const orderD = new Date(orderDate);
    const now = new Date();
    const diffTime = now.getTime() - orderD.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  };

  // Faktura yükləmə
  const handleDownloadInvoice = async () => {
    if (!order?.id) return;

    setInvoiceLoading(true);
    try {
      const response = await axios.get(
        `https://admin.brendoo.com/api/orders/${order.id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': lang,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(tarnslation?.fakturani_yukle || 'Faktura yükləndi');
    } catch (error) {
      console.error('Invoice download error:', error);
      toast.error(tarnslation?.xeta_bas_verdi || 'Xəta baş verdi');
    } finally {
      setInvoiceLoading(false);
    }
  };

  // currency
  const formatCurrency = (price: string | null) => {
    if (!price) return '0.00';
    const currencySymbol = price.replace(/[0-9.]/g, '').trim();
    return `${Number.parseFloat(price).toFixed(2)} ${currencySymbol || '₼'}`;
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [order]);

  const [commentModal, setCommentModal] = useState<boolean>(false);
  const [restoreModal, setRestoreModal] = useState<boolean>(false);

  const getOrderId = (o: any) => o?.order_id ?? o?.id ?? null;

  const openAddressModal = () => {
    setAddrError('');
    setAddressInput(order?.address || '');
    setRegionId(order?.region_id || '');
    setCityId(order?.city_id || '');
    setChangeAddress(true);
  };

  const closeAddressModal = () => {
    if (savingAddress) return;
    setChangeAddress(false);
    setAddrError('');
  };

  const handleSaveAddress = async () => {
    setAddrError('');
    const trimmed = addressInput.trim();

    if (trimmed.length < 5) {
      setAddrError(tarnslation?.msg_one ?? '');
      return;
    }
    const orderId = getOrderId(order);
    if (!orderId) {
      setAddrError(tarnslation?.err_ord ?? '');
      return;
    }

    const uStr = localStorage.getItem('user-info');
    const pUser = uStr ? JSON.parse(uStr) : null;
    const tkn =
      pUser?.token ||
      pUser?.access_token ||
      pUser?.api_token ||
      pUser?.bearer ||
      pUser?.user?.token ||
      '';

    try {
      setSavingAddress(true);

      const res = await fetch('https://admin.brendoo.com/api/changeOrderAddress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
        },
        body: JSON.stringify({
          order_id: orderId,
          address: trimmed,
          region_id: regionId,
          city_id: cityId,
        }),
      });

      if (res.status === 401) {
        navigate(`/en/login`);
        return;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `${tarnslation?.catchhttp ?? ''} ${res.status}`);
      }

      await refetch?.();
      setChangeAddress(false);
    } catch (e: any) {
      setAddrError((e.message || tarnslation?.ddd) ?? '');
      console.error('changeOrderAddress error:', e);
    } finally {
      setSavingAddress(false);
    }
  };

  if (OrderLoading || tarnslationLoading) {
    return (
      <div>
        <Header />
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <Header />

      {order && (
        <>
          {changeAddress && (
            <div
              className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
              onClick={(e) => {
                if (e.target === e.currentTarget) closeAddressModal();
              }}
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  onClick={closeAddressModal}
                  aria-label="Close"
                >
                  <IoClose size={22} />
                </button>
                <h2 className="text-xl font-semibold mb-4">
                  {tarnslation?.izmen_ad || ui.changeAddress}
                </h2>

                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={tarnslation?.noviy_adress || ui.newAddress}
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAddress();
                    if (e.key === 'Escape') closeAddressModal();
                  }}
                  autoFocus
                />

                <SearchableSelect
                  regionData={regionData}
                  value={regionId}
                  onChange={(selectedRegionId: number) => {
                    setRegionId(selectedRegionId);
                    setCityId('');
                  }}
                />

                <SearchableSelectCity
                  cityData={cityData}
                  value={cityId}
                  onChange={(selectedCityId: number) => setCityId(selectedCityId)}
                  // @ts-expect-error disabled
                  disabled={!regionId}
                />

                {addrError && <p className="text-sm text-red-600 mb-2">{addrError}</p>}

                <button
                  className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  onClick={handleSaveAddress}
                  disabled={savingAddress}
                >
                  {savingAddress ? (tarnslation?.coxranenie ?? 'Saxlanılır...') : (tarnslation?.izmen_ad || ui.changeAddress)}
                </button>
              </div>
            </div>
          )}

          <main className="flex max-sm:flex-col flex-row w-full gap-5 p-4">
            <UserAside active={1} />
            <div className="py-2 space-y-6">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <Package className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">{ui.orderNumber}</div>
                      <div className="font-semibold">{order.order_number}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">{ui.orderHistory}</div>
                    <div className="font-semibold">{new Date(order.order_date).toLocaleDateString()}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">{ui.productCount}</div>
                    <div className="font-semibold">{order.order_items_count} {ui.product}</div>
                  </div>

                  <button
                    onClick={handleDownloadInvoice}
                    disabled={invoiceLoading}
                    className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {invoiceLoading ? (tarnslation?.yuklenir || 'Yüklənir...') : ui.downloadInvoice}
                  </button>
                </div>
              </div>

              {order?.order_items?.map((item: any, idx: number) => (
                <div key={item?.id ?? idx} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-slate-100 rounded-md overflow-hidden">
                        {item?.product ? (
                          <img
                            src={getImageUrl(item.product.image || item.product.thumbnail)}
                            alt={item.product.title}
                            className="object-cover w-full h-full cursor-pointer"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                            onClick={() => {
                              const slug = item.product?.slug;
                              const productSlug = typeof slug === 'object' ? (slug as any)?.[lang as string] || (slug as any)?.az || (slug as any)?.en : slug;
                              if (productSlug) navigate(`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}/${productSlug}`);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            <span className="text-slate-500 text-xs" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-semibold">{item?.product ? item.product.title : 'Product not available'}</h3>
                        <div className="text-sm text-slate-500">
                          {(item?.options || []).map((opt: any) => `${opt.filter}: ${opt.option}`).join(', ')}
                        </div>
                        <div className="font-bold">{formatCurrency(item?.price)}</div>
                        {item?.product && (
                          <button className="text-blue-600 text-sm" onClick={() => setProductCommit(item.id)}>
                            {ui.rateProduct}
                          </button>
                        )}
                      </div>
                    </div>

                    {order?.status?.length > 0 && (
                      <div className="ml-auto flex items-start">
                        <div
                          className="bg-white-100 text-black-700 px-4 py-2 rounded-full flex items-center gap-1"
                          style={{ display: order?.isCancel ? 'none' : '', border: '1px solid #cecece' }}
                        >
                          <span>{order?.status ?? ''}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div ref={scrollRef} className="mt-8 overflow-x-auto" style={{ maxWidth: '1160px', width: '100%' }}>
                    <div className="relative flex items-start min-w-max gap-10 px-4 pb-4">
                      <div className="absolute top-3 left-4 right-4 h-1 bg-slate-200 z-0" style={{ display: order?.isCancel ? 'none' : '' }}>
                        <div className="h-1 bg-green-500 transition-all duration-500" style={{ width: '100%' }} />
                      </div>

                      {order?.isCancel ? (
                        <div className="text-red-600 font-semibold py-4 px-6 border rounded bg-red-100 text-center flex align-center justify-center gap-3">
                          <IoClose fontSize={24} />
                          <p>{order?.cancelTitle}</p>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          {(item?.statuses || []).map((s: any) => (
                            <div key={s.id} className="z-10 flex flex-col items-center text-center min-w-[80px]">
                              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <p className="mt-2 text-xs font-medium capitalize">{s.status}</p>
                              <p className="text-[10px] text-slate-500 whitespace-nowrap">{s.created_at}</p>
                            </div>
                          ))}
                          {item?.statusDelivery && (
                            <div className="z-10 flex flex-col items-center text-center min-w-[80px]">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <p className="mt-2 text-xs font-medium">{item.statusDelivery.status}</p>
                              <p className="text-[10px] text-slate-500 whitespace-nowrap">{item.statusDelivery.created_at}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col md:flex-row items-start gap-4">
                    {item?.returnable && isWithin14Days(order.order_date) ? (
                      <>
                        <button className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50" onClick={() => setRestoreModal(true)}>
                          {tarnslation?.iade_et || 'İadə et'}
                        </button>
                        <button
                          onClick={() => setCommentModal(true)}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-blue-500 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
                        >
                          {tarnslation?.add_com || 'Rəy əlavə et'}
                        </button>
                        {commentModal && <RatingModal productId={item?.product?.id ? item?.product?.id : null} onClose={() => setCommentModal(false)} />}
                        {restoreModal && <RestoreModal productd={item?.product} order_item_id={item?.id} onClose={() => setRestoreModal(false)} />}
                      </>
                    ) : item?.returnable ? (
                      <div className="text-gray-500 text-sm italic flex items-center gap-2">
                        <IoClose className="text-red-400" />
                        {tarnslation?.qaytarilmir_text || 'İadə müddəti bitib (14 gün)'}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {/* ✅ Delivery Timeline Section */}
              {order?.delivery && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">{tarnslation?.catdirilma_izle || 'Çatdırılma İzləmə'}</h3>
                    {order.delivery.expargo_status && (
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                        ExpargoStatusColors[order.delivery.expargo_status as ExpargoStatus]?.bg || 'bg-gray-100'
                      } ${ExpargoStatusColors[order.delivery.expargo_status as ExpargoStatus]?.text || 'text-gray-800'}`}>
                        {order.delivery.expargo_status_text || ExpargoStatusColors[order.delivery.expargo_status as ExpargoStatus]?.label}
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Timeline */}
                    <div className="space-y-4">
                      {order.delivery.timeline?.map((step: any, index: number) => {
                        const isCancelled = order?.isCancel === true;
                        const isLastItem = index === (order.delivery.timeline?.length || 0) - 1;
                        return (
                          <div key={step.status || index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                              }`}>
                                {step.completed ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Circle className="w-3 h-3" />
                                )}
                              </div>
                              {(!isLastItem || isCancelled) && (
                                <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-300' : 'bg-gray-200'}`} />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.title}
                              </p>
                              {step.description && (
                                <p className="text-sm text-gray-500">{step.description}</p>
                              )}
                              {step.date && (
                                <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Ləğv edildi statusu */}
                      {order?.isCancel === true && (
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <IoClose className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="font-medium text-red-600">
                              {tarnslation?.legv_edildi || 'Ləğv edildi'}
                            </p>
                            {order?.cancel_reason && (
                              <p className="text-sm text-gray-500">{order.cancel_reason}</p>
                            )}
                            {order?.cancelled_at && (
                              <p className="text-xs text-gray-400 mt-1">{order.cancelled_at}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Əgər timeline yoxdursa, sadəcə status göstər */}
                      {!order.delivery.timeline && order.delivery.status_text && !order?.isCancel && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <Truck className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{order.delivery.status_text}</p>
                            {order.delivery.estimate && (
                              <p className="text-sm text-gray-500">{tarnslation?.texmini_catdirilma || 'Təxmini'}: {order.delivery.estimate}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Əgər timeline yoxdursa və ləğv edilibsə */}
                      {!order.delivery.timeline && order?.isCancel === true && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                          <IoClose className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-600">{tarnslation?.legv_edildi || 'Ləğv edildi'}</p>
                            {order?.cancel_reason && (
                              <p className="text-sm text-gray-500">{order.cancel_reason}</p>
                            )}
                            {order?.cancelled_at && (
                              <p className="text-sm text-gray-500">{order.cancelled_at}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pickup Point & Parcel Info */}
                    <div className="space-y-4">
                      {/* Tracking Number */}
                      {order.delivery.parcel?.tracking_number && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">{tarnslation?.tracking_nomresi || 'Tracking nömrəsi'}</p>
                          <p className="font-semibold text-lg">{order.delivery.parcel.tracking_number}</p>
                          {order.delivery.parcel.sent_at && (
                            <p className="text-xs text-gray-400 mt-1">{tarnslation?.gonderilme_tarixi || 'Göndərilmə'}: {order.delivery.parcel.sent_at}</p>
                          )}
                        </div>
                      )}

                      {/* Pickup Point */}
                      {order.delivery.pickup_point && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-semibold">{order.delivery.pickup_point.name}</p>
                              <p className="text-sm text-gray-600">{order.delivery.pickup_point.address}</p>
                              {order.delivery.pickup_point.city && (
                                <p className="text-sm text-gray-500">{order.delivery.pickup_point.city}</p>
                              )}
                              {order.delivery.pickup_point.working_hours && (
                                <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  <span>{order.delivery.pickup_point.working_hours}</span>
                                </div>
                              )}
                              {order.delivery.pickup_point.phone && (
                                <a href={`tel:${order.delivery.pickup_point.phone}`} className="flex items-center gap-1 mt-1 text-sm text-blue-600 hover:underline">
                                  <Phone className="w-4 h-4" />
                                  <span>{order.delivery.pickup_point.phone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Estimate */}
                      {order.delivery.estimate && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                          <Clock className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="text-sm text-gray-600">{tarnslation?.texmini_catdirilma || 'Təxmini çatdırılma'}</p>
                            <p className="font-semibold">{order.delivery.estimate}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{tarnslation?.d_d ?? 'Göndərmə məlumatı'}</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-slate-500">{tarnslation?.adres_key ?? 'Ünvan'}</div>
                        <div className="font-medium">{order.address}</div>
                      </div>
                      {order.addressChangeAble && (
                        <button className="text-blue-600 flex items-center gap-1 text-sm" onClick={openAddressModal}>
                          {tarnslation?.ism_ ?? 'Ünvanı dəyiş'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">{tarnslation?.p_p ?? 'Ödəniş məlumatları'}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-slate-500">{tarnslation?.kol_ ?? 'Məhsul məbləği'}</div>
                        <div className="font-medium">{formatCurrency(order.total_price)}</div>
                      </div>
                      {order.discount && Number.parseFloat(order.discount) > 0 && (
                        <div className="flex justify-between items-center">
                          <div className="text-slate-500">{ui.discount}</div>
                          <div className="font-medium text-red-500">-{formatCurrency(order.discount)}</div>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="text-slate-500">{ui.delivery}</div>
                        <div className="font-medium">{order.delivered_price ? formatCurrency(order.delivered_price) : '0.00 ₼'}</div>
                      </div>
                      <div className="border-t pt-4 flex justify-between items-center">
                        <div className="text-slate-500">{ui.total}</div>
                        <div className="font-bold text-green-600">{formatCurrency(order.final_price)}</div>
                      </div>
                      {order.payment_type === 'card' && (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-8 h-5 bg-red-500 rounded" />
                          <div className="w-8 h-5 bg-yellow-500 rounded" />
                          <div className="text-sm">****0000</div>
                        </div>
                      )}
                      {order.payment_type === 'cash' && (
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-sm">{tarnslation?.nagd_odenis || 'Nağd ödəniş'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default OrderItemsDetail;