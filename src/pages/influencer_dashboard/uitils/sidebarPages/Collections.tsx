import React, { useEffect, useState } from 'react';
import TopTitle from './TopTitle';
import EditCollectionModal from '../../ui/EditCollectionModal';
import { baseUrlInf } from '../../../../InfluencerBaseURL';
import axios from 'axios';
import { useCollectionModal } from '../../../../contexts/CollectionModalProvider';
import { Product, TranslationsKeys } from '../../../../setting/Types';
import { removeFromCollection } from '../../requests/removeFromCollection';
import { removeCollection } from '../../requests/removeCollection';
import { useParams } from 'react-router-dom';
import GETRequest from '../../../../setting/Request';
import { useActions } from './useDashboardActions';
import { useCollections } from '../../CollectionProvider';

export interface CollectionInner {
  collection: {
    id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
    productCount: number;
    copyLink: string;
  };
  products: Product[];
}

export interface MoreActionsInterface {
  id: number;
  title: string;
  icon: string;
}

export interface CollectionsInterfaceApi {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  productCount: number;
  copyLink: string;
  moreActions: MoreActionsInterface[];
}

const Collections: React.FC = () => {
  const { lang = 'ru' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const { defaultMoreActions } = useActions();

  const [search, setSearch] = React.useState<string>('');
  const { collections, setCollections } = useCollections();

  // open more actions
  const [actions, setActions] = React.useState<number | null>(null);
  const handleActionModal = (id: number | null) => {
    setActions(prev => (prev === id ? null : id));
  };

  // handle create collection
  const { setCreateCollectionModal } = useCollectionModal();
  const handleCreateCollection = () => {
    setCreateCollectionModal(true);
  };

  // handle edit collection
  const [editCollectionModal, setEditCollectionModal] = React.useState<number | null>(
    null,
  );
  const handleEditCollectionModal = (id: number | null) => {
    setEditCollectionModal(id);
  };

  const getCollectionListWithSearch = async (searchTerm: string) => {
    const userStr = localStorage.getItem('user-info');
    const user = userStr ? JSON.parse(userStr) : '';
    const token = user?.token;

    const res = await axios.get(`${baseUrlInf}/collections?search=${searchTerm}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchData = async () => {
        try {
          const result = await getCollectionListWithSearch(search);
          console.log(result, 'RESSULT');
          const withMoreActions = result?.data?.map(
            (data: CollectionsInterfaceApi) => ({
              ...data,
              moreActions: defaultMoreActions,
            }),
          );
          setCollections(withMoreActions);
        } catch (err) {
          console.error('no result', err);
        }
      };

      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const [dataInner, setDataInner] = React.useState<CollectionInner | null>(null);
  const [loadingInner, setLoadingInner] = React.useState<{
    [key: number]: boolean;
  }>({});
  const getInnerCollection = async (id: number) => {
    const userStr = localStorage.getItem('user-info');
    const user = userStr ? JSON.parse(userStr) : '';
    const token = user?.token;
    setLoadingInner(prev => ({ ...prev, [id]: true }));

    try {
      const res = await axios.get(`${baseUrlInf}/collection/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setDataInner(res.data?.data);
      } else {
        console.log(res.status);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingInner(prev => ({ ...prev, [id]: false }));
    }
  };

  const [copied, setCopied] = useState(false);
  const [copiedT, setCopiedT] = useState<{ [key: number]: boolean }>({});
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama xetasi:', err);
    }
  };

  const copyToClipboardT = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedT(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setCopiedT(prev => ({ ...prev, [id]: false })), 2000);
    } catch (err) {
      console.error('Kopyalama xetasi:', err);
    }
  };

  const RenderInnerCollection = () => {
    return (
      <div className="inner-collection">
        <div className="top-head">
          <div className="left">
            <div
              className="top-back-btn"
              onClick={() => setDataInner(null)}
              style={{ cursor: 'pointer' }}
            >
              <img src="/lefted.svg" alt="lefted" />
              <p>Geri</p>
            </div>
            <div className="titles">
              <h1>{dataInner?.collection?.title ?? ''}</h1>
              <p>{dataInner?.collection?.description ?? ''}</p>
            </div>
          </div>
          <div className="right-share">
            <button
              type="button"
              onClick={() => {
                if (dataInner?.collection?.copyLink) {
                  copyToClipboard(dataInner.collection.copyLink);
                }
              }}
              className="relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              {copied ? (
                <div className="flex items-center gap-2 animate-fade-in cursor-default">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="green"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-green-600 font-medium">Скопировано!</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 transition-all duration-200">
                  <img src="/copy.svg" alt="Copy" className="w-5 h-5" />
                  <p>Copy</p>
                </div>
              )}
            </button>
          </div>
        </div>
        <div className="container-with-col">
          <p>{dataInner?.products && dataInner?.products?.length} Məhsul</p>
          <div className="grid-items">
            {dataInner?.products && dataInner?.products?.length > 0
              ? dataInner?.products?.map((p: Product) => (
                  <div key={p?.id} className="item-col">
                    <div className="left">
                      <img src={p?.image ?? ''} />
                      <div className="right-text-content">
                        <h3>{p?.title}</h3>
                        <p>{p?.price} ₼</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-from-coll"
                      onClick={() =>
                        removeFromCollection(
                          {
                            collection_id: dataInner?.collection?.id,
                            product_id: p?.id,
                          },
                          getInnerCollection,
                          translation?.mehsul_kolleksiyadan_silindi_t ?? '',
                        )
                      }
                    >
                      <img src="/Trash Bin Trash.svg" alt="Trash Bin Trash" />
                      <p>
                        {loadingInner[dataInner?.collection?.id]
                          ? translation?.is_loading ?? ''
                          : translation?.removed_c_p ?? ''}
                      </p>
                    </button>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="collections">
      <EditCollectionModal
        id={editCollectionModal}
        onClose={() => setEditCollectionModal(null)}
      />
      {dataInner && dataInner !== null ? (
        <RenderInnerCollection />
      ) : (
        <React.Fragment>
          <TopTitle>
            <h3>{translation?.inf_kolleksiyalar ?? ''}</h3>
            <div className="button-pay" onClick={handleCreateCollection}>
              <img src="/AddCircle.svg" alt="AddCircle" />
              <p>{translation?.kolleksiya_yarat ?? ''}</p>
            </div>
          </TopTitle>
          <div className="container-collections">
            <div className="input-format">
              <input
                type="search"
                placeholder={translation?.axtar ?? ''}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <img src="/search.svg" alt="search-icon" className="search-icon" />
            </div>
            <div className="mini-result-content">
              <p className="length-result">
                {collections?.length} {translation?.inf_kolleksiyalar}
              </p>
            </div>
            <div className="table-content">
              <table>
                <thead>
                  <tr>
                    <th>{translation?.kolleksiya_adi ?? ''}</th>
                    <th>{translation?.mehsul_sayi ?? ''}</th>
                    <th>{translation?.kolleksiya_statusu ?? ''}</th>
                    <th>{translation?.yaradilma_tarixi ?? ''}</th>
                    <th>{translation?.link_tit ?? ''}</th>
                    <th>{translation?.emeliyyatlar ?? ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {collections && collections?.length > 0
                    ? collections?.map((data: CollectionsInterfaceApi) => (
                        <tr key={data?.id}>
                          <td className="collection-name">{data?.title}</td>
                          <td>
                            {data?.productCount} {translation?.pp_pp ?? ''}
                          </td>
                          <td>
                            {data?.status === 'Aktiv' ? (
                              <div className="promocode-status">
                                <img src="/statusicon.svg" alt="statusicon" />
                                <p>{translation?.aktiv_st ?? ''}</p>
                              </div>
                            ) : (
                              <div className="promocode-status_exit">
                                <img src="/sss.svg" alt="statusicon" />
                                <p>{translation?.deaktiv_st ?? ''}</p>
                              </div>
                            )}
                          </td>
                          <td>{data?.created_at}</td>
                          <td>
                            <div
                              className="copy-collect"
                              onClick={() => copyToClipboardT(data?.copyLink, data?.id)}
                            >
                              <img src="/LinkMinimalistic.svg" alt="LinkMinimalistic" />
                              <p>
                                {copiedT[data?.id]
                                  ? translation?.copyalandi ?? ''
                                  : translation?.copyala ?? ''}
                              </p>
                            </div>
                          </td>
                          <td className="more-act-td">
                            <div
                              className="more-actions"
                              onClick={() => handleActionModal(data?.id)}
                            >
                              <img src="/dots.svg" alt="dots" />
                              <p>{translation?.daha_cox_title ?? ''}</p>
                            </div>
                            {actions === data?.id && (
                              <div className="more-actions-mini-modal">
                                {data?.moreActions?.map(
                                  (item: MoreActionsInterface) => (
                                    <div
                                      key={item?.id}
                                      className="action-item"
                                      onClick={() => {
                                        setActions(null);
                                        if (item.id === 99991) {
                                          getInnerCollection(data?.id); // Посмотреть коллекцию
                                        } else if (item.id === 229379278278) {
                                          handleEditCollectionModal(data?.id); // Редактировать
                                        } else if (item.id === 39292928328928) {
                                          removeCollection(
                                            data?.id,
                                            translation?.kolleksiya_sil ?? '',
                                          ); // Удалить
                                        }
                                      }}
                                    >
                                      <img src={item?.icon} alt={item?.icon} />
                                      <p>{item?.title}</p>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </React.Fragment>
      )}
    </section>
  );
};

export default Collections;
