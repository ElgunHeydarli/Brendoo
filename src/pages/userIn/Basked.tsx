import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request.ts';
import { Basket, TranslationsKeys } from '../../setting/Types.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import ROUTES from '../../setting/routes.tsx';
import Loading from '../../components/Loading/index.tsx';
import React from 'react';
import { ProductDetail } from '../../setting/Types';

export default function Basked() {
  const GUEST_CART_KEY = 'guest_cart';
  type GuestCartItem = {
    id: number;
    product: ProductDetail; // məhsulun detalları
    quantity: number;
    price: string; // API-də string formatda gəlir
    options: { filter: string; option: string }[];
    selected_options?: Record<string, string>; // CJ variant məlumatları
    variant_key?: string;
    selected_image?: string;
  };

  type GuestCart = {
    basket_items: GuestCartItem[];
    total_price: number;
    discount: number;
    final_price: number;
  };

  const getGuestCart = (): GuestCart => {
    try {
      return JSON.parse(
        localStorage.getItem(GUEST_CART_KEY) ||
          '{"basket_items": [], "total_price": 0, "discount": 0, "final_price": 0}',
      );
    } catch {
      return { basket_items: [], total_price: 0, discount: 0, final_price: 0 };
    }
  };

  const setGuestCart = (cart: GuestCart) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  };

  const userStr = localStorage.getItem('user-info');
  const parsed = userStr ? JSON.parse(userStr) : null;
  const token = parsed?.token;

