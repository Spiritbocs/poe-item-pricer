import { Item } from '../services/characterService';

/**
 * Get the rarity color class for an item based on its frame type
 */
export const getItemRarityClass = (frameType: number): string => {
  switch (frameType) {
    case 0: // Normal
      return 'text-white';
    case 1: // Magic
      return 'text-blue-400';
    case 2: // Rare
      return 'text-yellow-300';
    case 3: // Unique
      return 'text-orange-400';
    case 4: // Gem
      return 'text-green-400';
    case 5: // Currency
      return 'text-yellow-200';
    case 6: // Divination Card
      return 'text-sky-200';
    case 8: // Prophecy
      return 'text-purple-400';
    case 9: // Relic
      return 'text-teal-300';
    default:
      return 'text-white';
  }
};

/**
 * Get the background color class for an item tooltip based on its frame type
 */
export const getItemBackgroundClass = (frameType: number): string => {
  switch (frameType) {
    case 0: // Normal
      return 'bg-gray-800';
    case 1: // Magic
      return 'bg-gray-800 border-blue-400';
    case 2: // Rare
      return 'bg-gray-800 border-yellow-300';
    case 3: // Unique
      return 'bg-gray-800 border-orange-400';
    case 4: // Gem
      return 'bg-gray-800 border-green-400';
    case 5: // Currency
      return 'bg-gray-800 border-yellow-200';
    case 6: // Divination Card
      return 'bg-gray-800 border-sky-200';
    case 8: // Prophecy
      return 'bg-gray-800 border-purple-400';
    case 9: // Relic
      return 'bg-gray-800 border-teal-300';
    default:
      return 'bg-gray-800';
  }
};

/**
 * Get the socket color class
 */
export const getSocketColorClass = (color: string): string => {
  switch (color.toLowerCase()) {
    case 'r':
      return 'bg-red-500';
    case 'g':
      return 'bg-green-500';
    case 'b':
      return 'bg-blue-500';
    case 'w':
      return 'bg-white';
    case 'a':
      return 'bg-purple-500'; // Abyssal socket
    case 'd':
      return 'bg-black border border-white'; // Delve socket
    default:
      return 'bg-gray-500';
  }
};

/**
 * Get the item slot name for display
 */
export const getItemSlotName = (inventoryId: string): string => {
  switch (inventoryId) {
    case 'Weapon':
      return 'Main Hand';
    case 'Weapon2':
      return 'Off Hand';
    case 'Offhand':
      return 'Shield';
    case 'Offhand2':
      return 'Shield (Swap)';
    case 'Helm':
      return 'Helmet';
    case 'BodyArmour':
      return 'Body Armour';
    case 'Gloves':
      return 'Gloves';
    case 'Boots':
      return 'Boots';
    case 'Belt':
      return 'Belt';
    case 'Ring':
      return 'Left Ring';
    case 'Ring2':
      return 'Right Ring';
    case 'Amulet':
      return 'Amulet';
    case 'Flask':
      return 'Flask 1';
    case 'Flask2':
      return 'Flask 2';
    case 'Flask3':
      return 'Flask 3';
    case 'Flask4':
      return 'Flask 4';
    case 'Flask5':
      return 'Flask 5';
    default:
      return inventoryId;
  }
};
