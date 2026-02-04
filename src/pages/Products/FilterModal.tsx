import { useParams } from 'react-router-dom';
import type { TranslationsKeys } from '../../setting/Types';
import GETRequest from '../../setting/Request';

interface OutOfStockNotificationProps {
  isOpen: boolean;
  productName: string;
  onRequestReminder: () => void;
  isLoading?: boolean;
}


const FilterModal = ({
  isOpen,
  onRequestReminder,
  isLoading,
}: OutOfStockNotificationProps) => {
  const { lang = 'az' } = useParams<{
    lang: string;
    slug: string;
  }>();

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang]
  );

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <div className="bg-white rounded-lg mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {translation?.Out_of_Stock}
          </h3>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onRequestReminder}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Processing...' : translation?.Notify_Me}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterModal;
