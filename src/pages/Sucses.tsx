import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { TranslationsKeys } from '../setting/Types';
import GETRequest from '../setting/Request';
import ROUTES from '../setting/routes';
import Loading from '../components/Loading';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Sucses() {
  const { lang = 'ru' } = useParams<{ lang: string }>();
  const [searchParams] = useSearchParams();
  const userInfo = localStorage.getItem('user-info');
  const parsedInfo = userInfo ? JSON.parse(userInfo) : null;
  const token = parsedInfo?.token;

  const [orderId, setOrderId] = useState<string | null>(null);
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
      } else if (response.data.status === 'DECLINED') {
        setPaymentStatus('failed');
      } else {
        // PENDING - bir az gözlə və yenidən yoxla
        setTimeout(() => checkEpointPayment(orderIdParam), 3000);
      }
    } catch (error) {
      console.error('Epoint status check error:', error);
      setPaymentStatus('success'); // Callback uğurlu olub, səhifəyə gəlib
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
        <section className="flex  justify-center items-center pb-[120px]  px-7">
          <div className="max-w-[440px] flex flex-col justify-center items-center">
            <svg
              className="w-full aspect-square"
              width="450"
              height="450"
              viewBox="0 0 450 450"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M237.196 113.728L193.316 103.716C192.966 103.639 192.635 103.493 192.341 103.287C192.048 103.08 191.799 102.818 191.608 102.514C191.418 102.21 191.29 101.872 191.231 101.518C191.173 101.164 191.186 100.802 191.269 100.453L191.633 98.8514C191.71 98.5012 191.856 98.1698 192.062 97.8766C192.269 97.5833 192.531 97.3341 192.835 97.1435C193.139 96.9529 193.477 96.8247 193.831 96.7664C194.185 96.7081 194.547 96.7208 194.896 96.8039L238.771 106.816L237.196 113.728Z"
                fill="#C7B8F8"
              />
              <path
                d="M255.891 175.811L242.166 173.273C233.616 171.691 226.045 166.778 221.117 159.614C216.19 152.45 214.31 143.622 215.89 135.072L220.498 110.079C220.928 107.754 222.264 105.695 224.211 104.355C226.159 103.015 228.559 102.503 230.884 102.933L286.284 113.18C287.935 113.481 289.511 114.105 290.922 115.016C292.332 115.927 293.549 117.107 294.502 118.489C295.455 119.871 296.127 121.427 296.478 123.069C296.829 124.711 296.853 126.406 296.548 128.057L292.341 150.75C290.829 158.906 286.14 166.128 279.305 170.827C272.469 175.527 264.047 177.319 255.891 175.811Z"
                fill="black"
              />
              <path
                d="M228.754 107.194C225.739 107.014 223.975 107.842 223.017 108.472C217.09 112.351 220.393 122.458 213.238 132.867C212.531 133.895 211.758 134.876 210.925 135.805L209.287 137.574C208.874 138.021 208.639 138.603 208.626 139.212C208.612 139.82 208.822 140.413 209.215 140.877L211.438 143.487L210.313 157.257C210.21 158.454 209.557 167.373 216.06 173.07L216.51 173.457C219.086 175.504 222.261 176.651 225.55 176.724L235.977 177.043V192.271H270.514L270.856 160.528C270.856 160.528 278.727 159.178 280.158 151.434C280.519 149.497 280.437 147.503 279.918 145.602C279.399 143.702 278.457 141.943 277.161 140.458C274.582 137.538 270.037 135.058 262.554 138.55C260.051 139.546 257.321 139.833 254.666 139.379C252.01 138.925 249.531 137.747 247.501 135.976C242.394 131.404 242.767 124.866 242.826 124.069C242.826 124.069 237.03 122.35 234.244 120.415C231.868 118.764 229.281 115.29 228.754 107.194Z"
                fill="white"
              />
              <path
                d="M156.417 317.057C156.476 318.254 136.32 317.183 134.777 317.102C131.51 316.935 128.247 316.751 124.985 316.53C121.502 316.296 117.992 315.477 114.509 315.576C112.884 315.626 111.296 316.08 110.459 317.615C108.569 321.165 115.512 323.654 117.771 324.432C122.123 325.926 125.381 325.971 125.376 326.475C125.376 326.799 124.026 327.137 121.686 327.348C115.584 327.906 103.992 326.61 93.2239 322.529C90.7399 321.588 88.2739 320.18 85.6144 319.793C84.9335 319.668 84.2316 319.727 83.5814 319.965C82.9311 320.202 82.356 320.609 81.9154 321.143C81.0874 322.254 80.8984 324.23 81.8074 325.35C82.335 325.9 82.9417 326.369 83.6074 326.741C83.0086 327.003 82.4472 327.343 81.9379 327.753C80.6554 328.968 81.0379 331.205 81.9379 332.523C83.1349 334.292 85.1329 335.439 86.8879 336.546C88.948 337.844 91.0766 339.029 93.2644 340.097C93.5905 340.238 93.9012 340.413 94.1914 340.619C94.7128 341.04 95.1679 341.538 95.5414 342.095C95.9807 342.647 96.4605 343.166 96.9769 343.647C100.892 347.427 106.184 349.718 111.354 351.167C116.525 352.616 121.952 353.349 127.352 354.002C135.078 354.942 143.151 354.587 150.527 351.936C151.467 351.599 158.087 349.236 158.033 348.192C157.493 337.812 156.954 327.434 156.417 317.057Z"
                fill="white"
              />
            </svg>
            <h1 className="text-[20px] font-semibold text-center text-[#132A1B]">
              {tarnslation?.uğurlu_sifariş}
            </h1>
            <p className="text-[14px] max-w-[440px] font-normal text-center  opacity-80 mb-[40px]">
              {tarnslation?.uğurlu_sifariş_desc}
            </p>
            <Link
              reloadDocument
              to={`/${lang}/${ROUTES?.home[lang as keyof typeof ROUTES.home]}`}
            >
              <button className="px-[30px] py-[16px] rounded-[100px] border border-[#3873C3] border-opacity-25 flex flex-row gap-2 text-[16px] font-medium text-[#3873C3]">
                {tarnslation?.uğurlu_sifariş_btn}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1234_3811)">
                    <path
                      d="M9 14L5 10L9 6"
                      stroke="#3873C3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 10H16C17.0609 10 18.0783 10.4214 18.8284 11.1716C19.5786 11.9217 20 12.9391 20 14C20 15.0609 19.5786 16.0783 18.8284 16.8284C18.0783 17.5786 17.0609 18 16 18H15"
                      stroke="#3873C3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1234_3811">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}