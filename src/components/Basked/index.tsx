import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request';
import { TranslationsKeys } from '../../setting/Types';

export default function BaskedForum({
  Name,
  Email,
  Number,
  onSubmit,
}: {
  Name: string;
  Email: string;
  Number: string;
  onSubmit: (values: any) => void;
}) {
  const { lang = 'az' } = useParams<{ lang: string }>();

  const { data: translation } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [
    lang,
  ]);

  // Kullanıcı bilgileri localStorage'dan
  const userStr = localStorage.getItem('user-info');
  const parsedUser = userStr ? JSON.parse(userStr) : null;

  // Komponent mount olduqda avtomatik onSubmit çağır
  useEffect(() => {
    onSubmit({
      address: 'Pickup nöqtəsi',
      additionalInfo: '',
      regionId: parsedUser?.customer?.region_id || 1,
      cityId: parsedUser?.customer?.city_id || 1,
      deliveryType: true,
      paymentType: true,
    });
  }, []);

  return (
    <div className="flex overflow-hidden flex-col justify-center p-10 rounded-3xl bg-stone-50 lg:w-[70%] w-full max-md:px-5 max-sm:px-2">
      <div className="flex flex-col max-md:max-w-full">
        <div className="text-sm text-black text-opacity-60 max-md:max-w-full">
          {translation?.Şəxsi_məlumatlarım || 'Şəxsi məlumatlarım'}
        </div>

        <div className="flex flex-col mt-5 w-full text-base text-black max-md:max-w-full">
          <div className="overflow-hidden px-5 py-5 w-full bg-white border border-solid border-black border-opacity-10 rounded-[100px]">
            {Name}
          </div>
          <div className="flex lg:flex-row flex-col gap-5 items-center mt-5 max-md:max-w-full">
            <div className="overflow-hidden self-stretch px-5 py-5 my-auto bg-white border border-solid border-black border-opacity-10 min-w-[240px] rounded-[100px] lg:w-1/2 w-full">
              {Email}
            </div>
            <div className="overflow-hidden self-stretch px-5 py-5 my-auto bg-white border border-solid border-black border-opacity-10 min-w-[240px] rounded-[100px] lg:w-1/2 w-full">
              +7 {Number}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
