/**
 * Ad Configuration
 * 
 * Central configuration for managing ad settings across the site.
 * 
 * Layout Notes:
 * - Full-width layout: Container expands to fill the entire screen width
 * - Responsive padding: Uses clamp() for smart padding that scales with screen size
 * - Content/sidebar ratio: 3/4 to 1/4 when ads are enabled
 * - Large screens: Additional padding for improved readability
 *
 * AdSense Implementation:
 * - Publisher ID: ca-pub-4543471446143087
 * - Note: Replace placeholder slot values with actual AdSense ad unit slot IDs
 * - Format mapping: 'horizontal' = leaderboard/banner, 'vertical' = skyscraper, 'rectangle' = medium rectangle
 */

// Master switch to enable/disable ads site-wide
// For testing, we're enabling this regardless of environment
// Later, this would be: process.env.NODE_ENV === 'production'
export const ADS_ENABLED = true;

// Page-specific ad configurations
export const PAGE_AD_CONFIG = {
  // Home page ad configuration
  home: {
    enabled: true, // Can be used to disable ads on specific pages
    adUnits: {
      topBanner: {
        id: 'home-top',
        format: 'horizontal',
        slot: '' // Will be filled with actual AdSense slot ID later
      },
      midContent1: {
        id: 'home-mid-1',
        format: 'horizontal',
        slot: ''
      },
      midContent2: {
        id: 'home-mid-2',
        format: 'horizontal',
        slot: ''
      },
      sidebar1: {
        id: 'home-sidebar-1',
        format: 'vertical',
        slot: ''
      },
      sidebar2: {
        id: 'home-sidebar-2',
        format: 'vertical',
        slot: ''
      },
      bottom: {
        id: 'home-bottom',
        format: 'horizontal',
        slot: ''
      }
    }
  },
  
  // Similar vehicles results ads
  similarVehicles: {
    enabled: true,
    // How many vehicle results to show before inserting an ad
    frequency: 2,
    adUnits: {
      inResults: {
        id: 'similar-vehicles-result',
        format: 'rectangle',
        slot: ''
      }
    }
  },
  
  // Fuel savings calculator page ads
  fuelSavings: {
    enabled: true,
    adUnits: {
      topBanner: {
        id: 'fuel-savings-top',
        format: 'horizontal',
        slot: ''
      },
      belowCalculator: {
        id: 'fuel-savings-below-calc',
        format: 'horizontal',
        slot: ''
      },
      betweenResults: {
        id: 'fuel-savings-between-results',
        format: 'horizontal',
        slot: ''
      },
      betweenGraphs: {
        id: 'fuel-savings-between-graphs',
        format: 'horizontal',
        slot: ''
      },
      sidebar: {
        id: 'fuel-savings-sidebar',
        format: 'vertical',
        slot: ''
      },
      bottom: {
        id: 'fuel-savings-bottom',
        format: 'horizontal',
        slot: ''
      }
    }
  },

  // Vehicles page ad configuration
  vehicles: {
    enabled: true,
    adUnits: {
      topBanner: {
        id: 'vehicles-top',
        format: 'horizontal',
        slot: ''
      },
      sidebar: {
        id: 'vehicles-sidebar',
        format: 'vertical',
        slot: ''
      },
      inContent: {
        id: 'vehicles-content',
        format: 'horizontal',
        slot: ''
      },
      bottom: {
        id: 'vehicles-bottom',
        format: 'horizontal',
        slot: ''
      }
    }
  },

  // Individual vehicle detail page ad configuration
  vehicleDetail: {
    enabled: true,
    adUnits: {
      topBanner: {
        id: 'vehicle-detail-top',
        format: 'horizontal',
        slot: ''
      },
      afterSummary: {
        id: 'vehicle-detail-summary',
        format: 'horizontal',
        slot: ''
      },
      sidebar: {
        id: 'vehicle-detail-sidebar',
        format: 'vertical',
        slot: ''
      },
      inContent: {
        id: 'vehicle-detail-variants',
        format: 'horizontal',
        slot: ''
      },
      beforeSimilar: {
        id: 'vehicle-detail-similar',
        format: 'horizontal',
        slot: ''
      },
      bottom: {
        id: 'vehicle-detail-bottom',
        format: 'horizontal',
        slot: ''
      }
    }
  },
  
  // Fuel economy compare page ad configuration
  fuelEconomyCompare: {
    enabled: true,
    adUnits: {
      topBanner: {
        id: 'compare-top',
        format: 'horizontal',
        slot: ''
      },
      betweenComparison: {
        id: 'compare-between',
        format: 'horizontal',
        slot: ''
      },
      inContentComparison: {
        id: 'compare-in-content',
        format: 'horizontal',
        slot: ''
      },
      sidebar: {
        id: 'compare-sidebar',
        format: 'vertical',
        slot: ''
      },
      bottom: {
        id: 'compare-bottom',
        format: 'horizontal',
        slot: ''
      }
    }
  },
  
  // We'll add more page types in future phases
  // Example structure for reference:
  /*
  fuelEconomyCompare: {
    enabled: true,
    adUnits: {
      // Ad units for vehicle comparison page
    }
  }
  */
}; 