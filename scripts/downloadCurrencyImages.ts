const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

// Define the directory where we'll store our currency images
const CURRENCY_IMAGE_DIR: string = path.join(process.cwd(), 'public', 'currency-images');

// Define interfaces for our data types
interface CurrencyMap {
  [key: string]: string;
}

// Ensure the directory exists
async function ensureDirectoryExists(): Promise<void> {
  try {
    await fsPromises.access(CURRENCY_IMAGE_DIR);
  } catch (error) {
    await fsPromises.mkdir(CURRENCY_IMAGE_DIR, { recursive: true });
    console.log(`Created directory: ${CURRENCY_IMAGE_DIR}`);
  }
}

// Function to download an image from a URL and save it locally
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    console.log(`Downloading from ${url} to ${filename}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      maxRedirects: 5
    });
    
    const localPath: string = path.join(CURRENCY_IMAGE_DIR, filename);
    await fsPromises.writeFile(localPath, response.data);
    
    // Return the public URL path
    return `/currency-images/${filename}`;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Function to scrape the PoE Wiki for currency items
async function scrapeCurrencyFromWiki(): Promise<string[]> {
  try {
    console.log('Scraping currency list from PoE Wiki...');
    const response = await axios.get('https://www.poewiki.net/wiki/Currency');
    const $ = cheerio.load(response.data);
    
    const currencies: string[] = [];
    
    // Find all currency items on the page
    $('.item-box').each((i: number, element: any) => {
      const currencyName: string = $(element).find('.header').text().trim();
      if (currencyName) {
        currencies.push(currencyName);
      }
    });
    
    console.log(`Found ${currencies.length} currencies on the wiki.`);
    return currencies;
  } catch (error) {
    console.error('Error scraping currency from wiki:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// Function to get the direct image URL from the wiki file page
async function getDirectImageUrl(currencyName: string): Promise<string | null> {
  try {
    const formattedName: string = currencyName.replace(/ /g, '_');
    const filePageUrl: string = `https://www.poewiki.net/wiki/File:${formattedName}_inventory_icon.png`;
    
    console.log(`Fetching file page: ${filePageUrl}`);
    const response = await axios.get(filePageUrl, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // Find the direct image link on the file page
    const imageLink: string | undefined = $('a.internal').attr('href');
    
    if (imageLink) {
      console.log(`Found direct image URL: ${imageLink}`);
      return imageLink;
    }
    
    // Try alternative format (without inventory_icon)
    const altFilePageUrl: string = `https://www.poewiki.net/wiki/File:${formattedName}.png`;
    console.log(`Trying alternative file page: ${altFilePageUrl}`);
    
    const altResponse = await axios.get(altFilePageUrl, { timeout: 10000 });
    const alt$ = cheerio.load(altResponse.data);
    
    const altImageLink: string | undefined = alt$('a.internal').attr('href');
    
    if (altImageLink) {
      console.log(`Found alternative direct image URL: ${altImageLink}`);
      return altImageLink;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting direct image URL for ${currencyName}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Function to download currency images from the wiki
async function downloadCurrencyImages(currencies: string[]): Promise<void> {
  await ensureDirectoryExists();
  
  console.log(`Starting download of ${currencies.length} currency images...`);
  
  const currencyMap: CurrencyMap = {};
  
  for (const currency of currencies) {
    try {
      const sanitizedName: string = currency.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filename: string = `${sanitizedName}.png`;
      const localPath: string = path.join(CURRENCY_IMAGE_DIR, filename);
      
      // Check if we already have this image
      try {
        await fsPromises.access(localPath);
        console.log(`Image for ${currency} already exists.`);
        currencyMap[currency] = `/currency-images/${filename}`;
        continue; // Skip if already exists
      } catch {
        // File doesn't exist, continue to download
      }
      
      // Get the direct image URL from the wiki
      const directUrl: string | null = await getDirectImageUrl(currency);
      
      if (directUrl) {
        await downloadImage(directUrl, filename);
        console.log(`Successfully downloaded ${currency} image.`);
        currencyMap[currency] = `/currency-images/${filename}`;
      } else {
        console.error(`Could not find a valid image URL for ${currency}`);
      }
    } catch (error) {
      console.error(`Error processing ${currency}:`, error instanceof Error ? error.message : String(error));
    }
    
    // Add a small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save the currency map
  await fsPromises.writeFile(
    path.join(CURRENCY_IMAGE_DIR, 'currency-map.json'),
    JSON.stringify(currencyMap, null, 2)
  );
  
  console.log('Finished downloading currency images and created currency map.');
}

// Add known currencies that might not be on the main page
const KNOWN_CURRENCIES: string[] = [
  "Chaos Orb", "Exalted Orb", "Divine Orb", "Mirror of Kalandra",
  "Orb of Alchemy", "Orb of Alteration", "Orb of Annulment", "Orb of Binding",
  "Orb of Chance", "Orb of Fusing", "Orb of Horizons", "Orb of Regret",
  "Orb of Scouring", "Orb of Transmutation", "Regal Orb", "Vaal Orb",
  "Blessed Orb", "Cartographer's Chisel", "Chromatic Orb", "Engineer's Orb",
  "Gemcutter's Prism", "Glassblower's Bauble", "Jeweller's Orb", "Portal Scroll",
  "Scroll of Wisdom", "Silver Coin", "Awakener's Orb", "Crusader's Exalted Orb",
  "Hunter's Exalted Orb", "Redeemer's Exalted Orb", "Warlord's Exalted Orb",
  "Ancient Orb", "Harbinger's Orb", "Stacked Deck", "Timeless Karui Splinter",
  "Timeless Maraketh Splinter", "Timeless Eternal Empire Splinter", "Timeless Templar Splinter",
  "Timeless Vaal Splinter", "Simulacrum Splinter", "Delirium Orb", "Awakened Sextant",
  "Prime Sextant", "Simple Sextant", "Veiled Chaos Orb", "Ritual Vessel",
  "Orb of Unmaking", "Maven's Invitation", "Crescent Splinter", "Sacred Orb",
  "Mirror Shard", "Hinekora's Lock", "Fracturing Orb", "Reflecting Mist",
  "Hunter's Exalted Orb", "Voidborn Reliquary Key", "Warlord's Exalted Orb",
  "Veiled Orb", "Chayula's Flawless Breachstone", "Blessing of Chayula"
];

// Main function to run the script
async function main(): Promise<void> {
  try {
    // Get currencies from the wiki
    const wikiCurrencies: string[] = await scrapeCurrencyFromWiki();
    
    // Combine and deduplicate
    const allCurrencies: string[] = Array.from(new Set([...wikiCurrencies, ...KNOWN_CURRENCIES]));
    console.log(`Total currencies to process: ${allCurrencies.length}`);
    
    // Download images
    await downloadCurrencyImages(allCurrencies);
    
    console.log('Script completed successfully.');
  } catch (error) {
    console.error('Error in main function:', error instanceof Error ? error.message : String(error));
  }
}

// Run the script
main().catch(error => console.error('Unhandled error:', error instanceof Error ? error.message : String(error)));
