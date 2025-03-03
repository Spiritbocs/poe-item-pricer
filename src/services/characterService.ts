import axios from 'axios';

// Base URL for Path of Exile API
const BASE_URL = 'https://www.pathofexile.com';

// Browser-like headers to help bypass Cloudflare protection
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.pathofexile.com/',
  'Origin': 'https://www.pathofexile.com',
  'Content-Type': 'application/x-www-form-urlencoded',
};

export interface Character {
  name: string;
  league: string;
  classId: number;
  ascendancyClass: number;
  class: string;
  level: number;
  experience: number;
}

export interface CharacterEquipment {
  items: Item[];
  character: {
    name: string;
    league: string;
    classId: number;
    ascendancyClass: number;
    class: string;
    level: number;
  };
}

export interface Item {
  verified: boolean;
  w: number;
  h: number;
  icon: string;
  league: string;
  id: string;
  name: string;
  typeLine: string;
  baseType: string;
  identified: boolean;
  itemLevel: number;
  ilvl: number;
  properties: ItemProperty[];
  requirements: ItemRequirement[];
  implicitMods: string[];
  explicitMods: string[];
  craftedMods: string[];
  enchantMods: string[];
  flavourText: string[];
  frameType: number;
  x: number;
  y: number;
  inventoryId: string;
  socketedItems: Item[];
  sockets: Socket[];
}

export interface ItemProperty {
  name: string;
  values: [string, number][];
  displayMode: number;
  type: number;
}

export interface ItemRequirement {
  name: string;
  values: [string, number][];
  displayMode: number;
}

export interface Socket {
  group: number;
  attr: string;
  sColour: string;
}

export interface PassiveSkills {
  hashes: number[];
  items: Item[];
  jewels: Record<string, any>;
  hashesEx: number[];
}

/**
 * Encodes an account name for use in API requests
 * Handles special characters like # in account names (e.g., "icueMike#3595")
 */
export function encodeAccountName(accountName: string): string {
  // Trim any whitespace
  const trimmedName = accountName.trim();
  console.log('Original account name:', trimmedName);
  
  // Return the trimmed name (URL encoding will be handled by URLSearchParams)
  return trimmedName;
}

/**
 * Fetches the list of characters for a given account
 */
export async function getCharacters(accountName: string): Promise<Character[]> {
  console.log('Getting characters for account:', accountName);
  const encodedAccountName = encodeAccountName(accountName);
  
  try {
    // Use POST with form data
    const response = await axios.post(
      `${BASE_URL}/character-window/get-characters`, 
      new URLSearchParams({ accountName: encodedAccountName }).toString(),
      { headers }
    );
    
    console.log('Characters response:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
}

/**
 * Fetches character items for a specific character
 */
export async function getCharacterItems(accountName: string, characterName: string): Promise<CharacterEquipment> {
  console.log('Getting items for character:', characterName, 'Account:', accountName);
  const encodedAccountName = encodeAccountName(accountName);
  
  try {
    // Use POST with form data
    const response = await axios.post(
      `${BASE_URL}/character-window/get-items`,
      new URLSearchParams({ 
        accountName: encodedAccountName, 
        character: characterName 
      }).toString(),
      { headers }
    );
    
    console.log('Items response:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error fetching character items:', error);
    throw error;
  }
}

/**
 * Fetches passive skills for a specific character
 */
export async function getPassiveSkills(accountName: string, characterName: string, realm = 'pc'): Promise<PassiveSkills> {
  console.log('Getting passive skills for character:', characterName, 'Account:', accountName);
  const encodedAccountName = encodeAccountName(accountName);
  
  try {
    // Use POST with form data for consistency (although GET might still work)
    const response = await axios.post(
      `${BASE_URL}/character-window/get-passive-skills`,
      new URLSearchParams({ 
        accountName: encodedAccountName, 
        character: characterName,
        realm
      }).toString(),
      { headers }
    );
    
    console.log('Passive skills response:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error fetching passive skills:', error);
    throw error;
  }
}

/**
 * Builds a URL to the official Path of Exile passive skill tree viewer
 */
export function buildPassiveTreeUrl(characterClass: string, passiveSkills: number[]) {
  // Map character classes to their respective starting positions on the tree
  const classMap: Record<string, number> = {
    'Marauder': 1,
    'Duelist': 2,
    'Ranger': 3,
    'Shadow': 4,
    'Witch': 5,
    'Templar': 6,
    'Scion': 7
  };
  
  // Extract the base class (remove ascendancy if present)
  const baseClass = characterClass.split(' ')[0];
  const classId = classMap[baseClass] || 0;
  
  // Build the passive tree URL with the allocated skills
  const skillsParam = passiveSkills.join(',');
  return `https://www.pathofexile.com/fullscreen-passive-skill-tree/3.21.0/class/${classId}/passives/${skillsParam}`;
}

/**
 * Extracts account name from a profile URL
 * Handles formats like "username" or "username#1234"
 */
export function extractAccountName(input: string): string {
  // Remove any URL parts if a full URL was pasted
  if (input.includes('pathofexile.com')) {
    const match = input.match(/\/profile\/([^\/]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  
  return input;
}
