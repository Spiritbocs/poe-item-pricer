'use client';

import React, { useState } from 'react';
import styles from './armory.module.css';
import Navbar from '@/components/Navbar';

interface Character {
  name: string;
  class: string;
  level: number;
  league: string;
}

interface Item {
  id: string;
  name: string;
  typeLine: string;
  baseType?: string;
  identified: boolean;
  itemLevel: number;
  frameType: number;
  icon: string;
  inventoryId: string;
  socketedItems?: Item[];
  properties?: Array<{
    name: string;
    values: Array<[string, number]>;
    displayMode: number;
  }>;
  requirements?: Array<{
    name: string;
    values: Array<[string, number]>;
    displayMode: number;
  }>;
  explicitMods?: string[];
  implicitMods?: string[];
  craftedMods?: string[];
  enchantMods?: string[];
  corrupted?: boolean;
}

interface CharacterData {
  character: {
    name: string;
    class: string;
    level: number;
    league: string;
  };
  items: Item[];
}

function mapFrameTypeToRarity(frameType: number): string {
  switch (frameType) {
    case 0: return 'normal';
    case 1: return 'magic';
    case 2: return 'rare';
    case 3: return 'unique';
    case 4: return 'gem';
    case 5: return 'currency';
    case 6: return 'divination';
    case 7: return 'quest';
    case 8: return 'prophecy';
    case 9: return 'relic';
    default: return 'normal';
  }
}

function getSlotName(inventoryId: string): string {
  const slotMap: Record<string, string> = {
    Weapon: 'Main Hand',
    Offhand: 'Off Hand',
    Weapon2: 'Swap Main Hand',
    Offhand2: 'Swap Off Hand',
    Helm: 'Helmet',
    BodyArmour: 'Body Armour',
    Gloves: 'Gloves',
    Boots: 'Boots',
    Amulet: 'Amulet',
    Ring: 'Left Ring',
    Ring2: 'Right Ring',
    Belt: 'Belt',
    Flask: 'Flask 1',
    Flask2: 'Flask 2',
    Flask3: 'Flask 3',
    Flask4: 'Flask 4',
    Flask5: 'Flask 5',
  };

  return slotMap[inventoryId] || inventoryId;
}

