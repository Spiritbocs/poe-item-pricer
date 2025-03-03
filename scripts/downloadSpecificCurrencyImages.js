const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Define the directory where we'll store our currency images
const CURRENCY_IMAGE_DIR = path.join(process.cwd(), 'public', 'currency-images');

// Ensure the directory exists
async function ensureDirectoryExists() {
  try {
    await fs.promises.access(CURRENCY_IMAGE_DIR);
  } catch (error) {
    await fs.promises.mkdir(CURRENCY_IMAGE_DIR, { recursive: true });
    console.log(`Created directory: ${CURRENCY_IMAGE_DIR}`);
  }
}

// Function to download an image from a URL and save it locally
async function downloadImage(url, filename) {
  try {
    console.log(`Downloading from ${url} to ${filename}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 10000,
      maxRedirects: 5
    });
    
    const localPath = path.join(CURRENCY_IMAGE_DIR, filename);
    await fs.promises.writeFile(localPath, response.data);
    console.log(`Successfully saved ${filename}`);
    
    return `/currency-images/${filename}`;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
    return null;
  }
}

// List of specific currencies we want to download
const CURRENCIES = [
  "Mirror of Kalandra",
  "Hinekora's Lock",
  "Mirror Shard",
  "Awakener's Orb",
  "Fracturing Orb",
  "Reflecting Mist",
  "Hunter's Exalted Orb",
  "Voidborn Reliquary Key",
  "Warlord's Exalted Orb",
  "Veiled Chaos Orb",
  "Divine Orb",
  "Chayula's Flawless Breachstone",
  "Blessing of Chayula",
  "Chaos Orb",
  "Exalted Orb"
];

// Main function to run the script
async function main() {
  try {
    await ensureDirectoryExists();
    
    console.log(`Starting download of ${CURRENCIES.length} currency images...`);
    
    const currencyMap = {};
    
    for (const currency of CURRENCIES) {
      try {
        const sanitizedName = currency.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const filename = `${sanitizedName}.png`;
        
        // Create the redirect URL
        const formattedName = currency.replace(/ /g, '_');
        const redirectUrl = `https://www.poewiki.net/wiki/Special:Redirect/file/${encodeURIComponent(formattedName)}_inventory_icon.png`;
        
        console.log(`Trying ${redirectUrl} for ${currency}`);
        const result = await downloadImage(redirectUrl, filename);
        
        if (result) {
          currencyMap[currency] = result;
        } else {
          // Try alternative URL without inventory_icon
          const altRedirectUrl = `https://www.poewiki.net/wiki/Special:Redirect/file/${encodeURIComponent(formattedName)}.png`;
          console.log(`Trying alternative ${altRedirectUrl} for ${currency}`);
          const altResult = await downloadImage(altRedirectUrl, filename);
          
          if (altResult) {
            currencyMap[currency] = altResult;
          } else {
            console.error(`Failed to download image for ${currency}`);
          }
        }
        
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error processing ${currency}:`, error.message);
      }
    }
    
    // Save the currency map
    await fs.promises.writeFile(
      path.join(CURRENCY_IMAGE_DIR, 'currency-map.json'),
      JSON.stringify(currencyMap, null, 2)
    );
    
    console.log('Finished downloading currency images and created currency map.');
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

// Run the script
main().catch(error => console.error('Unhandled error:', error.message));
