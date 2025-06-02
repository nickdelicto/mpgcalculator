'use client'

import React, { useState, useEffect, useRef } from 'react'
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
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
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
  
  return (
    <div className="space-y-2 relative">
      <label htmlFor={id} className="block text-sm text-gray-200">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          placeholder={placeholder}
          className={`pl-10 bg-gray-700 border-gray-600 ${className}`}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
        />
        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-red-400 text-sm flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {/* Suggestions dropdown - show whenever we have suggestions and user has typed enough */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg mt-1 max-h-60 overflow-auto"
        >
          {isFallback && (
            <div className="px-3 py-1 text-xs text-amber-400 bg-amber-900/30 border-b border-gray-600">
              Using standard search results (autocomplete unavailable)
            </div>
          )}
          <ul>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="px-3 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm border-b border-gray-600 last:border-0"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>{suggestion.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 