export interface ItemData {
  id: string;
  name: string;
  baseType: string;
  itemLevel: number;
  rarity: number;
  price: {
    amount: number;
    currency: string;
    displayText: string;
  };
  links: {
    trade: string;
    wiki: string;
  };
  stats?: string[];
  implicitStats?: string[];
  icon?: string;
  account: {
    name: string;
    online: boolean;
    lastCharacterName: string;
    afk?: boolean;
    dnd?: boolean;
  };
  whisper: string;
  listedAt: string;
  stash: {
    name: string;
    x?: number;
    y?: number;
  };
  priceRecommendation: {
    min: number;
    max: number;
    average: number;
  };
}

export interface SearchResult {
  items: ItemData[];
  searchId?: string;
  note?: string;
  message?: string;
}

export async function searchItems(query: string): Promise<SearchResult> {
  try {
    // Check if the query is valid
    if (!query || query.trim() === '') {
      throw new Error('Please enter an item name or paste item data');
    }
    
    // Simple call to our backend API which handles all the parsing
    const response = await fetch(`/api/items?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch item data');
    }
    
    const data = await response.json();
    return {
      items: data.items || [],
      searchId: data.searchId,
      note: data.note,
      message: data.message
    };
  } catch (error) {
    console.error("Error searching for items:", error);
    throw error;
  }
}
