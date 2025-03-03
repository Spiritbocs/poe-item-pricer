import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Configure this route as dynamic
export const dynamic = 'force-dynamic';

// Define the Path of Exile API base URL
const POE_API_BASE = 'https://www.pathofexile.com/character-window';

// Define interfaces for character data
interface Character {
  name: string;
  class: string;
  level: number;
  league: string;
  experience: number;
  lastActive: string;
  items?: any[];
}

interface Account {
  name: string;
  characters: Character[];
}

// Simple in-memory cache
const accountCache = new Map<string, Account>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Check if we have valid cached data
function checkCache(key: string): Account | null {
  const now = Date.now();
  if (accountCache.has(key) && cacheExpiry.has(key)) {
    const expiry = cacheExpiry.get(key) || 0;
    if (now < expiry) {
      return accountCache.get(key) || null;
    }
  }
  return null;
}

// Update cache with new data
function updateCache(key: string, data: Account): void {
  accountCache.set(key, data);
  cacheExpiry.set(key, Date.now() + CACHE_DURATION);
}

// Format account name for API requests
function formatAccountName(accountName: string): string {
  // Remove leading/trailing whitespace
  return accountName.trim();
}

// Convert PoE class names to more readable format
function formatClassName(className: string): string {
  const classMap: Record<string, string> = {
    'Scion': 'Scion',
    'Marauder': 'Marauder',
    'Ranger': 'Ranger',
    'Witch': 'Witch',
    'Duelist': 'Duelist',
    'Templar': 'Templar',
    'Shadow': 'Shadow',
    'Ascendant': 'Scion (Ascendant)',
    'Juggernaut': 'Marauder (Juggernaut)',
    'Berserker': 'Marauder (Berserker)',
    'Chieftain': 'Marauder (Chieftain)',
    'Raider': 'Ranger (Raider)',
    'Deadeye': 'Ranger (Deadeye)',
    'Pathfinder': 'Ranger (Pathfinder)',
    'Occultist': 'Witch (Occultist)',
    'Elementalist': 'Witch (Elementalist)',
    'Necromancer': 'Witch (Necromancer)',
    'Slayer': 'Duelist (Slayer)',
    'Gladiator': 'Duelist (Gladiator)',
    'Champion': 'Duelist (Champion)',
    'Inquisitor': 'Templar (Inquisitor)',
    'Hierophant': 'Templar (Hierophant)',
    'Guardian': 'Templar (Guardian)',
    'Assassin': 'Shadow (Assassin)',
    'Trickster': 'Shadow (Trickster)',
    'Saboteur': 'Shadow (Saboteur)',
  };
  
  return classMap[className] || className;
}

