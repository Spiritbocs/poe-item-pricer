import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

interface ItemPrice {
  amount: number;
  currency: string;
  displayText: string;
}

interface ItemLinks {
  trade: string;
  wiki: string;
}

interface ItemAccount {
  name: string;
  online: boolean;
  lastCharacterName: string;
  afk?: boolean;
  dnd?: boolean;
}

interface ItemStash {
  name: string;
  x?: number;
  y?: number;
}

interface PriceRecommendation {
  min: number;
  max: number;
  average: number;
}

interface Item {
  id: string;
  name: string;
  baseType: string;
  itemLevel: number;
  rarity: number;
  price: ItemPrice;
  links: ItemLinks;
  stats?: string[];
  implicitStats?: string[];
  icon?: string;
  account: ItemAccount;
  whisper: string;
  listedAt: string;
  stash: ItemStash;
  priceRecommendation: PriceRecommendation;
}

interface ItemResultProps {
  items: Item[] | null;
  message?: string;
  POE_LEAGUE?: string;
  searchId?: string;
}

function getRarityClass(rarity: number): string {
  switch (rarity) {
    case 0: return 'text-[#c8c8c8]'; // Normal
    case 1: return 'text-[#8888ff]'; // Magic
    case 2: return 'text-[#ffff77]'; // Rare
    case 3: return 'text-[#af6025]'; // Unique
    case 4: return 'text-[#1ba29b]'; // Gem
    case 5: return 'text-[#aa9e82]'; // Currency
    case 6: return 'text-[#aa9e82]'; // Divination Card
    case 8: return 'text-[#d20000]'; // Prophecy
    default: return 'text-[#c8c8c8]';
  }
}

function getRarityBgClass(rarity: number): string {
  switch (rarity) {
    case 0: return 'bg-[#1a1a1a]'; // Normal
    case 1: return 'bg-[#1a1a1a]'; // Magic
    case 2: return 'bg-[#1a1a1a]'; // Rare
    case 3: return 'bg-[#1a1a1a]'; // Unique
    case 4: return 'bg-[#1a1a1a]'; // Gem
    case 5: return 'bg-[#1a1a1a]'; // Currency
    case 6: return 'bg-[#1a1a1a]'; // Divination Card
    case 8: return 'bg-[#1a1a1a]'; // Prophecy
    default: return 'bg-[#1a1a1a]';
  }
}

function getRarityBorderClass(rarity: number): string {
  switch (rarity) {
    case 0: return 'border-[#3d3d3d]'; // Normal
    case 1: return 'border-[#3d3d3d]'; // Magic
    case 2: return 'border-[#3d3d3d]'; // Rare
    case 3: return 'border-[#af6025]'; // Unique
    case 4: return 'border-[#1ba29b]'; // Gem
    case 5: return 'border-[#aa9e82]'; // Currency
    case 6: return 'border-[#aa9e82]'; // Divination Card
    case 8: return 'border-[#d20000]'; // Prophecy
    default: return 'border-[#3d3d3d]';
  }
}

function getCurrencyImage(currency: string): string {
  // Use placeholder images from a public CDN
  const currencyImages: { [key: string]: string } = {
    'chaos': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png',
    'divine': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png',
    'exalted': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToRare.png',
    'mirror': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyDuplicate.png',
    'alt': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollMagic.png',
    'alch': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToRare.png',
    'fusing': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketLinks.png',
    'chisel': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyMapQuality.png',
    'vaal': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyVaal.png',
    'regal': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeMagicToRare.png',
    'gcp': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyGemQuality.png',
    'blessed': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyImplicitMod.png',
    'scour': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyConvertToNormal.png',
    'jewellers': 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketNumbers.png',
  };
  
  return currencyImages[currency.toLowerCase()] || currencyImages['chaos'];
}

function formatStatWithValues(stat: string): JSX.Element {
  // Replace numeric values with highlighted spans
  const parts = stat.split(/(\d+(?:\.\d+)?)/);
  
  return (
    <>
      {parts.map((part, index) => {
        const isNumber = /^\d+(?:\.\d+)?$/.test(part);
        return isNumber 
          ? <span key={index} className="text-[#8888ff] font-medium">{part}</span> 
          : <span key={index}>{part}</span>;
      })}
    </>
  );
}

