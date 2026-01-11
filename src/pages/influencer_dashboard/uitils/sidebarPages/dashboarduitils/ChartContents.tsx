import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { baseUrlInf } from '../../../../../InfluencerBaseURL';
import axios from 'axios';
import { TranslationsKeys } from '../../../../../setting/Types';
import GETRequest from '../../../../../setting/Request';
import { useParams } from 'react-router-dom';
import Loading from '../../../../../components/Loading';

interface RightContentInterface {
  id: number;
  price: string;
  tag: string;
  color: string;
}

export interface SalesDataInterface {
  Ödənilib: {
    id: number;
    name: string;
    total_amount: number;
    items_count: number;
  };
  'Ödəniş gözlənilir': {
    id: number;
    name: string;
    total_amount: number;
    items_count: number;
  };
  'Sorğu göndərilməyib': {
    id: number;
    name: string;
    total_amount: number;
    items_count: number;
  };
}

const ChartContents: React.FC = () => {
  const { lang = 'ru' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const [salesDataFromAPI, setSalesDataFromAPI] = React.useState<SalesDataInterface[]>(
    [],
  );
  const [filter, setFilter] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const fetchData = async (selectedFilter = filter) => {
    const userStr = localStorage.getItem('user-info');
    const user = userStr ? JSON.parse(userStr) : '';
    const token = user?.token;

    setLoading(true);

    try {
      const url = selectedFilter
        ? `${baseUrlInf}/sales-statistics?filter=${selectedFilter}`
        : `${baseUrlInf}/sales-statistics`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSalesDataFromAPI(res.data?.data);
    } catch (err) {
      console.error('Veri alınamadı', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData(filter);
  }, [filter]);

  const barChartData = [
    {
      name: 'A',
      paid:
        salesDataFromAPI.find(item => item['Ödənilib'])?.['Ödənilib'].items_count || 0,
      pending:
        salesDataFromAPI.find(item => item['Ödəniş gözlənilir'])?.['Ödəniş gözlənilir']
          .items_count || 0,
      notSent:
        salesDataFromAPI.find(item => item['Sorğu göndərilməyib'])?.[
          'Sorğu göndərilməyib'
        ].items_count || 0,
    },
  ];

  const rightStatusBarChart = [
    {
      id: 1,
      title: translation?.odenilib ?? '',
      tag: `${
        salesDataFromAPI.find(item => item['Ödənilib'])?.['Ödənilib'].items_count || 0
      } ${translation?.satish_text ?? ''}`,
      name: 'A',
      color: '#FF82AC',
    },
    {
      id: 2,
      title: translation?.gozlemede ?? '',
      tag: `${
        salesDataFromAPI.find(item => item['Ödəniş gözlənilir'])?.['Ödəniş gözlənilir']
          .items_count || 0
      } ${translation?.satish_text ?? ''}`,
      name: 'B',
      color: '#59E6F6',
    },
    {
      id: 3,
      title: translation?.sorgugonderilmeyib ?? '',
      tag: `${
        salesDataFromAPI.find(item => item['Sorğu göndərilməyib'])?.[
          'Sorğu göndərilməyib'
        ].items_count || 0
      } ${translation?.satish_text ?? ''}`,
      name: 'C',
      color: '#4C78FF',
    },
  ];

  const RightContent: RightContentInterface[] = [
    {
      id: 1,
      price: `${
        salesDataFromAPI.find(item => item['Ödənilib'])?.['Ödənilib'].total_amount || 0
      }.00 ₼`,
      tag: translation?.umumi_odenilen ?? '',
      color: '#7661e2',
    },
    {
      id: 2,
      price: `${
        salesDataFromAPI.find(item => item['Ödəniş gözlənilir'])?.['Ödəniş gözlənilir']
          .total_amount || 0
      }.00 ₼`,
      tag: translation?.gozlemede ?? '',
      color: '#59c7f6',
    },
    {
      id: 3,
      price: `${
        salesDataFromAPI.find(item => item['Sorğu göndərilməyib'])?.[
          'Sorğu göndərilməyib'
        ].total_amount || 0
      }.00 ₼`,
      tag: translation?.sorgugonderilmeyib ?? '',
      color: '#ff82ac',
    },
  ];

  if (loading) return <Loading />;
  return (
    <section className="chart-content-wrapper">
      <div className="left-content">
        <div className="top-title-wrap">
          <h2>{translation?.satis_statistikasi ?? ''}</h2>
          <div className="filter-right">
            <select
              style={{ padding: '8px 18px' }}
              onChange={e => setFilter(e.target.value)}
              value={filter}
            >
              <option value="">{translation?.tarixleregoresiralar ?? ''}</option>
              <option value="oneweekago">{translation?.son1hefte ?? ''}</option>
              <option value="onemonthago">{translation?.son1ay ?? ''}</option>
              <option value="threemonthago">{translation?.son3ay ?? ''}</option>
            </select>
          </div>
        </div>
        <div className="bar-chart-container">
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                barCategoryGap={8}
                margin={{ top: 0, right: 0, left: 0, bottom: 32 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="notSent" fill="#7661E2" radius={[10, 10, 0, 0]} />
                <Bar dataKey="pending" fill="#59E6F6" radius={[10, 10, 0, 0]} />
                <Bar dataKey="paid" fill="#FF82AC" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="right-chart-status">
            {rightStatusBarChart?.map(data => (
              <div className="item-chart-stat" key={data?.id}>
                <div className="item-chart-stat_left">
                  <h3>{data?.name}</h3>
                  <div className="colorize">
                    <span
                      className="color"
                      style={{ backgroundColor: data?.color }}
                    ></span>
                    <p>{data?.title}</p>
                  </div>
                </div>
                <h5>{data?.tag}</h5>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="right-content">
        {RightContent?.map((item: RightContentInterface) => (
          <div
            key={item?.id}
            className="right-content-chart-item"
            style={{ backgroundColor: item?.color || '' }}
          >
            <svg
              className="vecorone"
              width="59"
              height="63"
              viewBox="0 0 59 63"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="198.653"
                height="90.7425"
                rx="45.3713"
                transform="matrix(0.97057 0.24082 -0.29289 0.956146 15.8848 -8.80139)"
                fill="white"
                fillOpacity="0.12"
              />
              <rect
                x="0.33884"
                y="0.598483"
                width="197.653"
                height="89.7425"
                rx="44.8713"
                transform="matrix(0.97057 0.24082 -0.29289 0.956146 16.07 -8.85675)"
                stroke="white"
                strokeOpacity="0.12"
              />
            </svg>
            {item.id === 1 ? (
              <svg
                className="vectortwo"
                width="53"
                height="60"
                viewBox="0 0 53 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="185.203"
                  height="97.5961"
                  rx="48.7981"
                  transform="matrix(-0.539949 0.841698 -0.887357 -0.461084 168.602 -80.1)"
                  fill="#7661E2"
                  fillOpacity="0.5"
                />
                <rect
                  x="-0.713653"
                  y="0.190307"
                  width="184.203"
                  height="96.5961"
                  rx="48.2981"
                  transform="matrix(-0.539949 0.841698 -0.887357 -0.461084 167.671 -79.2212)"
                  stroke="white"
                  strokeOpacity="0.2"
                />
              </svg>
            ) : item.id === 2 ? (
              <svg
                className="vectorthree"
                width="53"
                height="60"
                viewBox="0 0 53 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="185.203"
                  height="97.5961"
                  rx="48.7981"
                  transform="matrix(-0.539949 0.841698 -0.887357 -0.461084 168.602 -80.1)"
                  fill="#59C7F6"
                  fillOpacity="0.5"
                />
                <rect
                  x="-0.713653"
                  y="0.190307"
                  width="184.203"
                  height="96.5961"
                  rx="48.2981"
                  transform="matrix(-0.539949 0.841698 -0.887357 -0.461084 167.671 -79.2212)"
                  stroke="white"
                  strokeOpacity="0.2"
                />
              </svg>
            ) : (
              <svg
                className="vectorfour"
                width="53"
                height="60"
                viewBox="0 0 53 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="185.203"
                  height="97.5961"
                  rx="48.7981"
                  transform="matrix(-0.539949 0.841698 -0.887357 -0.461084 168.602 -80.1)"
                  fill="#FF82AC"
                  fillOpacity="0.5"
                />
                <rect
                  x="-0.713653"
                  y="0.190307"
                  width="184.203"
                  height="96.5961"
                  rx="48.2981"
                  transform="matrix(-0.539949 0.841698 -0.887357 -0.461084 167.671 -79.2212)"
                  stroke="white"
                  strokeOpacity="0.2"
                />
              </svg>
            )}
            <div className="left-icon">
              <img src="/comp.svg" alt="icon" />
            </div>
            <div className="right-text">
              <h3>{item?.price}</h3>
              <p>{item?.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChartContents;
