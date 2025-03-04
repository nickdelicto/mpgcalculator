export const PREFERRED_EV_CHARGERS = {
  // Our curated list of preferred/verified chargers
  preferredAsins: [
    'B0C6YMS4KH',  // ChargePoint
    'B0BZRTD9VS',  // EVIQO
    'B0DGQ5MXGK',  // Elecq
    'B0BWSK35WH',  // Tesla
    'B08BFB56KF',  // Additional charger
    'B0BDLQMR51',  // Additional charger
    'B0D2NPCGYB'   // Additional charger
  ],
  settings: {
    maxDisplay: 12,          // Show up to 12 products
    minPreferred: 7,         // Always show all preferred products
    searchTerm: "EV Charger Level 2", // Search term for additional products
    searchFilters: {
      minRating: 4,          // Minimum rating for additional products
      minReviews: 50,        // Minimum number of reviews
      priceRange: {
        min: 200,            // Minimum price
        max: 1000           // Maximum price
      }
    },
    randomize: true,         // Randomize selection of additional products
    cacheTime: 21600        // 6 hours in seconds
  }
} 