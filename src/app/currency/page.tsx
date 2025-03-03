'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Tooltip from '../components/Tooltip';

// Define currency types
type Currency = {
  id: string;
  name: string;
  icon: string;
  chaosEquivalent: number;
  divineEquivalent: number;
  buyPrice: number;
  sellPrice: number;
  buyPriceDivine: number;
  sellPriceDivine: number;
  listingCount: number;
  change: number;
};

// Define the API response type
type CurrencyApiResponse = {
  currencies: Currency[];
  timestamp: string;
  divinePrice: number;
  league: string;
  availableLeagues: string[];
  baseCurrency: string;
  baseCurrencies: {
    id: string;
    name: string;
    icon: string;
  }[];
  error?: string;
};

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'chaosEquivalent', direction: 'descending' });
  const [selectedLeague, setSelectedLeague] = useState('Phrecia');
  const [baseCurrency, setBaseCurrency] = useState('chaos');
  const [availableLeagues, setAvailableLeagues] = useState<string[]>([]);
  const [baseCurrencies, setBaseCurrencies] = useState<any[]>([]);
  const [timestamp, setTimestamp] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [divinePrice, setDivinePrice] = useState(0);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');

  // Function to request sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Function to format currency values
  const formatCurrencyValue = (value: number) => {
    if (value >= 1000) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    } else if (value >= 1) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
    } else if (value >= 0.01) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    } else {
      return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
  };

  // Fetch currency data
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        setError(null);
        const startTime = Date.now();

        const response = await fetch(`/api/currency?league=${selectedLeague}&baseCurrency=${baseCurrency}`);
        const data: CurrencyApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch currency data');
        }

        setCurrencies(data.currencies);
        setAvailableLeagues(data.availableLeagues);
        setBaseCurrencies(data.baseCurrencies);
        setTimestamp(data.timestamp);
        setDivinePrice(data.divinePrice || 0);
        setLoading(false);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        setError('Failed to fetch currency data. Please try again later.');
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [selectedLeague, baseCurrency]);

  // Filter currencies based on search term
  const filteredCurrencies = currencies.filter((currency) =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort currencies based on the current sort configuration
  const sortedCurrencies = [...filteredCurrencies].sort((a, b) => {
    if (sortConfig.key === 'chaosEquivalent') {
      // For value sorting, use the appropriate price based on mode
      const aValue = mode === 'buy' 
        ? (baseCurrency === 'chaos' ? a.buyPrice : a.buyPriceDivine)
        : (baseCurrency === 'chaos' ? a.sellPrice : a.sellPriceDivine);
      
      const bValue = mode === 'buy'
        ? (baseCurrency === 'chaos' ? b.buyPrice : b.buyPriceDivine)
        : (baseCurrency === 'chaos' ? b.sellPrice : b.sellPriceDivine);
      
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }
    
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    if (sortConfig.key === 'listingCount') {
      return sortConfig.direction === 'ascending'
        ? a.listingCount - b.listingCount
        : b.listingCount - a.listingCount;
    }
    
    if (sortConfig.key === 'change') {
      return sortConfig.direction === 'ascending'
        ? a.change - b.change
        : b.change - a.change;
    }
    
    return 0;
  });

  const generateTradeQuery = (currencyId: string, baseCurrencyId: string, mode: 'buy' | 'sell') => {
    // In buy mode, we want to buy the currency (we have base currency, want target currency)
    // In sell mode, we want to sell the currency (we have target currency, want base currency)
    
    // Convert currency IDs to the format expected by pathofexile.com/trade
    const convertCurrencyId = (id: string) => {
      // Map of our currency IDs to Path of Exile trade site IDs
      const currencyMap: Record<string, string> = {
        'chaos': 'chaos',
        'divine': 'divine',
        'mirror-of-kalandra': 'mirror',
        'exalted-orb': 'exalted',
        'ancient-orb': 'ancient',
        'awakened-sextant': 'awakened-sextant',
        'orb-of-annulment': 'annul',
        'orb-of-alchemy': 'alch',
        'orb-of-alteration': 'alt',
        'blessed-orb': 'blessed',
        'cartographers-chisel': 'chisel',
        'chromatic-orb': 'chrome',
        'gemcutters-prism': 'gcp',
        'jewellers-orb': 'jewellers',
        'orb-of-fusing': 'fusing',
        'orb-of-regret': 'regret',
        'orb-of-scouring': 'scour',
        'orb-of-transmutation': 'transmute',
        'vaal-orb': 'vaal',
        // Add more mappings as needed
      };
      
      // Try to find a direct mapping
      if (currencyMap[id]) {
        return currencyMap[id];
      }
      
      // If no direct mapping, try to clean up the ID
      // Remove common prefixes/suffixes and convert to lowercase
      const cleanId = id
        .replace(/-orb$/, '')
        .replace(/^orb-of-/, '')
        .replace(/-of-kalandra$/, '');
      
      return cleanId;
    };
    
    const have = convertCurrencyId(mode === 'buy' ? baseCurrencyId : currencyId);
    const want = convertCurrencyId(mode === 'buy' ? currencyId : baseCurrencyId);
    
    // Create the query object according to pathofexile.com/trade/exchange format
    const queryObj = {
      exchange: {
        status: {
          option: "online"
        },
        have: [have],
        want: [want]
      }
    };
    
    // Encode the query object as a JSON string and then URL encode it
    return encodeURIComponent(JSON.stringify(queryObj));
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#af6025]">Currency Exchange Rates</h1>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
            <div className="flex items-center">
              <label htmlFor="league-select" className="mr-2 text-white">League:</label>
              <select
                id="league-select"
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="bg-[#181818] text-white border border-[#3d3d3d] rounded px-3 py-1"
              >
                {availableLeagues.map((league) => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label htmlFor="base-currency-select" className="mr-2 text-white">Base Currency:</label>
              <select
                id="base-currency-select"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="bg-[#181818] text-white border border-[#3d3d3d] rounded px-3 py-1"
              >
                {baseCurrencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>{currency.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <div className="flex bg-[#181818] border border-[#3d3d3d] rounded overflow-hidden">
                <button
                  className={`px-4 py-1 ${mode === 'buy' ? 'bg-[#2a2a2a] text-[#af6025]' : 'text-gray-400 hover:bg-[#222222]'}`}
                  onClick={() => setMode('buy')}
                >
                  Buy
                </button>
                <button
                  className={`px-4 py-1 ${mode === 'sell' ? 'bg-[#2a2a2a] text-[#af6025]' : 'text-gray-400 hover:bg-[#222222]'}`}
                  onClick={() => setMode('sell')}
                >
                  Sell
                </button>
              </div>
            </div>
            {divinePrice > 0 && (
              <div className="flex items-center bg-[#222222] px-3 py-1 rounded border border-[#3d3d3d]">
                <div className="flex items-center">
                  <span className="text-gray-300 mr-1">1</span>
                  <div className="w-5 h-5 mr-1">
                    <img 
                      src="/currency-images/divine_orb.png"
                      alt="Divine Orb"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-gray-300 mx-1">=</span>
                  <span className="text-[#af6025] mr-1">{formatCurrencyValue(divinePrice)}</span>
                  <div className="w-5 h-5">
                    <img 
                      src="/currency-images/chaos_orb.png"
                      alt="Chaos Orb"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search currency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#181818] text-white border border-[#3d3d3d] rounded px-3 py-2 pl-10 w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-[#af6025] focus:border-[#af6025]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  onClick={() => setSearchTerm('')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-[#7f7f7f]">
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
        
        {divinePrice > 0 && baseCurrency === 'chaos' && (
          <div className="mb-4 text-sm text-gray-400">
            <span>1 Divine Orb = {formatCurrencyValue(divinePrice)} Chaos Orbs</span>
          </div>
        )}
        
        <div className="mb-6">
          <div className="bg-[#1a1a1a] rounded-lg shadow-lg border border-[#3d3d3d]">
            <div className="flex justify-between items-center p-4 border-b border-[#3d3d3d]">
              <div>
                <h2 className="text-xl font-semibold text-[#af6025]">Currency Values</h2>
                {lastUpdated && (
                  <p className="text-xs text-[#7f7f7f] mt-1">Last updated: {lastUpdated}</p>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by name..."
                  className="bg-[#181818] border border-[#3d3d3d] text-[#a38d6d] p-2 pl-8 rounded w-64 focus:outline-none focus:ring-1 focus:ring-[#af6025] focus:border-[#af6025]"
                  style={{ backgroundColor: '#181818' }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-4 w-4 text-[#7f7f7f]" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7f7f7f] hover:text-[#af6025]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#af6025] mb-4"></div>
                  <p className="text-[#7f7f7f]">Loading currency data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-[#ff6b6b]">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#3d3d3d]">
                  <thead className="bg-[#1f1f1f] text-[#af6025]">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          <span>Currency</span>
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('chaosEquivalent')}
                      >
                        <div className="flex items-center">
                          <span>{mode === 'buy' ? 'Buying Price' : 'Selling Price'}</span>
                          <div className="ml-1 w-4 h-4">
                            <img 
                              src={baseCurrency === 'chaos' ? '/currency-images/chaos_orb.png' : '/currency-images/divine_orb.png'} 
                              alt={baseCurrency === 'chaos' ? 'Chaos Orb' : 'Divine Orb'} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {sortConfig.key === 'chaosEquivalent' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('listingCount')}
                      >
                        <div className="flex items-center justify-end">
                          <span>Listings</span>
                          {sortConfig.key === 'listingCount' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('change')}
                      >
                        <div className="flex items-center justify-end">
                          <span>Change (24h)</span>
                          {sortConfig.key === 'change' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer"
                      >
                        <div className="flex items-center justify-end">
                          <span>Trade</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCurrencies.map((currency) => (
                      <tr key={currency.id} className="hover:bg-[#222222] border-b border-[#3d3d3d] last:border-b-0">
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 mr-3">
                              <Tooltip 
                                content={
                                  <div className="p-1">
                                    <div className="font-semibold text-[#af6025] mb-1">{currency.name}</div>
                                    <div className="text-sm text-gray-300">
                                      <a 
                                        href={`https://poedb.tw/us/${currency.name.replace(/\s+/g, '_')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="border-b border-dotted border-gray-400 hover:text-[#af6025] hover:border-[#af6025]"
                                        onClick={(e) => {
                                          // Only open the link if Ctrl key is pressed
                                          if (!e.ctrlKey) {
                                            e.preventDefault();
                                            alert('Hold Ctrl key and click to open poedb in a new tab');
                                          }
                                        }}
                                      >
                                        Hold Ctrl and click to view details
                                      </a>
                                      <div className="mt-1 text-xs text-gray-500">
                                        (Ctrl key keeps tooltip open)
                                      </div>
                                    </div>
                                  </div>
                                }
                              >
                                <img 
                                  src={`/currency-images/${currency.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.png`}
                                  alt={currency.name} 
                                  className="w-full h-full object-contain" 
                                  style={{ maxWidth: '32px', maxHeight: '32px' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    
                                    // If local image fails, try the icon from the API
                                    if (currency.icon) {
                                      target.src = currency.icon;
                                      
                                      // If that fails too, use the fallback
                                      target.onerror = () => {
                                        target.onerror = null;
                                        target.src = `/fallback-currency-icon.png`;
                                      };
                                    } else {
                                      target.src = `/fallback-currency-icon.png`;
                                    }
                                  }}
                                />
                              </Tooltip>
                            </div>
                            <span className="text-[#af6025] hover:text-[#d87c2b] transition-colors cursor-pointer">{currency.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end">
                            <span className="mr-1">
                              {formatCurrencyValue(
                                baseCurrency === 'chaos' 
                                  ? mode === 'buy' ? currency.buyPrice : currency.sellPrice
                                  : mode === 'buy' ? currency.buyPriceDivine : currency.sellPriceDivine
                              )}
                            </span>
                            <Tooltip 
                              content={
                                <div className="p-1">
                                  <div className="font-semibold text-[#af6025] mb-1">
                                    {baseCurrency === 'chaos' ? 'Chaos Orb' : 'Divine Orb'}
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    {baseCurrency === 'chaos' 
                                      ? 'Standard currency used for trading'
                                      : 'High-value currency used for expensive items'}
                                  </div>
                                </div>
                              }
                              position="left"
                            >
                              <div className="w-5 h-5">
                                <img 
                                  src={baseCurrency === 'chaos' ? '/currency-images/chaos_orb.png' : '/currency-images/divine_orb.png'} 
                                  alt={baseCurrency === 'chaos' ? 'Chaos Orb' : 'Divine Orb'} 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Tooltip 
                            content={
                              <div className="p-1">
                                <div className="font-semibold text-[#af6025] mb-1">Listings</div>
                                <div className="text-sm text-gray-300">
                                  Number of listings available on poe.ninja
                                </div>
                              </div>
                            }
                            position="left"
                          >
                            <span>
                              {currency.listingCount > 0 
                                ? `~${currency.listingCount}` 
                                : 'No listings'}
                            </span>
                          </Tooltip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Tooltip 
                            content={
                              <div className="p-1">
                                <div className="font-semibold text-[#af6025] mb-1">Price Change</div>
                                <div className="text-sm text-gray-300">
                                  Price change over the last 7 days
                                </div>
                              </div>
                            }
                            position="left"
                          >
                            <span 
                              className={
                                currency.change > 0 
                                  ? 'text-green-500' 
                                  : currency.change < 0 
                                    ? 'text-red-500' 
                                    : 'text-gray-500'
                              }
                            >
                              {currency.change > 0 ? '+' : ''}{currency.change.toFixed(1)}%
                            </span>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right">
                          <Tooltip 
                            content={
                              <div className="p-1">
                                <div className="font-semibold text-[#af6025] mb-1">Trade on Path of Exile</div>
                                <div className="text-sm text-gray-300">
                                  {mode === 'buy' 
                                    ? `Buy ${currency.name} with ${baseCurrency === 'chaos' ? 'Chaos Orbs' : 'Divine Orbs'}`
                                    : `Sell ${currency.name} for ${baseCurrency === 'chaos' ? 'Chaos Orbs' : 'Divine Orbs'}`}
                                </div>
                              </div>
                            }
                            position="left"
                          >
                            <a
                              href={`https://www.pathofexile.com/trade/exchange/${selectedLeague}?q=${generateTradeQuery(currency.id, baseCurrency, mode)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-3 py-1 bg-[#2a2a2a] text-[#af6025] rounded hover:bg-[#333333] transition-colors"
                            >
                              <span className="mr-1">Trade</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-[#1a1a1a] text-[#a38d6d] rounded-lg border border-[#3d3d3d]" style={{ backgroundColor: '#181818' }}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <p className="text-[#af6025] font-medium">Currency Exchange Information</p>
              <p className="mt-1 text-[#7f7f7f]">
                These rates are approximate and based on player listings. Actual in-game rates may vary.
              </p>
            </div>
            <div className="mt-3 md:mt-0">
              <p className="text-[#7f7f7f] text-sm">
                Data updated: <span className="text-[#af6025]">{timestamp}</span>
              </p>
              <p className="mt-1 text-[#7f7f7f] text-sm">
                League: <span className="text-[#af6025]">{selectedLeague}</span>
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#3d3d3d] text-[#7f7f7f] text-sm">
            For more detailed currency information, visit <a href="https://poe.ninja/economy/phrecia/currency" target="_blank" rel="noopener noreferrer" className="text-[#af6025] hover:underline">poe.ninja</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
