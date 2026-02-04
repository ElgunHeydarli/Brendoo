import GETRequest from '../../../../setting/Request';
import { TranslationsKeys } from '../../../../setting/Types';
import { MoreActionsInterface } from './Collections';

export const useActions = () => {
  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    ['az'],
  );

  const defaultMoreActions: MoreActionsInterface[] = [
    {
      id: 99991,
      title: translation?.kolleksiyaya_bax_key || 'Kolleksiyaya bax',
      icon: '/Eye.svg',
    },
    {
      id: 229379278278,
      title: translation?.redakte_et_key || 'Redaktə et',
      icon: '/peng.svg',
    },
    {
      id: 39292928328928,
      title: translation?.sill_key || 'Sil',
      icon: '/removed.svg',
    },
  ];

  return { defaultMoreActions };
};
