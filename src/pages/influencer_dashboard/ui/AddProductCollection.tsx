import React, { useEffect } from 'react';
import { IoIosClose } from 'react-icons/io';
import { useCollectionModal } from '../../../contexts/CollectionModalProvider';
import { addProductInCollection } from '../requests/addProductInCollection';
import { useParams } from 'react-router-dom';
import GETRequest from '../../../setting/Request';
import { TranslationsKeys } from '../../../setting/Types';
import '../../influencer_styles/influencer_dash.scss';
import { useCollections } from '../CollectionProvider';
interface Props {
  opener: boolean;
  onClose: () => void;
}

const AddProductCollection: React.FC<Props> = ({ opener, onClose }) => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const { productId } = useCollectionModal();
  const { collections } = useCollections();

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

  // search and select collection
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const handleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const filteredCollections =
    collections && collections?.length > 0
      ? collections.filter((collection: any) =>
          collection.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : [];

  useEffect(() => {
    setSelectedIds([]);
  }, [opener]);

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
            <h2>{translation?.mehsulu_elave_et ?? ''}</h2>
            <p>{translation?.mehsulu_elave_et_text ?? ''}</p>
          </div>
        </div>
        <div className="wrap-form">
          <form
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              addProductInCollection(
                {
                  collection_id: selectedIds,
                  product_id: productId || 0,
                },
                translation?.mehsul_is_added ?? '',
              );
            }}
            acceptCharset="UTF-8"
            className="form-for-bottom"
          >
            <div className="main-collections">
              <div className="search-content">
                <input
                  type="search"
                  placeholder={translation?.axtar ?? ''}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <img src="/Rounded Magnifer.svg" alt="Rounded Magnifer" />
              </div>
              <div className="list-collections">
                {filteredCollections.length > 0 ? (
                  filteredCollections.map((data: any) => (
                    <div
                      key={data.id}
                      className="item-collection"
                      onClick={() => handleSelect(data.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="left-area">
                        <div className="image">
                          <img
                            src="/4666a9244ae471c19531d95245425c8b47835f20.png"
                            alt=""
                          />
                          <img
                            src="/4666a9244ae471c19531d95245425c8b47835f20.png"
                            alt=""
                          />
                          <img
                            src="/4666a9244ae471c19531d95245425c8b47835f20.png"
                            alt=""
                          />
                          <img
                            src="/4666a9244ae471c19531d95245425c8b47835f20.png"
                            alt=""
                          />
                        </div>
                        <div className="text">
                          <h2>{data.title}</h2>
                          <p>{data.productCount || 0}</p>
                        </div>
                      </div>

                      <div
                        className="right-checkbox"
                        onClick={e => {
                          e.stopPropagation();
                          handleSelect(data.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(data.id)}
                          readOnly
                          required
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    {translation?.no_col ?? ''}
                  </p>
                )}
              </div>
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

export default AddProductCollection;
