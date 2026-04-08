export const formatCurrency = (amount: number, symbol = '₹'): string => {
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatShortDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export const getMonthYear = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getCurrentMonthKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthKey = (date: string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};