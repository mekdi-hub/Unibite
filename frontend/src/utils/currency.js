/**
 * Format amount with currency from settings
 */
export const formatCurrency = (amount, currency = 'ETB') => {
  if (amount === null || amount === undefined) return `${currency} 0.00`;
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return `${currency} 0.00`;
  
  return `${currency} ${numAmount.toFixed(2)}`;
};

/**
 * Format amount with Birr symbol (legacy support)
 */
export const formatBirr = (amount) => {
  if (amount === null || amount === undefined) return '0.00 Br';
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return '0.00 Br';
  
  return `${numAmount.toFixed(2)} Br`;
};

/**
 * Get currency symbol based on currency code
 */
export const getCurrencySymbol = (currency = 'ETB') => {
  const symbols = {
    'ETB': 'ETB',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  return symbols[currency] || currency;
};

/**
 * Get currency code from settings or default
 */
export const getCurrencyCode = (settings) => {
  return settings?.currency || 'ETB';
};

