import React from 'react';
import { Item } from '../../services/characterService';
import { getItemRarityClass, getItemBackgroundClass, getSocketColorClass } from '../../utils/itemUtils';

interface ItemTooltipProps {
  item: Item;
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item }) => {
  const rarityClass = getItemRarityClass(item.frameType);
  const bgClass = getItemBackgroundClass(item.frameType);
  
  return (
    <div className={`p-4 rounded border ${bgClass} max-w-md`}>
      {/* Item Header */}
      <div className="mb-2">
        {item.name && (
          <div className={`font-bold ${rarityClass}`}>{item.name}</div>
        )}
        <div className={`${item.name ? 'text-sm' : 'font-bold'} ${rarityClass}`}>
          {item.typeLine}
        </div>
      </div>
      
      {/* Item Properties */}
      {item.properties && item.properties.length > 0 && (
        <div className="border-t border-gray-600 pt-2 mb-2">
          {item.properties.map((prop, index) => (
            <div key={`prop-${index}`} className="text-sm text-gray-300">
              {prop.name}
              {prop.values && prop.values.length > 0 && ': '}
              {prop.values && prop.values.map((value, vIndex) => (
                <span 
                  key={`value-${index}-${vIndex}`}
                  className={value[1] === 1 ? 'text-blue-400' : 'text-white'}
                >
                  {value[0]}
                  {vIndex < prop.values.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      
      {/* Requirements */}
      {item.requirements && item.requirements.length > 0 && (
        <div className="border-t border-gray-600 pt-2 mb-2">
          <div className="text-sm text-gray-400">Requires </div>
          {item.requirements.map((req, index) => (
            <span key={`req-${index}`} className="text-sm text-gray-300">
              {req.name}: 
              {req.values && req.values.map((value, vIndex) => (
                <span key={`req-val-${index}-${vIndex}`}>
                  {' '}
                  <span className="text-white">{value[0]}</span>
                  {vIndex < req.values.length - 1 ? ', ' : ''}
                </span>
              ))}
              {index < item.requirements.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}
      
      {/* Sockets */}
      {item.sockets && item.sockets.length > 0 && (
        <div className="border-t border-gray-600 pt-2 mb-2">
          <div className="flex items-center space-x-1">
            {item.sockets.map((socket, index) => {
              const isLinked = index > 0 && socket.group === item.sockets[index - 1].group;
              return (
                <React.Fragment key={`socket-${index}`}>
                  {isLinked && <div className="w-2 h-0.5 bg-gray-500"></div>}
                  <div className={`w-4 h-4 rounded-full ${getSocketColorClass(socket.sColour)}`}></div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Implicit Mods */}
      {item.implicitMods && item.implicitMods.length > 0 && (
        <div className="border-t border-gray-600 pt-2 mb-2">
          {item.implicitMods.map((mod, index) => (
            <div key={`implicit-${index}`} className="text-sm text-blue-300">
              {mod}
            </div>
          ))}
        </div>
      )}
      
      {/* Explicit Mods */}
      {item.explicitMods && item.explicitMods.length > 0 && (
        <div className="border-t border-gray-600 pt-2 mb-2">
          {item.explicitMods.map((mod, index) => (
            <div key={`explicit-${index}`} className="text-sm text-blue-300">
              {mod}
            </div>
          ))}
        </div>
      )}
      
      {/* Crafted Mods */}
      {item.craftedMods && item.craftedMods.length > 0 && (
        <div className="mb-2">
          {item.craftedMods.map((mod, index) => (
            <div key={`crafted-${index}`} className="text-sm text-blue-200">
              {mod} (crafted)
            </div>
          ))}
        </div>
      )}
      
      {/* Enchant Mods */}
      {item.enchantMods && item.enchantMods.length > 0 && (
        <div className="mb-2">
          {item.enchantMods.map((mod, index) => (
            <div key={`enchant-${index}`} className="text-sm text-purple-300">
              {mod} (enchant)
            </div>
          ))}
        </div>
      )}
      
      {/* Flavor Text */}
      {item.flavourText && item.flavourText.length > 0 && (
        <div className="border-t border-gray-600 pt-2 italic text-sm text-gray-400">
          {item.flavourText.map((text, index) => (
            <div key={`flavor-${index}`}>{text}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemTooltip;