function formatModText(mod: string): string {
  // Color coding for different stat types
  if (mod.includes('Life') || mod.includes('Fire')) {
    return mod.replace(/([+-]?\d+\.?\d*%?)/g, '<span class="text-[#ff6b6b]">$1</span>');
  } else if (mod.includes('Mana') || mod.includes('Cold') || mod.includes('Intelligence')) {
    return mod.replace(/([+-]?\d+\.?\d*%?)/g, '<span class="text-[#3993fa]">$1</span>');
  } else if (mod.includes('Armour') || mod.includes('Strength')) {
    return mod.replace(/([+-]?\d+\.?\d*%?)/g, '<span class="text-[#ff6b6b]">$1</span>');
  } else if (mod.includes('Evasion') || mod.includes('Dexterity') || mod.includes('Lightning')) {
    return mod.replace(/([+-]?\d+\.?\d*%?)/g, '<span class="text-[#d3ce3e]">$1</span>');
  } else if (mod.includes('Energy Shield') || mod.includes('Chaos')) {
    return mod.replace(/([+-]?\d+\.?\d*%?)/g, '<span class="text-[#d02090]">$1</span>');
  } else if (mod.includes('Critical')) {
    return mod.replace(/([+-]?\d+\.?\d*%?)/g, '<span class="text-[#8888ff]">$1</span>');
  } else {
    return mod.replace(/([+-]?\d+\.?\d*%?)/g, '<span class="text-[#8888ff]">$1</span>');
  }
}

