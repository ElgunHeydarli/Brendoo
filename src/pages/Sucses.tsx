import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { TranslationsKeys } from '../setting/Types';
import GETRequest from '../setting/Request';
import ROUTES from '../setting/routes';
import Loading from '../components/Loading';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Phone, Clock, Package, CheckCircle } from 'lucide-react';

interface OrderDetails {
  id: number;
  order_number: string;
  tracking_number?: string;
  pickup_point?: {
    name: string;
    address: string;
    phone?: string;
    working_hours?: string;
  };
}

export default function Sucses() {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const [searchParams] = useSearchParams();
  const userInfo = localStorage.getItem('user-info');
  const parsedInfo = userInfo ? JSON.parse(userInfo) : null;
  const token = parsedInfo?.token;

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed'>('checking');
  
  const { data: tarnslation, isLoading: tarnslationLoading } =
    GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);

  // Epoint ödəniş statusunu yoxla
  const checkEpointPayment = async (orderIdParam: string) => {
    try {
      const response = await axios.post(
        'https://admin.brendoo.com/api/epoint/check-status',
        {
          order_id: orderIdParam,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.status === 'APPROVED') {
        setPaymentStatus('success');
        // LocalStorage-ı təmizlə
        localStorage.removeItem('order_ID');
        // Sifariş detallarını al
        fetchOrderDetails(orderIdParam);
      } else if (response.data.status === 'DECLINED') {
        setPaymentStatus('failed');
      } else {
        // PENDING - bir az gözlə və yenidən yoxla
        setTimeout(() => checkEpointPayment(orderIdParam), 3000);
      }
    } catch (error) {
      console.error('Epoint status check error:', error);
      setPaymentStatus('success'); // Callback uğurlu olub, səhifəyə gəlib
      fetchOrderDetails(orderIdParam);
    }
  };

  // Sifariş detallarını al
  const fetchOrderDetails = async (orderIdParam: string) => {
    try {
      const response = await axios.get(
        `https://admin.brendoo.com/api/orders/${orderIdParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': lang,
          },
        },
      );
      if (response.data) {
        setOrderDetails(response.data.order || response.data);
      }
    } catch (error) {
      console.error('Order details fetch error:', error);
    }
  };

  useEffect(() => {
    // URL-dən order_id al (Epoint redirect ilə gəlir)
    const orderIdFromUrl = searchParams.get('order_id');
    const orderIdFromStorage = localStorage.getItem('order_ID');
    
    const finalOrderId = orderIdFromUrl || orderIdFromStorage;
    
    if (finalOrderId) {
      setOrderId(finalOrderId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (orderId && token) {
      checkEpointPayment(orderId);
    } else if (orderId) {
      // Token yoxdursa, sadəcə success göstər
      setPaymentStatus('success');
    }
  }, [orderId, token]);

  if (tarnslationLoading || paymentStatus === 'checking') {
    return <Loading />;
  }

  // Ödəniş uğursuz oldusa, fail səhifəsinə yönləndir
  if (paymentStatus === 'failed') {
    window.location.href = `/${lang}/fail`;
    return <Loading />;
  }

  return (
    <div>
      <Header />
      <main>
        <div className="px-[40px] max-sm:px-4 pt-[40px] mb-[28px] ">
          <div className="flex items-center gap-2 flex-wrap">
            <Link reloadDocument to={`${lang}`}>
              <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
                {tarnslation?.home}
              </h6>
            </Link>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            />

            <Link
              reloadDocument
              to={`/${lang}/${ROUTES.order[lang as keyof typeof ROUTES.order]}`}
            >
              <h6 className="text-nowrap self-stretch my-auto hover:text-blue-600">
                {tarnslation?.basked}
              </h6>
            </Link>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            />
            <h6 className="text-nowrap self-stretch my-auto">{tarnslation?.sucses}</h6>
          </div>
        </div>
        <section className="flex justify-center items-center pb-[120px] px-7">
          <div className="max-w-[500px] flex flex-col justify-center items-center">
            {/* Success Icon */}
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              {tarnslation?.uğurlu_sifariş || 'Sifarişiniz uğurla qəbul edildi!'}
            </h1>
            
            <p className="text-base text-center text-gray-500 mb-6">
              {tarnslation?.uğurlu_sifariş_desc || 'Sifarişiniz emal olunur'}
            </p>

            {/* Order Info Card */}
            {orderDetails && (
              <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                {/* Order Number */}
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">{tarnslation?.sifaris_nomresi || 'Sifariş №'}</span>
                    </div>
                    <span className="font-bold text-blue-600">{orderDetails.order_number || `#${orderDetails.id}`}</span>
                  </div>
                  {orderDetails.tracking_number && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Tracking:</span>
                      <span className="font-semibold text-gray-700">{orderDetails.tracking_number}</span>
                    </div>
                  )}
                </div>

                {/* Pickup Point */}
                {orderDetails.pickup_point && (
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-50">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">{tarnslation?.pickup_noqtesi || 'Pickup nöqtəsi'}</p>
                        <p className="font-semibold text-gray-900">{orderDetails.pickup_point.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{orderDetails.pickup_point.address}</p>
                        
                        <div className="flex flex-wrap gap-3 mt-3">
                          {orderDetails.pickup_point.phone && (
                            <a 
                              href={`tel:${orderDetails.pickup_point.phone}`} 
                              className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                            >
                              <Phone className="w-4 h-4" />
                              {orderDetails.pickup_point.phone}
                            </a>
                          )}
                          {orderDetails.pickup_point.working_hours && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {orderDetails.pickup_point.working_hours}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Estimate */}
                <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      {tarnslation?.catdirilma_muddeti || 'Təxmini çatdırılma'}: <strong>5-14 iş günü</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Back to Home Button */}
            <Link
              reloadDocument
              to={`/${lang}/${ROUTES?.home[lang as keyof typeof ROUTES.home]}`}
            >
              <button className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold flex items-center gap-2">
                {tarnslation?.uğurlu_sifariş_btn || 'Alış-verişə davam et'}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 14L5 10L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 10H16C17.0609 10 18.0783 10.4214 18.8284 11.1716C19.5786 11.9217 20 12.9391 20 14C20 15.0609 19.5786 16.0783 18.8284 16.8284C18.0783 17.5786 17.0609 18 16 18H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>

            {/* View Orders Link */}
            <Link
              to={`/${lang}/${ROUTES?.order?.[lang as keyof typeof ROUTES.order] || 'orders'}`}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              {tarnslation?.sifarislerim || 'Sifarişlərimi gör'} →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}