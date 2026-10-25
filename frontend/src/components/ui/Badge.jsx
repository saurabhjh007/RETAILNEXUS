import React from 'react';
import { getStatusBadgeConfig } from '../../utils/formatters';

export const Badge = ({ status, label, variant, size = 'sm', showDot = true, className = '' }) => {
  const config = getStatusBadgeConfig(status || variant);
  const text = label || config.label;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full capitalize leading-none ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />}
      <span>{text}</span>
    </span>
  );
};
