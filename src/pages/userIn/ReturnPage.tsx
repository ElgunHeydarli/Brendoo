import Header from '../../components/Header';
import UserAside from '../../components/userAside';
import { useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request';
import { Product, TranslationsKeys } from '../../setting/Types';

type Return = {
  id: number;
  product: Product;
  return_date?: string;
  status?: string;
};

export default function ReturnPage() {
  const { lang = 'ru' } = useParams<{ lang: string }>();

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );
  
  const { data: Returns, isLoading: OrdersLoading } = GETRequest<Return[]>(
    `/returns`,
    'returns',
    [lang]
  );

  const statusIndicator = (status?: string) => {
    if (!status) return translation?.processing || 'В обработке';
    
    switch (status) {
      case 'approved':
        return translation?.approved || 'Одобрено';
      case 'rejected':
        return translation?.rejected || 'Отклонено';
      case 'pending':
        return translation?.pending || 'В обработке';
      default:
        return translation?.pending || 'В обработке';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div>
      <Header />
      <main className="flex flex-row max-sm:flex-col w-full gap-5 p-4">
        <UserAside active={5} />
        <div className="w-full rounded-[20px] bg-[#F8F8F8] lg:p-[40px] px-2 py-10">
          <div className="flex flex-row flex-wrap justify-between mb-6">
            <h1 className="text-[28px] font-semibold">
              {translation?.return || 'Returns'}
            </h1>
          </div>

          {/* Returns List */}
          <div className="space-y-4">
            {OrdersLoading ? (
              // Loading skeletons
              <>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="grid grid-cols-12 items-center text-sm font-medium gap-4">
                      {/* Image skeleton */}
                      <div className="col-span-2">
                        <div className="bg-gray-200 rounded-md aspect-square w-full animate-pulse" />
                      </div>
                      
                      {/* Details skeleton */}
                      <div className="col-span-6 flex flex-col gap-2">
                        <div className="bg-gray-200 h-4 rounded w-1/3 animate-pulse"></div>
                        <div className="bg-gray-200 h-6 rounded w-1/2 animate-pulse"></div>
                        <div className="bg-gray-200 h-4 rounded w-1/4 animate-pulse"></div>
                      </div>
                      
                      {/* Status skeleton */}
                      <div className="col-span-4 flex justify-end">
                        <div className="bg-gray-200 h-6 rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : Returns && Returns.length > 0 ? (
              // Returns List
              Returns.map((returnItem, index) => (
                <div key={`return-${returnItem.id || index}`} className="border-b pb-4">
                  <div className="grid grid-cols-12 items-center text-sm font-medium gap-4">
                    {/* Product Image - Col 1-2 */}
                    <div className="col-span-2">
                      <img
                        loading="lazy"
                        src={returnItem?.product?.image || '/placeholder.svg'}
                        className="object-cover w-full aspect-square rounded-md"
                        alt={returnItem?.product?.title || "Product image"}
                      />
                    </div>
                    
                    {/* Product Details - Col 3-8 */}
                    <div className="col-span-6 flex flex-col">
                      <div className="text-xs text-gray-500">
                        {formatDate(returnItem.return_date)}
                      </div>
                      <div className="mt-1 font-medium text-black">
                        {returnItem?.product?.title}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        {returnItem?.product?.price && `${returnItem.product.price} ${translation?.currency || '₼'}`}
                      </div>
                    </div>
                    
                    <div className="col-span-4 flex justify-end">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        returnItem.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        returnItem.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {statusIndicator(returnItem.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // No returns
              <div className="text-center py-10">
                <div className="text-gray-500">
                  {translation?.no_returns || 'У вас нет возвращенных товаров'}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
