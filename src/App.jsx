import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Search, Info, RefreshCw } from 'lucide-react';

const SUPPORTED_CHAINS = [
  { name: 'Ethereum', id: 'eth-mainnet', icon: '⟠' },
  { name: 'Polygon', id: 'matic-mainnet', icon: '⬡' },
  { name: 'BSC', id: 'bsc-mainnet', icon: '◆' },
  { name: 'Arbitrum', id: 'arbitrum-mainnet', icon: '◉' },
  { name: 'Optimism', id: 'optimism-mainnet', icon: '◎' },
  { name: 'Base', id: 'base-mainnet', icon: '◈' },
  { name: 'Avalanche', id: 'avalanche-mainnet', icon: '▲' },
];

const MOCK_YIELD_OPPORTUNITIES = [
  { id: 1, protocol: 'Aave', chain: 'eth-mainnet', chainName: 'Ethereum', pool: 'USDC', apy: 4.25, tvl: 1250000000, risk: 'low', type: 'Lending', icon: '🏦' },
  { id: 2, protocol: 'Uniswap V3', chain: 'eth-mainnet', chainName: 'Ethereum', pool: 'ETH/USDC', apy: 12.8, tvl: 850000000, risk: 'medium', type: 'Liquidity Pool', icon: '🦄' },
  { id: 3, protocol: 'Curve', chain: 'eth-mainnet', chainName: 'Ethereum', pool: '3pool', apy: 3.5, tvl: 2100000000, risk: 'low', type: 'Stableswap', icon: '🌊' },
  { id: 4, protocol: 'PancakeSwap', chain: 'bsc-mainnet', chainName: 'BSC', pool: 'CAKE/BNB', apy: 45.2, tvl: 125000000, risk: 'high', type: 'Liquidity Pool', icon: '🥞' },
  { id: 5, protocol: 'QuickSwap', chain: 'matic-mainnet', chainName: 'Polygon', pool: 'MATIC/USDC', apy: 18.5, tvl: 95000000, risk: 'medium', type: 'Liquidity Pool', icon: '⚡' },
  { id: 6, protocol: 'Compound', chain: 'eth-mainnet', chainName: 'Ethereum', pool: 'DAI', apy: 3.8, tvl: 980000000, risk: 'low', type: 'Lending', icon: '🏛️' },
  { id: 7, protocol: 'GMX', chain: 'arbitrum-mainnet', chainName: 'Arbitrum', pool: 'GLP', apy: 28.5, tvl: 450000000, risk: 'medium', type: 'Perpetuals', icon: '📊' },
  { id: 8, protocol: 'Velodrome', chain: 'optimism-mainnet', chainName: 'Optimism', pool: 'OP/USDC', apy: 35.2, tvl: 78000000, risk: 'medium', type: 'Liquidity Pool', icon: '🚴' },
  { id: 9, protocol: 'Aerodrome', chain: 'base-mainnet', chainName: 'Base', pool: 'ETH/USDC', apy: 42.8, tvl: 156000000, risk: 'medium', type: 'Liquidity Pool', icon: '✈️' },
  { id: 10, protocol: 'Trader Joe', chain: 'avalanche-mainnet', chainName: 'Avalanche', pool: 'AVAX/USDC', apy: 22.4, tvl: 210000000, risk: 'medium', type: 'Liquidity Pool', icon: '☕' },
  { id: 11, protocol: 'Balancer', chain: 'eth-mainnet', chainName: 'Ethereum', pool: 'wstETH/WETH', apy: 8.9, tvl: 520000000, risk: 'low', type: 'Liquidity Pool', icon: '⚖️' },
  { id: 12, protocol: 'Stargate', chain: 'arbitrum-mainnet', chainName: 'Arbitrum', pool: 'USDC', apy: 6.2, tvl: 340000000, risk: 'low', type: 'Bridge Liquidity', icon: '🌉' },
];

const REFRESH_INTERVALS = [
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
  { label: '10m', value: 600000 },
];