// Identify important stats based on common valuable modifiers
export function identifyKeyStats(input: string | string[] = [], implicitStats: string[] = []): string[] {
  // If input is a string, parse it to extract stats
  let stats: string[] = [];
  
  // Early return if input is empty
  if (!input || (Array.isArray(input) && input.length === 0) || (typeof input === 'string' && input.trim() === '')) {
    return [];
  }
  
  if (typeof input === 'string') {
    // Extract implicit and explicit stats from item text
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    console.log("Item lines:", lines);
    
    // Special handling for belts and other items with implicit stats
    // Look for implicit stats that are between two separator lines
    let implicitSection: string[] = [];
    let foundImplicit = false;
    
    for (let i = 0; i < lines.length; i++) {
      // If we find a line with "to Strength" or other common implicit stats
      if (lines[i].match(/\+\d+ to (Strength|Dexterity|Intelligence|all Attributes)/i)) {
        implicitSection.push(lines[i]);
        foundImplicit = true;
      }
      
      // Also check for explicit "implicit" marker
      if (lines[i].toLowerCase().includes('implicit')) {
        foundImplicit = true;
        // Get the next line if it's not a separator
        if (i + 1 < lines.length && lines[i + 1] !== '--------') {
          implicitSection.push(lines[i + 1]);
        }
      }
    }
    
    if (foundImplicit && implicitSection.length > 0) {
      console.log("Found implicit stats:", implicitSection);
      implicitStats = [...implicitStats, ...implicitSection];
    }
    
    // Try multiple approaches to extract stats
    
    // First, identify key sections in the item text
    const sections: { [key: string]: string[] } = {
      implicit: [],
      explicit: [],
      crafted: [],
      enchant: [],
      other: []
    };
    
    let currentSection = 'other';
    
    // Process the item text line by line to identify sections
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip separator lines and identify section changes
      if (line === '--------') {
        // Check if the next line indicates a section
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].toLowerCase();
          if (nextLine.includes('implicit')) {
            currentSection = 'implicit';
            continue;
          } else if (nextLine.includes('explicit')) {
            currentSection = 'explicit';
            continue;
          } else if (nextLine.includes('crafted')) {
            currentSection = 'crafted';
            continue;
          } else if (nextLine.includes('enchant')) {
            currentSection = 'enchant';
            continue;
          }
        }
        
        // If we can't identify a specific section, just continue
        continue;
      }
      
      // Skip lines that are likely not stats
      if (line.match(/^(item level|rarity|requirements|sockets|item class|quality|--------)/i) ||
          line.match(/^(level|str|dex|int):/i) ||
          line.match(/^(implicit|explicit|crafted|enchant)$/i)) {
        continue;
      }
      
      // Add the line to the current section
      sections[currentSection].push(line);
    }
    
    console.log("Identified sections:", sections);
    
    // Combine all stats from all sections
    stats = [
      ...sections.implicit,
      ...sections.explicit,
      ...sections.crafted,
      ...sections.enchant,
      ...sections.other
    ];
    
    // If we didn't find any stats using the section approach, try the separator approach
    if (stats.length === 0) {
      // Approach 1: Look for sections after separator lines
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '--------') {
          // Check if the next line looks like a stat (not metadata)
          if (i + 1 < lines.length && 
              !lines[i + 1].match(/^(item level|rarity|requirements|sockets|item class|quality)/i) &&
              !lines[i + 1].match(/^(implicit|explicit|crafted|enchant)$/i) &&
              lines[i + 1] !== '--------') {
            
            // Extract stats until the next separator
            const extractedStats: string[] = [];
            let j = i + 1;
            
            while (j < lines.length && lines[j] !== '--------') {
              extractedStats.push(lines[j]);
              j++;
            }
            
            // If we found what look like stats, add them
            if (extractedStats.length > 0) {
              console.log("Approach 1 found stats:", extractedStats);
              stats = [...stats, ...extractedStats];
            }
          }
        }
      }
    }
    
    // If we still don't have stats, try pattern matching
    if (stats.length === 0) {
      // Look for lines that match common stat patterns
      const statPatterns = [
        /\+\d+/,                    // +X to something
        /\d+% (increased|reduced)/, // X% increased/reduced
        /\d+% to/,                  // X% to something
        /adds \d+/,                 // adds X damage
        /gain \d+/,                 // gain X on something
        /regenerate \d+/,           // regenerate X
        /\d+% chance/,              // X% chance to something
        /\(\d+-\d+\)/,              // Range values like (1-10)
        /\d+.\d+%/                  // Decimal percentages
      ];
      
      const patternMatches = lines.filter(line => 
        statPatterns.some(pattern => pattern.test(line)) &&
        !line.match(/^(item level|rarity|requirements|sockets|item class|quality|--------)/i) &&
        !line.match(/^(implicit|explicit|crafted|enchant)$/i)
      );
      
      if (patternMatches.length > 0) {
        console.log("Pattern matching found stats:", patternMatches);
        stats = [...stats, ...patternMatches];
      }
    }
    
    console.log("Final extracted stats:", stats);
  } else {
    stats = input;
  }
  
  const allStats = [...implicitStats, ...stats];
  const keyStats: string[] = [];
  
  // Patterns to look for in valuable stats
  const valuablePatterns = [
    // Life and ES
    { pattern: /(\+\d+) to maximum life/i, priority: 10 },
    { pattern: /(\d+)% increased maximum life/i, priority: 10 },
    { pattern: /(\+\d+) to maximum energy shield/i, priority: 9 },
    { pattern: /(\d+)% increased maximum energy shield/i, priority: 9 },
    
    // Resistances with high values
    { pattern: /((?:\+\d{1,3})%.*to (fire|cold|lightning|chaos|all) resistance)/i, priority: 8 },
    
    // Critical strike mods
    { pattern: /(\d+)% increased critical strike chance/i, priority: 7 },
    { pattern: /(\+\d+)% to critical strike multiplier/i, priority: 8 },
    
    // Damage mods
    { pattern: /(\d+)% increased (physical|elemental|spell|attack|projectile|area|chaos|fire|cold|lightning) damage/i, priority: 7 },
    { pattern: /adds (\d+) to (\d+) (physical|fire|cold|lightning|chaos) damage/i, priority: 6 },
    
    // Movement speed
    { pattern: /(\d{1,3})% increased movement speed/i, priority: 9 },
    
    // Attribute mods with high values
    { pattern: /(\+\d{1,}).*to (strength|dexterity|intelligence|all attributes)/i, priority: 6 },
    
    // Special mods
    { pattern: /gain (\d+) life (on|per) (kill|hit)/i, priority: 7 },
    { pattern: /(\d+)% chance to (dodge|block)/i, priority: 8 },
    { pattern: /(\d+)% increased attack speed/i, priority: 8 },
    { pattern: /(\d+)% increased cast speed/i, priority: 8 },
    { pattern: /(\d+)% increased mana regeneration/i, priority: 5 },
    
    // Influenced/special mods
    { pattern: /additional curse/i, priority: 10 },
    { pattern: /explode/i, priority: 10 },
    { pattern: /nearby enemies/i, priority: 8 },
    { pattern: /aura effect/i, priority: 9 },
    { pattern: /\+(\d+) to level of (all|socketed) (skill gems|gems)/i, priority: 10 },
    
    // Specific weapon mods
    { pattern: /(\d+)% increased physical damage/i, priority: 8 },
    { pattern: /adds (\d+) to (\d+) physical damage/i, priority: 7 },
    
    // Specific to the example item
    { pattern: /gain (\d+) life per enemy killed/i, priority: 8 },
    { pattern: /\+(\d+) to (strength|dexterity|intelligence)/i, priority: 7 },
    { pattern: /(\d+)% increased spell damage/i, priority: 8 },
    { pattern: /adds (\d+) to (\d+) (physical|cold) damage/i, priority: 7 },
    { pattern: /(\d+)% increased elemental damage/i, priority: 8 },
    { pattern: /(\d+)% increased evasion rating/i, priority: 6 },
    { pattern: /\+(\d+) to evasion rating/i, priority: 5 },
    { pattern: /(\d+)% increased stun and block recovery/i, priority: 4 }
  ];
  
  // Check each stat against valuable patterns and store with priority
  const statPriorities: { stat: string, priority: number }[] = [];
  
  allStats.forEach(stat => {
    for (const { pattern, priority } of valuablePatterns) {
      if (pattern.test(stat)) {
        // Extract numeric values to adjust priority
        const numericValues = stat.match(/\d+/g)?.map(Number) || [];
        const highestValue = Math.max(...numericValues, 0);
        
        // Adjust priority based on the value (higher values = higher priority)
        let adjustedPriority = priority;
        
        // For percentage-based stats, higher values are more valuable
        if (stat.includes('%')) {
          if (highestValue > 40) adjustedPriority += 3;
          else if (highestValue > 25) adjustedPriority += 2;
          else if (highestValue > 15) adjustedPriority += 1;
        }
        // For flat additions, higher values are more valuable
        else if (stat.includes('+')) {
          if (highestValue > 80) adjustedPriority += 3;
          else if (highestValue > 50) adjustedPriority += 2;
          else if (highestValue > 30) adjustedPriority += 1;
        }
        
        statPriorities.push({ stat, priority: adjustedPriority });
        break;
      }
    }
  });
  
  // Sort by priority (highest first)
  statPriorities.sort((a, b) => b.priority - a.priority);
  
  // Take the top 3 stats
  return statPriorities.slice(0, 3).map(item => item.stat);
}

