import React from 'react';
import { X, Clock, Phone, Globe, MapPin, Navigation, Star, DollarSign, Fuel, Zap, Coffee, Camera, Info, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { POI } from '../utils/overpassService';

interface POIDetailPanelProps {
  poi: POI | null;
  onClose: () => void;
  onSetAsDestination?: (poi: POI) => void;
  isLoading?: boolean; // Add loading state prop
}

const POIDetailPanel: React.FC<POIDetailPanelProps> = ({ 
  poi, 
  onClose, 
  onSetAsDestination,
  isLoading = false 
}) => {
  if (!poi) return null;

  // Get placeholder image based on POI type
  const getPlaceholderImage = (poiType: string) => {
    const images = {
      gasStations: '/images/placeholder-gas-station.jpg',
      evCharging: '/images/placeholder-ev-charging.jpg',
      hotels: '/images/placeholder-hotel.jpg',
      restaurants: '/images/placeholder-restaurant.jpg',
      attractions: '/images/placeholder-attraction.jpg'
    };
    
    // Fallback to a generic image if type not found
    return images[poiType as keyof typeof images] || '/images/placeholder-poi.jpg';
  };
  
  // Placeholder image URL - in real implementation, would come from API
  const imageUrl = getPlaceholderImage(poi.type);
  
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
            {buttonsWithWebsite}
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900"
              onClick={() => window.open(`https://www.booking.com/search.html?ss=${encodeURIComponent(poi.name + ' ' + (poi.tags.address || ''))}`, '_blank')}
            >
              <DollarSign className="h-4 w-4" />
              <span>Book a Room</span>
            </Button>
          </div>
        );
      
      case 'attractions':
        return (
          <div className="flex flex-wrap gap-2 mt-4">
            {buttonsWithWebsite}
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => window.open(`https://www.viator.com/search/${encodeURIComponent(poi.tags.address?.split(',')[1]?.trim() || '')}?pid=P00088888&mcid=42383&medium=link&activities_sort=REVIEW_COUNT_D&query=${encodeURIComponent(poi.name)}`, '_blank')}
            >
              <Camera className="h-4 w-4" />
              <span>Find Tickets & Tours</span>
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
  
  // Get POI type icon
  const renderTypeIcon = () => {
    switch (poi.type) {
      case 'gasStations':
        return <Fuel className="h-5 w-5 text-red-500" />;
      case 'evCharging':
        return <Zap className="h-5 w-5 text-green-500" />;
      case 'hotels':
        return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'restaurants':
        return <Coffee className="h-5 w-5 text-orange-500" />;
      case 'attractions':
        return <Camera className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
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
  
  return (
    <Card className="bg-gray-800 border-gray-700 p-4 animate-slideDown overflow-hidden relative">
      {renderLoadingOverlay()}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {renderTypeIcon()}
          <h3 className="text-xl font-semibold text-white">{poi.name}</h3>
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
      
      {/* Main content with image and details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Image section */}
        <div className="md:col-span-1 h-[150px] md:h-[200px] rounded-md overflow-hidden bg-gray-700 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
          <img 
            src={imageUrl} 
            alt={poi.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-poi.jpg';
            }}
          />
        </div>
        
        {/* Details section */}
        <div className="md:col-span-2 text-gray-300 space-y-3">
          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
            <span>{poi.tags.address || 'Address not available'}</span>
          </div>
          
          {/* Phone if available */}
          {poi.tags.phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
              <span>{formatPhone(poi.tags.phone)}</span>
            </div>
          )}
          
          {/* Opening hours if available */}
          {poi.tags.opening_hours && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
              <span>{poi.tags.opening_hours}</span>
            </div>
          )}
          
          {/* Website if available */}
          {poi.tags.website && (
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
          
          {poi.type === 'hotels' && (
            <>
              {poi.tags.stars && (
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 mt-1 flex-shrink-0 text-yellow-400" />
                  <span><strong>Rating:</strong> {poi.tags.stars} Stars</span>
                </div>
              )}
              {poi.tags.brand && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                  <span><strong>Chain:</strong> {poi.tags.brand}</span>
                </div>
              )}
            </>
          )}
          
          {poi.type === 'restaurants' && (
            <>
              {poi.tags.cuisine && (
                <div className="flex items-start gap-2">
                  <Coffee className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                  <span><strong>Cuisine:</strong> {poi.tags.cuisine}</span>
                </div>
              )}
              {poi.tags.brand && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                  <span><strong>Chain:</strong> {poi.tags.brand}</span>
                </div>
              )}
            </>
          )}
          
          {poi.type === 'attractions' && (
            <>
              {poi.tags.description && (
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-1 flex-shrink-0 text-gray-400" />
                  <span><strong>Description:</strong> {poi.tags.description}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      {renderActionButtons()}
    </Card>
  );
};

export default POIDetailPanel; 