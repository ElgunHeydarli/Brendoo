import { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import GETRequest from '../../setting/Request';
import { TranslationsKeys } from '../../setting/Types';
import ROUTES from '../../setting/routes';
import { baseUrlInf } from '../../InfluencerBaseURL';

export default function Login() {
  const [userType, setUserType] = useState<'user' | 'influencer'>('user');
  const { lang = 'ru' } = useParams<{ lang: string }>();
  const { data: tarnslation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const initialValues = {
    email: '',
    password: '',
  };

  const syncGuestCartToServer = async (token: string) => {
    const guest_cart = localStorage.getItem('guest_cart');
    if (!guest_cart) return;

    try {
      const parsedGuestCart = JSON.parse(guest_cart);

      const basket_items = (parsedGuestCart?.basket_items || []).map((item: any) => ({
        product_id: item.product?.id,
        quantity: item.quantity,
        price: item.price,
        options:
          item.options?.map((opt: any) => ({
            filter_id: opt.filter,
            option_id: opt.option,
          })) || [],
      }));

      console.log(basket_items);

      if (basket_items.length > 0) {
        const response = await fetch(
          `https://admin.brendoo.com/api/storeMultipleBasketItems`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ basket_items }),
          },
        );

        if (!response.ok) {
          throw new Error(`Hata: ${response.status}`);
        }

        localStorage.removeItem('guest_cart');
      }
    } catch (error) {
      console.error('Error', error);
    }
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(tarnslation?.is_r_12 ?? '')
      .required(tarnslation?.is_r_7 ?? ''),
    password: Yup.string()
      .min(6, tarnslation?.is_r_13 ?? '')
      .required(tarnslation?.is_r_14 ?? ''),
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setFormStatus(null);

    const influencerEndpoint = `${baseUrlInf}/login`;
    const userEndpoint = 'https://admin.brendoo.com/api/login';
    const endpoint =
      userType === 'influencer'
        ? influencerEndpoint
        : userType === 'user'
        ? userEndpoint
        : null;

    if (!endpoint) {
      toast.error('Invalid user type.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(endpoint, values);
      const data = response.data;
      console.log(data,'data')

      localStorage.setItem('user-info', JSON.stringify(data));
      toast.success(tarnslation?.success_login ?? '');

      if (userType === 'influencer') {
        // influencer
        window.location.href = `/${lang}/influencer/kolleksiyalar`;
        localStorage.setItem('user_type', userType);
      } else {
        // user

        const userStr = localStorage.getItem('user-info');
        const parsedUser = userStr ? JSON.parse(userStr) : null;
        const token = parsedUser?.token || '';

        syncGuestCartToServer(token).then(() => {
          // sonra yönlendir
          window.location.href = `/${lang}/${
            ROUTES.userSettings[lang as keyof typeof ROUTES.userSettings]
          }`;
        });

        // window.location.href = `/${lang}/${ROUTES.userSettings[lang as keyof typeof ROUTES.userSettings]}`;
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || tarnslation?.error_to_log || '';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const { data: registerImage } = GETRequest<{ image: string }>(
    `/registerImage`,
    'registerImage',
    [lang],
  );

  return (
    <div className="flex  flex-col bg-back py-[40px]">
      <div className="flex relative flex-col w-full max-md:max-w-full justify-center items-center px-[40px] max-sm:px-4">
        <img
          loading="lazy"
          src={registerImage?.image}
          className="object-cover fixed w-full h-full"
        />
        <div
          onClick={() => navigate(-1)}
          className="rounded-full bg-white lg:w-[56px] lg:h-[56px] w-[30px] h-[30px] bg-opacity-60 z-50 absolute top-[-34px]  lg:top-5 left-5 cursor-pointer"
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/d1d01662ce302f4f64e209cc8ecd0540b6f0e5fb3d4ccd79eead1b316a272d11?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099"
            className="object-contain w-14 aspect-square rounded-full"
          />
        </div>

        <div
          style={{ overflow: 'auto' }}
          className=" z-[50] flex  relative flex-col justify-center self-center p-[60px]  max-w-full rounded-3xl bg-white bg-opacity-20 w-[560px] max-md:px-5  max-sm:py-[28px]"
        >
          <div className="flex flex-col max-md:max-w-full">
            <div className="flex flex-col items-center self-center text-center">
              <div className="text-3xl font-bold text-white">
                {tarnslation?.Xoş_gəldiniz}
              </div>
              <div className="mt-3 text-base text-white text-opacity-80">
                {tarnslation?.logindesc}
              </div>
            </div>
            <div className="flex flex-col items-center mt-4 w-full max-md:max-w-full">
              <div className="flex lg:gap-10 gap-5 items-center mt-7 text-xs text-center text-white w-full">
                <div className="shrink-0 self-stretch my-auto h-px border border-solid border-white border-opacity-20 w-[35%]" />
                <div className="self-stretch my-auto text-nowrap">
                  {tarnslation?.or}
                </div>
                <div className="shrink-0 self-stretch my-auto h-px border border-solid border-white border-opacity-20 w-[35%]" />
              </div>

              <div
                className="flex gap-4 justify-start text-white z-[60]"
                style={{ marginTop: '48px' }}
              >
                <label className="flex items-center gap-2">
                  <input
                    style={{
                      minWidth: '21px',
                      width: '21px',
                      minHeight: '21px',
                      height: '21px',
                    }}
                    type="radio"
                    name="userType"
                    value="user"
                    required
                    checked={userType === 'user'}
                    onChange={() => setUserType('user')}
                  />
                  {tarnslation?.istifadeci_key}
                </label>
                <label className="hidden items-center gap-2">
                  <input
                    style={{
                      minWidth: '21px',
                      width: '21px',
                      minHeight: '21px',
                      height: '21px',
                    }}
                    type="radio"
                    name="userType"
                    required
                    value="influencer"
                    checked={userType === 'influencer'}
                    onChange={() => setUserType('influencer')}
                  />
                  {tarnslation?.influencer_key ?? ''}
                </label>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {() => (
                  <Form className="flex flex-col self-stretch mt-7 w-full max-md:max-w-full">
                    <div className="flex flex-col w-full max-md:max-w-full">
                      <div className="overflow-hidden px-5  flex justify-center items-center w-full h-[56px] text-base bg-white border border-solid border-black border-opacity-10 rounded-full text-black text-opacity-60 max-md:max-w-full">
                        <Field
                          type="email"
                          name="email"
                          placeholder={tarnslation?.Email ?? ''}
                          className="w-full bg-transparent outline-none"
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                      <div className="flex flex-col mt-3 w-full max-md:max-w-full">
                        <div className="flex overflow-hidden gap-5 justify-between px-5  w-full h-[56px] text-base bg-white border border-solid border-black border-opacity-10 rounded-full text-black text-opacity-60 max-md:max-w-full">
                          <Field
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder={tarnslation?.password}
                            className="w-full bg-transparent outline-none"
                          />
                          <img
                            loading="lazy"
                            src={
                              !showPassword
                                ? '/svg/closedaye.svg'
                                : 'https://cdn.builder.io/api/v1/image/assets/TEMP/cc75299a447e1f2b81cfaeb2821950c885d45d255e50ae73ad2684fcd9aa2110?placeholderIfAbsent=true&apiKey=2d5d82cf417847beb8cd2fbbc5e3c099'
                            }
                            className="object-contain shrink-0 w-6 aspect-square cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </div>
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                        <div
                          onClick={() => {
                            const resetPath =
                              ROUTES.resetPasword[
                                lang as keyof typeof ROUTES.resetPasword
                              ];
                            navigate(`/${lang}/${resetPath}?type=${userType}`);
                          }}
                          className="mt-3 text-sm text-right text-white max-md:max-w-full cursor-pointer hover:underline"
                        >
                          {tarnslation?.forgotpassword}{' '}
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`gap-2.5 self-stretch px-10 py-4 mt-7 w-full text-base font-medium text-black border border-solid ${
                        loading ? 'bg-gray-400' : 'bg-slate-300'
                      } border-slate-300 rounded-full max-md:px-5 max-md:max-w-full`}
                    >
                      {loading ? tarnslation?.loading_main_key : tarnslation?.login}
                    </button>
                  </Form>
                )}
              </Formik>

              {formStatus && (
                <div
                  className={`mt-4 text-sm text-center ${
                    formStatus.success ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {formStatus.message}
                </div>
              )}
            </div>
            <div className=" lg:mt-[60px] mt-8 text-base font-semibold text-center text-white text-opacity-80  max-md:max-w-full">
              <span>{tarnslation?.Hesabın_yoxdur}? </span>
              <Link
                reloadDocument
                to={`/${lang}/${ROUTES.register[lang as keyof typeof ROUTES.register]}`}
                className="hover:underline"
              >
                {tarnslation?.register}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 bg-black opacity-50"></div>
    </div>
  );
}
