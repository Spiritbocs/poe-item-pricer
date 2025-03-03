import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { promises as fsPromises } from 'fs';

// Define the directory where we'll store our currency images
const CURRENCY_IMAGE_DIR = path.join(process.cwd(), 'public', 'currency-images');

// Ensure the directory exists
async function ensureDirectoryExists() {
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
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    
    const localPath = path.join(CURRENCY_IMAGE_DIR, filename);
    await fsPromises.writeFile(localPath, response.data);
    
    // Return the public URL path
    return `/currency-images/${filename}`;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    throw error;
  }
}

// Function to get a currency image - checks local cache first, downloads if not available
export async function getCurrencyImage(currencyName: string, externalUrl: string): Promise<string> {
  await ensureDirectoryExists();
  
  // Sanitize the currency name for use as a filename
  const sanitizedName = currencyName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const filename = `${sanitizedName}.png`;
  const localPath = path.join(CURRENCY_IMAGE_DIR, filename);
  
  try {
    // Check if we already have this image
    await fsPromises.access(localPath);
    // If no error, file exists, return the public path
    return `/currency-images/${filename}`;
  } catch (error) {
    // File doesn't exist, download it
    try {
      return await downloadImage(externalUrl, filename);
    } catch (downloadError) {
      // If download fails, try the wiki as a fallback
      try {
        // Construct the wiki URL
        const wikiUrl = `https://www.poewiki.net/w/images/${sanitizedName.charAt(0).toUpperCase()}/${sanitizedName.charAt(0).toUpperCase()}${sanitizedName.charAt(1).toUpperCase()}/${sanitizedName}.png`;
        return await downloadImage(wikiUrl, filename);
      } catch (wikiError) {
        console.error(`Failed to download from wiki as well:`, wikiError);
        // Return a default image path
        return '/fallback-currency-icon.png';
      }
    }
  }
}

// Function to download all known currency images from the wiki
export async function downloadAllCurrencyImages(currencyList: string[]): Promise<void> {
  await ensureDirectoryExists();
  
  console.log(`Starting download of ${currencyList.length} currency images...`);
  
  for (const currency of currencyList) {
    try {
      const sanitizedName = currency.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filename = `${sanitizedName}.png`;
      const localPath = path.join(CURRENCY_IMAGE_DIR, filename);
      
      // Check if we already have this image
      try {
        await fsPromises.access(localPath);
        console.log(`Image for ${currency} already exists.`);
        continue; // Skip if already exists
      } catch {
        // File doesn't exist, continue to download
      }
      
      // Try to download from the wiki
      const wikiUrl = `https://www.poewiki.net/wiki/File:${currency.replace(/ /g, '_')}_inventory_icon.png`;
      console.log(`Downloading ${currency} from ${wikiUrl}...`);
      
      // This is a more complex operation as we need to extract the actual image URL from the wiki page
      const response = await axios.get(wikiUrl);
      const html = response.data;
      
      // Extract the actual image URL from the wiki page
      const match = html.match(/fullImageLink"[^>]*><a[^>]*><img[^>]*src="([^"]+)"/);
      if (match && match[1]) {
        const imageUrl = match[1].startsWith('//') ? `https:${match[1]}` : match[1];
        await downloadImage(imageUrl, filename);
        console.log(`Downloaded ${currency} image.`);
      } else {
        console.error(`Could not find image URL for ${currency} on the wiki.`);
      }
    } catch (error) {
      console.error(`Error processing ${currency}:`, error);
    }
  }
  
  console.log('Finished downloading currency images.');
}

// Export a function to get the local path for a currency
export function getLocalCurrencyImagePath(currencyName: string): string {
  const sanitizedName = currencyName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `/currency-images/${sanitizedName}.png`;
}
