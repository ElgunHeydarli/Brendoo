import axios from 'axios';
import React, { ChangeEvent, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { IoCloseCircle } from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import GETRequest from '../../setting/Request';
import { TranslationsKeys } from '../../setting/Types';

type Props = {
  order_item_id: number;
  onClose: () => void;
  productd: any;
};

const RestoreModal: React.FC<Props> = ({ order_item_id, onClose, productd }) => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  // fetch
  const userInfoRaw = localStorage.getItem('user-info');
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const token = userInfo?.token;

  const [reasons, setReasons] = React.useState<{ id: number; title: string }[]>([]);
  const getReasonsForRestore = async () => {
    try {
      const res = await axios.get('https://admin.brendoo.com/api/return-reasons', {
        headers: {
          'Accept-Language': lang,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        console.log(res.data);
        setReasons(res.data);
      } else {
        console.log(res.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  React.useEffect(() => {
    getReasonsForRestore();
  }, []);

  // restore product
  const [name, setName] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [address, setAddress] = React.useState<string>('');
  const [note, setNote] = React.useState<string>('');
  const [returnReasonId, setReturnReasonId] = React.useState<string>('');

  const handleRestore = async () => {
    const data = {
      order_item_id: order_item_id,
      name: name,
      phone: phone,
      email: email,
      address: address,
      return_reason_id: returnReasonId,
      notes: note,
    };

    await toast.promise(
      axios.post('https://admin.brendoo.com/api/returns', data, {
        headers: {
          'Accept-Language': lang,
          Authorization: `Bearer ${token}`,
        },
      }),
      {
        loading: '..',
        success: res => {
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return res?.data?.message || 'Sorğunuz uğurla göndərildi!';
        },
        error: err => {
          if (err?.response?.data?.message) return err.response.data.message;
          return translation?.xeta_bas_verdi ?? '';
        },
      },
      { style: { zIndex: 1000000000 } },
    );
  };

  return (
    <div className="overlay-restore-modal">
      <div className="restore-modal">
        <IoCloseCircle className="circle-close" onClick={() => onClose()} />
        <div className="top-text">
          <h2>{translation?.iade_ve_geri_qaytarilma}</h2>
        </div>
        <div className="selected-product-content">
          <div className="left-content">
            <div className="image">
              <img src={productd?.image ?? ''} alt="Frame1261155996" />
            </div>
            <div className="texts">
              <h4>{productd?.title ?? ''}</h4>
            </div>
          </div>
        </div>
        <div className="container-with-result">
          <div className="text-content">
            <h3>{translation?.mehsulu_iade_et}</h3>
            <p>{translation?.sebeb_sec}</p>
          </div>
          <form
            acceptCharset="UTF-8"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              handleRestore();
            }}
          >
            <div className="inputs">
              <input
                type="text"
                placeholder=""
                name="name"
                required
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                value={name}
              />
              <input
                type="number"
                placeholder=""
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                value={phone}
                required
                name="phone"
              />
              <input
                type="email"
                placeholder=""
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                value={email}
                required
                name="email"
              />
              <input
                type="text"
                placeholder=""
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAddress(e.target.value)
                }
                value={address}
                required
                name="address"
              />
              <select
                name="return_reason_id"
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setReturnReasonId(e.target.value)
                }
                value={returnReasonId}
              >
                <option value="" defaultChecked>
                  {translation?.sebeb_sec}
                </option>
                {reasons && reasons?.length > 0
                  ? reasons?.map(r => (
                      <option value={r?.id} key={r?.id}>
                        {r?.title}
                      </option>
                    ))
                  : null}
              </select>
              <textarea
                name="notes"
                required
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setNote(e.target.value)
                }
                value={note}
              />
            </div>
            <button type="submit" className="submit-btn">
              {translation?.göndər}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestoreModal;
