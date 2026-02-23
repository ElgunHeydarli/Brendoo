import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import UserAside from '../../components/userAside';
import GETRequest, { axiosInstance } from '../../setting/Request';
import type { Notification, TranslationsKeys } from '../../setting/Types';
import Loading from '../../components/Loading';
import NotificationPop from '../../components/NotificationPopUp';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function Notification() {
  const { lang = 'az' } = useParams<{
    lang: string;
  }>();
  const [isPopOpen, setIsPopOpen] = useState(false);
  const [NotificationId, setNotificationId] = useState(0);
  const { data: notifications, isLoading: NotificationsLoading } = GETRequest<
    Notification[]
  >(`/notifications`, 'notifications', [lang]);
  const { data: tarnslation, isLoading: tarnslationLoading } =
    GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    const userStr = localStorage.getItem('user-info');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('user:', user);
    } else {
      navigate(`/en/login`);
    }
  }, []);
  if (NotificationsLoading || tarnslationLoading) {
    <Loading />;
  }

  return (
    <div>
      <Header />
      <div className="" />
      <main className="flex max-sm:flex-col flex-row w-full gap-5 p-4">
        <UserAside active={3} />
        <div className="w-full rounded-[20px] bg-[#F8F8F8] lg:p-[40px] px-4 py-10">
          <h1 className="text-[28px] font-semibold mb-[40px]">
            {tarnslation?.notification}
          </h1>
          <div className="flex flex-col  gap-3">
            {[...(notifications || [])].sort((a, b) => b.id - a.id).map((item) => {
              if (!item.is_read) {
                return (
                  <div
                    className="flex overflow-hidden flex-wrap gap-5 justify-between px-6 py-6 w-full bg-white rounded-3xl border border-blue-100 border-solid max-md:pr-5 max-md:max-w-full"
                    onClick={async () => {
                      setIsPopOpen(true);
                      setNotificationId(item.id);
                      const userStr = localStorage.getItem('user-info');
                      if (userStr) {
                        const User = JSON.parse(userStr);
                        await axiosInstance
                          .put(
                            '/read/notification',
                            {
                              notification_id: item.id,
                              is_read: true,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${User.token}`,
                                Accept: 'application/json',
                              },
                            }
                          )
                          .then(() => {
                            queryClient.invalidateQueries({
                              queryKey: ['notifications'],
                            });
                          });
                      }
                    }}>
                    <div className="flex flex-col max-md:max-w-full">
                      <div className="text-base font-medium text-sky-400 max-md:max-w-full">
                        {item.title}
                      </div>
                      <div className="mt-2 text-sm text-black text-opacity-80 max-md:max-w-full">
                        {item.body}
                      </div>
                    </div>
                    <div className="flex shrink-0 my-auto w-3 h-3 bg-rose-600 rounded-[100px]" />
                  </div>
                );
              } else {
                return (
                  <div
                    className="flex overflow-hidden flex-col justify-center items-start px-5 py-6 mt-3 w-full rounded-3xl border border-solid bg-stone-50 border-black border-opacity-10 max-md:max-w-full"
                    onClick={() => {
                      setIsPopOpen(true);
                      setNotificationId(item.id);
                    }}>
                    <div className="flex flex-col max-md:max-w-full">
                      <div className="text-base font-medium text-black max-md:max-w-full">
                        {item.title}
                      </div>
                      <div className="mt-2 text-sm text-black text-opacity-80 max-md:max-w-full">
                        {item.body}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>

        <NotificationPop
          isOpen={isPopOpen}
          onClose={() => {
            setIsPopOpen(false);
          }}
          title={
            notifications?.find((item) => item.id === NotificationId)?.title ||
            ''
          }
          description={
            notifications?.find((item) => item.id === NotificationId)?.body ||
            ''
          }
        />
      </main>
    </div>
  );
}
