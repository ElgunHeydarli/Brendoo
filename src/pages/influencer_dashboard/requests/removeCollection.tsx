import axios from 'axios';
import { baseUrlInf } from '../../../InfluencerBaseURL';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

export const removeCollection = async (id: number, msg: string) => {
  const { lang = 'az' } = useParams();
  const userStr = localStorage.getItem('user-info');
  const user = userStr ? JSON.parse(userStr) : '';
  const token = user?.token;

  try {
    const res = await axios.delete(`${baseUrlInf}/collection/${id}/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data) {
      toast.success(msg ?? "");
      if (location.pathname === `/${lang}/influencer/kolleksiyalar`) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } else {
      console.log(res.status);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error?.response?.data?.message) {
        toast.error(error?.response?.data?.message ?? '');
      }
    }
    console.log(error);
  }
};
