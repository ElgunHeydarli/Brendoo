import { IoIosClose } from 'react-icons/io';
import {
  EditCollectionBody,
  handleEditCollectionReq,
} from '../requests/editCollection';
import React from 'react';
import { CollectionsInterfaceApi } from '../uitils/sidebarPages/Collections';
import { useParams } from 'react-router-dom';
import GETRequest from '../../../setting/Request';
import { TranslationsKeys } from '../../../setting/Types';
import { useCollections } from '../CollectionProvider';

interface Props {
  id: number | null;
  onClose: () => void;
}

const EditCollectionModal: React.FC<Props> = ({ id, onClose }) => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );
  const { collections } = useCollections();

  const findedData = collections?.find(
    (data: CollectionsInterfaceApi) => Number(data.id) === Number(id),
  );
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

  const [data, setData] = React.useState<EditCollectionBody>({
    title: '',
    description: '',
  });

  // 👇 findedData gələndə inputlara doldur
  React.useEffect(() => {
    if (findedData) {
      setData({
        title: findedData.title || '',
        description: findedData.description || '',
      });
    }
  }, [findedData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (findedData) {
      handleEditCollectionReq(findedData.id, data, onClose);
    }
  };

  return (
    <div className={`modal-overlay ${id ? 'active' : ''}`}>
      <div ref={divRef} className={`modal-content ${id ? 'active' : ''}`}>
        <div className="head">
          <button type="button" onClick={onClose}>
            <IoIosClose className="close-icon" />
          </button>
        </div>
        <div className="wrap-text">
          <div className="text-content">
            {findedData?.title && (
              <h2>
                <strong style={{ fontWeight: '600' }}>{findedData.title}</strong>
                <span style={{ paddingLeft: '10px' }}>
                  {translation?.redakte_et_key}
                </span>
              </h2>
            )}
          </div>
        </div>
        <div className="wrap-form">
          <form onSubmit={handleSubmit} className="form-for-bottom">
            <div className="inputs">
              <input
                type="text"
                name="title"
                value={data.title}
                onChange={e =>
                  setData((prev: any) => ({ ...prev, title: e.target.value }))
                }
              />
              <textarea
                name="description"
                value={data.description}
                onChange={e =>
                  setData((prev: any) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="button-content">
              <button type="button" className="close" onClick={onClose}>
                {translation?.legv_et}
              </button>
              <button type="submit" className="accept">
                {translation?.tesdiqle_key}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCollectionModal;
