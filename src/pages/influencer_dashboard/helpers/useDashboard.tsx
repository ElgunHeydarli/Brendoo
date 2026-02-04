import { useParams } from 'react-router-dom';
import GETRequest from '../../../setting/Request';
import { TranslationsKeys } from '../../../setting/Types';

export interface DashboardElementsInterface {
  id: number;
  title: string;
  icon: string;
  isLink?: boolean;
  to?: string;
}

export const useDashboard = () => {
  const { lang = 'az' } = useParams<{ lang: string }>();

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const DashboardElements: DashboardElementsInterface[] = [
    {
      id: 1,
      title: translation?.inf_dashboard ?? '',
      icon: '/HomeSmile.svg',
      to: 'dashboard',
    },
    {
      id: 2,
      title: translation?.inf_kolleksiyalar ?? '',
      icon: '/FolderWithFiles.svg',
      to: 'kolleksiyalar',
    },
    {
      id: 3,
      title: translation?.storiler_key_key ?? '',
      icon: '/TrafficEconomy.svg',
      to: 'story',
    },
    {
      id: 4,
      title: translation?.inf_promokodlar ?? '',
      icon: '/TicketSale.svg',
      to: 'promokodlar',
    },
    {
      id: 5,
      title: translation?.inf_qazancodenisler ?? '',
      icon: '/BillCheck.svg',
      to: 'qazanc-ve-odenisler',
    },
    {
      id: 6,
      title: translation?.inf_settings ?? '',
      icon: '/Settings.svg',
      to: 'tenzimlemeler',
    },
    {
      id: 7,
      title: translation?.inf_cixis ?? '',
      icon: '/Logout2.svg',
      isLink: true,
    },
  ];

  return { DashboardElements };
};
