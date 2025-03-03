import React from 'react';
import Image from 'next/image';

interface PriceRecommendationProps {
  marketPrice: number;
  idealPrice: number;
  greedyPrice: number;
  currency: string;
}

const PriceRecommendation: React.FC<PriceRecommendationProps> = ({
  marketPrice,
  idealPrice,
  greedyPrice,
  currency
}) => {
  // Format price with appropriate precision
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return (price / 1000).toFixed(1) + 'k';
    } else if (price >= 100) {
      return price.toFixed(0);
    } else if (price >= 10) {
      return price.toFixed(0);
    } else {
      return price.toFixed(1);
    }
  };

  // Get currency image based on currency type
  const getCurrencyImage = (currency: string): string => {
    switch (currency.toLowerCase()) {
      // High-value currencies
      case 'mirror':
      case 'mirror of kalandra':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyDuplicate.png';
      case 'divine':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png';
      case 'exalted':
      case 'ex':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToRare.png';
      
      // Mid-value currencies
      case 'chaos':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png';
      case 'ancient':
      case 'ancient orb':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/AncientOrb.png';
      case 'annulment':
      case 'orb of annulment':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/AnnullOrb.png';
      case 'awakened sextant':
      case 'sextant':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/AtlasSextants/SextantRed.png';
      case 'elevated sextant':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/AtlasSextants/SextantRedPlus.png';
      case 'veiled chaos':
      case 'veiled chaos orb':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/VeiledChaosOrb.png';
      
      // Common currencies
      case 'alchemy':
      case 'alch':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToRare.png';
      case 'alteration':
      case 'alt':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollMagic.png';
      case 'fusing':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketLinks.png';
      case 'jeweller':
      case 'jewellers':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketNumbers.png';
      case 'chromatic':
      case 'chrome':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketColours.png';
      case 'vaal':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyVaal.png';
      case 'regal':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeMagicToRare.png';
      case 'blessed':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyImplicitMod.png';
      case 'chisel':
      case 'cartographer\'s chisel':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyMapQuality.png';
      case 'scouring':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyConvertToNormal.png';
      case 'regret':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyPassiveSkillRefund.png';
      case 'chance':
      case 'orb of chance':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeRandomly.png';
      case 'gemcutter\'s prism':
      case 'gcp':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyGemQuality.png';
      
      // Fragment currencies
      case 'maven\'s invitation':
      case 'maven invitation':
        return 'https://web.poecdn.com/image/Art/2DItems/Maps/MavenInvitation.png';
      case 'scarab':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Scarabs/ScarabHarbinger.png';
      case 'gilded scarab':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Scarabs/ScarabHarbingerGold.png';
      case 'polished scarab':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Scarabs/ScarabHarbingerSilver.png';
      case 'rusted scarab':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Scarabs/ScarabHarbingerBronze.png';
      case 'winged scarab':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Scarabs/ScarabHarbingerWinged.png';
      
      // Essence currencies
      case 'essence':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Essence/Woe7.png';
      case 'deafening essence':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Essence/Woe7.png';
      case 'shrieking essence':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Essence/Woe6.png';
      
      // Fossil currencies
      case 'fossil':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/DelveSocketableCurrency/MetallicFossil.png';
      case 'resonator':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Delve/ResonatorPrimePrime.png';
      
      // Harvest currencies
      case 'lifeforce':
      case 'sacred lifeforce':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Harvest/LifeforceSacred.png';
      case 'wild lifeforce':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Harvest/LifeforceWild.png';
      case 'vivid lifeforce':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Harvest/LifeforceVivid.png';
      case 'primal lifeforce':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Harvest/LifeforcePrimal.png';
      
      // Breach currencies
      case 'blessing':
      case 'blessing of chayula':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachUpgraderChayula.png';
      case 'splinter':
      case 'splinter of chayula':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachShardChayula.png';
      
      // Legion currencies
      case 'timeless jewel':
        return 'https://web.poecdn.com/image/Art/2DItems/Jewels/TimelessJewel.png';
      case 'timeless emblem':
        return 'https://web.poecdn.com/image/Art/2DItems/Maps/TimelessMaraketh.png';
      case 'timeless splinter':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Legion/LegionSplinterMaraketh.png';
      
      // Catalysts
      case 'catalyst':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Catalysts/IntrinsicCatalyst.png';
      
      // Oils
      case 'oil':
      case 'golden oil':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Oils/GoldenOil.png';
      case 'silver oil':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Oils/SilverOil.png';
      case 'opalescent oil':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/Oils/OpalOil.png';
      
      // Divination cards
      case 'card':
      case 'divination card':
        return 'https://web.poecdn.com/image/Art/2DItems/Divination/InventoryIcon.png';
      
      // Basic currencies
      case 'transmutation':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToMagic.png';
      case 'augmentation':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToMagic.png';
      case 'wisdom':
      case 'scroll of wisdom':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyIdentification.png';
      case 'portal':
      case 'portal scroll':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyPortal.png';
      case 'armourer\'s scrap':
      case 'scrap':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyArmourQuality.png';
      case 'blacksmith\'s whetstone':
      case 'whetstone':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyWeaponQuality.png';
      case 'glassblower\'s bauble':
      case 'bauble':
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyFlaskQuality.png';
      
      // Default to chaos if unknown
      default:
        return 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png';
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-[#3d3d3d]">
      <h2 className="text-xl font-bold mb-4 text-[#af6025]">This Items Worth</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-[#0c0c0e] rounded border border-[#3d3d3d]">
          <span className="text-green-500 font-medium text-xs">Market Sell Price</span>
          <div className="flex items-center">
            <span className="text-green-500 font-bold text-sm mr-1">{formatPrice(marketPrice)}</span>
            <Image 
              src={getCurrencyImage(currency)} 
              alt={currency}
              width={20}
              height={20}
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-[#0c0c0e] rounded border border-[#3d3d3d]">
          <span className="text-yellow-500 font-medium text-xs">Recommended Sell Price</span>
          <div className="flex items-center">
            <span className="text-yellow-500 font-bold text-sm mr-1">{formatPrice(idealPrice)}</span>
            <Image 
              src={getCurrencyImage(currency)} 
              alt={currency}
              width={20}
              height={20}
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-[#0c0c0e] rounded border border-[#3d3d3d]">
          <span className="text-red-500 font-medium text-xs">Premium Sell Price</span>
          <div className="flex items-center">
            <span className="text-red-500 font-bold text-sm mr-1">{formatPrice(greedyPrice)}</span>
            <Image 
              src={getCurrencyImage(currency)} 
              alt={currency}
              width={20}
              height={20}
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-[#7f7f7f]">
        <p className="mb-1"><span className="text-green-500 font-medium">Market:</span> Price at which similar items sell quickly</p>
        <p className="mb-1"><span className="text-yellow-500 font-medium">Recommended:</span> Balanced price for fair value</p>
        <p><span className="text-red-500 font-medium">Premium:</span> Higher price for valuable mods</p>
      </div>
    </div>
  );
};

export default PriceRecommendation;