export default function ArmoryPage() {
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    setIsLoading(true);
    setError(null);
    setCharacters([]);
    setSelectedCharacter(null);
    setCharacterData(null);

    try {
      const response = await fetch(`/api/armory?account=${encodeURIComponent(accountName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account data');
      }

      if (data.characters && Array.isArray(data.characters)) {
        setCharacters(data.characters);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterSelect = async (characterName: string) => {
    setIsLoading(true);
    setError('');
    setSelectedCharacter(characterName);
    setCharacterData(null);
    
    try {
      const response = await fetch(`/api/armory?accountName=${encodeURIComponent(accountName)}&character=${encodeURIComponent(characterName)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch character data: ${response.status}`);
      }
      
      const character = await response.json();
      
      if (!character) {
        throw new Error('No character data returned');
      }
      
      // Log the character data to debug
      console.log(`Character data for ${characterName}:`, character);
      
      // Always ensure there's an items array, even if empty
      const items = character.items || [];
      if (!Array.isArray(items)) {
        console.error('Items is not an array for character:', character);
        throw new Error('Character items data is invalid (not an array)');
      }
      
      // Format the data to match the expected structure
      setCharacterData({
        character: {
          name: character.name,
          class: character.class,
          level: character.level,
          league: character.league
        },
        items: items
      });
    } catch (err) {
      console.error('Error fetching character data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSelectedCharacter(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItemProperties = (item: Item) => {
    if (!item.properties || item.properties.length === 0) return null;

    return (
      <div className={styles.itemProperties}>
        {item.properties.map((prop, index) => (
          <div key={index}>
            {prop.name}: {prop.values.map(([value]) => value).join(', ')}
          </div>
        ))}
      </div>
    );
  };

  const renderItemRequirements = (item: Item) => {
    if (!item.requirements || item.requirements.length === 0) return null;

    return (
      <div className={styles.itemRequirements}>
        <span className={styles.requirementsHeader}>Requires:</span>
        {item.requirements.map((req, index) => (
          <span key={index} className={styles.requirement}>
            {req.name} {req.values.map(([value]) => value).join(', ')}
          </span>
        ))}
      </div>
    );
  };

  const renderItemMods = (item: Item) => {
    const allMods = [
      ...(item.implicitMods || []),
      ...(item.explicitMods || []),
      ...(item.craftedMods || []),
      ...(item.enchantMods || []),
    ];

    if (allMods.length === 0) return null;

    return (
      <div className={styles.itemMods}>
        {allMods.map((mod, index) => (
          <div key={index} className={styles.itemMod}>
            {mod}
          </div>
        ))}
        {item.corrupted && <div className={styles.corrupted}>Corrupted</div>}
      </div>
    );
  };

  const renderItem = (item: Item) => {
    const rarityClass = mapFrameTypeToRarity(item.frameType);
    
    return (
      <div className={styles.item}>
        <div className={`${styles.itemHeader} ${styles[rarityClass]}`}>
          <div className={styles.itemName}>
            <span className={styles.itemNameText}>{item.name || item.typeLine}</span>
            {item.name && <span className={styles.itemType}>{item.typeLine}</span>}
          </div>
        </div>
        <div className={styles.itemContent}>
          <div className={styles.itemImage}>
            {item.icon ? (
              <img 
                src={item.icon} 
                alt={item.name || item.typeLine} 
                width={64} 
                height={64}
                onError={(e) => {
                  // If image fails to load, replace with a placeholder
                  (e.target as HTMLImageElement).src = "https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png";
                  console.error(`Failed to load image for item: ${item.name || item.typeLine}`);
                }}
              />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
          </div>
          <div className={styles.itemDetails}>
            {renderItemProperties(item)}
            {renderItemRequirements(item)}
            {renderItemMods(item)}
          </div>
        </div>
      </div>
    );
  };

  const renderEquipmentSlot = (slotId: string) => {
    if (!characterData) return null;

    const item = characterData.items.find(item => item.inventoryId === slotId);
    const slotName = getSlotName(slotId);

    return (
      <div className={styles.equipmentSlot}>
        <div className={styles.slotName}>{slotName}</div>
        {item ? renderItem(item) : <div className={styles.emptySlot}>Empty</div>}
      </div>
    );
  };

  const equipmentSlots = [
    'Helm', 'Amulet', 'Weapon', 'BodyArmour', 'Offhand',
    'Gloves', 'Ring', 'Belt', 'Ring2', 'Boots',
    'Flask', 'Flask2', 'Flask3', 'Flask4', 'Flask5',
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg p-6 mb-6 shadow-lg">
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="accountName" className="block text-sm font-medium text-[#a38d6d] mb-2">
                Account Name
              </label>
              <input
                id="accountName"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter PoE account name"
                className="w-full px-4 py-2 bg-[#252525] border border-[#3d3d3d] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#af6025]"
                required
              />
            </div>
            <button 
              type="submit" 
              className="px-6 py-2 bg-[#af6025] text-white font-medium rounded-md hover:bg-[#c27b3e] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !accountName.trim()}
            >
              {isLoading ? 'Loading...' : 'Search'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-[#3d1c1c] border border-[#b41e1e] text-white p-4 rounded-md mb-6">
            <p className="font-medium">{error}</p>
            {error.includes('private') && (
              <p className="mt-2 text-sm">
                Make sure your profile is set to public in your 
                <a href="https://www.pathofexile.com/my-account/privacy" target="_blank" rel="noopener noreferrer" className="text-[#ffcc00] hover:underline ml-1">
                  Path of Exile privacy settings
                </a>.
              </p>
            )}
          </div>
        )}

        {characters.length > 0 && (
          <div className="mb-6">
            <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg p-4 shadow-lg">
              <h2 className="text-lg font-medium text-[#af6025] mb-4">Select a character to view their equipment</h2>
              <div className={`${styles.characterScroller}`}>
                <ul className="flex space-x-4 min-w-max pb-2">
                  {characters.map(character => (
                    <li 
                      key={character.name} 
                      onClick={() => handleCharacterSelect(character.name)} 
                      className={`p-3 rounded cursor-pointer transition-colors duration-200 min-w-[200px] ${
                        selectedCharacter === character.name 
                          ? 'bg-[#2a2a2a] border-l-4 border-[#af6025]' 
                          : 'hover:bg-[#252525] border border-[#3d3d3d]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-[#af6025]">{character.name}</span>
                        <span className="text-sm text-[#a38d6d]">
                          Level {character.level} {character.class} ({character.league})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {characters.length > 0 && (
          <div>
            {characterData ? (
              <div className="bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg p-4 shadow-lg">
                <div className="mb-6 border-b border-[#3d3d3d] pb-4">
                  <h2 className="text-xl font-bold text-[#af6025]">{characterData.character.name}</h2>
                  <div className="mt-2">
                    <p className="text-[#a38d6d]">Level {characterData.character.level} {characterData.character.class}</p>
                    <p className="text-[#a38d6d]">{characterData.character.league} League</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {characterData.items.length > 0 ? (
                    equipmentSlots.map(slot => (
                      <div key={slot} className="bg-[#252525] border border-[#3d3d3d] rounded-lg overflow-hidden">
                        {renderEquipmentSlot(slot)}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 p-6 text-center">
                      <p className="text-[#a38d6d] mb-2">No equipment data available for this character.</p>
                      <p className="text-sm text-[#777]">This could be due to API limitations or the character being inactive.</p>
                      <button 
                        onClick={() => handleCharacterSelect(selectedCharacter!)}
                        className="mt-4 px-4 py-2 bg-[#af6025] text-white rounded-md hover:bg-[#c27b3e] transition-colors duration-200"
                      >
                        Retry Loading Equipment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedCharacter ? (
              <div className="flex justify-center items-center h-64 bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#af6025]"></div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg">
                <p className="text-[#a38d6d]">Select a character to view their equipment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
