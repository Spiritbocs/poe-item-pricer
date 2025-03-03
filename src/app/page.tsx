'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ItemResult from '@/components/ItemResult';
import Navbar from '@/components/Navbar';
import PriceRecommendation from '@/components/PriceRecommendation';
import SmartSorting from '@/components/SmartSorting';
import { identifyKeyStats } from '@/components/ItemResult';

const POE_LEAGUE = 'Phrecia';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemText, setItemText] = useState<string>(''); // Add state for the raw item text
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchId, setSearchId] = useState<string>('');
  const [priceRecommendations, setPriceRecommendations] = useState<{
    marketPrice: number;
    idealPrice: number;
    greedyPrice: number;
    currency: string;
  }>({
    marketPrice: 0,
    idealPrice: 0,
    greedyPrice: 0,
    currency: 'chaos',
  });

  // Smart sorting state
  const [sortOnlineFirst, setSortOnlineFirst] = useState(true);
  const [hideAfk, setHideAfk] = useState(false);
  const [hideOffline, setHideOffline] = useState(true);
  const [hideDnd, setHideDnd] = useState(false);

  // Apply filters and sorting to search results
  useEffect(() => {
    if (!searchResults || searchResults.length === 0) {
      setFilteredResults([]);
      return;
    }

    let results = [...searchResults];

    // Filter out AFK sellers if enabled
    if (hideAfk) {
      results = results.filter((item: any) => !item.account.afk);
    }

    // Filter out DND sellers if enabled
    if (hideDnd) {
      results = results.filter((item: any) => !item.account.dnd);
    }

    // Filter out offline sellers if enabled
    if (hideOffline) {
      results = results.filter((item: any) => item.account.online || item.account.afk || item.account.dnd);
    }

    // Sort online sellers first if enabled
    if (sortOnlineFirst) {
      results.sort((a: any, b: any) => {
        // Online sellers first
        if (a.account.online && !b.account.online) return -1;
        if (!a.account.online && b.account.online) return 1;

        // Then sort by price
        return a.price.amount - b.price.amount;
      });
    }

    setFilteredResults(results);
  }, [searchResults, sortOnlineFirst, hideAfk, hideOffline, hideDnd]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setSearchResults(null);
        setFilteredResults(null);
      } else {
        setSearchResults(data.items || []);
        setFilteredResults(data.items || []);
        setSearchId(data.searchId || '');

        // Set price recommendations
        if (data.items && data.items.length > 0) {
          // Find the most common currency in the results
          const currencyCounts: Record<string, number> = {};
          data.items.forEach((item: { price: { currency: string; amount: number } }) => {
            const currency = item.price.currency;
            currencyCounts[currency] = (currencyCounts[currency] || 0) + 1;
          });

          // Get the most common currency
          let mostCommonCurrency = 'chaos';
          let maxCount = 0;

          Object.keys(currencyCounts).forEach((currency: string) => {
            if (currencyCounts[currency] > maxCount) {
              maxCount = currencyCounts[currency];
              mostCommonCurrency = currency;
            }
          });

          const firstItem = data.items[0];
          setPriceRecommendations({
            marketPrice: firstItem.priceRecommendation.min,
            idealPrice: firstItem.priceRecommendation.average,
            greedyPrice: firstItem.priceRecommendation.max,
            currency: mostCommonCurrency,
          });
        }
      }

      // Set hasSearched after data is loaded
      setHasSearched(true);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      // Add a small delay before setting isLoading to false to prevent UI flicker
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <main className="min-h-screen bg-[#0c0c0e] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-[#af6025] mb-2">Path of Exile Item Search</h1>
        <p className="text-center text-[#a38d6d] mb-6">Check real-time prices for items in the Path of Exile Phrecia league</p>

        <div className="mb-8 flex flex-wrap justify-center">
          <div className={`bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-[#3d3d3d] transition-all duration-700 ease-in-out ${hasSearched ? 'w-full md:w-1/2' : 'w-full max-w-2xl'}`} style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <label htmlFor="search-input" className="block text-[#a38d6d] mb-2">Paste item text from Path of Exile</label>
                  <textarea
                    id="search-input"
                    className="w-full p-3 bg-[#0c0c0e] text-white border border-[#3d3d3d] rounded-lg focus:outline-none focus:border-[#af6025] resize-none"
                    rows={5}
                    value={itemText}
                    onChange={(e) => {
                      setItemText(e.target.value);
                      // Also update searchQuery if needed for compatibility
                      setSearchQuery(e.target.value);
                    }}
                    placeholder="Paste your item text here..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-[#af6025] hover:bg-[#8f4e1d] text-white rounded-lg transition-colors flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : 'Search'}
                </button>
              </div>
            </form>
          </div>

          <div className={`w-full md:w-1/4 mt-4 md:mt-0 md:pl-4 transition-all duration-700 ease-in-out ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="p-4 rounded-lg shadow-lg border border-[#3d3d3d] w-full bg-[#1a1a1a]" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <h2 className="text-lg font-semibold text-[#af6025] mb-3">Your Item's Key Value</h2>
              <div className="p-2 bg-[#0c0c0e] rounded border border-[#af6025]">
                {(() => {
                  // Use the itemText state directly
                  console.log("Item text for key stats:", itemText);

                  const keyStats = identifyKeyStats(itemText);
                  console.log("Identified key stats:", keyStats);

                  return keyStats.length > 0 ? (
                    <ul className="text-[#f0d6a7] text-sm">
                      {keyStats.map((stat, index) => (
                        <li key={index} className="flex items-center mb-1">
                          <span className="text-[#af6025] mr-2">•</span>
                          <span dangerouslySetInnerHTML={{ __html: stat }}></span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#7f7f7f] text-sm italic">No key stats identified. Try pasting a complete item.</p>
                  );
                })()}
              </div>
              <p className="text-xs text-[#7f7f7f] mt-2 italic">These are the most valuable modifiers on your item</p>
            </div>
          </div>

          <div className={`w-full md:w-1/4 mt-4 md:mt-0 md:pl-4 transition-all duration-700 ease-in-out ${!hasSearched || isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <PriceRecommendation
              marketPrice={priceRecommendations.marketPrice}
              idealPrice={priceRecommendations.idealPrice}
              greedyPrice={priceRecommendations.greedyPrice}
              currency={priceRecommendations.currency}
            />
          </div>
        </div>

        {hasSearched && searchResults && searchResults.length > 0 && (
          <div className="mb-8 flex flex-wrap">
            <div className="w-full md:w-3/4 pr-0 md:pr-4">
              <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-[#3d3d3d] w-full" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <svg className="animate-spin h-10 w-10 text-[#af6025]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : error ? (
                  <div className="text-center p-8 text-red-500">
                    <p>{error}</p>
                  </div>
                ) : filteredResults && filteredResults.length > 0 ? (
                  <ItemResult
                    items={filteredResults}
                    POE_LEAGUE={POE_LEAGUE}
                    searchId={searchId}
                  />
                ) : (
                  <div className="text-center p-8 text-[#a38d6d]">
                    <p>No items found matching your search criteria.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-1/4 mt-4 md:mt-0">
              <div className="sticky top-20 pt-4">
                <SmartSorting
                  sortOnlineFirst={sortOnlineFirst}
                  hideAfk={hideAfk}
                  hideOffline={hideOffline}
                  hideDnd={hideDnd}
                  onSortOnlineFirstChange={setSortOnlineFirst}
                  onHideAfkChange={setHideAfk}
                  onHideOfflineChange={setHideOffline}
                  onHideDndChange={setHideDnd}
                />
              </div>
            </div>
          </div>
        )}

        {hasSearched && !searchResults && !isLoading && (
          <div className="mb-8 flex flex-wrap justify-center">
            <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-[#3d3d3d] w-full" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              {error ? (
                <div className="text-center p-8 text-red-500">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="text-center p-8 text-[#a38d6d]">
                  <p>No items found matching your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-[#7f7f7f] text-sm">
          <p>This tool is designed to check prices for equipment items on the trade market.</p>
          <p className="mt-1">For currency exchange rates, check our <a href="/currency" className="text-[#af6025] hover:underline">Currency Exchange</a> page or speak with Faustus, the Financier (Currency Exchange) in your hideout.</p>
          <p className="mt-1">For more detailed searches, visit the <a href="https://www.pathofexile.com/trade" target="_blank" rel="noopener noreferrer" className="text-[#af6025] hover:underline">official Path of Exile trade site</a>.</p>
        </div>
      </div>
    </main>
  );
}
