
// Financial data API service
// Using CoinMarketCap, Twelve Data, Frankfurter, and Alpha Vantage APIs

// API Keys - Replace these with your actual API keys
const CMC_API_KEY = '478085d0-7f9b-44bb-9b5e-f88abf9f5a3a'; // CoinMarketCap API key
const TWELVE_DATA_API_KEY = '6b49010b45c74440923790d98203c9e5'; // Twelve Data API key  
const ALPHA_VANTAGE_API_KEY = 'RGHLGIFYBZMTCTFF'; // Alpha Vantage API key

// Get stock quote data using Twelve Data API
export async function fetchStockData(symbol) {
  try {
    console.log(`Fetching stock data for: ${symbol}`);
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    console.log(`Stock data response for ${symbol}:`, data);
    
    // Check if we have valid stock data
    if (data.price) {
      return {
        symbol: data.symbol,
        name: data.name,
        price: parseFloat(data.price),
        change: parseFloat(data.change) || 0,
        changePercent: parseFloat(data.percent_change) || 0,
        volume: parseInt(data.volume) || 0,
        lastUpdated: data.datetime
      };
    } else {
      throw new Error(`No stock data found for ${symbol}`);
    }
  } catch (error) {
    console.error('Failed to get stock data for', symbol, ':', error);
    throw error;
  }
}

// Get multiple stocks data using Twelve Data batch request
export async function fetchMultipleStocks(symbols) {
  try {
    console.log('Fetching multiple stocks:', symbols);
    const symbolString = symbols.join(',');
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbolString}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    console.log('Multiple stocks response:', data);
    
    const results = [];
    
    // Handle both single and multiple symbols response
    if (symbols.length === 1) {
      // Single symbol response
      if (data.price) {
        results.push({
          symbol: data.symbol,
          name: data.name,
          price: parseFloat(data.price),
          change: parseFloat(data.change) || 0,
          changePercent: parseFloat(data.percent_change) || 0,
          volume: parseInt(data.volume) || 0,
          lastUpdated: data.datetime
        });
      }
    } else {
      // Multiple symbols response
      symbols.forEach(symbol => {
        if (data[symbol] && data[symbol].price) {
          const stock = data[symbol];
          results.push({
            symbol: stock.symbol,
            name: stock.name,
            price: parseFloat(stock.price),
            change: parseFloat(stock.change) || 0,
            changePercent: parseFloat(stock.percent_change) || 0,
            volume: parseInt(stock.volume) || 0,
            lastUpdated: stock.datetime
          });
        }
      });
    }
    
    console.log('Processed stock results:', results);
    return results;
  } catch (error) {
    console.error('Failed to get multiple stocks data:', error);
    throw error;
  }
}

// Get currency exchange rate using Frankfurter API (public, no key required)
export async function fetchExchangeRate(fromCurrency, toCurrency) {
  try {
    console.log(`Converting ${fromCurrency} to ${toCurrency}`);
    const response = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);
    const data = await response.json();
    
    console.log('Exchange rate response:', data);
    
    // Check if we have valid exchange rate data
    if (data.rates && data.rates[toCurrency]) {
      return {
        rate: data.rates[toCurrency],
        lastRefreshed: data.date,
        fromCurrencyCode: fromCurrency,
        toCurrencyCode: toCurrency
      };
    } else {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
  } catch (error) {
    console.error('Currency API error:', error);
    throw error;
  }
}

// Get cryptocurrency data from CoinMarketCap API
export async function fetchCryptoData(symbol) {
  try {
    console.log(`Fetching crypto data for: ${symbol}`);
    const response = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    console.log(`Crypto data response for ${symbol}:`, data);
    
    // Check if we have valid crypto data
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
      throw new Error(`Crypto data not available for ${symbol}`);
    }
  } catch (error) {
    console.error('Crypto API failed:', error);
    throw error;
  }
}

// Get stock time series data using Twelve Data API for charts
export async function fetchStockTimeSeries(symbol, interval = '1day', outputsize = 30) {
  try {
    console.log(`Fetching time series for ${symbol}, interval: ${interval}, size: ${outputsize}`);
    const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    console.log(`Time series response for ${symbol}:`, data);
    
    // Check if we have valid time series data
    if (data.values && Array.isArray(data.values)) {
      return {
        symbol: data.meta.symbol,
        values: data.values.map(item => ({
          date: item.datetime,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseInt(item.volume) || 0
        }))
      };
    } else {
      throw new Error(`No time series data found for ${symbol}`);
    }
  } catch (error) {
    console.error('Failed to get time series data for', symbol, ':', error);
    throw error;
  }
}

// Get major market indices (ETFs that track major indices)
export async function getMarketIndices() {
  const indices = ['SPY', 'QQQ', 'DIA', 'IWM']; // S&P 500, NASDAQ, Dow, Russell 2000
  try {
    console.log('Fetching market indices...');
    return await fetchMultipleStocks(indices);
  } catch (error) {
    console.error('Market indices fetch failed:', error);
    throw error;
  }
}

// Get major tech and popular stocks
export async function getMajorStocks() {
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  try {
    console.log('Fetching major stocks...');
    return await fetchMultipleStocks(stocks);
  } catch (error) {
    console.error('Major stocks fetch failed:', error);
    throw error;
  }
}

// Get top cryptocurrencies using CoinMarketCap API
export async function getMajorCrypto() {
  try {
    console.log('Fetching top cryptocurrencies from CoinMarketCap...');
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=10&convert=USD', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    console.log('CoinMarketCap response:', data);
    
    // Check if we have valid cryptocurrency listings
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(crypto => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.quote.USD.price,
        volume: crypto.quote.USD.volume_24h,
        change: crypto.quote.USD.percent_change_24h,
        lastRefreshed: crypto.last_updated
      }));
    } else {
      throw new Error('Crypto data not available from CoinMarketCap');
    }
  } catch (error) {
    console.error('Crypto data fetch failed:', error);
    throw error;
  }
}

// Get global cryptocurrency market statistics from CoinMarketCap
export async function getGlobalMarketStats() {
  try {
    console.log('Fetching global market statistics...');
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    
    console.log('Global market stats response:', data);
    
    // Check if we have valid global market data
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

// Search for stock symbols using Twelve Data
export async function searchSymbol(keywords) {
  try {
    console.log(`Searching for symbol: ${keywords}`);
    const response = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${keywords}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    console.log('Symbol search response:', data);
    
    // Check if we have valid search results
    if (data.data && Array.isArray(data.data)) {
      return data.data.map(match => ({
        symbol: match.symbol,
        name: match.instrument_name,
        type: match.instrument_type,
        exchange: match.exchange,
        currency: match.currency,
        country: match.country
      }));
    } else {
      throw new Error('Symbol search failed');
    }
  } catch (error) {
    console.error('Symbol search error:', error);
    throw error;
  }
}

// Get financial news (using mock data for now since you wanted real APIs focused on market data)
export async function fetchFinancialNews(query, limit = 10) {
  // Mock news data - in production you'd use a real news API
  console.log('Fetching financial news...');
  const mockNews = [
    {
      title: "Markets Rally on Strong Economic Data",
      description: "Stock markets surged today following positive economic indicators and better-than-expected corporate earnings reports.",
      url: "https://example.com/news1",
      urlToImage: "https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "Financial Times" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Cryptocurrency Market Update",
      description: "Bitcoin and major altcoins show strong performance amid growing institutional adoption and regulatory clarity.",
      url: "https://example.com/news2", 
      urlToImage: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "CoinDesk" },
      publishedAt: new Date().toISOString()
    }
  ];
  
  return mockNews.slice(0, limit);
}
