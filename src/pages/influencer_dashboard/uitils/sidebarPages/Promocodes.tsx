import React from "react";
import TopTitle from "./TopTitle";
import {
  GetPromocodesData,
  useGetPromocodes,
} from "../../promocodes/getPromocodes";
import { useParams } from "react-router-dom";
import GETRequest from "../../../../setting/Request";
import { TranslationsKeys } from "../../../../setting/Types";
import Loading from "../../../../components/Loading";

interface NavPromocodes {
  id: number;
  title: string;
}

const Promocodes: React.FC = () => {
  const { lang = "ru" } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    "translates",
    [lang]
  );

  const Navs: NavPromocodes[] = [
    { id: 1, title: translation?.hamisi_keyy ?? "" },
    { id: 2, title: translation?.aktif_key ?? "" },
    { id: 3, title: translation?.bitmis_key ?? "" },
  ];

  const [activeSort, setActiveSort] = React.useState<number | null>(null);

  React.useEffect(() => {
    setActiveSort(Navs[0]?.id);
  }, []);

  const { getPromocodes, loadingPromocodes, promocodes } = useGetPromocodes();

  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    const delay = setTimeout(() => {
      const type =
        activeSort === 2 ? "active" : activeSort === 3 ? "expired" : undefined;
      getPromocodes({ type, search });
    }, 300);

    return () => clearTimeout(delay);
  }, [search, activeSort]);

  if (!search && search.trim() === "" && loadingPromocodes) return <Loading />;

  return (
    <section className="promocodes">
      <TopTitle>
        <div className="left">
          <h3>{translation?.inf_promokodlar ?? ""}</h3>
        </div>
        <div className="right">
          {Navs?.map((n: NavPromocodes) => (
            <button
              type="button"
              key={n?.id}
              onClick={() => setActiveSort(n?.id)}
              className={`sort-nav ${activeSort === n?.id ? "active" : ""}`}
            >
              {n?.title}
            </button>
          ))}
        </div>
      </TopTitle>
      <div className="container-promocodes">
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
            {promocodes?.length} {translation?.inf_promokodlar ?? ""}
          </p>
          {/* <div className="righted">
            <img src="/SortVertical.svg" alt="SortVertical" />
            <p>Filter by date: Last 7 days</p>
          </div> */}
        </div>
        <div className="table-content">
          <table>
            <thead>
              <tr>
                <th>{translation?.promokodun_adi ?? ""}</th>
                <th>{translation?.promokod_statusu ?? ""}</th>
                <th>{translation?.istifade_sayi ?? ""}</th>
                <th>{translation?.umumi_qazanc ?? ""}</th>
                <th>{translation?.yaranma_tarixi ?? ""}</th>
                <th>{translation?.bitme_tarixi ?? ""}</th>
              </tr>
            </thead> 
            <tbody>
              {promocodes && promocodes?.length > 0
                ? promocodes?.map((prom: GetPromocodesData) => (
                    <tr>
                      <td>
                        <div className="promocode-name">
                          <img src="/promocodeicon.svg" alt="promocodeicon" />
                          <p>{prom?.title}</p>
                        </div>
                      </td>
                      <td>
                        {prom.is_expired ? (
                          <div className="promocode-status statusExpired">
                            <span>x</span>
                            <p>{prom?.status ?? ""}</p>
                          </div>
                        ) : (
                          <div className="promocode-status">
                            <img src="/statusicon.svg" alt="statusicon" />
                            <p>{prom?.status ?? ""}</p>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="user-count">
                          <p>{prom?.usage_count}</p>
                        </div>
                      </td>
                      <td>
                        <div className="all-pays">
                          <img src="/₼.svg" alt="₼" />
                          <p>{prom?.total_earnings}</p>
                        </div>
                      </td>
                      <td>{prom?.to_date}</td>
                      <td>{prom?.from_date}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Promocodes;