// Format the date to a readable string
function formatLastActive(timestamp: number): string {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Map frame type to rarity
function mapFrameTypeToRarity(frameType: number): string {
  switch (frameType) {
    case 0: return 'Normal';
    case 1: return 'Magic';
    case 2: return 'Rare';
    case 3: return 'Unique';
    case 4: return 'Gem';
    case 5: return 'Currency';
    case 6: return 'Divination Card';
    case 7: return 'Quest Item';
    case 8: return 'Prophecy';
    case 9: return 'Relic';
    default: return 'Unknown';
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountName = searchParams.get('account');
  const characterName = searchParams.get('character');
  
  if (!accountName) {
    return NextResponse.json({ error: 'Account name is required' }, { status: 400 });
  }
  
  // Format account name for API requests
  const formattedAccountName = formatAccountName(accountName);
  
  // Check if we have cached data for this account
  const cacheKey = formattedAccountName.toLowerCase();
  const cachedData = checkCache(cacheKey);
  
  if (cachedData) {
    return NextResponse.json(cachedData);
  }
  
  try {
    console.log(`Fetching characters for account: ${formattedAccountName}`);
    
    // Setup headers to mimic a browser request to bypass Cloudflare
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.pathofexile.com/',
      'Origin': 'https://www.pathofexile.com',
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    // Use POST with form data instead of GET with query params
    const charactersResponse = await axios.post(
      `${POE_API_BASE}/get-characters`,
      new URLSearchParams({ accountName: formattedAccountName }).toString(),
      { headers }
    );
    
    if (!charactersResponse.data || charactersResponse.data.error) {
      throw new Error(charactersResponse.data?.error || 'Failed to fetch characters');
    }
    
    // Process character data
    const characters: Character[] = await Promise.all(
      charactersResponse.data.map(async (char: any) => {
        // Fetch items for each character if a specific character is requested
        if (characterName && char.name !== characterName) {
          return {
            name: char.name,
            class: formatClassName(char.class),
            level: char.level,
            league: char.league,
            experience: char.experience,
            lastActive: formatLastActive(char.lastActive)
          };
        }
        
        try {
          console.log(`Fetching items for character: ${char.name}`);
          
          // Use POST with form data for items as well
          const itemsResponse = await axios.post(
            `${POE_API_BASE}/get-items`,
            new URLSearchParams({
              accountName: formattedAccountName,
              character: char.name,
              realm: 'pc' // Default to PC realm
            }).toString(),
            { headers }
          );
          
          if (!itemsResponse.data || !itemsResponse.data.items) {
            console.error(`Invalid items response for character ${char.name}:`, itemsResponse.data);
            throw new Error('Invalid items response format');
          }
          
          const items = itemsResponse.data.items || [];
          
          // Log the first item to debug
          if (items.length > 0) {
            console.log(`Sample item for ${char.name}:`, {
              name: items[0].name,
              typeLine: items[0].typeLine,
              icon: items[0].icon,
              inventoryId: items[0].inventoryId
            });
          } else {
            console.log(`No items found for character ${char.name}`);
          }
          
          return {
            name: char.name,
            class: formatClassName(char.class),
            level: char.level,
            league: char.league,
            experience: char.experience,
            lastActive: formatLastActive(char.lastActive),
            items: items.map((item: any) => ({
              id: item.id || `${item.inventoryId}-${Date.now()}`,
              name: item.name,
              typeLine: item.typeLine,
              baseType: item.baseType,
              identified: item.identified,
              itemLevel: item.ilvl,
              frameType: item.frameType,
              icon: item.icon, // Make sure icon URL is passed correctly
              inventoryId: item.inventoryId, // This is critical for equipment slot rendering
              socketedItems: item.socketedItems,
              sockets: item.sockets,
              properties: item.properties,
              requirements: item.requirements,
              explicitMods: item.explicitMods,
              implicitMods: item.implicitMods,
              craftedMods: item.craftedMods,
              enchantMods: item.enchantMods,
              flavourText: item.flavourText,
              corrupted: item.corrupted,
              support: item.support,
              stackSize: item.stackSize,
              maxStackSize: item.maxStackSize
            }))
          };
        } catch (error) {
          console.error(`Error fetching items for character ${char.name}:`, error);
          // If we can't get items, still return the character without items
          return {
            name: char.name,
            class: formatClassName(char.class),
            level: char.level,
            league: char.league,
            experience: char.experience,
            lastActive: formatLastActive(char.lastActive)
          };
        }
      })
    );
    
    const accountData = {
      name: accountName,
      characters
    };
    
    // Cache the data
    updateCache(cacheKey, accountData);
    
    return NextResponse.json(accountData);
  } catch (error: any) {
    console.error('Error fetching account data:', error);
    
    // Handle specific API errors
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      
      console.log('API Error Response:', {
        status,
        data: responseData
      });
      
      if (status === 404) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      } else if (status === 403) {
        return NextResponse.json({ 
          error: 'Account profile is private or Cloudflare is blocking the request. Try again later.',
          details: 'The Path of Exile API is protected by Cloudflare, which may block automated requests.',
          cloudflare: true
        }, { status: 403 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch account data', 
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
