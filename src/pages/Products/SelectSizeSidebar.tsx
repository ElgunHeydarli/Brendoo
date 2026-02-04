import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { TiDelete } from 'react-icons/ti';
import { RiArrowGoBackFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import GETRequest, { axiosInstance } from '../../setting/Request';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { DataRulesPage } from '../../featurePages/RulesPage';
import axios from 'axios';
import { TranslationsKeys } from '../../setting/Types';

interface Props {
  openSidebar: boolean;
  onClose: () => void;
}

const SelectSizeSidebar = ({ openSidebar, onClose }: Props) => {
  const { lang = 'az' } = useParams();
  const [clothImage, setClothImage] = useState<File | null>(null);
  const [humanImage, setHumanImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [statusMessage] = useState<string>('');
  const clothInputRef = useRef<HTMLInputElement>(null);
  const humanInputRef = useRef<HTMLInputElement>(null);

  const { data: tarnslation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );
  const ui = {
    az: {
      success: 'Uğurlu!',
      back: 'Geri',
      result: 'Nəticə',
      tryOnTitle: 'Geyimi üzərinizdə yoxlayın',
      loading: 'Yüklənir...',
      tryOn: 'Yoxla',
      termsPath: 'terms',
    },
    en: {
      success: 'Success!',
      back: 'Back',
      result: 'Result',
      tryOnTitle: 'Try on the outfit',
      loading: 'Loading...',
      tryOn: 'Try on',
      termsPath: 'terms',
    },
  } as const;
  const t = ui[lang === 'en' ? 'en' : 'az'];

  useEffect(() => {
    document.body.style.overflow = openSidebar ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [openSidebar]);

  const handleSelectFile = useCallback((type: 'cloth' | 'human') => {
    if (type === 'cloth') clothInputRef.current?.click();
    else humanInputRef.current?.click();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cloth' | 'human',
  ) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > 10 * 1024 * 1024) {
      toast.error(tarnslation?.mb_razmer ?? '');
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const { width, height } = img;
          if (width < 512 || height < 512) {
            toast.error(`${tarnslation?.img_min ?? ''} ${width}x${height}`);
            return;
          }

          if (type === 'cloth') setClothImage(file);
          else setHumanImage(file);
        };

        img.onerror = () => {
          toast.error(tarnslation?.key_ne_dostup ?? '');
        };
      };

      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type: 'cloth' | 'human') => {
    if (type === 'cloth') setClothImage(null);
    else setHumanImage(null);
  };

  const handleSubmit = async () => {
    if (!clothImage || !humanImage) {
      toast.error(tarnslation?.no_img ?? '');
      return;
    }

    setIsSubmitting(true);
    setResultImageUrl(null);

    try {
      const userStr = localStorage.getItem('user-info');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      if (!token) {
        toast.error(tarnslation?.sistem_ab ?? '');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('clothing_image', humanImage, humanImage.name);
      formData.append('user_image', clothImage, clothImage.name);

      const res = await axios.post(
        'https://admin.brendoo.com/api/swap-clothing',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': lang,
          },
        },
      );

      const imageUrl = res.data?.result_image_url;
      if (imageUrl) {
        setResultImageUrl(imageUrl);
        window.open(imageUrl, '_blank');
        toast.success(tarnslation?.succ_t ?? t.success);
      } else {
        toast.error(tarnslation?.r_i_n_f ?? '');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          toast.error(error?.response?.data?.error ?? '');
        } else {
          toast.error('500');
        }
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const UploadBox = ({
    label,
    image,
    onSelect,
    onRemove,
  }: {
    label: string;
    image: File | null;
    onSelect: () => void;
    onRemove: () => void;
  }) => (
    <div className="py-[20px]">
      <span className="text-[#21232A99] text-[12px]">{label}</span>
      <div
        className="border-dashed border cursor-pointer border-[#0000001F] rounded-[12px] mt-[8px]"
        onClick={onSelect}
      >
        <div className="py-[14px] flex items-center gap-[20px] px-[16px]">
          <span className="text-[#3873C3]">
            <FaCloudDownloadAlt size={28} />
          </span>
          <div>
            <h4 className="text-black text-[14px]">{tarnslation?.msg_two ?? ''}</h4>
            <p className="text-[#9C9C9C] text-[12px] pt-[4px]">
              {tarnslation?.support_file ?? ''}
            </p>
          </div>
        </div>
      </div>
      {image && (
        <div className="py-[20px] w-full relative">
          <div className="max-w-[173px] h-[150px] relative">
            <img
              className="w-full h-full rounded-[12px] object-cover"
              src={URL.createObjectURL(image)}
              alt="preview"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <TiDelete size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const [dataRulesPage, setDataRulesPage] = React.useState<DataRulesPage | null>(null);
  const fetchData = async () => {
    try {
      const res = await axiosInstance.get('/pages?page_id=13', {
        headers: {
          'Accept-Language': lang,
        },
      });

      if (res.data) {
        setDataRulesPage(res.data);
      } else {
        console.log(res.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [lang]);

  return (
    <>
      {openSidebar && (
        <div
          className="fixed cursor-pointer inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full overflow-y-auto w-full max-w-[598px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          openSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-[40px] py-[30px]">
          {resultImageUrl ? (
            <>
              <button
                onClick={() => {
                  onClose();
                }}
                className="px-6 py-2 flex items-center gap-2 text-blue-600 rounded-full hover:bg-blue-50 transition"
              >
                <span>
                  <RiArrowGoBackFill />
                </span>
                {t.back}
              </button>

              <div className="mt-8">
                <h4 className="text-[16px] font-semibold mb-2">
                  {tarnslation?.result ?? t.result}
                </h4>
                <img
                  src={resultImageUrl}
                  alt="Try-on result"
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-[40px]">
                <h4 className="font-[500] text-[28px]">
                  {tarnslation?.try_on_title ?? t.tryOnTitle}
                </h4>
                <p className="text-[15px]">{tarnslation?.RES ?? ''}</p>
              </div>

              <UploadBox
                label={tarnslation?.cloth_img_label ?? ''}
                image={clothImage}
                onSelect={() => handleSelectFile('cloth')}
                onRemove={() => removeFile('cloth')}
              />

              <UploadBox
                label={tarnslation?.human_image_text ?? ''}
                image={humanImage}
                onSelect={() => handleSelectFile('human')}
                onRemove={() => removeFile('human')}
              />

              {statusMessage ? (
                <div className="text-sm text-gray-600 mt-4 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>{statusMessage}</span>
                </div>
              ) : (
                <div className="flex w-full gap-4 mt-6">
                  <button
                    className="px-6 py-2 border w-full border-blue-400 text-blue-600 rounded-full hover:bg-blue-50 transition"
                    onClick={onClose}
                  >
                    {tarnslation?.Cancel ?? ''}
                  </button>
                  <button
                    className="px-6 py-2 w-full bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-60"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !clothImage || !humanImage}
                  >
                    {isSubmitting
                      ? (tarnslation?.loading ?? t.loading)
                      : (tarnslation?.try_on ?? t.tryOn)}
                  </button>
                </div>
              )}
            </>
          )}

          <div className="flex w-full gap-4 mt-8 justify-start">
            <Link
              reloadDocument
              className="font-[400] text-[14px] text-[#3873C3] hover:text-[blue] transition-[300ms]"
              to={`/${t.termsPath}/${lang}/${
                dataRulesPage
                  ? dataRulesPage?.slug[lang as keyof typeof dataRulesPage.slug]
                  : ''
              }`}
              target="_blank"
              style={{
                textDecoration: 'underline',
              }}
            >
              {tarnslation?.qaydalar_ve_sertler_text ?? ''}
            </Link>
          </div>
        </div>

        <input
          ref={clothInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileChange(e, 'cloth')}
        />
        <input
          ref={humanInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFileChange(e, 'human')}
        />
      </aside>
    </>
  );
};

export default SelectSizeSidebar;
