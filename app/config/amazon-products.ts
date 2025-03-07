export const VEHICLE_PAGES_PRODUCTS = {
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
  // Additional automotive accessories
  additionalAsins: [
    'B0CC1FLWXP',  // DENVIX Tire Inflator
    'B015TKSSB8',  // NOCO GB150 Jump Starter
    'B08WZFPXFM',  // NOCO GBX155 Power Bank
    'B09NNGMZNQ',  // MeeFar Car Carrier
    'B0C6YBHKJ5',  // Car Vacuum
    'B073CQMF25',  // Autel Scanner
    'B0BJQMTY48',  // Car Cleaning Kit
    'B00IPS4APU'   // Rain-X Windshield Repair
  ],
  settings: {
    maxDisplay: 7,           // Show exactly 7 products
    minPreferred: 3,         // Always show at least 3 preferred products
    fixedPositions: {        // Fixed position rules
      first: 'preferred',    // Position 1 must be preferred
      fifth: 'preferred',    // Position 5 must be preferred
      seventh: 'preferred'   // Position 7 must be preferred
    },
    searchTerm: "EV Charger Level 2",
    searchFilters: {
      minRating: 4,
      minReviews: 50,
      priceRange: {
        min: 200,
        max: 1000
      }
    },
    randomize: true,
    cacheTime: 21600
  }
} 