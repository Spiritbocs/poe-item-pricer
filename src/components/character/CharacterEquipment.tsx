import React, { useState } from 'react';
import { Item, CharacterEquipment as CharacterEquipmentType } from '../../services/characterService';
import { getItemRarityClass, getItemSlotName } from '../../utils/itemUtils';
import ItemTooltip from './ItemTooltip';

interface CharacterEquipmentProps {
  equipment: CharacterEquipmentType;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({ equipment }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Group items by their inventory slot
  const itemsBySlot = equipment.items.reduce<Record<string, Item>>((acc, item) => {
    acc[item.inventoryId] = item;
    return acc;
  }, {});
  
  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };
  
  const handleCloseTooltip = () => {
    setSelectedItem(null);
  };
  
  // Define the order of slots to display
  const slotOrder = [
    'Helm', 'Amulet', 'Weapon', 'BodyArmour', 'Offhand', 
    'Gloves', 'Ring', 'Ring2', 'Belt', 'Boots',
    'Flask', 'Flask2', 'Flask3', 'Flask4', 'Flask5'
  ];
  
  // Filter items to only include equipment (no inventory items)
  const equipmentSlots = Object.keys(itemsBySlot).filter(slot => 
    slotOrder.includes(slot)
  );
  
  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">
        {equipment.character.name} - Level {equipment.character.level} {equipment.character.class}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {slotOrder.map(slotId => {
          const item = itemsBySlot[slotId];
          if (!item) return (
            <div 
              key={slotId} 
              className="bg-gray-800 p-3 rounded-lg flex items-center justify-between border border-gray-700"
            >
              <span className="text-gray-400">{getItemSlotName(slotId)}</span>
              <span className="text-gray-500">Empty</span>
            </div>
          );
          
          return (
            <div 
              key={slotId}
              className="bg-gray-800 p-3 rounded-lg flex items-center justify-between border border-gray-700 cursor-pointer hover:bg-gray-700 transition"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex-shrink-0">
                  <img 
                    src={item.icon} 
                    alt={item.name || item.typeLine} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-gray-300 text-sm">{getItemSlotName(slotId)}</div>
                  <div className={`${getItemRarityClass(item.frameType)} font-medium truncate max-w-[180px]`}>
                    {item.name || item.typeLine}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Item tooltip modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseTooltip}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
              onClick={handleCloseTooltip}
            >
              ×
            </button>
            <ItemTooltip item={selectedItem} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterEquipment;
