'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Input } from '../../components/ui/input'
import { Loader2, MapPin, AlertCircle } from 'lucide-react'

interface AddressAutocompleteProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelectLocation: (value: string) => void;
  className?: string;
  customIcon?: React.ReactNode;
}

interface Suggestion {
  text: string;
  label: string;
}

export default function AddressAutocomplete({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSelectLocation,
  className = '',
  customIcon,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  
  // Portal related states
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  
  // Create portal container on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.className = 'address-autocomplete-portal';
      document.body.appendChild(container);
      setPortalContainer(container);
      
      return () => {
        document.body.removeChild(container);
      };
    }
  }, []);
  
  // Update dropdown position
  const updatePosition = useCallback(() => {
    if (inputWrapperRef.current) {
      const rect = inputWrapperRef.current.getBoundingClientRect();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      setDropdownPosition({
        top: rect.bottom + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width
      });
    }
  }, []);
  
  // Set up position tracking
  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);
  
  // Update position when suggestions change
  useEffect(() => {
    if (showSuggestions && suggestions.length > 0) {
      updatePosition();
    }
  }, [showSuggestions, suggestions, updatePosition]);
  
  // Function to fetch address suggestions from our proxy API
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsFallback(false);
    
    try {
      const response = await fetch(`/api/route/geocode/autocomplete?text=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Autocomplete API error:', errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if we got valid results
      if (!data.features || data.features.length === 0) {
        // Try the regular geocode endpoint as fallback
        const fallbackResponse = await fetch(`/api/route/geocode?text=${encodeURIComponent(query)}`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.features && fallbackData.features.length > 0) {
            setIsFallback(true);
            const fallbackSuggestions = fallbackData.features.map((feature: any) => ({
              text: feature.properties.name,
              label: feature.properties.label || feature.properties.name
            })).slice(0, 5);
            setSuggestions(fallbackSuggestions);
          } else {
            setSuggestions([]);
          }
        } else {
          setSuggestions([]);
        }
      } else {
        // Process autocomplete results
        const processedSuggestions = data.features.map((feature: any) => ({
          text: feature.properties.name,
          label: feature.properties.label || feature.properties.name
        })).slice(0, 5);
        setSuggestions(processedSuggestions);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setError('Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Debounce function to limit API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 3) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [value]);
  
  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) &&
        (inputRef.current && !inputRef.current.contains(event.target as Node))
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onSelectLocation(suggestion.label);
    setShowSuggestions(false);
  };
  
  // Update onChange handler to automatically show suggestions as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Show suggestions dropdown when typing if we have 3+ characters
    if (newValue.length >= 3) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // Add some global styles for portal dropdown
  useEffect(() => {
    // Only run on client
    if (typeof document === 'undefined') return;
    
    const styleId = 'address-autocomplete-portal-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        .address-autocomplete-portal {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 9999;
          width: 0;
          height: 0;
        }
        
        .address-autocomplete-dropdown {
          animation: dropdownFadeIn 0.15s ease-out;
        }
        
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    return () => {
      const styleEl = document.getElementById(styleId);
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);
  
  return (
    <div className="space-y-2 relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      )}
      <div className="relative" ref={inputWrapperRef}>
        <Input
          id={id}
          ref={inputRef}
          placeholder={placeholder}
          className={`pl-10 bg-white border-gray-200 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${className}`}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
        />
        <div className="absolute left-3 top-2.5 h-5 w-5 text-blue-500 opacity-70">
          {customIcon || <MapPin className="h-5 w-5" />}
        </div>
        {isLoading && (
          <div className="absolute right-3 top-2.5 h-5 w-5 text-blue-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {/* Portal-based suggestions dropdown */}
      {portalContainer && showSuggestions && suggestions.length > 0 && ReactDOM.createPortal(
        <div 
          ref={suggestionsRef}
          className="address-autocomplete-dropdown shadow-lg rounded-md border border-gray-200 bg-white"
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          aria-labelledby={id}
        >
          {isFallback && (
            <div className="px-3 py-1 text-xs text-amber-700 bg-amber-50 border-b border-gray-200">
              Using standard search results (autocomplete unavailable)
            </div>
          )}
          <ul>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm border-b border-gray-200 last:border-0 transition-colors"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5 text-blue-500">
                    {customIcon ? (
                      <div className="h-4 w-4 scale-75 transform origin-top-left">
                        {customIcon}
                      </div>
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </div>
                  <span>{suggestion.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>,
        portalContainer
      )}
    </div>
  );
} 