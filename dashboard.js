
// Dashboard JavaScript - Handles all dashboard functionality with real API data
// Uses CoinMarketCap for crypto, Twelve Data for stocks, and proper error handling

import { 
  getMarketIndices,
  getMajorStocks,
  getMajorCrypto,
  getGlobalMarketStats
} from './api.js';

// Wait for the page to fully load before initializing dashboard
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Dashboard loading started...');
  
  // Initialize all dashboard sections
  await initializeMarketOverview();
  await initializeWatchlist();
  await initializeCryptoTracker();
  await initializeGlobalStats();
  updateDateTime();
  
  // Set up refresh button functionality
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async function() {
      console.log('User clicked refresh button');
      this.classList.add('animate-spin');
      await refreshDashboardData();
      setTimeout(() => {
        this.classList.remove('animate-spin');
        showToast('Dashboard data refreshed successfully!');
      }, 1000);
    });
  }
});

// Update the current date and time display every second
function updateDateTime() {
  const dateTimeElement = document.getElementById('current-datetime');
  if (dateTimeElement) {
    const updateTime = () => {
      const now = new Date();
      dateTimeElement.textContent = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };
    
    updateTime(); // Update immediately
    setInterval(updateTime, 1000); // Then update every second
  }
}

// Load and display market indices (SPY, QQQ, DIA, IWM)
async function initializeMarketOverview() {
  const marketOverviewElement = document.getElementById('market-overview');
  if (!marketOverviewElement) {
    console.log('Market overview element not found');
    return;
  }
  
  try {
    console.log('Loading market indices data...');
    marketOverviewElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading market data...</div>';
    
    // Fetch market indices data from Twelve Data API
    const marketIndices = await getMarketIndices();
    console.log('Market indices loaded:', marketIndices);
    
    if (!marketIndices || marketIndices.length === 0) {
      throw new Error('No market indices data received');
    }
    
    let marketOverviewHTML = '';
    marketIndices.forEach(index => {
      if (index && index.price) {
        // Determine if the stock is up or down for styling
        const changeClass = index.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = index.change >= 0 ? 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
        
        // Build HTML for each market index
        marketOverviewHTML += `
          <div class="glass glass-hover rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-gold-400">${index.symbol}</h3>
                <span class="text-sm text-gray-400">${index.name || index.symbol}</span>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold">${formatCurrency(index.price, 'USD')}</div>
                <div class="flex items-center ${changeClass}">
                  ${changeIcon}
                  <span class="ml-1">${index.change.toFixed(2)} (${index.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });
    
    marketOverviewElement.innerHTML = marketOverviewHTML;
    console.log('Market overview updated successfully');
  } catch (error) {
    console.error('Error initializing market overview:', error);
    marketOverviewElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load market data. Checking API connection...</div>';
  }
}

// Load and display major tech stocks watchlist
async function initializeWatchlist() {
  const watchlistElement = document.getElementById('watchlist');
  if (!watchlistElement) {
    console.log('Watchlist element not found');
    return;
  }
  
  try {
    console.log('Loading major stocks data...');
    watchlistElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading stock data...</div>';
    
    // Fetch major stocks from Twelve Data API
    const stocks = await getMajorStocks();
    console.log('Stocks loaded:', stocks);
    
    if (!stocks || stocks.length === 0) {
      throw new Error('No stocks data received');
    }
    
    let watchlistHTML = '';
    stocks.forEach(stock => {
      if (stock && stock.price) {
        // Determine styling based on price movement
        const changeClass = stock.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = stock.change >= 0 ? 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
        
        // Build HTML for each stock
        watchlistHTML += `
          <div class="glass glass-hover rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-gold-400">${stock.symbol}</h3>
                <span class="text-sm text-gray-400">${stock.name}</span>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold">${formatCurrency(stock.price, 'USD')}</div>
                <div class="flex items-center ${changeClass}">
                  ${changeIcon}
                  <span class="ml-1">${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });
    
    watchlistElement.innerHTML = watchlistHTML;
    console.log('Watchlist updated successfully');
  } catch (error) {
    console.error('Error initializing watchlist:', error);
    watchlistElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load stock data. Checking API connection...</div>';
  }
}

// Load and display cryptocurrency data using CoinMarketCap API
async function initializeCryptoTracker() {
  const cryptoTrackerElement = document.getElementById('crypto-tracker');
  if (!cryptoTrackerElement) {
    console.log('Crypto tracker element not found');
    return;
  }
  
  try {
    console.log('Loading cryptocurrency data from CoinMarketCap...');
    cryptoTrackerElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading crypto data...</div>';
    
    // Fetch top cryptocurrencies from CoinMarketCap API
    const cryptos = await getMajorCrypto();
    console.log('Cryptocurrencies loaded:', cryptos);
    
    if (!cryptos || cryptos.length === 0) {
      throw new Error('No cryptocurrency data received');
    }
    
    let cryptoHTML = '';
    cryptos.forEach(crypto => {
      if (crypto && crypto.price) {
        // Determine styling based on 24h price change
        const changeClass = crypto.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = crypto.change >= 0 ? '▲' : '▼';
        
        // Build HTML for each cryptocurrency
        cryptoHTML += `
          <div class="glass glass-hover rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold text-gold-400">${crypto.symbol}</h3>
                <span class="text-sm text-gray-400">${crypto.name}</span>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold">${formatCurrency(crypto.price, 'USD')}</div>
                <div class="flex items-center ${changeClass}">
                  <span>${changeIcon} ${crypto.change.toFixed(2)}%</span>
                </div>
                <div class="text-sm text-gray-400">Vol: ${formatVolume(crypto.volume)}</div>
              </div>
            </div>
          </div>
        `;
      }
    });
    
    cryptoTrackerElement.innerHTML = cryptoHTML;
    console.log('Crypto tracker updated successfully');
  } catch (error) {
    console.error('Error initializing crypto tracker:', error);
    cryptoTrackerElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load crypto data. Checking CoinMarketCap API...</div>';
  }
}

// Load and display global cryptocurrency market statistics
async function initializeGlobalStats() {
  const globalStatsElement = document.getElementById('global-stats');
  if (!globalStatsElement) {
    console.log('Global stats element not found');
    return;
  }
  
  try {
    console.log('Loading global market statistics...');
    
    // Fetch global market data from CoinMarketCap
    const stats = await getGlobalMarketStats();
    console.log('Global stats loaded:', stats);
    
    if (!stats) {
      throw new Error('No global stats data received');
    }
    
    // Build HTML for global market statistics
    const globalStatsHTML = `
      <div class="glass rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gold-400 mb-4">Global Market Stats</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-400 text-sm">Total Market Cap</p>
            <p class="text-xl font-bold">${formatCurrency(stats.totalMarketCap, 'USD')}</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">24h Volume</p>
            <p class="text-xl font-bold">${formatVolume(stats.totalVolume)}</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">BTC Dominance</p>
            <p class="text-xl font-bold">${stats.btcDominance.toFixed(1)}%</p>
          </div>
          <div>
            <p class="text-gray-400 text-sm">Active Cryptos</p>
            <p class="text-xl font-bold">${stats.activeCryptocurrencies.toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
    
    globalStatsElement.innerHTML = globalStatsHTML;
    console.log('Global stats updated successfully');
  } catch (error) {
    console.error('Error loading global stats:', error);
    globalStatsElement.innerHTML = '<div class="text-red-500">Failed to load global market stats. Checking API connection...</div>';
  }
}

// Refresh all dashboard data when user clicks refresh button
async function refreshDashboardData() {
  try {
    console.log('Refreshing all dashboard data...');
    
    // Refresh all sections
    await initializeMarketOverview();
    await initializeWatchlist();
    await initializeCryptoTracker();
    await initializeGlobalStats();
    
    console.log('Dashboard refresh completed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    showToast('Failed to refresh dashboard data. Please try again.', 'error');
    return false;
  }
}

// Format numbers as currency (e.g., $1,234.56)
function formatCurrency(amount, currency = 'USD') {
  if (!amount || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format large numbers with K, M, B, T suffixes for volume display
function formatVolume(volume) {
  if (!volume || isNaN(volume)) return '$0';
  
  if (volume >= 1e12) {
    return '$' + (volume / 1e12).toFixed(1) + 'T'; // Trillions
  } else if (volume >= 1e9) {
    return '$' + (volume / 1e9).toFixed(1) + 'B'; // Billions
  } else if (volume >= 1e6) {
    return '$' + (volume / 1e6).toFixed(1) + 'M'; // Millions
  } else if (volume >= 1e3) {
    return '$' + (volume / 1e3).toFixed(1) + 'K'; // Thousands
  } else {
    return '$' + volume.toFixed(0);
  }
}

// Show toast notification to user (success or error messages)
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Style toast based on message type
    if (type === 'error') {
      toast.style.borderColor = 'rgba(239, 68, 68, 0.3)'; // Red border for errors
      toast.style.color = '#ef4444'; // Red text for errors
    } else {
      toast.style.borderColor = 'rgba(245, 158, 11, 0.3)'; // Gold border for success
      toast.style.color = '#f59e0b'; // Gold text for success
    }
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}
