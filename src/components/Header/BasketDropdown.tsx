import React from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../setting/routes';

const API_URL = 'https://admin.brendoo.com';

// ✅ Şəkil URL-ni düzgün formata çevir
const getImageUrl = (src: string | null | undefined): string => {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/storage/')) return API_URL + src;
  if (src.startsWith('storage/')) return API_URL + '/' + src;
  return '/placeholder.png';
};

interface BasketDropdownProps {
  isBaskedOpen: boolean;
  setIsBaskedOpen: (val: boolean) => void;
  BaskedDiv: React.RefObject<HTMLDivElement>;
  enableScrolling: () => void;
  hasItems: any[] | null;
  baskedLoading: boolean;
  basketItemsData: any;
  User: any;
  translation: any;
  lang: string;
  fetchBasketItems: () => Promise<void>;
  UpdateBaskedmutation: any;
  RemoveFromBaskedmutation: any;
  toggleIdInLocalStorage: (id: number) => void;
}

export default function BasketDropdown({
  isBaskedOpen,
  setIsBaskedOpen,
  BaskedDiv,
  enableScrolling,
  hasItems,
  baskedLoading,
  basketItemsData,
  User,
  translation,
  lang,
  fetchBasketItems,
  UpdateBaskedmutation,
  RemoveFromBaskedmutation,
  toggleIdInLocalStorage,
}: BasketDropdownProps) {
  const navigate = useNavigate();

  if (!isBaskedOpen) return null;

  return (
    <div
      ref={BaskedDiv}
      className="bg-black bg-opacity-60 absolute top-[100%] w-full h-[100vh] px-10 py-2 z-[99999999999]"
    >
      <div
        className="h-[200vh] bg-black bg-opacity-60 w-full absolute top-0 left-0 z-[-1]"
        onClick={() => {
          setIsBaskedOpen(false);
          enableScrolling();
        }}
      />
      <div className="flex overflow-hidden max-h-[60vh] flex-col items-center pt-10 bg-white rounded-3xl w-[511px] absolute right-4">
        {/* Header */}
        <div className="flex gap-5 justify-between w-full max-w-[432px] max-md:max-w-full mx-[40px]">
          <div className="text-lg font-semibold text-center text-slate-800">
            {translation?.Səbətdəki_məhsullarım || 'Products in cart'}
          </div>
          <div className="flex gap-2 items-center py-0.5 text-sm font-medium text-blue-600 whitespace-nowrap border-b border-solid border-b-blue-600 cursor-pointer">
            <div
              onClick={() => {
                navigate(`/${lang}/${ROUTES.order[lang as keyof typeof ROUTES.order]}`);
                window.location.reload();
              }}
              className="self-stretch my-auto"
            >
              {translation?.Səbətim || 'My Cart'}
            </div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/a7f2acd9a318cf187f0283026a4fe39d7a878ed09e47ff9f7a31b2fad77b951f?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
              className="object-contain shrink-0 self-stretch my-auto aspect-square w-[18px]"
            />
          </div>
        </div>

        {/* Items */}
        {hasItems && hasItems.length > 0 ? (
          <div className="overflow-y-scroll h-[40vh] px-[24px]">
            {hasItems
              ?.filter((item) => item && item.product)
              .map((item) => (
              <div key={item.id}>
                <div className="flex gap-8 items-center mt-[4px] justify-between max-md:max-w-full mx-[40px]">
                  <div className="flex gap-2.5 items-center self-stretch my-auto min-w-[240px]">
                    {/* ✅ DÜZƏLDİLDİ: getImageUrl istifadə edilir */}
                    <img
                      loading="lazy"
                      src={getImageUrl(item.product?.image)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.png';
                      }}
                      className="object-contain shrink-0 self-stretch my-auto rounded-3xl h-[100px] w-[100px] bg-gray-100"
                      alt={item.product?.title || 'Product'}
                    />
                    <div className="flex flex-col self-stretch my-auto w-[152px]">
                      <div className="w-full truncate text-sm font-medium text-black">
                        {item.product?.title}
                      </div>
                      <div className="flex flex-col items-start mt-2.5 w-full text-xs text-black text-opacity-80">
                        <div className="flex gap-3 items-start">
                          {item.options?.map((opt: any, idx: number) => (
                            <div key={idx}>{opt.option}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {User && (
                    <div className="flex gap-1 items-center self-stretch my-auto text-sm text-white whitespace-nowrap">
                      <button
                        disabled={item.quantity === 1}
                        onClick={async () => {
                          fetchBasketItems();
                          UpdateBaskedmutation.mutate({
                            id: item.id,
                            price: item?.price,
                            quantity: item.quantity - 1,
                          });
                        }}
                      >
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/5ef9358261fb5c9b47ddda71283dc2e74a91d2ff5650a77a1cca91a21f654228?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                          className="object-contain shrink-0 self-stretch my-auto w-8 rounded-lg aspect-square"
                        />
                      </button>
                      <div className="overflow-hidden flex justify-center items-center self-stretch px-2.5 my-auto w-8 h-8 rounded-lg bg-slate-400">
                        {item.quantity}
                      </div>
                      <button
                        onClick={async () => {
                          fetchBasketItems();
                          UpdateBaskedmutation.mutate({
                            id: item.id,
                            price: item?.price,
                            quantity: item.quantity + 1,
                          });
                        }}
                      >
                        <img
                          loading="lazy"
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e3b9ffafd163cac5114cd6b3eb85e5013d893da6f8069d8e1ffe1279f71fe8a3?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                          className="object-contain shrink-0 self-stretch my-auto w-8 rounded-lg aspect-square"
                        />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-5 justify-between mt-3 w-full text-base font-semibold text-center text-black max-w-[431px] max-md:max-w-full mx-[40px]">
                  <div className="flex gap-10 items-center self-start">
                    <div className="gap-1 self-stretch my-auto">
                      {(Number(item.price) * Number(item?.quantity)).toFixed(2)} ₼
                    </div>
                    {item.product?.discounted_price && Number(item.product?.discount) > 0 && (
                      <div className="font-medium flex items-center text-[14px] line-through opacity-60">
                        {(Number(item.product.price) * Number(item?.quantity)).toFixed(2)} ₼
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      User
                        ? RemoveFromBaskedmutation.mutate(item?.id)
                        : toggleIdInLocalStorage(item?.product?.id);
                    }}
                  >
                    <img
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/f8def1bebbad3cbf09bef8d55ed4ec86d21afaa0e256174b36745ad28b51cc5f?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
                      className="object-contain shrink-0 w-7 aspect-square"
                    />
                  </button>
                </div>
                <div className="mx-[40px] shrink-0 mt-4 max-w-full h-px border border-solid border-black border-opacity-10 w-[431px]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {baskedLoading ? (
              <BasketSkeleton />
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <img 
                  src="/images/empty_basked.png" 
                  className="w-[100px] aspect-square" 
                  alt="Empty basket"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="text-lg font-semibold text-gray-500 mt-4">
                  {translation?.basket_empty || 'Səbət boşdur'}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="flex overflow-hidden flex-wrap gap-5 justify-between self-stretch py-5 mt-10 px-[40px] bg-slate-100 max-md:max-w-full w-full">
          <div className="flex gap-3 items-center my-auto">
            <div className="self-stretch my-auto text-sm text-black text-opacity-60">
              {translation?.Cəmi_məbləğ || 'Total amount'}
            </div>
            <div className="self-stretch my-auto text-lg font-semibold text-center text-blue-600">
              {basketItemsData?.final_price || 0}₼
            </div>
          </div>
          <button
            onClick={() => {
              if (User) {
                navigate(`/${lang}/${ROUTES.ordersConfirm[lang as keyof typeof ROUTES.ordersConfirm]}`);
                window.location.reload();
              } else {
                navigate(`/${lang}/${ROUTES.login[lang as keyof typeof ROUTES.login]}`);
                window.location.reload();
              }
            }}
            className="gap-2.5 self-stretch px-10 py-4 text-base font-medium text-white bg-blue-600 border border-blue-600 border-solid rounded-[100px] max-md:px-5"
          >
            {translation?.Sifariş_et || 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BasketSkeleton() {
  return (
    <div className="overflow-y-scroll h-[40vh] px-[24px]">
      {[1, 2, 3].map((item) => (
        <div key={item}>
          <div className="flex gap-8 items-center mt-[4px] justify-between max-md:max-w-full mx-[40px]">
            <div className="flex gap-2.5 items-center self-stretch my-auto min-w-[240px]">
              <div className="animate-pulse bg-gray-200 rounded-3xl h-[100px] w-[100px]" />
              <div className="flex flex-col self-stretch my-auto w-[152px]">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-3 items-start mt-2.5">
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex gap-1 items-center self-stretch my-auto">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex gap-5 justify-between mt-3 w-full max-w-[431px] max-md:max-w-full mx-[40px]">
            <div className="flex gap-10 items-center self-start">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
            <div className="w-7 h-7 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="mx-[40px] shrink-0 mt-4 max-w-full h-px border border-solid border-black border-opacity-10 w-[431px]" />
        </div>
      ))}
    </div>
  );
}