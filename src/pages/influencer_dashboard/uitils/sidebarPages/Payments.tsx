import React, { ChangeEvent } from "react";
import TopTitle from "./TopTitle";
import {
  GetPaymentsData,
  useGetPayments,
} from "../../payments/getDemandPaymentList";
import GETRequest from "../../../../setting/Request";
import { TranslationsKeys } from "../../../../setting/Types";
import { useParams } from "react-router-dom";
import Loading from "../../../../components/Loading";
import { Link } from "react-router-dom";
import axios from "axios";
import { baseUrlInf } from "../../../../InfluencerBaseURL";
import toast from "react-hot-toast";
import getback from '../../../../assets/getback.svg'
export interface PaymentDataType {
  paymentTypes: { type: string; amount: number }[];
  totalBalance: number;
}

const Payments: React.FC = () => {
  const { lang = "ru" } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    "translates",
    [lang]
  );

  const user = localStorage.getItem("user-info");
  const parse = user ? JSON.parse(user) : null;
  const token = parse?.token;

  // Payment Modal Actions
  const [paymentModal, setPaymentModal] = React.useState<boolean>(false);
  const handlePaymentModal = () => {
    setPaymentModal(true);
  };

  const { getPromocodes, loadingPayData, paymentData } = useGetPayments();

  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    const delay = setTimeout(() => {
      getPromocodes({ search });
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  const [amountDatas, setAmountDatas] = React.useState<PaymentDataType>();
  const [sendedAmount, setSendedAmount] = React.useState<string[]>([]);
  const [detailData, setDetailData] = React.useState<any>(null);
  const [showDetail, setShowDetail] = React.useState(false);
  const getAmountDatas = async () => {
    try {
      const res = await axios.get(`${baseUrlInf}/demand-payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": lang,
        },
      });
      if (res.data) {
        setAmountDatas(res.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDetailData = async (id: number) => {
    try {
      const res = await axios.get(
        `${baseUrlInf}/demand-payment-lists/${id}/detail`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": lang,
          },
        }
      );
      if (res.data) {
        setDetailData(res.data.data);
        console.log(res.data.data,"res.data.data")
        setShowDetail(true);
      }
    } catch (error) {
      console.log(error);
      toast.error("Detallar yüklənmədi.");
    }
  };

  const handleSubmit = async () => {
    if (sendedAmount.length === 0) {
      toast.error("Zəhmət olmasa ən azı bir ödəniş növü seçin");
      return;
    }

    try {
      const body = {
        type: sendedAmount,
      };

      const res = await axios.post(`${baseUrlInf}/demand-payment/store`, body, {
        headers: {
          "Accept-Language": lang,
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        toast.success("Запрос на оплату отправлен!");
        setPaymentModal(false);
        setSendedAmount([]);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error("Serverdən cavab alınmadı.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error?.response?.data?.message) {
          toast.error(error.response?.data?.message || "");
        }
      }
      console.log(error);
    }
  };

  React.useEffect(() => {
    getAmountDatas();
  }, [paymentModal]);

  if (!search && search.trim() === "" && loadingPayData) return <Loading />;

  return (
    <section className="payments">
      <div
        className={`payment-modal-overlay ${
          paymentModal ? "active-overlay" : ""
        }`}
      >
        <div
          className={`payment-modal-content ${
            paymentModal ? "active-modal" : ""
          }`}
        >
          <div className="close">
            <button
              type="button"
              onClick={() => setPaymentModal(false)}
              className="close-button"
            >
              <img src="/closed.svg" alt="close-icon" />
            </button>
          </div>
          <form
            acceptCharset="UTF-8"
            className="content"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="title-content-top">
              <h2>{translation?.odenis_teleb_et ?? ""}</h2>
              <p>{translation?.descript_p ?? ""}</p>
            </div>
            <div className="select-section">
              {/* <div className="input-checkbox-content">
                <label htmlFor='1'>{translation?.hamisini_secc ?? ""}</label>
                <input type="checkbox" id='1' />
              </div> */}
              {amountDatas?.paymentTypes &&
              amountDatas?.paymentTypes?.length > 0
                ? amountDatas?.paymentTypes
                    ?.filter((item) => item.amount !== null)
                    ?.map((p, idx) => (
                      <div className="input-checkbox-content" key={idx}>
                        <label htmlFor={p?.type}>{p?.amount} ₼</label>
                        <input
                          type="checkbox"
                          id={p?.type}
                          value={p?.type}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            setSendedAmount((prev) => {
                              if (e.target.checked) {
                                if (!prev.includes(value)) {
                                  return [...prev, value];
                                }
                                return prev;
                              } else {
                                return prev.filter((item) => item !== value);
                              }
                            });
                          }}
                        />
                      </div>
                    ))
                : null}
            </div>
            <button type="submit" className="req-btn">
              {translation?.sorgunu_gonder ?? ""}
            </button>
          </form>
        </div>
      </div>
      {showDetail && detailData && (
        <div className="inner-stories">
          <div className="top-container-main">
            <div className="left-titles">
              <button
                type="button"
                className="get-back"
                onClick={() => {
                  setShowDetail(false);
                  window.location.reload();
                }}
              >
                <img src={getback} alt="get back" />
                <p>Возвращаться</p>
              </button>
              <h2>Детали оплаты</h2>
            </div>
          </div>
          <div className="container-in">
            <div className="table-content">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Влиятельный человек</th>
                    <th>Сумма к оплате</th>
                    <th>Тип платежа</th>
                    <th>Клиент</th>
                    <th>Коллекция</th>
                    <th>Дата платежа</th>
                    <th>Купон</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(detailData) && detailData.length > 0 ? (
                      detailData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.influencer ?? "—"}</td>
                          <td>
                            <div className="all-pays">
                              <img src="/₼.svg" alt="₼" />
                              <p>{item.amount ?? "—"} ₼</p>
                            </div>
                          </td>
                          <td>{item.balance_type ?? "—"}</td>
                          <td>{item.customer ?? "—"}</td>
                          <td>{item.collection ?? "—"}</td>
                          <td>{item.created_at ?? "—"}</td>
                          <td>{item.coupon ?? "—"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>
                          Məlumat tapılmadı
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {
        !showDetail &&
        <>
        <TopTitle>
          <h3>{translation?.inf_qazancveodenisler}</h3>
          <div className="title-content">
            <div className="left-titles">
              <div className="pay-title">
                <img src="/₼.svg" alt="₼e" />
                <p>{amountDatas?.totalBalance ?? 0} ₼</p>
              </div>
              <span>{translation?.odenilecek_mebleg ?? ""}</span>
            </div>
            <div className="button-pay" onClick={handlePaymentModal}>
              <img src="/BillList.svg" alt="BillList" />
              <p>{translation?.odenis_teleb_et ?? ""}</p>
            </div>
          </div>
        </TopTitle>

        <div className="container-payments">
          <div className="input-format">
            <input
              type="search"
              placeholder={translation?.axtar ?? ""}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src="/search.svg" alt="search-icon" className="search-icon" />
          </div>
          <div className="mini-result-content">
            <p className="length-result">
              {paymentData?.length} {translation?.inf_qazancveodenisler}
            </p>
          </div>
          <div className="table-content">
            <table>
              <thead>
                <tr>
                  <th>{translation?.qazanc_meblegi ?? ""}</th>
                  <th>{translation?.qazanc_sebebi ?? ""}</th>
                  <th>{translation?.odenis_statusu_t ?? ""}</th>
                  <th>{translation?.odenis_qebzi ?? ""}</th>
                  <th>{translation?.odenis_tarixi ?? ""}</th>
                  <th>{translation?.otherr ?? ""}</th>
                </tr>
              </thead>
              <tbody>
                {paymentData && paymentData?.length > 0
                  ? paymentData
                      ?.filter((item) => item.amount !== null)
                      ?.map((data: GetPaymentsData) => (
                        <tr key={data.id}>
                          <td>
                            <div className="all-pays">
                              <img src="/₼.svg" alt="₼" />
                              <p>{data?.amount} ₼</p>
                            </div>
                          </td>
                          <td>{data?.earningReason ?? ""}</td>
                          <td>{data?.paymentStatus ?? ""}</td>
                          <td>
                            {data?.isPaid ? (
                              <Link
                              reloadDocument
                                to={`${baseUrlInf}/demandPayment/createFacture/${data?.id}`}
                                target="_blank"
                                style={{
                                  textDecoration: "underline",
                                  color: "mediumslateblue",
                                }}
                              >
                                {translation?.fakturani_yukle ?? ""}
                              </Link>
                            ) : (
                              <p>----</p>
                            )}
                          </td>
                          <td>{data?.paymentDate}</td>
                          <td
                            style={{
                              cursor: "pointer",
                              color: "mediumslateblue",
                            }}
                            onClick={() => getDetailData(data.id)}
                          >
                            {translation?.show_title ?? ""}
                          </td>
                        </tr>
                      ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>
        </>

      }

    </section>
  );
};

export default Payments;
