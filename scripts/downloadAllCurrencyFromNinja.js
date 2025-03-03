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

// Function to fetch all currency data from poe.ninja
async function fetchAllCurrencyData() {
  try {
    console.log('Fetching currency data from poe.ninja...');
    
    // Get currency data
    const currencyResponse = await axios.get('https://poe.ninja/api/data/currencyoverview?league=Phrecia&type=Currency');
    const fragmentResponse = await axios.get('https://poe.ninja/api/data/currencyoverview?league=Phrecia&type=Fragment');
    
    // Extract currency details with images
    const currencyDetails = currencyResponse.data.currencyDetails || [];
    const fragmentDetails = fragmentResponse.data.currencyDetails || [];
    
    // Combine all currency details
    const allDetails = [...currencyDetails, ...fragmentDetails];
    
    console.log(`Found ${allDetails.length} currency items on poe.ninja`);
    return allDetails;
  } catch (error) {
    console.error('Error fetching currency data:', error.message);
    return [];
  }
}

// Main function to run the script
async function main() {
  try {
    await ensureDirectoryExists();
    
    // Get all currency data from poe.ninja
    const allCurrencyItems = await fetchAllCurrencyData();
    
    if (allCurrencyItems.length === 0) {
      console.error('No currency items found. Exiting.');
      return;
    }
    
    console.log(`Starting download of ${allCurrencyItems.length} currency images...`);
    
    const currencyMap = {};
    
    for (const item of allCurrencyItems) {
      try {
        if (!item.name || !item.icon) {
          console.log(`Skipping item with missing name or icon: ${JSON.stringify(item)}`);
          continue;
        }
        
        const sanitizedName = item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const filename = `${sanitizedName}.png`;
        
        // Download the image from poe.ninja's CDN
        const result = await downloadImage(item.icon, filename);
        
        if (result) {
          currencyMap[item.name] = result;
        }
        
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing ${item.name}:`, error.message);
      }
    }
    
    // Save the currency map
    await fs.promises.writeFile(
      path.join(CURRENCY_IMAGE_DIR, 'currency-map.json'),
      JSON.stringify(currencyMap, null, 2)
    );
    
    console.log(`Finished downloading ${Object.keys(currencyMap).length} currency images and created currency map.`);
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

// Run the script
main().catch(error => console.error('Unhandled error:', error.message));
