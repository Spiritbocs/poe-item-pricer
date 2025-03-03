# Path of Exile Price Checker

A web-based tool to quickly check the price of items in Path of Exile by pasting item data directly from the game. This tool uses the official Path of Exile Trade API to provide accurate pricing information.

## Features

- Paste item data directly from Path of Exile (Ctrl+C in-game, Ctrl+V in the app)
- Get real-time price estimates based on similar items on the trade site
- Links to the official trade site for each search
- Links to the Wiki for more information about the item
- Mobile-friendly design

## How It Works

1. The app parses pasted item data to extract the item name, type, and stats
2. It then creates a search query for the Path of Exile Trade API using these parameters
3. The results are displayed in a clean, easy-to-read format with links to the official trade site

## API Integration

The app directly integrates with the official Path of Exile Trade API:

1. The front-end sends item data to the Next.js API route
2. The API route parses the item data and constructs a search query according to the PoE API specifications
3. The query is sent to the Path of Exile Trade API to search for matching items
4. The search results are returned, and a second API call fetches the specific details for those items
5. The results are processed and returned to the front-end

## Statistics Parsing

The app extracts item statistics from pasted item text and uses them to create more accurate search queries. Statistics are matched against known Path of Exile stat IDs to allow for precise filtering in accordance with the official API documentation.

## Caching

To reduce the number of API calls and improve performance, the application implements a caching system:

- Search results are cached for 5 minutes
- Each cache entry includes the item data and search ID
- The cache is keyed by a normalized version of the search query

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application can be deployed to Vercel or any other hosting service that supports Next.js applications. For the best performance, consider using a serverless function for the API proxy to avoid CORS issues.

## Future Improvements

- Implement a machine learning-based price prediction system similar to poeprices.info
- Add support for more item types and stat combinations
- Improve the UI/UX with more filtering options and visualization of price trends
- Add the ability to save search history

## Data Sources

This application uses data from the official [Path of Exile Trade API](https://www.pathofexile.com/developer/docs/index).

## Credits

- Game data provided by [Grinding Gear Games](https://www.grindinggear.com/)
- Path of Exile is a trademark of Grinding Gear Games

## Legal

This project is not affiliated with or endorsed by Grinding Gear Games. All game assets and trade data belong to their respective owners.