function App() {
  const [yields, setYields] = useState([]);
  const [filteredYields, setFilteredYields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChains, setSelectedChains] = useState([]);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60000);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadYieldData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedYields = MOCK_YIELD_OPPORTUNITIES.map(y => ({
        ...y,
        apy: y.apy + (Math.random() - 0.5) * 2,
        tvl: y.tvl * (1 + (Math.random() - 0.5) * 0.1),
      }));
      setYields(updatedYields);
      setFilteredYields(updatedYields);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load yield opportunities. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOLDRUSH_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      setApiKeySet(true);
    }
    loadYieldData();
  }, [loadYieldData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadYieldData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadYieldData]);

  useEffect(() => {
    if (!autoRefresh) {
      setCountdown(0);
      return;
    }
    setCountdown(refreshInterval / 1000);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return refreshInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, [autoRefresh, refreshInterval, lastUpdate]);

  useEffect(() => {
    filterYields();
  }, [searchTerm, selectedChains, yields]);

  const filterYields = () => {
    let filtered = yields;
    if (searchTerm) {
      filtered = filtered.filter(
        y =>
          y.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          y.pool.toLowerCase().includes(searchTerm.toLowerCase()) ||
          y.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedChains.length > 0) {
      filtered = filtered.filter(y => selectedChains.includes(y.chain));
    }
    setFilteredYields(filtered);
  };

  const toggleChain = (chainId) => {
    setSelectedChains(prev =>
      prev.includes(chainId)
        ? prev.filter(c => c !== chainId)
        : [...prev, chainId]
    );
  };

  const handleManualRefresh = () => {
    loadYieldData();
  };

  const formatCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const calculateStats = () => {
    const totalTVL = filteredYields.reduce((sum, y) => sum + y.tvl, 0);
    const avgAPY = filteredYields.length > 0
      ? filteredYields.reduce((sum, y) => sum + y.apy, 0) / filteredYields.length
      : 0;
    const highestAPY = filteredYields.length > 0
      ? Math.max(...filteredYields.map(y => y.apy))
      : 0;
    return { totalTVL, avgAPY, highestAPY };
  };

  const stats = calculateStats();
  return (
    <div className="container">
      <header className="header">
        <h1>🌐 Web3 Yield Aggregator</h1>
        <p>Discover the best yield farming opportunities across all blockchains</p>
      </header>

      {!apiKeySet && (
        <div className="error">
          <h3>⚠️ API Key Required</h3>
          <p>Please add your GoldRush API key to the .env file (VITE_GOLDRUSH_API_KEY)</p>
          <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Get your free API key at{' '}
            <a href="https://goldrush.dev/platform/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', textDecoration: 'underline' }}>
              goldrush.dev
            </a>
          </p>
        </div>
      )}

      <div className="refresh-controls">
        <div className="refresh-status">
          <div className="status-item">
            <span className="status-label">Last Update:</span>
            <span className="status-value">{formatTime(lastUpdate)}</span>
          </div>
          {autoRefresh && (
            <div className="status-item">
              <span className="status-label">Next refresh in:</span>
              <span className="status-value countdown">{countdown}s</span>
            </div>
          )}
        </div>

        <div className="refresh-actions">
          <button className={`refresh-toggle ${autoRefresh ? 'active' : ''}`} onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
          </button>

          <select className="refresh-interval-select" value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} disabled={!autoRefresh}>
            {REFRESH_INTERVALS.map(interval => (
              <option key={interval.value} value={interval.value}>{interval.label}</option>
            ))}
          </select>

          <button className={`manual-refresh-btn ${isRefreshing ? 'refreshing' : ''}`} onClick={handleManualRefresh} disabled={isRefreshing}>
            <RefreshCw size={18} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Value Locked</h3>
          <div className="value">{formatCurrency(stats.totalTVL)}</div>
          <div className="change positive">Across {filteredYields.length} pools</div>
        </div>
        <div className="stat-card">
          <h3>Average APY</h3>
          <div className="value">{stats.avgAPY.toFixed(2)}%</div>
          <div className="change">Weighted average</div>
        </div>
        <div className="stat-card">
          <h3>Highest APY</h3>
          <div className="value positive">{stats.highestAPY.toFixed(2)}%</div>
          <div className="change">Best opportunity</div>
        </div>
        <div className="stat-card">
          <h3>Supported Chains</h3>
          <div className="value">{SUPPORTED_CHAINS.length}</div>
          <div className="change">Major networks</div>
        </div>
      </div>

      <div className="search-section">
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} size={20} />
          <input type="text" className="search-input" placeholder="Search protocols, pools, or types..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '45px' }} />
        </div>

        <div className="chain-filters">
          {SUPPORTED_CHAINS.map(chain => (
            <button key={chain.id} className={`chain-filter-btn ${selectedChains.includes(chain.id) ? 'active' : ''}`} onClick={() => toggleChain(chain.id)}>
              {chain.icon} {chain.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading yield opportunities...</p>
        </div>
      ) : error ? (
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      ) : filteredYields.length === 0 ? (
        <div className="empty-state">
          <h3>No yield opportunities found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="yield-grid">
          {filteredYields.map(yieldOpp => (
            <div key={yieldOpp.id} className="yield-card">
              <div className="yield-card-header">
                <div className="protocol-info">
                  <div className="protocol-icon">{yieldOpp.icon}</div>
                  <div className="protocol-details">
                    <h3>{yieldOpp.protocol}</h3>
                    <div className="chain">
                      {SUPPORTED_CHAINS.find(c => c.id === yieldOpp.chain)?.icon} {yieldOpp.chainName}
                    </div>
                  </div>
                </div>
                <div className="apy-badge">{yieldOpp.apy.toFixed(2)}%</div>
              </div>

              <div className="yield-details">
                <div className="detail-item">
                  <label>Pool</label>
                  <div className="value">{yieldOpp.pool}</div>
                </div>
                <div className="detail-item">
                  <label>Type</label>
                  <div className="value">{yieldOpp.type}</div>
                </div>
                <div className="detail-item">
                  <label>TVL</label>
                  <div className="value">{formatCurrency(yieldOpp.tvl)}</div>
                </div>
                <div className="detail-item">
                  <label>Risk Level</label>
                  <div className="value">
                    <span className={`risk-badge risk-${yieldOpp.risk}`}>{yieldOpp.risk}</span>
                  </div>
                </div>
              </div>

              <div className="yield-actions">
                <button className="btn btn-primary">
                  <TrendingUp size={16} style={{ marginRight: '5px', display: 'inline' }} />
                  Deposit
                </button>
                <button className="btn btn-secondary">
                  <Info size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="footer">
        <p>Powered by GoldRush API • Data across 200+ blockchains</p>
        <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>Always DYOR (Do Your Own Research) before investing</p>
      </footer>
    </div>
  );
}

export default App;
