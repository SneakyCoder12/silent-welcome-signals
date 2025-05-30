
// Financial data API service
// Using CoinMarketCap, Twelve Data, Frankfurter, and Alpha Vantage APIs

const CMC_API_KEY = '478085d0-7f9b-44bb-9b5e-f88abf9f5a3a';
const TWELVE_DATA_API_KEY = '6b49010b45c74440923790d98203c9e5';
const ALPHA_VANTAGE_API_KEY = 'RGHLGIFYBZMTCTFF';

// Get stock quote data using Twelve Data
export async function fetchStockData(symbol) {
  try {
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    if (data.price) {
      return {
        symbol: data.symbol,
        name: data.name,
        price: parseFloat(data.price),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        volume: parseInt(data.volume) || 0,
        lastUpdated: data.datetime
      };
    } else {
      throw new Error('No stock data found');
    }
  } catch (error) {
    console.error('Failed to get stock data for', symbol, ':', error);
    throw error;
  }
}

// Get multiple stocks data using Twelve Data batch request
export async function fetchMultipleStocks(symbols) {
  try {
    const symbolString = symbols.join(',');
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbolString}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    const results = [];
    
    // Handle both single and multiple symbols response
    if (symbols.length === 1) {
      if (data.price) {
        results.push({
          symbol: data.symbol,
          name: data.name,
          price: parseFloat(data.price),
          change: parseFloat(data.change),
          changePercent: parseFloat(data.percent_change),
          volume: parseInt(data.volume) || 0,
          lastUpdated: data.datetime
        });
      }
    } else {
      symbols.forEach(symbol => {
        if (data[symbol] && data[symbol].price) {
          const stock = data[symbol];
          results.push({
            symbol: stock.symbol,
            name: stock.name,
            price: parseFloat(stock.price),
            change: parseFloat(stock.change),
            changePercent: parseFloat(stock.percent_change),
            volume: parseInt(stock.volume) || 0,
            lastUpdated: stock.datetime
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Failed to get multiple stocks data:', error);
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

// Get major market indices using Twelve Data
export async function getMarketIndices() {
  const indices = ['SPY', 'QQQ', 'DIA', 'IWM'];
  try {
    return await fetchMultipleStocks(indices);
  } catch (error) {
    console.error('Market indices fetch failed:', error);
    throw error;
  }
}

// Get major tech stocks using Twelve Data
export async function getMajorStocks() {
  const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  try {
    return await fetchMultipleStocks(stocks);
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

// Get global market stats using CoinMarketCap
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

// Search for stock symbols using Twelve Data
export async function searchSymbol(keywords) {
  try {
    const response = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${keywords}&apikey=${TWELVE_DATA_API_KEY}`);
    const data = await response.json();
    
    if (data.data) {
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

// Simple news API function (using NewsAPI or similar free service)
export async function fetchFinancialNews(query, limit = 10) {
  // For demo purposes, return some financial news
  // In production, you'd use a real news API
  const mockNews = [
    {
      title: "Markets Rally on Economic Data",
      description: "Stock markets surged today following positive economic indicators and corporate earnings reports.",
      url: "https://example.com/news1",
      urlToImage: "https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "Financial Times" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Crypto Market Update",
      description: "Bitcoin and major altcoins show strong performance amid institutional adoption.",
      url: "https://example.com/news2", 
      urlToImage: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&h=350",
      source: { name: "CoinDesk" },
      publishedAt: new Date().toISOString()
    }
  ];
  
  return mockNews.slice(0, limit);
}