// Tooltip component
function Tooltip({ children, text }: { children: React.ReactNode, text: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="relative inline-block">
      <div
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full right-0 mb-2 z-50 w-72 p-3 text-sm bg-[#0c0c0e] rounded shadow-lg border border-[#3d3d3d]"
          style={{
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-[#af6025]">Whisper Message</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="text-[#7f7f7f] hover:text-[#af6025]"
            >
              ✕
            </button>
          </div>
          <textarea 
            className="w-full p-2 bg-[#1a1a1a] rounded border border-[#3d3d3d] text-xs text-[#a38d6d] h-20 resize-none focus:border-[#af6025] focus:outline-none"
            value={text}
            readOnly
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-2 text-right">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(text);
                setIsVisible(false);
              }}
              className="px-3 py-1 text-xs bg-[#af6025] hover:bg-[#8f4e1d] text-[#f0d6a7] rounded border border-[#af6025]/50"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)' }}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemResult({ 
  items,
  message,
  POE_LEAGUE,
  searchId
}: ItemResultProps) {
  
  if (!items || items.length === 0) {
    return (
      <div className="text-center p-8 bg-[#1a1a1a] rounded-lg border border-[#3d3d3d] text-[#a38d6d]">
        <h3 className="text-xl mb-2">No items found matching your search.</h3>
        <p>Try a different item or check the official trade site for more options.</p>
        {searchId && (
          <div className="mt-4">
            <a 
              href={`https://www.pathofexile.com/trade/search/${POE_LEAGUE}/${searchId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#af6025] text-white rounded hover:bg-[#c27b3e] transition-colors"
            >
              View on official trade site
            </a>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`mb-4 p-4 rounded-lg border-2 ${getRarityBorderClass(item.rarity)} ${getRarityBgClass(item.rarity)} shadow-lg`}
            style={{ 
              boxShadow: item.rarity === 3 ? '0 0 15px rgba(217, 119, 6, 0.2)' : 
                        item.rarity === 2 ? '0 0 15px rgba(217, 119, 6, 0.1)' : 
                        'none',
              backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1))'
            }}
          >
            <div className="p-4">
              <div className="flex items-start">
                {item.icon && (
                  <div className="mr-4 flex-shrink-0">
                    <img 
                      src={item.icon} 
                      alt={item.name || item.baseType}
                      className="w-16 h-16 object-contain bg-gray-900 rounded border border-gray-700"
                    />
                  </div>
                )}
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-semibold ${getRarityClass(item.rarity)}`}>
                        {item.name ? (
                          <>
                            {item.name}
                            <span className="text-gray-400 ml-1">{item.baseType}</span>
                          </>
                        ) : (
                          item.baseType
                        )}
                      </h3>
                      <p className="text-gray-400 text-sm">Item Level: {item.itemLevel}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#0c0c0e] px-3 py-1 rounded border border-[#3d3d3d] h-[72px] min-w-[180px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="mb-1 relative">
                              <span className="text-[#7f7f7f] mr-1">Seller:</span>{' '}
                              <span className="text-[#a38d6d]">
                                {item.account.name}
                              </span>
                            </p>
                            <p className="text-[#7f7f7f] text-xs">
                              Listed: {item.listedAt}
                            </p>
                          </div>
                          
                          <div className="flex items-center mt-1 mr-1">
                            {item.account.online && (
                              <span className="relative flex items-center" title="Online">
                                <span className="relative inline-flex">
                                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-700"></span>
                                </span>
                              </span>
                            )}
                            {item.account.afk && (
                              <span className="relative flex items-center" title="AFK">
                                <span className="relative inline-flex">
                                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-700"></span>
                                </span>
                              </span>
                            )}
                            {item.account.dnd && (
                              <span className="relative flex items-center" title="Do Not Disturb">
                                <span className="relative inline-flex">
                                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-700"></span>
                                </span>
                              </span>
                            )}
                            {!item.account.online && !item.account.afk && !item.account.dnd && (
                              <span className="relative flex items-center" title="Offline">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-2">
                          <Tooltip text={item.whisper}>
                            <button className="px-3 py-1 text-xs bg-[#af6025] hover:bg-[#8f4e1d] text-[#f0d6a7] rounded flex items-center border border-[#af6025]/50" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                              Whisper
                            </button>
                          </Tooltip>
                          
                          <a 
                            href={item.links.trade} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-xs bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#a38d6d] rounded flex items-center border border-[#3d3d3d]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Trade
                          </a>
                          
                          {item.rarity === 3 && (
                            <a 
                              href={`https://www.poewiki.net/wiki/${encodeURIComponent(item.name.replace(/ /g, '_'))}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#a38d6d] rounded flex items-center border border-[#3d3d3d]"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Wiki
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-[#0c0c0e] px-3 py-1 rounded border border-[#3d3d3d] h-[72px] flex items-center justify-center">
                        <div className="flex items-center">
                          <span className="font-medium text-[#f0d6a7]">{item.price.amount}</span>
                          <Image 
                            src={getCurrencyImage(item.price.currency)} 
                            alt={item.price.currency}
                            width={20}
                            height={20}
                            className="object-contain ml-1"
                            unoptimized
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      {item.implicitStats && item.implicitStats.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[#7f7f7f] text-xs mb-1">Implicit</p>
                          <ul className="text-[#a38d6d] text-sm">
                            {item.implicitStats.map((stat, index) => (
                              <li key={`implicit-${index}`} dangerouslySetInnerHTML={{ __html: formatModText(stat) }} />
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {item.stats && item.stats.length > 0 && (
                        <div>
                          <p className="text-[#7f7f7f] text-xs mb-1">Explicit</p>
                          <ul className="text-[#a38d6d] text-sm">
                            {item.stats.map((stat, index) => (
                              <li key={`explicit-${index}`} dangerouslySetInnerHTML={{ __html: formatModText(stat) }} />
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-between">
                      {item.stats && item.implicitStats && (() => {
                        const keyStats = identifyKeyStats(item.stats, item.implicitStats);
                        return keyStats.length > 0 ? (
                          <div className="p-2 bg-[#0c0c0e] rounded border border-[#af6025] w-full mt-4 ml-[-4px]">
                            <p className="text-[#af6025] text-xs font-semibold mb-1">Key Value</p>
                            <ul className="text-[#f0d6a7] text-sm">
                              {keyStats.map((stat, index) => (
                                <li key={`key-${index}`} className="flex items-center">
                                  <span className="text-[#af6025] mr-2">•</span>
                                  <span dangerouslySetInnerHTML={{ __html: formatModText(stat) }} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Message about API limitations removed as requested */}
    </div>
  );
}

export default ItemResult;
