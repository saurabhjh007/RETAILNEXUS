// RetailNexus Utility Formatters (INR, Date, Status badges)

export const formatINR = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  const num = Number(value);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
    }
    
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  } catch {
    return dateString;
  }
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const getStatusBadgeConfig = (status) => {
  switch (status?.toUpperCase()) {
    case 'IN_STOCK':
    case 'DELIVERED':
    case 'FULLY_RECEIVED':
    case 'APPROVED':
    case 'COMPLETED':
    case 'ACTIVE':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: status.replace(/_/g, ' ')
      };
    case 'LOW_STOCK':
    case 'PARTIALLY_RECEIVED':
    case 'PROCESSING':
    case 'READY_TO_DISPATCH':
    case 'SUBMITTED':
    case 'IN_PROGRESS':
    case 'WARNING':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: status.replace(/_/g, ' ')
      };
    case 'OUT_OF_STOCK':
    case 'CANCELLED':
    case 'CRITICAL':
    case 'INACTIVE':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: status.replace(/_/g, ' ')
      };
    case 'CONFIRMED':
    case 'DRAFT':
    case 'PLANNED':
    case 'INFO':
    default:
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        label: (status || 'UNKNOWN').replace(/_/g, ' ')
      };
  }
};
