import { NextResponse, NextRequest } from 'next/server';
import { Currency } from '@/types/currency';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Configure this route as dynamic
export const dynamic = 'force-dynamic';

// Constants
const POE_NINJA_API_BASE = 'https://poe.ninja/api/data';
const DEFAULT_LEAGUE = 'Phrecia'; // Current league
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache structure by league
const currencyCache: Record<string, { timestamp: number, data: any, divinePrice: number }> = {};

// Available leagues
const AVAILABLE_LEAGUES = [
  'Phrecia',
  'Standard',
  'Hardcore',
  'Hardcore Phrecia'
];

// Base currencies for equivalency
const BASE_CURRENCIES = {
  'chaos': {
    id: 'chaos',
    name: 'Chaos Orb',
    icon: '/currency-images/chaos_orb.png'
  },
  'divine': {
    id: 'divine',
    name: 'Divine Orb',
    icon: '/currency-images/divine_orb.png'
  }
};

// Load the currency map for local image paths
let currencyMap: Record<string, string> = {};
try {
  const mapPath = path.join(process.cwd(), 'public', 'currency-images', 'currency-map.json');
  if (fs.existsSync(mapPath)) {
    const mapData = fs.readFileSync(mapPath, 'utf8');
    currencyMap = JSON.parse(mapData);
    console.log(`Loaded ${Object.keys(currencyMap).length} currency images from map`);
  }
} catch (error) {
  console.error('Error loading currency map:', error);
}

// Helper function to get the image URL for a currency
function getImageUrl(item: any): string {
  // First check if we have a local image in our currency map
  if (item && item.currencyTypeName && currencyMap[item.currencyTypeName]) {
    return currencyMap[item.currencyTypeName];
  }
  
  // Then check if the item has an icon property
  if (item && item.icon) {
    return item.icon;
  }
  
  // Fallback to a default icon
  return '/fallback-currency-icon.png';
}

// Helper function to fetch currency exchange rates
async function fetchCurrencyRates(league = DEFAULT_LEAGUE) {
  try {
    // Check if we have cached data for this league
    const now = Date.now();
    const cacheKey = `currency_${league}`;
    
    if (currencyCache[cacheKey] && now - currencyCache[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`Returning cached currency data for ${league}`);
      return NextResponse.json({
        currencies: currencyCache[cacheKey].data,
        timestamp: new Date(currencyCache[cacheKey].timestamp).toISOString(),
        divinePrice: currencyCache[cacheKey].divinePrice,
        league,
        availableLeagues: AVAILABLE_LEAGUES,
        baseCurrency: 'chaos',
        baseCurrencies: Object.values(BASE_CURRENCIES)
      });
    }
    
    console.log(`Fetching fresh currency data from poe.ninja for ${league}`);
    
    // Fetch currency data from poe.ninja
    const currencyResponse = await axios.get(`${POE_NINJA_API_BASE}/currencyoverview?league=${league}&type=Currency`);
    const fragmentResponse = await axios.get(`${POE_NINJA_API_BASE}/currencyoverview?league=${league}&type=Fragment`);
    
    if (!currencyResponse.data || !fragmentResponse.data) {
      throw new Error('Invalid response from poe.ninja');
    }
    
    // Process currency data
    const currencyData = [...currencyResponse.data.lines, ...fragmentResponse.data.lines].map(item => {
      // Calculate change if available
      let change = 0;
      if (item.receiveSparkLine && item.receiveSparkLine.totalChange) {
        change = item.receiveSparkLine.totalChange;
      }
      
      // Debug Mirror of Kalandra
      if (item.currencyTypeName === 'Mirror of Kalandra') {
        console.log('Mirror data from poe.ninja:', {
          name: item.currencyTypeName,
          chaosEquivalent: item.chaosEquivalent,
          receive: item.receive?.value,
          pay: item.pay?.value
        });
      }
      
      // Extract both buy and sell prices
      // Buy price: how much you pay in chaos to get 1 of this currency (pay.value)
      // Sell price: how much chaos you get for 1 of this currency (receive.value)
      const buyPrice = item.pay?.value ? 1 / item.pay.value : item.chaosEquivalent || 0;
      const sellPrice = item.receive?.value || item.chaosEquivalent || 0;
      
      return {
        id: item.currencyTypeName.toLowerCase().replace(/\s+/g, '-'),
        name: item.currencyTypeName,
        icon: getImageUrl(item),
        chaosEquivalent: item.chaosEquivalent || 0,
        buyPrice: buyPrice,
        sellPrice: sellPrice,
        listingCount: item.receive?.listing_count || 0,
        change: change
      };
    });

    // Find divine orb price in chaos - do this before adding divine equivalents
    const divineOrb = currencyData.find(c => c.name === 'Divine Orb');
    const divinePrice = divineOrb ? divineOrb.chaosEquivalent : 200; // Default fallback

    // Add divine equivalents
    const processedData = currencyData.map(currency => ({
      ...currency,
      divineEquivalent: currency.chaosEquivalent / divinePrice,
      buyPriceDivine: currency.buyPrice / divinePrice,
      sellPriceDivine: currency.sellPrice / divinePrice
    }));

    // Update the cache for this league
    currencyCache[cacheKey] = {
      data: processedData,
      timestamp: now,
      divinePrice
    };
    
    // Return the processed data
    return NextResponse.json({
      currencies: processedData,
      timestamp: new Date().toISOString(),
      divinePrice,
      league,
      availableLeagues: AVAILABLE_LEAGUES,
      baseCurrency: 'chaos',
      baseCurrencies: Object.values(BASE_CURRENCIES)
    });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    // Return empty array instead of throwing to prevent API failures
    return NextResponse.json({ error: 'Failed to fetch currency data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters using nextUrl instead of request.url
    const searchParams = request.nextUrl.searchParams;
    const league = searchParams.get('league') || DEFAULT_LEAGUE;
    const baseCurrency = searchParams.get('baseCurrency') || 'chaos';
    
    // Fetch currency data
    const response = await fetchCurrencyRates(league);
    
    // Update the baseCurrency in the response
    const responseData = await response.json();
    responseData.baseCurrency = baseCurrency;
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in currency API:', error);
    return NextResponse.json({ error: 'Failed to fetch currency data' }, { status: 500 });
  }
}
