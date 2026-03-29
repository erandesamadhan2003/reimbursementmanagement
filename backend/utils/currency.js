// utils/currency.js
// Fetches live exchange rates from exchangerate-api.com
// Caches rates per base currency for 1 hour to avoid hammering the API

const cache = new Map();
let cacheTime = 0;

/**
 * Convert an amount from one currency to another.
 * @param {number} amount
 * @param {string} fromCurrency - ISO 4217 e.g. 'USD'
 * @param {string} toCurrency - ISO 4217 e.g. 'INR'
 * @returns {Promise<number>}
 */
export async function convertAmount(amount, fromCurrency, toCurrency) {
  if (!fromCurrency || !toCurrency) return amount;
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) return amount;

  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  // Refresh cache every hour or if base currency not cached
  if (Date.now() - cacheTime > 3_600_000 || !cache.has(from)) {
    try {
      const res = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`
      );
      if (!res.ok) throw new Error(`ExchangeRate API error: ${res.status}`);
      const data = await res.json();
      cache.set(from, data.rates);
      cacheTime = Date.now();
    } catch (err) {
      console.error('Currency conversion fetch failed:', err.message);
      // Fall back: return original amount if API is down
      return amount;
    }
  }

  const rates = cache.get(from);
  if (!rates || !rates[to]) {
    console.warn(`No rate found for ${from} -> ${to}`);
    return amount;
  }

  return parseFloat((amount * rates[to]).toFixed(2));
}

/**
 * Fetch currency code for a country name using restcountries API.
 * @param {string} countryName
 * @returns {Promise<string>} ISO 4217 currency code or 'USD' fallback
 */
export async function getCurrencyForCountry(countryName) {
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,currencies`
    );
    if (!res.ok) throw new Error('restcountries API error');
    const data = await res.json();
    if (!data || !data[0]?.currencies) return 'USD';
    const currencyCode = Object.keys(data[0].currencies)[0];
    return currencyCode || 'USD';
  } catch (err) {
    console.error('getCurrencyForCountry failed:', err.message);
    return 'USD';
  }
}