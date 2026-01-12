import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { getOrderTracking } from '../../setting/Request';
import type { OrderTracking } from '../../setting/Types';
import ExpargoStatusBadge from '../ExpargoStatusBadge';

interface OrderTrackingCardProps {
  orderNumber: string;
  lang: string;
  translation?: any;
  compact?: boolean;
}

// Status timeline ikonları
const statusIcons: Record<string, any> = {
  WaitingDomesticShipment: Package,
  WaitingForDeclaration: Package,
  InTransit: Truck,
  ArrivedAtPickup: MapPin,
  Delivered: CheckCircle,
  Returned: XCircle,
  Cancelled: XCircle,
};

export default function OrderTrackingCard({
  orderNumber,
  lang,
  translation,
  compact = false,
}: OrderTrackingCardProps) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTracking = async () => {
      setIsLoading(true);
      setError(null);
      
      const response = await getOrderTracking(orderNumber, lang);
      
      if (response?.success && response.data) {
        setTracking(response.data);
      } else {
        setError(translation?.tracking_tapilmadi || 'Tracking məlumatı tapılmadı');
      }
      
      setIsLoading(false);
    };

    if (orderNumber) {
      loadTracking();
    }
  }, [orderNumber, lang]);

  if (isLoading) {
    return (
      <div className="animate-pulse p-4 rounded-xl bg-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  const StatusIcon = statusIcons[tracking.status] || Package;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
        <StatusIcon className="w-5 h-5 text-blue-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {tracking.tracking_number}
          </p>
          <p className="text-xs text-gray-500">{tracking.estimate}</p>
        </div>
        <ExpargoStatusBadge status={tracking.status} size="sm" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <StatusIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {translation?.tracking_nomresi || 'Tracking nömrəsi'}
              </p>
              <p className="font-semibold text-gray-900">{tracking.tracking_number}</p>
            </div>
          </div>
          <ExpargoStatusBadge status={tracking.status} />
        </div>
      </div>

      {/* Pickup Point */}
      {tracking.pickup_point && (
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            {translation?.tehvil_noqtesi || 'Təhvil nöqtəsi'}
          </h4>
          
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="font-medium text-gray-900">{tracking.pickup_point.name}</p>
            <p className="text-sm text-gray-600 mt-1">{tracking.pickup_point.address}</p>
            
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              {tracking.pickup_point.phone && (
                <a 
                  href={`tel:${tracking.pickup_point.phone}`}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  <Phone className="w-3 h-3" />
                  {tracking.pickup_point.phone}
                </a>
              )}
              {tracking.pickup_point.working_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tracking.pickup_point.working_hours}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {translation?.texmini_catdirilma || 'Təxmini çatdırılma'}
          </span>
          <span className="font-medium text-gray-900">{tracking.estimate}</span>
        </div>
        
        {tracking.delivered_at && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">
              {translation?.tehvil_tarixi || 'Təhvil tarixi'}
            </span>
            <span className="font-medium text-green-600">{tracking.delivered_at}</span>
          </div>
        )}
      </div>
    </div>
  );
}
