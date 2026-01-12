import type { ExpargoStatus } from '../../setting/Types';
import { ExpargoStatusColors } from '../../setting/Types';

interface ExpargoStatusBadgeProps {
  status: ExpargoStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ExpargoStatusBadge({ status, size = 'md' }: ExpargoStatusBadgeProps) {
  const statusInfo = ExpargoStatusColors[status as ExpargoStatus] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: status,
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${statusInfo.bg} ${statusInfo.text} ${sizeClasses[size]}`}
    >
      {statusInfo.label}
    </span>
  );
}
