import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { baseUrlInf } from '../../../../../InfluencerBaseURL';
import axios from 'axios';
import { TranslationsKeys } from '../../../../../setting/Types';
import GETRequest from '../../../../../setting/Request';
import { useParams } from 'react-router-dom';
import Loading from '../../../../../components/Loading';

type IncomeDataItem = {
  name: string;
  value: number;
};

type PieDataItem = {
  amount: number;
  percent: string;
  title: string;
};

const BottomChart: React.FC = () => {
  const { lang = 'az' } = useParams<{ lang: string }>();
  const { data: translation } = GETRequest<TranslationsKeys>(`/translates`, 'translates', [
    lang,
  ]);

  const [incomeDataApi, setIncomeDataApi] = useState<IncomeDataItem[]>([]);
  const [pieApi, setPieApi] = useState<any>([]);

  const [filter, setFilter] = React.useState<string>('fourweekmonth');
  const [loading, setLoading] = React.useState(false);
  const [loadingp, setLoadingp] = React.useState<boolean>(false);

  const userStr = localStorage.getItem('user-info');
  const user = userStr ? JSON.parse(userStr) : '';
  const token = user?.token;

  const fetchData = async (selectedFilter = filter) => {
    setLoading(true);

    try {
      const url = selectedFilter
        ? `${baseUrlInf}/revenue-chart?filter=${selectedFilter}`
        : `${baseUrlInf}/revenue-chart`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const formattedData = Object.entries(res.data).map(([name, value]) => ({
        name,
        value: Number(value),
      }));

      setIncomeDataApi(formattedData);
    } catch (err) {
      console.error('Veri alınamadı', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData(filter);
  }, [filter]);

  const fetchDataPie = async () => {
    setLoadingp(true);

    try {
      const res = await axios.get(`${baseUrlInf}/source-of-income`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const manipulated = res.data?.map((data: PieDataItem, i: number) => {
        const parsedValue = parseFloat(data?.percent.replace('%', ''));

        return {
          name: data?.title,
          value: parsedValue,
          amount: data?.amount,
          percent: data?.percent,
          color: i === 0 ? '#FF82AC' : i === 1 ? '#59E6F6' : i === 2 ? '#4C78FF' : '#ccc',
        };
      });

      setPieApi(manipulated);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingp(false);
    }
  };

  const dataPie = pieApi;

  React.useEffect(() => {
    fetchDataPie();
  }, []);

  if (loading || loadingp) return <Loading />;

  return (
    <section className="bottom-chart-area">
      <div className="top-filter-title">
        <select
          style={{ padding: '8px 18px' }}
          onChange={e => setFilter(e.target.value)}
          value={filter}
        >
          <option value="fourweekmonth">{translation?.son4hefte ?? ''}</option>
          <option value="fourweekago">{translation?.son1ay ?? ''}</option>
        </select>
      </div>
      <div className="bottom-content">
        <div className="bottom-content_left">
          <h2>{translation?.gelir_grafiki ?? ''}</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={incomeDataApi}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <CartesianGrid stroke="#f5f5f5" strokeDasharray="0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickMargin={14}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={value => `${value / 1000} K`}
                  domain={[0, 500000]}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={21}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: 10,
                    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                  }}
                  labelFormatter={() => ''}
                  formatter={(value) => [`${(value ?? 0) as number / 1000} K`, '']}
                  cursor={{ strokeDasharray: '4 4', stroke: '#8B7EFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8B7EFF"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    stroke: '#8B7EFF',
                    strokeWidth: 2,
                    fill: '#fff',
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#8B7EFF',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bottom-content_right">
          <h2>{translation?.gelir_menbeyi ?? ''}</h2>
          <div className="bottom-content_right_container-chart">
            <div style={{ width: 160, height: 160 }}>
              {pieApi.length === 0 || pieApi.every((item: any) => item.value === 0) ? (
                <p>{translation?.data_yox ?? ''}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieApi}
                      cx="50%"
                      cy="50%"
                      startAngle={0}
                      endAngle={360}
                      innerRadius={30}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {pieApi?.map((entry: any, index: any) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <ul className="list">
              {dataPie.map((item: any, index: number) => (
                <li key={index} className="list-item">
                  <div className="color" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.percent}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BottomChart;