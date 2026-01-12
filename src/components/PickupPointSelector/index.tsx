import { useState, useEffect, useMemo } from 'react';
import { MapPin, Phone, Clock, ChevronDown, Search, X } from 'lucide-react';
import { getPickupPoints } from '../../setting/Request';
import type { PickupPoint } from '../../setting/Types';

interface PickupPointSelectorProps {
  selectedPickupPoint: PickupPoint | null;
  onSelect: (point: PickupPoint | null) => void;
  lang: string;
  translation?: any;
  error?: string;
}

export default function PickupPointSelector({
  selectedPickupPoint,
  onSelect,
  lang,
  translation,
  error,
}: PickupPointSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Bütün pickup nöqtələrini yüklə
  useEffect(() => {
    const loadPickupPoints = async () => {
      setIsLoading(true);
      const points = await getPickupPoints(undefined, lang);
      setPickupPoints(points);
      setIsLoading(false);
    };
    loadPickupPoints();
  }, [lang]);

  // Axtarış filtri
  const filteredPoints = useMemo(() => {
    if (!searchQuery) return pickupPoints;
    const query = searchQuery.toLowerCase();
    return pickupPoints.filter(
      (point) =>
        point.name.toLowerCase().includes(query) ||
        point.address.toLowerCase().includes(query)
    );
  }, [pickupPoints, searchQuery]);

  const handleSelect = (point: PickupPoint) => {
    onSelect(point);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect(null);
  };

  return (
    <div className="w-full">
      {/* Seçim Düyməsi */}
      <div className="flex flex-col gap-2">
        {!selectedPickupPoint ? (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`w-full px-5 py-4 rounded-xl border-2 border-dashed transition-all text-left flex items-center justify-between ${
              error
                ? 'border-red-300 bg-red-50 hover:border-red-400'
                : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${error ? 'bg-red-100' : 'bg-gray-200'}`}>
                <MapPin className={`w-5 h-5 ${error ? 'text-red-500' : 'text-gray-500'}`} />
              </div>
              <span className={`font-medium ${error ? 'text-red-500' : 'text-gray-500'}`}>
                {translation?.pickup_secin || 'Pickup nöqtəsi seçin'}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          </button>
        ) : (
          // Seçilmiş nöqtə kartı
          <div className="relative p-4 rounded-xl border-2 border-green-200 bg-green-50">
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white shadow-sm hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-green-100">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <h4 className="font-semibold text-gray-900">
                  {selectedPickupPoint.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{selectedPickupPoint.address}</p>

                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                  {selectedPickupPoint.phone && (
                    <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md">
                      <Phone className="w-3 h-3 text-green-600" />
                      {selectedPickupPoint.phone}
                    </span>
                  )}
                  {selectedPickupPoint.working_hours && (
                    <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3 text-green-600" />
                      {selectedPickupPoint.working_hours}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-3 text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
            >
              <span>↻</span> {translation?.deyisdir || 'Dəyişdir'}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        {/* Çatdırılma müddəti */}
        <div className="flex items-center gap-2.5 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-sm text-amber-800">
            {translation?.catdirilma_muddeti || 'Təxmini çatdırılma'}: <strong>5-14 iş günü</strong>
          </span>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {translation?.pickup_secin || 'Pickup nöqtəsi seçin'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Axtarış */}
            <div className="p-4 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={translation?.axtar || 'Axtar...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>

            {/* Pickup Nöqtələri Siyahısı */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredPoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {translation?.noqte_tapilmadi || 'Nöqtə tapılmadı'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPoints.map((point) => (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => handleSelect(point)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-400 hover:bg-blue-50 ${
                        selectedPickupPoint?.id === point.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedPickupPoint?.id === point.id ? 'bg-blue-200' : 'bg-gray-100'
                          }`}
                        >
                          <MapPin
                            className={`w-4 h-4 ${
                              selectedPickupPoint?.id === point.id ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{point.name}</h4>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                            {point.address}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
                            {point.working_hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {point.working_hours}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {filteredPoints.length} {translation?.noqte || 'nöqtə'} {translation?.tapildi || 'tapıldı'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
