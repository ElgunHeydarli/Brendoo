import React, { ChangeEvent } from 'react';
import { IoIosClose } from 'react-icons/io';
import {
  CreateCollectionBody,
  handleCreateCollectionReq,
} from '../requests/createCollection';
import { useParams } from 'react-router-dom';
import GETRequest from '../../../setting/Request';
import { TranslationsKeys } from '../../../setting/Types';

interface Props {
  opener: boolean;
  onClose: () => void;
}

const CreateCollectionModal: React.FC<Props> = ({ opener, onClose }) => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const [data, setData] = React.useState<CreateCollectionBody>({
    description: '',
    title: '',
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateCollectionReq(data, onClose, translation?.kolleksiya_yaradildi ?? '');
  };

  const divRef = React.useRef<HTMLDivElement | null>(null);
  const outsideClick = (e: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', outsideClick);
    return () => document.removeEventListener('mousedown', outsideClick);
  }, []);

  return (
    <div className={`modal-overlay ${opener ? 'active' : ''}`}>
      <div ref={divRef} className={`modal-content ${opener ? 'active' : ''}`}>
        <div className="head">
          <button type="button" onClick={() => onClose()}>
            <IoIosClose className="close-icon" />
          </button>
        </div>
        <div className="wrap-text">
          <div className="text-content">
            <h2>{translation?.kolleksiya_yarat ?? ''}</h2>
            <p>{translation?.c_c_text ?? ''}</p>
          </div>
        </div>
        <div className="wrap-form">
          <form
            onSubmit={handleSubmit}
            acceptCharset="UTF-8"
            className="form-for-bottom"
          >
            <div className="inputs">
              <input
                name="title"
                value={data?.title}
                required
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setData(prev => ({ ...prev, title: e.target.value }))
                }
                type="text"
                placeholder={translation?.kolleksiya_adi}
              />
              <textarea
                name="description"
                value={data?.description}
                required
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder={translation?.your_noted ?? ''}
              />
            </div>
            <div className="button-content">
              <button type="button" className="close" onClick={onClose}>
                {translation?.legv_et ?? ''}
              </button>
              <button type="submit" className="accept">
                {translation?.tesdiqle_key ?? ''}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCollectionModal;
