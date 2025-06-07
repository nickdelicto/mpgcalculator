/**
 * POI Control Synchronization Utility
 * 
 * This utility provides functions to ensure POI controls in different
 * parts of the UI stay visually synchronized.
 */

/**
 * Synchronizes POI controls that share the same data-poi-id attribute
 * across different components.
 */
export function initPOIControlSync() {
  if (typeof window === 'undefined') return;
  
  console.log('[POI Sync] Initializing POI control synchronization');
  
  // Clean up any existing listeners first
  cleanupPOIControlSync();
  
  // Find all POI control buttons
  const poiButtons = document.querySelectorAll('.poi-control-button[data-poi-id]');
  console.log(`[POI Sync] Found ${poiButtons.length} POI control buttons`);
  
  // Log button details
  poiButtons.forEach(button => {
    const poiId = button.getAttribute('data-poi-id');
    const isActive = button.getAttribute('data-active') === 'true';
    const parent = button.closest('[data-testid]')?.getAttribute('data-testid') || 'unknown';
    console.log(`[POI Sync] Button: ${poiId}, Active: ${isActive}, Parent: ${parent}`);
  });
  
  // For each button, add a mutation observer to watch for data-active changes
  poiButtons.forEach(button => {
    const poiId = button.getAttribute('data-poi-id');
    if (!poiId) return;
    
    // Create a mutation observer for this button
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-active') {
          const isActive = button.getAttribute('data-active') === 'true';
          console.log(`POI button "${poiId}" changed to ${isActive ? 'active' : 'inactive'}`);
          
          // Find all other buttons with the same POI ID and update them
          const otherButtons = document.querySelectorAll(`.poi-control-button[data-poi-id="${poiId}"]`);
          otherButtons.forEach(otherBtn => {
            if (otherBtn !== button) {
              otherBtn.setAttribute('data-active', isActive ? 'true' : 'false');
              otherBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
              
              // Update class list if needed
              if (isActive) {
                otherBtn.classList.add('poi-control-active');
                
                // Check if this is a MapPOIControls button (uses inline styles)
                const parent = otherBtn.closest('[data-testid]')?.getAttribute('data-testid');
                if (parent === 'map-poi-controls') {
                  // Find the category color from POI_CATEGORIES
                  const poiId = otherBtn.getAttribute('data-poi-id');
                  const poiCategoryColors = {
                    'gasStations': '#FF3B30',
                    'evCharging': '#34C759',
                    'hotels': '#007AFF',
                    'restaurants': '#FF9500',
                    'attractions': '#AF52DE'
                  };
                  
                  // Apply the color as inline style
                  const color = poiCategoryColors[poiId as keyof typeof poiCategoryColors] || '#007AFF';
                  (otherBtn as HTMLElement).style.backgroundColor = color;
                  (otherBtn as HTMLElement).style.color = 'white';
                  (otherBtn as HTMLElement).style.opacity = '0.9';
                }
              } else {
                otherBtn.classList.remove('poi-control-active');
                
                // Check if this is a MapPOIControls button
                const parent = otherBtn.closest('[data-testid]')?.getAttribute('data-testid');
                if (parent === 'map-poi-controls') {
                  // Reset to default style
                  (otherBtn as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  (otherBtn as HTMLElement).style.color = 'black';
                  (otherBtn as HTMLElement).style.opacity = '0.6';
                }
              }
            }
          });
        }
      });
    });
    
    // Start observing the button
    observer.observe(button, { attributes: true });
    
    // Store the observer in a data attribute for cleanup
    (button as any)._poiSyncObserver = observer;
  });
  
  console.log(`POI control sync initialized for ${poiButtons.length} buttons`);
}

/**
 * Cleans up any existing POI control synchronization observers
 */
export function cleanupPOIControlSync() {
  if (typeof window === 'undefined') return;
  
  // Find all POI control buttons
  const poiButtons = document.querySelectorAll('.poi-control-button[data-poi-id]');
  
  // Disconnect any existing observers
  poiButtons.forEach(button => {
    if ((button as any)._poiSyncObserver) {
      (button as any)._poiSyncObserver.disconnect();
      delete (button as any)._poiSyncObserver;
    }
  });
} 