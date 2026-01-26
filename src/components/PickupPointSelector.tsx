import React, { useEffect, useState, useRef } from "react";
import { getPickupPoints } from "../setting/Request";
import { PickupPoint, TranslationsKeys } from "../setting/Types";
import { MapPin, Clock, Phone, Check, Search, ChevronDown, Edit2, X, Navigation } from "lucide-react";

interface PickupPointSelectorProps {
  selectedPickupPoint: PickupPoint | null;
  onSelect: (point: PickupPoint | null) => void;
  lang: string;
  translation: TranslationsKeys | undefined;
  error?: string;
}

const PickupPointSelector: React.FC<PickupPointSelectorProps> = ({
  selectedPickupPoint,
  onSelect,
  lang,
  translation,
  error,
}) => {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load saved pickup point on mount
  useEffect(() => {
    const initialize = async () => {
      // Check for saved pickup point
      const savedPickup = localStorage.getItem("selected_pickup_point");

      if (savedPickup && !selectedPickupPoint) {
        try {
          const parsed = JSON.parse(savedPickup);
          onSelect(parsed);
        } catch (e) {
          console.error("Error parsing saved pickup point:", e);
        }
      }

      setIsInitialized(true);
    };

    initialize();
  }, [lang]);

  // Load ALL pickup points when modal opens (without city filter)
  useEffect(() => {
    const loadPickupPoints = async () => {
      if (!isModalOpen || !isInitialized) return;
      setLoading(true);
      try {
        const points = await getPickupPoints(undefined, lang);
        setPickupPoints(points);
      } catch (error) {
        console.error("Error loading pickup points:", error);
        setPickupPoints([]);
      } finally {
        setLoading(false);
      }
    };
    loadPickupPoints();
  }, [lang, isModalOpen, isInitialized]);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Filter pickup points
  const filteredPickupPoints = pickupPoints.filter((point) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      point.name?.toLowerCase().includes(query) ||
      point.address?.toLowerCase().includes(query)
    );
  });

  // Handle pickup point selection
  const handleSelectPoint = (point: PickupPoint) => {
    onSelect(point);
    localStorage.setItem("selected_pickup_point", JSON.stringify(point));
    setIsModalOpen(false);
    window.dispatchEvent(new Event("pickup_point_updated"));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Compact Card View */}
      <div
        onClick={openModal}
        className={`group relative rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
          error
            ? "border-red-300 bg-red-50"
            : selectedPickupPoint
            ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50"
            : "border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <div className="p-5">
          {selectedPickupPoint ? (
            // Selected state
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{selectedPickupPoint.name}</p>
                <p className="text-sm text-gray-500 truncate">{selectedPickupPoint.address}</p>
                {selectedPickupPoint.working_hours && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedPickupPoint.working_hours}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          ) : (
            // Empty state
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-200 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <MapPin className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                  {translation?.select_pickup_point || "Təhvil nöqtəsi seçin"}
                </p>
                <p className="text-sm text-gray-400">
                  {translation?.click_to_select || "Seçmək üçün klikləyin"}
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          )}
        </div>
        {error && (
          <div className="px-5 pb-3">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl">
              <h3 className="text-lg font-semibold">
                {translation?.tehvil_noqtesi || "Təhvil nöqtəsi"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translation?.search_pickup || "Axtar..."}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Points List */}
            <div className="flex-1 overflow-y-auto p-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">{translation?.is_loading || "Yüklənir..."}</p>
                </div>
              ) : filteredPickupPoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <MapPin className="w-12 h-12 mb-3 opacity-30" />
                  <p>{translation?.no_pickup_points || "Nöqtə tapılmadı"}</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredPickupPoints.map((point) => {
                    const isSelected = selectedPickupPoint?.id === point.id || selectedPickupPoint?.pickup_id === point.pickup_id;
                    return (
                      <div
                        key={point.id || point.pickup_id}
                        onClick={() => handleSelectPoint(point)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-2 border-blue-500 shadow-sm"
                            : "bg-white border border-gray-100 hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-blue-500" : "bg-gray-100"
                          }`}>
                            <Navigation className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium truncate ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                                {point.name}
                              </p>
                              {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{point.address}</p>
                            <div className="flex items-center gap-3 mt-2">
                              {point.working_hours && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                  <Clock className="w-3 h-3" />
                                  {point.working_hours}
                                </span>
                              )}
                              {point.phone && (
                                <a
                                  href={`tel:${point.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100"
                                >
                                  <Phone className="w-3 h-3" />
                                  {point.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 safe-area-bottom">
              <p className="text-xs text-center text-gray-400">
                {filteredPickupPoints.length} {translation?.tehvil_noqtesi_count || "nöqtə"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PickupPointSelector;
