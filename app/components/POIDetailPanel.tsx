'use client'

import React, { useState, useEffect } from 'react';
import { X, Clock, Phone, Globe, MapPin, Navigation, Star, DollarSign, Fuel, Zap, Coffee, Camera, Info, Loader2, Hotel } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { POI } from '../utils/overpassService';
import { generateViatorDeepLink } from '../utils/viatorService';

interface POIDetailPanelProps {
  poi: POI | null;
  onClose: () => void;
  onSetAsDestination?: (poi: POI) => void;
  isLoading?: boolean;
  className?: string; // Add optional className prop
}

// Your Viator affiliate ID
const VIATOR_AFFILIATE_ID = 'P00255194'; // Replace with your actual ID

const POIDetailPanel: React.FC<POIDetailPanelProps> = ({ 
  poi, 
  onClose, 
  onSetAsDestination,
  isLoading = false,
  className = '' // Initialize with empty string
}) => {
  if (!poi) return null;

  // Helper function to generate a vibrant, deterministic color based on POI name
  const getPoiColor = (poiName: string) => {
    // Simple hash function to generate a number from the POI name
    const hash = Array.from(poiName).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    // Use the hash to generate a hue value (0-360)
    const hue = Math.abs(hash % 360);
    
    // Return a vibrant color with fixed saturation and lightness
    return `hsl(${hue}, 85%, 45%)`;
  };

  // Get POI initial or first letter of name
  const getPoiInitial = () => {
    if (poi.tags.brand && poi.tags.brand.length > 0) {
      return poi.tags.brand.charAt(0).toUpperCase();
    }
    return poi.name.charAt(0).toUpperCase();
  };

  // Get appropriate icon based on POI type
  const renderPoiTypeIcon = () => {
    const size = "h-16 w-16";
    const opacity = "opacity-25";
    
    switch (poi.type) {
      case 'hotels':
        return <Hotel className={`${size} text-white ${opacity} absolute`} />;
      case 'restaurants':
        return <Coffee className={`${size} text-white ${opacity} absolute`} />;
      case 'gasStations':
        return <Fuel className={`${size} text-white ${opacity} absolute`} />;
      case 'evCharging':
        return <Zap className={`${size} text-white ${opacity} absolute`} />;
      case 'attractions':
        return <Camera className={`${size} text-white ${opacity} absolute`} />;
      default:
        return <MapPin className={`${size} text-white ${opacity} absolute`} />;
    }
  };

  // Get background color for POI
  const bgColor = getPoiColor(poi.name);
  
  // Handle navigation to this POI
  const handleNavigateToPOI = () => {
    if (onSetAsDestination) {
      onSetAsDestination(poi);
    }
  };
  
  // Format phone number for display
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };
  
  // Function to handle booking action
  const handleBookClick = () => {
    // Skip if not an attraction
    if (poi.type !== 'attractions') return;
    
    // Generate deep link with affiliate ID
    let deepLink = '';
    let searchFallbackLink = '';
    
    if (poi.viatorId) {
      console.log(`[POIDetailPanel] Creating Viator deep link for product: ${poi.viatorId}`);
      
      // Campaign value can be added to track specific placements
      const campaignValue = 'road-trip-calculator'; 
      
      // Extract destination information
      // For destination name, we'll use the first part of the address if available
      const addressParts = (poi.tags.address || '').split(',');
      const destinationName = addressParts.length > 0 ? addressParts[0].trim() : '';
      
      // Extract destination ID if present in the locationId field
      const destinationIdMatch = poi.tags.locationId?.match(/d(\d+)/) || 
                                poi.id.match(/d(\d+)/);
      const destinationId = destinationIdMatch ? destinationIdMatch[1] : undefined;
      
      // Log what we're using to build the URL
      console.log(`[POIDetailPanel] Building deep link with:`, {
        productCode: poi.viatorId,
        productTitle: poi.name,
        destinationName,
        destinationId: destinationId || 'UNKNOWN'
      });
      
      // Generate the primary deep link with all available information
      deepLink = generateViatorDeepLink(
        poi.viatorId, 
        VIATOR_AFFILIATE_ID, 
        campaignValue,
        poi.name,          // Product title
        destinationName,   // Destination name
        destinationId      // Destination ID
      );
      
      // Slugify the destination name for fallback
      const slugify = (text: string): string => {
        if (!text) return '';
        return text
          .toString()
          .normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9 ]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      };
      
      const destinationSlug = slugify(destinationName);
      
      // Create either a destination-based fallback or a search fallback
      if (destinationSlug && destinationId) {
        // Create a reliable destination page URL with the canonical format
        searchFallbackLink = `https://www.viator.com/${destinationSlug}/d${destinationId}-ttd?pid=${VIATOR_AFFILIATE_ID}&mcid=42383&medium=api&campaign=${campaignValue}`;
      } else {
        // Fall back to general search if we don't have destination info
        const searchParams = new URLSearchParams({
          q: poi.name,
          pid: VIATOR_AFFILIATE_ID,
          mcid: '42383',
          medium: 'api',
          campaign: campaignValue
        });
        searchFallbackLink = `https://www.viator.com/search?${searchParams.toString()}`;
      }
    } else {
      // Fallback to a search on Viator
      console.log(`[POIDetailPanel] No viatorId found for "${poi.name}", using search fallback`);
      
      // Get location part if available
      const locationPart = poi.tags.address ? poi.tags.address.split(',')[0].trim() : '';
      
      // Create search URL with proper attribution parameters per Viator docs
      const searchParams = new URLSearchParams({
        pid: VIATOR_AFFILIATE_ID,
        mcid: '42383', // Add MCID parameter for proper attribution
        medium: 'api',
        campaign: 'road-trip-cost-calculator',
        q: poi.name + (locationPart ? ` ${locationPart}` : '')
      });
      
      deepLink = `https://www.viator.com/search?${searchParams.toString()}`;
      searchFallbackLink = deepLink; // Same as primary link in this case
    }
    
    console.log(`[POIDetailPanel] Generated link: ${deepLink}`);
    console.log(`[POIDetailPanel] Fallback link if needed: ${searchFallbackLink}`);
    
    // Open the URL
    window.open(deepLink, '_blank');
  };

  // Determine what action buttons to show based on POI type
  const renderActionButtons = () => {
    const commonButtons = (
      <>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(poi.name + ' ' + (poi.tags.address || ''))}`, '_blank')}
        >
          <MapPin className="h-4 w-4" />
          <span>View on Maps</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(poi.name + ' ' + (poi.tags.address || ''))}`, '_blank')}
        >
          <Info className="h-4 w-4" />
          <span>More Info</span>
        </Button>
      </>
    );
    
    // Add category-specific buttons with website links if available
    const websiteButton = poi.tags.website ? (
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => window.open(poi.tags.website, '_blank')}
      >
        <Globe className="h-4 w-4" />
        <span>Website</span>
      </Button>
    ) : null;
    
    // Add website button to common buttons if available
    const buttonsWithWebsite = (
      <>
        {commonButtons}
        {websiteButton}
      </>
    );
    
    // Add category-specific buttons
    switch (poi.type) {
      case 'gasStations':
      case 'evCharging':
        return (
          <div className="flex flex-wrap gap-2 mt-4">
            {buttonsWithWebsite}
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleNavigateToPOI}
            >
              <Navigation className="h-4 w-4" />
              <span>Navigate Here</span>
            </Button>
          </div>
        );
      
      case 'restaurants':
        return (
          <div className="flex flex-wrap gap-2 mt-4">
            {buttonsWithWebsite}
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              onClick={() => window.open(`https://www.opentable.com/s?term=${encodeURIComponent(poi.name + ' ' + (poi.tags.address || ''))}`, '_blank')}
            >
              <Coffee className="h-4 w-4" />
              <span>Reserve a Table</span>
            </Button>
          </div>
        );
      
      case 'hotels':
        return (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleNavigateToPOI}
            >
              <Navigation className="h-4 w-4" />
              <span>Navigate Here</span>
            </Button>
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900"
              onClick={() => window.open(`https://www.tripadvisor.com/Search?q=${encodeURIComponent(poi.name + ' ' + (poi.tags.address || ''))}`, '_blank')}
            >
              <DollarSign className="h-4 w-4" />
              <span>Check Availability</span>
            </Button>
          </div>
        );
      
      case 'attractions':
        return (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={handleBookClick}
            >
              <Camera className="h-5 w-5 mr-2" />
              Book This Activity
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-wrap gap-2 mt-4">
            {buttonsWithWebsite}
          </div>
        );
    }
  };
  
  // Render loading indicator if we're fetching details
  const renderLoadingOverlay = () => {
    if (!isLoading) return null;
    
    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 rounded-md">
        <div className="text-white text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading details...</p>
        </div>
      </div>
    );
  };
  
  // Add this useEffect hook to handle the styling
  useEffect(() => {
    // This code only runs in the browser, after component mounts
    const style = document.createElement('style');
    style.innerHTML = `
      .highlight-animation {
        animation: panelFadeIn 0.3s ease-out, panelHighlight 1.5s ease-out;
      }
      
      @keyframes panelFadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes panelHighlight {
        0% { box-shadow: 0 0 0 2px rgba(37, 99, 235, 0); }
        20% { box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.8); }
        100% { box-shadow: 0 0 0 2px rgba(37, 99, 235, 0); }
      }
      
      /* Hide scrollbar but keep functionality */
      .hidden-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
      }
      
      .hidden-scrollbar::-webkit-scrollbar {
        display: none;             /* Chrome, Safari, Opera */
      }
      
      /* Panel entrance animation */
      .panel-enter {
        animation: panelEnter 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
      }
      
      @keyframes panelEnter {
        0% { opacity: 0; transform: scale(0.96); }
        100% { opacity: 1; transform: scale(1); }
      }
    `;
    
    document.head.appendChild(style);
    
    // Cleanup function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []); // Empty dependency array means this only runs once when component mounts

  return (
    <Card className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden relative shadow-lg highlight-animation panel-enter ${className}`}>
      {renderLoadingOverlay()}
      
      {/* Only for attractions - Show a large, prominent image at the top */}
      {poi.type === 'attractions' && (
        <div className="relative w-full h-48 sm:h-64 overflow-hidden">
          {/* Image or colored background with icon */}
          {(poi.tags.thumbnailHiResURL || poi.tags.thumbnailURL) ? (
            <>
              <img 
                src={poi.tags.thumbnailHiResURL || poi.tags.thumbnailURL}
                alt={poi.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallbackElement = document.getElementById(`fallback-icon-${poi.id}`);
                  if (fallbackElement) {
                    fallbackElement.style.display = 'flex';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
            </>
          ) : (
            <div 
              id={`fallback-icon-${poi.id}`}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <div className="flex items-center justify-center">
                {renderPoiTypeIcon()}
                <div className="relative flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full">
                  <span className="text-white text-3xl font-bold">{getPoiInitial()}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Title overlay at the bottom of the image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 to-transparent">
            <h3 className="text-xl font-bold text-white group">
              <span 
                className="cursor-pointer hover:underline inline-flex items-center"
                onClick={handleBookClick}
              >
                {poi.name}
                <Camera className="h-3 w-3 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
              </span>
            </h3>
            {poi.tags.address && (
              <div className="flex items-center gap-1 text-white text-sm mt-1">
                <MapPin className="h-3 w-3 text-white" />
                <span>{poi.tags.address.split(',')[0]}</span>
              </div>
            )}
          </div>
          
          {/* Add a more visible close button at the top right */}
          <div className="absolute top-3 right-3 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white hover:bg-gray-200 text-gray-800 shadow-md" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* For non-attraction POIs - Use the original header */}
      {poi.type !== 'attractions' && (
        <div className="flex justify-between items-start p-4 mb-2">
          <div className="flex items-center gap-2">
            {renderPoiTypeIcon()}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{poi.name}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Main content section with new layout for attractions */}
      <div className={`p-4 ${poi.type === 'attractions' ? 'pt-2' : ''}`}>
        {/* For attractions - New modern card layout */}
        {poi.type === 'attractions' ? (
          <>
            {/* Scrollable content area for attractions on desktop */}
            <div className="space-y-4 xl:max-h-[calc(60vh-200px)] xl:overflow-y-auto xl:overflow-x-hidden xl:pr-2 xl:pb-16 xl:custom-scrollbar hidden-scrollbar">
              {/* Address - Only show detailed address, not the city name which is now in the title */}
              {poi.tags.address && poi.tags.address.includes(',') && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">{poi.tags.address.split(',').slice(1).join(',').trim()}</span>
                </div>
              )}
              
              {/* Info items in a responsive grid - More compact design */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Duration - More compact */}
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
                  <div className="flex items-start gap-1">
                    <Clock className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800 dark:text-gray-200 text-sm break-words">
                      <strong>Duration:</strong> {poi.tags.duration || 'Varies'}
                    </span>
                  </div>
                </div>
                
                {/* Price - More compact */}
                {poi.tags.price && (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
                    <div className="flex items-start gap-1">
                      <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800 dark:text-gray-200 text-sm break-words">
                        <strong>Price:</strong> {poi.tags.price}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Rating - Using actual stars */}
                {poi.tags.rating && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-2">
                    <div className="flex items-start flex-wrap gap-1">
                      <div className="flex items-center flex-wrap">
                        {/* Generate actual stars based on rating */}
                        {Array.from({ length: 5 }).map((_, i) => {
                          const rating = parseFloat(poi.tags.rating);
                          // Full star
                          if (i < Math.floor(rating)) {
                            return <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-400" />;
                          }
                          // Half star
                          else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                            return <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-400 opacity-60" />;
                          }
                          // Empty star
                          else {
                            return <Star key={i} className="h-3 w-3 text-gray-300" />;
                          }
                        })}
                        <span className="ml-1 text-gray-800 dark:text-gray-200 text-sm">
                          {poi.tags.rating}
                          {poi.tags.reviews && <span className="text-xs text-gray-500 ml-1">({poi.tags.reviews})</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Distance information - More compact with tooltip */}
                {poi.tags.distance && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-2 inline-block group relative">
                    <div className="flex items-center gap-1">
                      <Navigation className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                      <span className="text-gray-800 dark:text-gray-200 text-sm truncate">{poi.tags.distance}</span>
                    </div>
                    {/* Tooltip for approximate distance */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                      Miles shown are approximate, not exact!
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description with scrollable area - Preserve existing scroll */}
              {poi.tags.description && (
                <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">About this attraction</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {poi.tags.description}
                  </div>
                </div>
              )}
            </div>
            
            {/* Book button for Viator - Enhanced style with sticky positioning on desktop */}
            {poi.viatorId && (
              <div className="mt-4 xl:sticky xl:bottom-0 xl:left-0 xl:right-0 xl:bg-white xl:dark:bg-gray-900 xl:pt-2 xl:pb-1 xl:z-10">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white py-2 h-auto"
                  onClick={handleBookClick}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Book This Activity
                </Button>
              </div>
            )}
          </>
        ) : (
          // For non-attraction POIs - Use the original grid layout
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Image section */}
            <div className="sm:col-span-1 h-[150px] sm:h-[180px] rounded-md overflow-hidden bg-gray-700 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
              
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <div className="flex items-center justify-center">
                  {renderPoiTypeIcon()}
                  <div className="relative flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full">
                    <span className="text-white text-2xl font-bold">{getPoiInitial()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Details section */}
            <div className="sm:col-span-2 text-gray-300 space-y-3">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                <span>{poi.tags.address || 'Address not available'}</span>
              </div>
              
              {/* Phone if available */}
              {poi.tags.phone && poi.type !== 'hotels' && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                  <span>{formatPhone(poi.tags.phone)}</span>
                </div>
              )}
              
              {/* Opening hours if available */}
              {poi.tags.opening_hours && poi.type !== 'hotels' && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                  <span>{poi.tags.opening_hours}</span>
                </div>
              )}
              
              {/* Website if available */}
              {poi.tags.website && poi.type !== 'hotels' && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                  <a 
                    href={poi.tags.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:underline truncate max-w-full"
                  >
                    {poi.tags.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {/* Category-specific details */}
              {poi.type === 'gasStations' && (
                <>
                  {poi.tags.brand && (
                    <div className="flex items-start gap-2">
                      <Fuel className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                      <span><strong>Brand:</strong> {poi.tags.brand}</span>
                    </div>
                  )}
                  {poi.tags.fuel_type && (
                    <div className="flex items-start gap-2">
                      <Fuel className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                      <span><strong>Fuel Types:</strong> {poi.tags.fuel_type}</span>
                    </div>
                  )}
                </>
              )}
              
              {poi.type === 'evCharging' && (
                <>
                  {poi.tags.brand && (
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                      <span><strong>Operator:</strong> {poi.tags.brand}</span>
                    </div>
                  )}
                  {poi.tags.capacity && (
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                      <span><strong>Charging Points:</strong> {poi.tags.capacity}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Only render action buttons for non-attraction POIs since we handle them separately for attractions */}
        {poi.type !== 'attractions' && renderActionButtons()}
      </div>
    </Card>
  );
};

export default POIDetailPanel; 