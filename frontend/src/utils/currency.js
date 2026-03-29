/**
 * Formats a given amount into a localized currency string.
 * @param {number|string} amount - The numeric amount to format
 * @param {string} currencyCode - The ISO 4217 currency code (e.g. "USD", "INR", "EUR")
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, currencyCode = "USD") => {
  const numericAmount = parseFloat(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(numericAmount);
  } catch (e) {
    // Basic fallback if Intl.NumberFormat fails (e.g., invalid currency code)
    return `${currencyCode} ${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }
};
