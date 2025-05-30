
// Financial data API service
// Using CoinMarketCap for crypto data, Frankfurter for currency, and Alpha Vantage for stocks

const CMC_API_KEY = '478085d0-7f9b-44bb-9b5e-f88abf9f5a3a';
const ALPHA_VANTAGE_API_KEY = 'RGHLGIFYBZMTCTFF';

// Get stock quote data
export async function fetchStockData(symbol) {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day']
      };
    } else {
      throw new Error('No stock data found');
    }
  } catch (error) {
    console.error('Failed to get stock data for', symbol, ':', error);
    throw error;
  }
}

// Get currency exchange rate using Frankfurter API
export async function fetchExchangeRate(fromCurrency, toCurrency) {
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);
    const data = await response.json();
    
    if (data.rates && data.rates[toCurrency]) {
      return {
        rate: data.rates[toCurrency],
        lastRefreshed: data.date,
        fromCurrencyCode: fromCurrency,
        toCurrencyCode: toCurrency
      };
    } else {
      throw new Error('Exchange rate not found');
    }
  } catch (error) {
    console.error('Currency API error:', error);
    throw error;
  }
}

// Get crypto data from CoinMarketCap
export async function fetchCryptoData(symbol) {
  try {
    const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    if (data.data && data.data[symbol]) {
      const crypto = data.data[symbol];
      return {
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.quote.USD.price,
        volume: crypto.quote.USD.volume_24h,
        change: crypto.quote.USD.percent_change_24h,
        lastRefreshed: crypto.last_updated
      };
    } else {
      throw new Error('Crypto data not available');
    }
  } catch (error) {
    console.error('Crypto API failed:', error);
    throw error;
  }
}

// Get historical price data for charts
export async function fetchStockTimeSeries(symbol, interval = 'daily') {
  let timeSeriesFunction;
  
  switch (interval) {
    case 'intraday':
      timeSeriesFunction = 'TIME_SERIES_INTRADAY';
      break;
    case 'daily':
      timeSeriesFunction = 'TIME_SERIES_DAILY';
      break;
    case 'weekly':
      timeSeriesFunction = 'TIME_SERIES_WEEKLY';
      break;
    case 'monthly':
      timeSeriesFunction = 'TIME_SERIES_MONTHLY';
      break;
    default:
      timeSeriesFunction = 'TIME_SERIES_DAILY';
  }
  
  try {
    const url = `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${symbol}&outputsize=compact${interval === 'intraday' ? '&interval=5min' : ''}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
    
    if (data[timeSeriesKey]) {
      const timeSeriesData = data[timeSeriesKey];
      return Object.entries(timeSeriesData).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      throw new Error('No time series data available');
    }
  } catch (error) {
    console.error('Time series API error:', error);
    throw error;
  }
}

// Search for stock symbols
export async function searchSymbol(keywords) {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();
    
    if (data.bestMatches) {
      return data.bestMatches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency'],
        matchScore: match['9. matchScore']
      }));
    } else {
      throw new Error('Symbol search failed');
    }
  } catch (error) {
    console.error('Symbol search error:', error);
    throw error;
  }
}

// Get major market indices (S&P 500, Dow, etc.)
export async function getMarketIndices() {
  const indices = ['SPY', 'DIA', 'QQQ', 'IWM'];
  const promises = indices.map(symbol => fetchStockData(symbol));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Market indices fetch failed:', error);
    throw error;
  }
}

// Get major tech stocks
export async function getMajorStocks() {
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  const promises = stocks.map(symbol => fetchStockData(symbol));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Major stocks fetch failed:', error);
    throw error;
  }
}

// Get popular cryptocurrencies using CoinMarketCap
export async function getMajorCrypto() {
  try {
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=10&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    if (data.data) {
      return data.data.map(crypto => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.quote.USD.price,
        volume: crypto.quote.USD.volume_24h,
        change: crypto.quote.USD.percent_change_24h,
        lastRefreshed: crypto.last_updated
      }));
    } else {
      throw new Error('Crypto data not available');
    }
  } catch (error) {
    console.error('Crypto data fetch failed:', error);
    throw error;
  }
}

// Get top gainers/losers using CoinMarketCap
export async function getTopGainers() {
  try {
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/gainers-losers?start=1&limit=10&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    if (data.data) {
      return data.data;
    } else {
      throw new Error('Top gainers data not available');
    }
  } catch (error) {
    console.error('Top gainers fetch failed:', error);
    throw error;
  }
}

// Get global market stats
export async function getGlobalMarketStats() {
  try {
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    if (data.data) {
      return {
        totalMarketCap: data.data.quote.USD.total_market_cap,
        totalVolume: data.data.quote.USD.total_volume_24h,
        btcDominance: data.data.btc_dominance,
        activeCryptocurrencies: data.data.active_cryptocurrencies,
        activeExchanges: data.data.active_exchanges
      };
    } else {
      throw new Error('Global market data not available');
    }
  } catch (error) {
    console.error('Global market data fetch failed:', error);
    throw error;
  }
}
