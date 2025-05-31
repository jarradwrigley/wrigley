import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X } from "lucide-react";

// TypeScript interfaces
interface AddressCoordinates {
  lat: number;
  lng: number;
}

interface AddressResult {
  id: string;
  displayName: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: AddressCoordinates;
}

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface GeocodeService {
  searchAddresses(query: string): Promise<AddressResult[]>;
}

interface AddressInputProps {
  onAddressSelect?: (address: AddressResult) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  debounceMs?: number;
}

// Mock geocoding service - replace with your preferred API
const mockGeocodeService: GeocodeService = {
  async searchAddresses(query: string): Promise<AddressResult[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock data - replace with actual API calls
    const mockResults: AddressResult[] = [
      {
        id: "1",
        displayName: "123 Main Street, New York, NY 10001, USA",
        streetNumber: "123",
        streetName: "Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
      {
        id: "2",
        displayName: "456 Oak Avenue, Los Angeles, CA 90210, USA",
        streetNumber: "456",
        streetName: "Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "USA",
        coordinates: { lat: 34.0522, lng: -118.2437 },
      },
      {
        id: "3",
        displayName: "789 Pine Road, Chicago, IL 60601, USA",
        streetNumber: "789",
        streetName: "Pine Road",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
        coordinates: { lat: 41.8781, lng: -87.6298 },
      },
    ];

    return mockResults.filter((result) =>
      result.displayName.toLowerCase().includes(query.toLowerCase())
    );
  },
};

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// AddressInput Component
function AddressInput({
  onAddressSelect,
  placeholder = "Enter address...",
  className = "",
  initialValue = "",
  debounceMs = 300,
}: AddressInputProps): JSX.Element {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedInputValue = useDebounce(inputValue, debounceMs);

  // Fetch suggestions when debounced input changes
  useEffect(() => {
    if (debouncedInputValue.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const results = await mockGeocodeService.searchAddresses(
          debouncedInputValue
        );
        setSuggestions(results);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedInputValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressResult): void => {
    setInputValue(suggestion.displayName);
    setShowDropdown(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    if (onAddressSelect) {
      onAddressSelect(suggestion);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Clear input
  const handleClear = (): void => {
    setInputValue("");
    setShowDropdown(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-start gap-3 ${
                index === selectedIndex
                  ? "bg-blue-50 border-l-2 border-blue-500"
                  : ""
              }`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.displayName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {suggestion.city}, {suggestion.state} {suggestion.zipCode}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Demo form component showing auto-population
function AddressForm(): JSX.Element {
  const [addressData, setAddressData] = useState<AddressData>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const handleAddressSelect = (selectedAddress: AddressResult): void => {
    setAddressData({
      street: `${selectedAddress.streetNumber} ${selectedAddress.streetName}`,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipCode: selectedAddress.zipCode,
      country: selectedAddress.country,
    });
  };

  const handleInputChange =
    (field: keyof AddressData) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setAddressData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSaveAddress = (): void => {
    console.log("Address saved:", addressData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Address Input Demo
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Address
          </label>
          <AddressInput
            onAddressSelect={handleAddressSelect}
            placeholder="Start typing an address..."
            className="mb-4"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={addressData.street}
              onChange={handleInputChange("street")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={addressData.city}
              onChange={handleInputChange("city")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              value={addressData.state}
              onChange={handleInputChange("state")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={addressData.zipCode}
              onChange={handleInputChange("zipCode")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={addressData.country}
              onChange={handleInputChange("country")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveAddress}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Save Address
          </button>
        </div>
      </div>

      {/* API Integration Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">
          API Integration Guide
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Google Places API:</strong>
          </p>
          <code className="block bg-white p-2 rounded text-xs">
            {`const response = await fetch(\`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=\${query}&key=\${API_KEY}\`);`}
          </code>

          <p>
            <strong>Mapbox Geocoding API:</strong>
          </p>
          <code className="block bg-white p-2 rounded text-xs">
            {`const response = await fetch(\`https://api.mapbox.com/geocoding/v5/mapbox.places/\${query}.json?access_token=\${API_KEY}\`);`}
          </code>
        </div>
      </div>
    </div>
  );
}

export default AddressForm;
