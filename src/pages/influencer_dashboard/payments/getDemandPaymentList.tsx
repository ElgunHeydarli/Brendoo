import axios from 'axios';
import { useState } from 'react';
import { baseUrlInf } from '../../../InfluencerBaseURL';
import { useParams } from 'react-router-dom';

export interface GetPaymentsData {
  id: number;
  amount: number;
  earningReason: string;
  paymentStatus: string;
  isPaid: boolean;
  paymentDate: string | null;
}

export const useGetPayments = () => {
  const [loadingPayData, setLoadingPayData] = useState(false);
  const [paymentData, setPaymentData] = useState<GetPaymentsData[]>([]);
  const { lang = 'az' } = useParams<{ lang: string }>();
  const getPromocodes = async (params?: { search: string }) => {
    const userStr = localStorage.getItem('user-info');
    const user = userStr ? JSON.parse(userStr) : '';
    const token = user?.token;
    setLoadingPayData(true);
    try {
      const query = new URLSearchParams();

      if (params?.search) query.append('search', params.search);

      const res = await axios.get(`${baseUrlInf}/demand-payment-lists?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': lang,
        },
      });

      setPaymentData(res.data.data);
    } catch (err) {
      console.error('Promokodlar alınamadı', err);
    } finally {
      setLoadingPayData(false);
    }
  };

  return { getPromocodes, loadingPayData, paymentData };
};
