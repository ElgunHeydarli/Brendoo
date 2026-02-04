import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GETRequest, { getPickupPoints } from "../../setting/Request";
import { TranslationsKeys, PickupPoint } from "../../setting/Types";
import Header from "../../components/Header";
import UserAside from "../../components/userAside";
import axios from "axios";
import toast from "react-hot-toast";
import { Clock, Phone, Check, Search, Navigation, Package } from "lucide-react";

const ChangeAddress: React.FC = () => {
  const { lang = "az" } = useParams<{ lang: string }>();

  const { data: translation } = GETRequest<TranslationsKeys>(
    "/translates",
    "translates",
    [lang]
  );

  // User info
  const [parsedInfo] = useState(() => {
    try {
      const raw = localStorage.getItem("user-info");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const token: string | null = parsedInfo?.token ?? null;
  const rawCustomer: any = parsedInfo?.customer ?? null;

  // State
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load saved pickup point and all pickup points on mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      // 1. Check for saved pickup point
      const savedPickup = localStorage.getItem("selected_pickup_point");
      if (savedPickup) {
        try {
          const parsed = JSON.parse(savedPickup);
          setSelectedPickup(parsed);
        } catch (e) {
          console.error("Error parsing saved pickup point:", e);
        }
      }

      // 2. Load ALL pickup points (without city filter)
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

    initialize();
  }, [lang]);

  // Filter pickup points by search
  const filteredPickupPoints = pickupPoints.filter((point) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      point.name?.toLowerCase().includes(query) ||
      point.address?.toLowerCase().includes(query)
    );
  });

  // Save selected pickup point
  const handleSavePickup = async () => {
    if (!selectedPickup) {
      toast.error(translation?.select_pickup_point || "Zəhmət olmasa təhvil nöqtəsi seçin");
      return;
    }

    setSaving(true);
    try {
      // LocalStorage-a saxla
      localStorage.setItem("selected_pickup_point", JSON.stringify(selectedPickup));

      // User info-nu yenilə
      if (parsedInfo) {
        const updatedInfo = {
          ...parsedInfo,
          customer: {
            ...rawCustomer,
            pickup_point: selectedPickup,
          },
        };
        localStorage.setItem("user-info", JSON.stringify(updatedInfo));
      }

      // API-yə göndər
      if (token) {
        await axios.post(
          "https://admin.brendoo.com/api/customer/pickup-point",
          {
            pickup_point_id: selectedPickup.pickup_id || selectedPickup.id,
            pickup_point_name: selectedPickup.name,
            pickup_point_address: selectedPickup.address,
            pickup_point_city: selectedPickup.city,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success(translation?.pickup_saved || "Təhvil nöqtəsi saxlanıldı");
      window.dispatchEvent(new Event("pickup_point_updated"));
    } catch (error) {
      console.error("Error saving pickup point:", error);
      toast.error(translation?.error_occurred || "Xəta baş verdi");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPoint = (point: PickupPoint) => {
    setSelectedPickup(point);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex flex-row max-sm:flex-col w-full gap-5 p-4 max-w-7xl mx-auto">
        <UserAside active={10} />
        <div className="w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {translation?.tehvil_noqtesi || "Təhvil nöqtəsi"}
            </h1>
            <p className="text-gray-500 mt-1">
              {translation?.select_pickup_desc || "Sifarişlərinizi təhvil alacağınız nöqtəni seçin"}
            </p>
          </div>

          {/* Selected Point Card */}
          {selectedPickup && (
            <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-600 font-medium">
                    {translation?.selected_pickup || "Seçilmiş təhvil nöqtəsi"}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedPickup.name}</p>
                  <p className="text-gray-600">{selectedPickup.address}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {selectedPickup.working_hours && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4" />
                        {selectedPickup.working_hours}
                      </span>
                    )}
                    {selectedPickup.phone && (
                      <a
                        href={`tel:${selectedPickup.phone}`}
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedPickup.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translation?.search_pickup || "Təhvil nöqtəsi axtar..."}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Points Grid */}
            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500">{translation?.is_loading || "Yüklənir..."}</p>
                </div>
              ) : filteredPickupPoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Package className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">{translation?.no_pickup_points || "Nöqtə tapılmadı"}</p>
                  <p className="text-sm mt-1">{translation?.try_different_search || "Başqa axtarış edin"}</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPickupPoints.map((point) => {
                    const isSelected = selectedPickup?.id === point.id || selectedPickup?.pickup_id === point.pickup_id;
                    return (
                      <div
                        key={point.id || point.pickup_id}
                        onClick={() => handleSelectPoint(point)}
                        className={`group p-4 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50 border-2 border-blue-500 shadow-md"
                            : "bg-gray-50 border-2 border-transparent hover:border-blue-300 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? "bg-blue-500" : "bg-gray-200 group-hover:bg-blue-100"
                          }`}>
                            <Navigation className={`w-5 h-5 transition-colors ${
                              isSelected ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`font-medium line-clamp-1 ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                                {point.name}
                              </p>
                              {isSelected && (
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{point.address}</p>
                            {point.working_hours && (
                              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {point.working_hours}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                {filteredPickupPoints.length} {translation?.tehvil_noqtesi_count || "nöqtə tapıldı"}
              </p>
              <button
                type="button"
                onClick={handleSavePickup}
                disabled={saving || !selectedPickup}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all ${
                  selectedPickup
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {translation?.please_wait || "Gözləyin..."}
                  </span>
                ) : (
                  translation?.save_pickup || "Təhvil nöqtəsini saxla"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangeAddress;
