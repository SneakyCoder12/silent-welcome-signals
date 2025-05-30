import { 
  getMarketIndices,
  getMajorStocks,
  getMajorCrypto,
  getGlobalMarketStats
} from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
  await initializeMarketOverview();
  await initializeWatchlist();
  await initializeCryptoTracker();
  await initializeGlobalStats();
  updateDateTime();
  
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async function() {
      this.classList.add('animate-spin');
      await refreshDashboardData();
      setTimeout(() => {
        this.classList.remove('animate-spin');
        showToast('Dashboard data refreshed successfully!');
      }, 1000);
    });
  }
});

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
    
    updateTime();
    setInterval(updateTime, 1000);
  }
}

async function initializeMarketOverview() {
  const marketOverviewElement = document.getElementById('market-overview');
  if (!marketOverviewElement) return;
  
  try {
    marketOverviewElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading market data...</div>';
    
    const marketIndices = await getMarketIndices();
    
    let marketOverviewHTML = '';
    marketIndices.forEach(index => {
      if (index) {
        const changeClass = index.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = index.change >= 0 ? 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
        
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
  } catch (error) {
    console.error('Error initializing market overview:', error);
    marketOverviewElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load market data. Please check your API connection.</div>';
  }
}

async function initializeWatchlist() {
  const watchlistElement = document.getElementById('watchlist');
  if (!watchlistElement) return;
  
  try {
    watchlistElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading stock data...</div>';
    
    const stocks = await getMajorStocks();
    
    let watchlistHTML = '';
    stocks.forEach(stock => {
      if (stock) {
        const changeClass = stock.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = stock.change >= 0 ? 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>' : 
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
        
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
  } catch (error) {
    console.error('Error initializing watchlist:', error);
    watchlistElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load stock data. Please check your API connection.</div>';
  }
}

async function initializeCryptoTracker() {
  const cryptoTrackerElement = document.getElementById('crypto-tracker');
  if (!cryptoTrackerElement) return;
  
  try {
    cryptoTrackerElement.innerHTML = '<div class="col-span-full text-center text-gold-400">Loading crypto data...</div>';
    
    const cryptos = await getMajorCrypto();
    
    let cryptoHTML = '';
    cryptos.forEach(crypto => {
      if (crypto) {
        const changeClass = crypto.change >= 0 ? 'text-neon-green' : 'text-red-500';
        const changeIcon = crypto.change >= 0 ? '▲' : '▼';
        
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
  } catch (error) {
    console.error('Error initializing crypto tracker:', error);
    cryptoTrackerElement.innerHTML = '<div class="col-span-full text-center text-red-500">Failed to load crypto data. Please check your API connection.</div>';
  }
}

async function initializeGlobalStats() {
  const globalStatsElement = document.getElementById('global-stats');
  if (!globalStatsElement) return;
  
  try {
    const stats = await getGlobalMarketStats();
    
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
  } catch (error) {
    console.error('Error loading global stats:', error);
    globalStatsElement.innerHTML = '<div class="text-red-500">Failed to load global market stats</div>';
  }
}

async function refreshDashboardData() {
  try {
    await initializeMarketOverview();
    await initializeWatchlist();
    await initializeCryptoTracker();
    await initializeGlobalStats();
    return true;
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
    showToast('Failed to refresh dashboard data. Please try again.', 'error');
    return false;
  }
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatVolume(volume) {
  if (volume >= 1e12) {
    return '$' + (volume / 1e12).toFixed(1) + 'T';
  } else if (volume >= 1e9) {
    return '$' + (volume / 1e9).toFixed(1) + 'B';
  } else if (volume >= 1e6) {
    return '$' + (volume / 1e6).toFixed(1) + 'M';
  } else if (volume >= 1e3) {
    return '$' + (volume / 1e3).toFixed(1) + 'K';
  } else {
    return '$' + volume.toFixed(0);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    if (type === 'error') {
      toast.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      toast.style.color = '#ef4444';
    } else {
      toast.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      toast.style.color = '#f59e0b';
    }
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}