const { lang = 'az' } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const [baskedLoading, setBaskedLoading] = React.useState<boolean>(false);
  const [basketItemsData, setBasketItemsData] = React.useState<Basket | GuestCart>();

  var hasItems =
    basketItemsData &&
    basketItemsData?.basket_items &&
    basketItemsData?.basket_items?.length > 0
      ? basketItemsData?.basket_items
      : null;

  if (!userStr) {
    const guest_cart = localStorage.getItem('guest_cart') || '';
    const parsedGuestCart = JSON.parse(guest_cart);
    hasItems = parsedGuestCart ? parsedGuestCart['basket_items'] : [];
  }

  React.useEffect(() => {
    if (!userStr) {
      const guest_cart = localStorage.getItem('guest_cart') || '';
      try {
        const parsedGuestCart = JSON.parse(guest_cart || '{}');
        setBasketItemsData(parsedGuestCart);
      } catch (e) {
        console.error('Geçersiz guest_cart JSON:', e);
        setBasketItemsData(undefined);
      }
    }
  }, [userStr]);

  const fetchBasketItems = async () => {
    setBaskedLoading(true);
    try {
      const res = await axios.get('https://admin.brendoo.com/api/basket_items', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': lang,
        },
      });

      if (res.data) {
        setBasketItemsData(res.data);
      } else {
        console.log(res.status);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBaskedLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBasketItems();
  }, []);

  // if is auth remove from basket
  const RemoveFromBasked = async (id: number) => {
    const userStr = localStorage.getItem('user-info');
    if (userStr) {
      const User = JSON.parse(userStr);
      if (User) {
        await axios.delete(`https://admin.brendoo.com/api/basket_items/${id}`, {
          headers: {
            Authorization: `Bearer ${User.token}`,
            Accept: 'application/json',
          },
        });
      }
    }
  };

  const UpdateBasked = async (id: number, price: string, quantity: number) => {
    const userStr = localStorage.getItem('user-info');
    if (userStr) {
      const User = JSON.parse(userStr);
      if (User) {
        await axios.put(
          `https://admin.brendoo.com/api/basket_items/${id}`,
          { price, quantity },
          {
            headers: {
              Authorization: `Bearer ${User.token}`,
              Accept: 'application/json',
            },
          },
        );
        fetchBasketItems();
      }
    }
  };

  const UpdateBaskedmutation = useMutation({
    mutationFn: ({
      id,
      price,
      quantity,
    }: {
      id: number;
      price: string;
      quantity: number;
    }) => UpdateBasked(id, price, quantity),
    onSuccess: () => {
      toast.success(tarnslation?.mehsul_ugurla_yenilendi ?? '');
      queryClient.invalidateQueries({ queryKey: ['basket_items'] });
      fetchBasketItems();
    },
    onError: error => {
      toast.error('');
      console.error(error);
    },
  });

  const queryClient = useQueryClient();

  const RemoveFromBaskedmutation = useMutation({
    mutationFn: RemoveFromBasked,
    onSuccess: () => {
      toast.success(tarnslation?.mehsul_silindi || '');
      queryClient.invalidateQueries({ queryKey: ['basket_items'] });
      fetchBasketItems();
    },
    onError: error => {
      toast.error(tarnslation?.xeta_bas_verdi ?? '');
      console.error(error);
    },
  });

  const { data: tarnslation, isLoading: translateLoading } =
    GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);

  if (translateLoading || baskedLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Header />
      <main className="lg:mt-[0px] mt-0">
        <div className="px-[40px] pt-[40px] max-sm:px-4 mb-[28px]">
          <div className="flex items-center gap-2">
            <Link
              reloadDocument
              to={`/${lang}/${ROUTES.home[lang as keyof typeof ROUTES.product]}`}
            >
              <h6 className="text-nowrap self-stretch my-auto text-black hover:text-blue-600">
                {tarnslation?.home}
              </h6>
            </Link>

            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/64bb3b3dae771cd265db1accd95aa96f30bd9da3da88a57867743da53bebc0eb?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
            />
            <h6 className="text-nowrap self-stretch my-auto">{tarnslation?.basked} </h6>
          </div>
        </div>
        <section className="px-[40px] max-sm:px-4">
          <h3 className="text-[40px] font-semibold  max-sm:text-[32px] mt-[28px] mb-[40px]">
            {tarnslation?.basked}
          </h3>
        </section>
        <section className="flex lg:flex-row flex-col max-sm:px-4  h-fit px-[40px] justify-between mb-[100px] gap-[65px]">
          <div className="flex overflow-hidden flex-col justify-center p-10 rounded-3xl bg-stone-50 w-full gap-[65px] h-fit max-md:px-5">
            <div className="flex flex-col max-md:max-w-full">
              {hasItems
                ? hasItems
                    .filter(item => item && item.product)
                    .map(item => (
                    <React.Fragment key={item.id}>
                      <div className="flex flex-wrap gap-10 items-center justify-between mt-5 max-md:max-w-full">
                        <div className="flex gap-2.5 items-center self-stretch my-auto min-w-[240px]">
                          <img
                            loading="lazy"
                            src={(() => {
                              // Seçilmiş variant şəklini prioritet et
                              const img = (item as any).selected_image || item.product?.image;
                              if (!img) return '/placeholder.png';
                              if (img.startsWith('http')) return img;
                              return `https://admin.brendoo.com${img.startsWith('/') ? '' : '/'}${img}`;
                            })()}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.png';
                            }}
                            onClick={() => {
                              const slug = item.product?.slug;
                              const productSlug = typeof slug === 'object' ? (slug as any)?.[lang] || (slug as any)?.az || (slug as any)?.en : slug;
                              if (productSlug) navigate(`/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}/${productSlug}`);
                            }}
                            className="object-contain shrink-0 self-stretch my-auto rounded-3xl aspect-[1.12] w-[134px] cursor-pointer"
                          />
                          <div className="flex flex-col self-stretch my-auto w-[152px]">
                            <div className="gap-1 self-start text-base font-semibold text-center text-black flex items-center flex-wrap">
                              <span>{item.price || item.product?.discounted_price || item.product?.price || '0'} ₼</span>
                              {/* Show original price with strikethrough if there's a discount */}
                              {(() => {
                                const currentPrice = parseFloat(item.price || item.product?.discounted_price || item.product?.price || '0');
                                const originalPrice = parseFloat(item.product?.price || '0');
                                const hasDiscount = originalPrice > currentPrice && item.product?.discount;
                                if (hasDiscount) {
                                  return (
                                    <span className="ml-2 text-sm text-gray-400 line-through font-normal">
                                      {originalPrice.toFixed(2)} ₼
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <div className="mt-2.5 w-full text-sm text-black">
                              {item.product?.title || ''}
                            </div>
                            <div className="flex flex-col items-start mt-2.5 w-full text-xs text-black text-opacity-80">
                              <div className="flex gap-3 items-start">
                                {/* CJ variant məlumatlarını göstər */}
                                {item.selected_options ? (
                                  Object.entries(item.selected_options).map(([key, value]: [string, any], idx: number) => (
                                    <div key={idx} className="capitalize">
                                      {key}: {value}
                                    </div>
                                  ))
                                ) : (
                                  /* Adi filter options */
                                  item.options && Array.isArray(item.options) && item.options.map((option, idx) => (
                                    <div key={idx}>
                                      {option?.filter} : {option?.option}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 items-center self-stretch my-auto text-sm text-white whitespace-nowrap">
                          <button
                            disabled={item.quantity === 1}
                            onClick={() => {
                              if (userStr) {
                                // LOGIN → server
                                UpdateBaskedmutation.mutate({
                                  id: item.id,
                                  price: item.price,
                                  quantity: item.quantity - 1,
                                });
                              } else {
                                // GUEST → localStorage
                                const cart = getGuestCart();

                                const idx = cart.basket_items.findIndex(i => {
                                  if (i.id !== item.id) return false;
                                  return (
                                    JSON.stringify(i.options || []) ===
                                    JSON.stringify(item.options || [])
                                  );
                                });

                                if (idx !== -1 && cart.basket_items[idx].quantity > 1) {
                                  cart.basket_items[idx].quantity -= 1;
                                }

                                // qiymətləri yenilə
                                let total_price = 0,
                                  discount = 0,
                                  final_price = 0;
                                cart.basket_items.forEach(basketItem => {
                                  const original = +basketItem.product.price;
                                  const discounted =
                                    +basketItem.product.discounted_price;
                                  total_price += original * basketItem.quantity;
                                  discount +=
                                    (original - discounted) * basketItem.quantity;
                                  final_price += discounted * basketItem.quantity;
                                });

                                cart.total_price = total_price;
                                cart.discount = discount;
                                cart.final_price = final_price;

                                setGuestCart(cart);
                                toast.success(
                                  tarnslation?.mehsul_ugurla_yenilendi ?? '',
                                );
                                setBasketItemsData(cart);
                              }
                            }}
                          >
                            <img
                              loading="lazy"
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/28d193498fe0181ef85fe4ae9724992dc65cbe3fabda2add56210add53339fe5?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                              className="object-contain shrink-0 self-stretch my-auto w-8 rounded-lg aspect-square"
                            />
                          </button>

                          <div className="overflow-hidden self-stretch px-2.5 my-auto w-8 h-8 flex justify-center items-center rounded-lg bg-slate-400">
                            {item.quantity}
                          </div>
                          <img
                            onClick={() => {
                              if (userStr) {
                                // LOGIN → server
                                UpdateBaskedmutation.mutate({
                                  id: item.id,
                                  price: item.price,
                                  quantity: item.quantity + 1,
                                });
                              } else {
                                // GUEST → localStorage
                                const cart = getGuestCart();

                                const idx = cart.basket_items.findIndex(i => {
                                  if (i.id !== item.id) return false;
                                  return (
                                    JSON.stringify(i.options || []) ===
                                    JSON.stringify(item.options || [])
                                  );
                                });

                                if (idx !== -1) {
                                  cart.basket_items[idx].quantity += 1;
                                }

                                // qiymətləri yenilə
                                let total_price = 0,
                                  discount = 0,
                                  final_price = 0;
                                cart.basket_items.forEach(basketItem => {
                                  if (!basketItem?.product) return;
                                  const original = +(basketItem.product?.price || 0);
                                  const discounted =
                                    +(basketItem.product?.discounted_price || original);
                                  total_price += original * (basketItem.quantity || 1);
                                  discount +=
                                    (original - discounted) * (basketItem.quantity || 1);
                                  final_price += discounted * (basketItem.quantity || 1);
                                });

                                cart.total_price = total_price;
                                cart.discount = discount;
                                cart.final_price = final_price;

                                setGuestCart(cart);
                                toast.success(
                                  tarnslation?.mehsul_ugurla_yenilendi ?? '',
                                );
                                setBasketItemsData(cart);
                              }
                            }}
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0141e195a9e4eacd357b98a238f5374b7d80c129448dd3fe9f98c88a3f2d375e?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                            className="object-contain cursor-pointer shrink-0 self-stretch my-auto w-8 rounded-lg aspect-square"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (userStr) {
                              // LOGIN → server
                              RemoveFromBaskedmutation.mutate(item.id);
                            } else {
                              // GUEST → localStorage
                              const cart = getGuestCart();

                              // eyni məhsulu options ilə tap
                              const idx = cart.basket_items.findIndex(i => {
                                if (i.id !== item.id) return false;
                                return (
                                  JSON.stringify(i.options || []) ===
                                  JSON.stringify(item.options || [])
                                );
                              });

                              if (idx !== -1) {
                                cart.basket_items.splice(idx, 1); // məhsulu sil
                              }

                              // qiymətləri yenilə
                              let total_price = 0,
                                discount = 0,
                                final_price = 0;
                              cart.basket_items.forEach(basketItem => {
                                if (!basketItem?.product) return;
                                const original = +(basketItem.product?.price || 0);
                                const discounted = +(basketItem.product?.discounted_price || original);
                                total_price += original * (basketItem.quantity || 1);
                                discount +=
                                  (original - discounted) * (basketItem.quantity || 1);
                                final_price += discounted * (basketItem.quantity || 1);
                              });

                              cart.total_price = total_price;
                              cart.discount = discount;
                              cart.final_price = final_price;

                              setGuestCart(cart);
                              setBasketItemsData(cart); // 🔥 UI dərhal yenilənsin
                              toast.success(tarnslation?.mehsul_silindi || '');
                            }
                          }}
                        >
                          <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b4fc83e19d3515c691d41a84b841f0d56e9ac8d5ef3c476eac75fb6fdab0b3c5?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                            className="object-contain shrink-0 self-stretch my-auto w-7 aspect-square rounded-[100px]"
                          />
                        </button>
                      </div>
                      <div className="mt-5 max-w-full min-h-0 border border-solid border-black border-opacity-10 w-full" />
                    </React.Fragment>
                  ))
                : null}
            </div>
          </div>
          <div className="w-[2px]  min-h-[400px] h-[100%] bg-black lg:block hidden  opacity-10" />
          <div className="flex flex-col rounded-3xl min-w-[306px]">
            <div className="flex overflow-hidden flex-col justify-center p-7 w-full rounded-3xl bg-stone-50">
              <div className="flex flex-col">
                <div className="text-base font-semibold text-black">
                  {tarnslation?.Ümumi_sifariş}
                </div>
                <div className="flex flex-col mt-6 w-full">
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col w-full text-sm">
                      <div className="flex gap-10 justify-between items-center w-full">
                        <div className="self-stretch my-auto text-black text-opacity-60">
                          {tarnslation?.Məbləğ}:
                        </div>
                        <div className={`self-stretch my-auto text-right text-black ${basketItemsData?.discount && basketItemsData?.discount>0 ? 'line-through opacity-60' : '' }`}>
                          {basketItemsData?.total_price}₼
                        </div>
                      </div>

                      <div className="flex gap-10 justify-between items-center mt-4 w-full text-rose-500">
                        <div className="self-stretch my-auto">
                          {tarnslation?.Endirim}:
                        </div>
                        <div className="self-stretch my-auto text-right">
                          {basketItemsData?.discount}₼
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 w-full border border-solid border-zinc-300 min-h-[1px]" />
                    <div className="flex gap-10 justify-between items-center mt-3">
                      <div className="self-stretch my-auto text-sm text-black text-opacity-80">
                        {tarnslation?.Cəmi_məbləğ}:
                      </div>
                      <div className="self-stretch my-auto text-base font-semibold text-blue-600">
                        {basketItemsData?.final_price}₼
                      </div>
                    </div>
                  </div>

                  {/* <Link
                    to={
                      userStr
                        ? `/${lang}/${
                            ROUTES.ordersConfirm[lang as keyof typeof ROUTES.ordersConfirm]
                          }`
                        : `/${lang}/${ROUTES.login[lang as keyof typeof ROUTES.login]}`
                    }
                  >
                    <button className="flex overflow-hidden h-[48px] flex-col justify-center items-center px-16 py-3.5 mt-6 w-full text-base font-medium text-white bg-[#3873C3] rounded-[100px]">
                      <div className="gap-2 self-stretch">{tarnslation?.sifarish_et}:</div>
                    </button>
                  </Link> */}

                  <Link
                    to={
                      hasItems && hasItems.length > 0
                        ? userStr
                          ? `/${lang}/${
                              ROUTES.ordersConfirm[
                                lang as keyof typeof ROUTES.ordersConfirm
                              ]
                            }`
                          : `/${lang}/${
                              ROUTES.login[lang as keyof typeof ROUTES.login]
                            }`
                        : '#'
                    }
                  >
                    <button
                      disabled={!hasItems || hasItems.length === 0}
                      className={`flex overflow-hidden h-[48px] flex-col justify-center items-center px-16 py-3.5 mt-6 w-full text-base font-medium rounded-[100px] 
      ${
        hasItems && hasItems.length > 0
          ? 'bg-[#3873C3] text-white cursor-pointer'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }
    `}
                    >
                      <div className="gap-2 self-stretch">
                        {tarnslation?.sifarish_et}:
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
