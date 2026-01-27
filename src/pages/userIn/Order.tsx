import Header from '../../components/Header';
import UserAside from '../../components/userAside';
import { useNavigate, useParams } from 'react-router-dom';
import GETRequest, { axiosInstance } from '../../setting/Request';
import { Order, TranslationsKeys } from '../../setting/Types';
import Loading from '../../components/Loading';
import React, { useEffect, useState } from 'react';
import OrderMainItem from './OrderMainItem';
import axios from 'axios';
// https://admin.brendoo.com/api/getOrders
export default function ORder() {
  const { lang = 'ru' } = useParams<{ lang: string }>();
  const [, setLoading] = useState(false);
  const [checkedRetunProductsIds, setCheckedRetunProductsIds] = useState<number[]>([]);

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const { data: translation, isLoading: transloationLoading } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  // selected status by filter
  const [selectedStatusName, setSelectedStatusName] = React.useState<any>();
  const [isTopDelivery, setIsTopDelivery] = React.useState<boolean>(false);

  const selectedStatusQuery =
    selectedStatusName === 'vse' || selectedStatusName === ''
      ? ''
      : encodeURIComponent(selectedStatusName);

  const apiQuery = isTopDelivery
    ? `?topdelivery_status=${selectedStatusQuery}`
    : `?status=${selectedStatusQuery}`;
  
  console.log('🔍 [ORDER PAGE] API Query:', `/getOrders${selectedStatusQuery ? apiQuery : ''}`);
  console.log('🔍 [ORDER PAGE] Selected Status:', selectedStatusName);
  console.log('🔍 [ORDER PAGE] Is Top Delivery:', isTopDelivery);
  
  const { data: Orders, isLoading: OrdersLoading } = GETRequest<Order[]>(
    `/getOrders${selectedStatusQuery ? apiQuery : ''}`,
    'getOrders',
    [lang, selectedStatusQuery],
  );
  
  console.log('📦 [ORDER PAGE] Orders Data:', Orders);
  console.log('📦 [ORDER PAGE] Orders Count:', Orders?.length || 0);

  useEffect(() => {
    const orderList = document.getElementById('order-list');
    if (orderList) {
      orderList.scrollLeft = orderList.scrollWidth;
    }
  }, [selectedStatusName]);

  React.useEffect(() => {
    setSelectedStatusName('vse');
  }, []);

  const navigate = useNavigate();
  useEffect(() => {
    const userStr = localStorage.getItem('user-info');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('user:', user);
    } else {
      navigate(`/en/login`);
    }
  }, []);

  // Submit return request
  const submitReturn = async () => {
    setLoading(true);
    if (!checkedRetunProductsIds.length) return;

    const userStr = localStorage.getItem('user-info');
    const token = userStr ? JSON.parse(userStr).token : null;

    try {
      // Format quantities as required by the API
      const formattedQuantities: Record<string, number> = {};
      checkedRetunProductsIds.forEach(id => {
        formattedQuantities[id.toString()] = quantities[id] || 1;
      });

      await axiosInstance.post(
        '/returns',
        {
          products: [...checkedRetunProductsIds],
          quantities: formattedQuantities,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      setCheckedRetunProductsIds([]);
      setQuantities({});
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // fetch new statuses
  const userInfoRaw = localStorage.getItem('user-info');
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const token = userInfo?.token;

  const [loadingStatuses, setLoadingStatuses] = React.useState<boolean>(false);
  const [allStatuses, setAllStatuses] = React.useState<{ id: number; title: string }[]>([]);
  const fetchAllStasuses = async () => {
    setLoadingStatuses(true);
    try {
      const res = await axios.get('https://admin.brendoo.com/api/status-list', {
        headers: {
          'Accept-Language': lang,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setAllStatuses(res.data);
        console.log('✅ [STATUS LIST] Success:', res.data);
      } else {
        console.log('⚠️ [STATUS LIST] Empty response, status:', res.status);
      }
    } catch (error) {
      console.error('❌ [STATUS LIST] Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ [STATUS LIST] Response:', error.response?.data);
        console.error('❌ [STATUS LIST] Status:', error.response?.status);
        console.error('❌ [STATUS LIST] Headers:', error.response?.headers);
      }
    } finally {
      setLoadingStatuses(false);
    }
  };

  React.useEffect(() => {
    fetchAllStasuses();
  }, []);

  const [cancellationReasons, setCancellationReasons] = useState([]);
  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const res = await axios.get(
          'https://admin.brendoo.com/api/order-cancellation-reasons',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Accept-Language': lang,
            },
          },
        );
        setCancellationReasons(res.data);
      } catch (err) {
        console.error('error fetching cancellation reasons', err);
      }
    };

    fetchReasons();
  }, [token, lang]);

  React.useEffect(() => {
    fetchAllStasuses();
  }, [lang]);

  if (transloationLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Header />
      {/* <div className="mt-[180px]" /> */}
      <main className="w-full gap-5 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 w-full">
          <div className=" col-span-3 w-full">
            <UserAside active={1} />
          </div>
          <div className=" col-span-9 w-full">
            <div className="w-full rounded-[20px] bg-[#F8F8F8] lg:p-[40px] px-2 py-10">
              <div className="flex flex-col gap-6">
                <h1 className="text-[28px] font-semibold">{translation?.oders}</h1>

                {checkedRetunProductsIds?.length > 0 && (
                  <button
                    onClick={submitReturn}
                    className={`rounded-full px-7 py-3 text-white font-medium text-[16px] leading-[19.5px] transition duration-300
                    ${
                      true
                        ? 'bg-[#3873C3]'
                        : 'bg-transparent border border-black border-opacity-10'
                    }`}
                  >
                    {translation?.return_text}
                  </button>
                )}

                {loadingStatuses ? (
                  <Loading />
                ) : (
                  <div className="flex flex-wrap gap-3 items-center">
                    <div
                      onClick={() => setSelectedStatusName('vse')}
                      className="px-4 py-2 bg-[#f0f0f0] text-sm font-medium rounded-full border border-gray-300"
                      style={{
                        backgroundColor: selectedStatusName === 'vse' ? '#3873c3' : '',
                        color: selectedStatusName === 'vse' ? 'white' : '',
                        cursor: selectedStatusName !== 'vse' ? 'pointer' : 'auto',
                      }}
                    >
                      {translation?.Hamısı}
                    </div>
                    {allStatuses?.map((item: any) => {
                      const isActive = item?.topdelivery
                        ? isTopDelivery && selectedStatusName === item?.topdelivery_id
                        : !isTopDelivery && selectedStatusName === item?.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item?.topdelivery) {
                              setSelectedStatusName(item?.topdelivery_id);
                              setIsTopDelivery(true);
                            } else {
                              setSelectedStatusName(item?.id);
                              setIsTopDelivery(false);
                            }
                          }}
                          className={`px-4 py-2 text-sm font-medium rounded-full border border-gray-300 cursor-pointer ${
                            isActive ? 'bg-[#3873c3] text-white' : 'bg-[#f0f0f0] text-black'
                          }`}
                        >
                          {item.title}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col mt-4 gap-6  px-[20px] [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
                {OrdersLoading ? (
                  // Skeleton Loader
                  <>
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="flex flex-wrap gap-10 items-center text-sm font-medium justify-between animate-pulse"
                      >
                        <div className="flex gap-3 max-md:flex-col items-center lg:justify-start md:justify-start justify-start text-xs text-black text-opacity-60">
                          <div className="bg-gray-200 rounded-3xl aspect-[1.12] w-[134px] h-[134px]" />
                          <div className="flex flex-col self-stretch my-auto w-full">
                            <div className="bg-gray-200 h-4 rounded w-1/3 mb-2"></div>
                            <div className="bg-gray-200 h-6 rounded w-1/2 mb-2"></div>
                            <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                          </div>
                        </div>
                        <div className="bg-gray-200 h-6 rounded w-20 self-stretch my-auto"></div>
                        <div className="flex gap-2 items-center self-stretch py-0.5 my-auto">
                          <div className="bg-gray-200 h-4 rounded w-16"></div>
                          <div className="bg-gray-200 rounded-full w-4 h-4"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  Orders?.map(order => (
                    <OrderMainItem
                      key={order.id}
                      order={order}
                      cancellationReasons={cancellationReasons}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
