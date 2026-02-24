import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import UserAside from '../../components/userAside';
import GETRequest from '../../setting/Request';
import { Order, TranslationsKeys } from '../../setting/Types';
import Loading from '../../components/Loading';
import { cn } from '../../utils/cn';
import { useEffect, useState } from 'react';
import CancelModal from '../../components/Modal_censel/modal';
import ChageAdressModal from '../../components/Change-Adress-Modal';

const API_URL = 'https://admin.brendoo.com';

const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  if (src.startsWith('storage/')) return API_URL + '/' + src;
  return API_URL + '/storage/' + src;
};

export default function OrderId() {
  const navigate = useNavigate();
  const [, setProductCommit] = useState<number>(0);
  const [Delete, setDelete] = useState<boolean>(false);
  const [changeadress, setchangeadress] = useState<boolean>(false);

  const { lang, slug } = useParams<{
    lang: string;
    page: string;
    slug: string;
  }>();
  useEffect(() => {
    const userStr = localStorage.getItem('user-info');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log(user);
    } else {
      navigate(`/en/login`);
    }
  }, []);
  const { data: Order, isLoading: OrderLoading } = GETRequest<Order>(
    `/getOrderItem/${slug}`,
    'getOrderItem',
    [lang]
  );
  const { data: tarnslation, isLoading: tarnslationLoading } =
    GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);

  if (OrderLoading || tarnslationLoading) {
    <Loading />;
  }
  return (
    <div>
      <Header />
      {/* <div className="mt-[180px]" /> */}
      <main className="flex max-sm:flex-col flex-row w-full gap-5 p-4">
        <UserAside active={1} />
        <div className="w-full rounded-[20px] bg-[#F8F8F8] lg:p-[40px] px-2 py-10">
          <div className="flex flex-col items-start ">
            <div className="flex flex-col max-w-full whitespace-nowrap w-[162px]">
              <div
                onClick={() => navigate(-1)}
                className="flex gap-2 items-center self-start text-sm text-zinc-950 cursor-pointer">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/4e16fbda98176a2fcfc899b69e0f7e3fea7dc9adeb9c74702a0323a7762de95d?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                  className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                />
                <div className="self-stretch my-auto">{tarnslation?.Geri}</div>
              </div>
              <div className="mt-5 text-3xl font-semibold text-black">
                {tarnslation?.Sifarişim}
              </div>
            </div>

            <div className="flex max-md:hidden flex-nowrap gap-2 items-center mt-10 w-full ">
              <div
                className={cn(
                  'flex shrink-0 self-stretch my-auto w-4 h-4  ',
                  Order?.status === 'ordered' ||
                    Order?.status === 'prepared' ||
                    Order?.status === 'delivered_to_courier' ||
                    Order?.status === 'delivered'
                    ? 'bg-green-500 rounded-full fill-green-500'
                    : 'bg-neutral-200'
                )}
              />
              <div
                className={cn(
                  'flex shrink-0 self-stretch my-auto h-[3px]  rounded-[100px] lg:w-[28%] w-[7%]',
                  Order?.status === 'prepared' ||
                    Order?.status === 'delivered_to_courier' ||
                    Order?.status === 'delivered'
                    ? 'bg-green-500 '
                    : 'bg-neutral-200'
                )}
              />
              <div
                className={cn(
                  'flex shrink-0 self-stretch my-auto w-4 h-4  ',
                  Order?.status === 'prepared' ||
                    Order?.status === 'delivered_to_courier' ||
                    Order?.status === 'delivered'
                    ? 'bg-green-500 rounded-full fill-green-500'
                    : 'bg-neutral-200'
                )}
              />
              <div
                className={cn(
                  'flex shrink-0 self-stretch my-auto h-[3px]  rounded-[100px] lg:w-[28%] w-[7%]',
                  Order?.status === 'delivered_to_courier' ||
                    Order?.status === 'delivered'
                    ? 'bg-green-500 '
                    : 'bg-neutral-200'
                )}
              />
              <div
                className={cn(
                  'flex shrink-0 self-stretch my-auto w-4 h-4  ',
                  Order?.status === 'delivered_to_courier' ||
                    Order?.status === 'delivered'
                    ? 'bg-green-500 rounded-full fill-green-500'
                    : 'bg-neutral-200'
                )}
              />
              <div
                className={cn(
                  'flex shrink-0 self-stretch my-auto h-[3px]  rounded-[100px] lg:w-[28%] w-[7%]',
                  Order?.status === 'delivered'
                    ? 'bg-green-500 '
                    : 'bg-neutral-200'
                )}
              />
              <div
                className={cn(
                  'flex shrink-0 self-stretch my-auto w-4 h-4  ',
                  Order?.status === 'delivered'
                    ? 'bg-green-500 rounded-full fill-green-500'
                    : 'bg-neutral-200'
                )}
              />
              {/* <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-green-500 rounded-full fill-green-500" />
                            <div className="flex shrink-0 self-stretch my-auto bg-neutral-200 h-[3px]  rounded-[100px] lg:w-[28%] w-[7%]" />
                            <div className="flex shrink-0 self-stretch my-auto w-4 h-4 rounded-full bg-neutral-200" />
                            <div className="flex shrink-0 self-stretch my-auto bg-neutral-200 h-[3px]  rounded-[100px] lg:w-[28%] w-[7%]" />
                            <div className="flex shrink-0 self-stretch my-auto w-4 h-4 rounded-full bg-neutral-200" /> */}
            </div>
            <div className="flex flex-wrap flex-row max-sm:flex-col    gap-2 justify-between self-stretch mt-3 w-full max-md:max-w-full">
              <div className="flex flex-row gap-3">
                <div className=" shrink-0 max-md:flex hidden self-stretch my-auto w-4 h-4 bg-green-500 rounded-full fill-green-500 " />

                <div className="flex flex-col">
                  <div className="text-sm w-fit text-black">
                    {tarnslation?.Sifariş_verildi}
                  </div>
                  <div className="mt-1.5 text-xs w-fit text-black text-opacity-60">
                    05.02.2024
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">
                <div className=" shrink-0 max-md:flex hidden self-stretch my-auto w-4 h-4 bg-green-500 rounded-full fill-green-500 " />

                <div className="flex flex-col">
                  <div className="text-sm w-fit text-black">
                    {tarnslation?.Sifariş_hazırlanır}
                  </div>
                  <div className="mt-1.5 text-xs w-fit text-black text-opacity-60">
                    05.02.2024
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">
                <div className=" shrink-0 max-md:flex hidden self-stretch my-auto w-4 h-4 bg-green-500 rounded-full fill-green-500 " />

                <div className="flex flex-col">
                  <div className="text-sm w-fit text-black">
                    {tarnslation?.Kuryerə_verildi}
                  </div>
                  <div className="mt-1.5 text-xs w-fit text-black text-opacity-60">
                    05.02.2024
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-3">
                <div className=" shrink-0 max-md:flex hidden self-stretch my-auto w-4 h-4 bg-green-500 rounded-full fill-green-500 " />

                <div className="flex flex-col">
                  <div className="text-sm w-fit text-black">
                    {tarnslation?.Çatdırıldı}
                  </div>
                  <div className="mt-1.5 text-xs w-fit text-black text-opacity-60">
                    05.02.2024
                  </div>
                </div>
              </div>
              {/* <div className="flex flex-col">
                                <div className="text-sm w-fit text-black">
                                    Sifariş hazırlanır
                                </div>
                                <div className="mt-1.5 text-xs w-fit text-black text-opacity-60">
                                    05.02.2024
                                </div>
                            </div>
                            <div className="self-start text-sm w-fit text-green-950">
                                Kuryerə verildi
                            </div>
                            <div className="self-start text-sm w-fit whitespace-nowrap text-black text-opacity-60">
                                Çatdırıldı
                            </div> */}
            </div>
          </div>
          <div className="flex flex-col font-semibold text-[16px] mt-[60px]">
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 items-center w-full max-md:max-w-full">
              {Order?.order_items.map((item) => (
                <div className="flex gap-3 items-center flex-wrap">
                  <img
                    loading="lazy"
                    src={getImageUrl(item.product.image || item.product.thumbnail)}
                    alt={item.product.title || 'Product'}
                    className="object-cover shrink-0 self-stretch my-auto rounded-3xl aspect-[1.12] w-[134px] cursor-pointer"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                    onClick={() => {
                      const slug = item.product?.slug;
                      const productSlug = typeof slug === 'object' ? (slug as any)?.[lang as string] || (slug as any)?.az || (slug as any)?.en : slug;
                      if (productSlug) window.open(`/${lang}/product/${productSlug}`, '_blank');
                    }}
                  />
                  <div className="flex flex-col justify-center self-stretch my-auto">
                    <div className="text-sm text-black text-wrap">
                      {item.product.title}{' '}
                    </div>
                    {Order?.status === 'delivered' && (
                      <button
                        className="mt-4 text-xs w-fit text-wrap text-blue-600 underline decoration-auto decoration-solid underline-offset-auto"
                        onClick={() => setProductCommit(item?.product?.id)}>
                        {tarnslation?.Məhsulu_dəyərləndir}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex overflow-hidden max-sm:justify-center flex-wrap gap-10 px-6 py-5 rounded-3xl bg-white bg-opacity-80  justify-between max-md:pr-5 mt-4">
            <div className="flex gap-5 max-sm:flex-row items-center max-sm:gap-2 ">
              <div className="flex gap-5 items-center self-stretch my-auto">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/61bb2aca9b7b286baed1108447439f3b7e43632b7436e098db5d7997b28e7858?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                  className="object-contain max-sm:hidden shrink-0 self-stretch my-auto aspect-square w-[60px]"
                />
                <div className="flex flex-col self-stretch my-auto">
                  <div className="text-xs text-black text-opacity-60">
                    {tarnslation?.Sifariş_nömrəsi}:
                  </div>
                  <div className="mt-2 text-base text-black">
                    {Order?.order_number}
                  </div>
                </div>
              </div>
              <div className="shrink-0 self-stretch my-auto w-0 h-11 border border-solid border-zinc-300" />
              <div className="flex flex-col self-stretch my-auto">
                <div className="text-xs text-black text-opacity-60">
                  {tarnslation?.Sifariş_tarixi}:{' '}
                </div>
                <div className="mt-2 text-base text-black">
                  {Order?.order_date}
                </div>
              </div>
              <div className="shrink-0 self-stretch my-auto w-0 h-11 border border-solid border-zinc-300" />
              <div className="flex flex-col self-stretch my-auto">
                <div className="text-xs text-black text-opacity-60">
                  {tarnslation?.Məhsul_sayı}:{' '}
                </div>
                <div className="mt-2 text-base text-black">
                  {Order?.order_items_count}
                </div>
              </div>
            </div>
            {/* <button className="flex gap-2.5 justify-center items-center px-7 py-3.5 my-auto text-base font-medium text-center text-white bg-[#3873C3] rounded-xl border border-solid border-neutral-100 max-md:px-5">
                            <img
                                loading="lazy"
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f94626f29baa40253df5d994693071ebb35e01a27694c2109f8aa983ec4265d5?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                                className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
                            />
                            <div className="self-stretch my-auto">
                                Faktura yüklə ///make it worck
                            </div>
                        </button> */}
          </div>
          <div className="flex flex-col mt-[30px]">
            {Order?.payment_type === 'card' && (
              <div className="flex overflow-hidden flex-wrap gap-5 justify-between items-center px-6 py-5 w-full text-base font-medium text-center bg-white rounded-t-3xl text-black text-opacity-80 max-md:px-5 max-md:max-w-full">
                <div className="self-stretch my-auto max-sm:hidden">
                  {tarnslation?.Çatdırılma_məlumatları}:
                </div>
                {/* <div className="self-stretch my-auto">
                  {tarnslation?.Change_address}:
                </div> */}
                <div className="flex gap-1 items-center self-stretch text-black whitespace-nowrap">
                  <img
                    loading="lazy"
                    srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/9d4a1a23b873f9a7a617a8408e9f84223a82454a0244d5c030c16308e9e29024?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                    className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
                  />
                  <div className="self-stretch my-auto">****0000</div>
                </div>
              </div>
            )}
            <div className="overflow-hidden px-5 pt-5 pb-11 rounded-b-3xl mt-1 w-full bg-white max-md:pl-5 max-md:max-w-full">
              <div className="flex gap-5 max-md:flex-col">
                <div className="flex flex-col w-[44%] max-md:ml-0 max-md:w-full">
                  <div className="flex flex-col w-full max-md:mt-10 h-full justify-between">
                    <div className="flex flex-col w-full">
                      <div className="self-stretch my-auto max-sm:block hidden mb-3">
                        {tarnslation?.Çatdırılma_məlumatları}:
                      </div>
                      <div className="text-sm text-black text-opacity-60">
                        {tarnslation?.Ünvan}:
                      </div>
                      <div className="mt-2 text-base text-black">
                        {Order?.address}
                      </div>
                    </div>
                    {Order?.status === 'ordered' && (
                      <button
                        className="flex gap-2 items-center self-start py-0.5 mt-5 text-sm font-medium text-blue-600 border-b border-solid border-b-blue-600"
                        onClick={() => setchangeadress(true)}>
                        <div className="self-stretch my-auto">
                          {tarnslation?.SETÜnvan}:
                        </div>
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0526326e93674398bc67c3737a2087d7b05c1e7206ef11005491f94e8cb5b1f3?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                          className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
                        />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col ml-5 w-[56%] max-md:ml-0 max-md:w-full">
                  <div className="flex flex-col w-full max-md:mt-10 max-md:max-w-full">
                    <div className="flex gap-5 justify-between text-sm max-md:max-w-full">
                      <div className="text-black text-opacity-60">
                        {tarnslation?.Məhsul_məbləği}:
                      </div>
                      <div className="font-medium text-center text-black">
                        {Order?.total_price}₼
                      </div>
                    </div>
                    <div className="shrink-0 mt-5 h-px border border-solid border-zinc-300 max-md:max-w-full" />
                    <div className="flex gap-5 justify-between mt-3 text-sm max-md:max-w-full">
                      <div className="text-black text-opacity-60">
                        {tarnslation?.Endirim}:
                      </div>
                      <div className="font-medium text-center text-black">
                        {Order?.discount} ₼
                      </div>
                    </div>
                    <div className="shrink-0 mt-5 h-px border border-solid border-zinc-300 max-md:max-w-full" />
                    <div className="flex gap-5 justify-between mt-3 max-md:max-w-full">
                      <div className="my-auto text-sm text-black text-opacity-60">
                        {' '}
                        {tarnslation?.Ümumi_məbləğ}:
                      </div>
                      <div className="text-lg font-semibold text-center text-green-500">
                        {Order?.final_price}₼
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center mt-[40px]">
            {Order?.status === 'ordered' && (
              <button
                onClick={() => setDelete(true)}
                className="gap-2.5 self-start px-6 py-3 text-sm font-medium text-rose-500 border border-rose-500 border-solid rounded-[100px]">
                {tarnslation?.Sifarişin_ləğvi}
              </button>
            )}

            <div className="flex gap-2 items-center mt-3.5 text-xs text-black text-opacity-80">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/de6a5b11847522840b6320ba9d9c3ff5184743b8eb06723fc6afbd171fb70ae5?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
              />
              <div className="self-stretch my-auto">
                {tarnslation?.Sifariş_hazırlanma}
              </div>
            </div>
          </div>
        </div>
        {/* {ProductCommit > 0 && (
          <RatingModal
            ProductCommit={ProductCommit}
            onClose={() => {
              setProductCommit(0);
            }}
          />
        )} */}
        {Delete && (
          <CancelModal
            onClose={() => {
              setDelete(false);
            }}
          />
        )}{' '}
        <ChageAdressModal
          id={Order?.id || 0}
          isOpen={changeadress}
          onClose={() => {
            setchangeadress(false);
          }}
        />
      </main>
    </div>
  );
}
