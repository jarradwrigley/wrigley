import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface AddressSuggestion {
  place_name: string;
  context?: { id: string; text: string }[];
  geometry: { coordinates: [number, number] };
}

interface AddressData {
  fullAddress: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  coordinates?: [number, number];
}

interface AddressInputProps {
  onSelect: (address: AddressData) => void;
  placeholder?: string;
  accessToken: string; // Your Mapbox access token
}

export const AddressInput: React.FC<AddressInputProps> = ({
  onSelect,
  placeholder = "Enter address",
  accessToken,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (search: string) => {
    if (!search) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          search
        )}.json`,
        {
          params: {
            access_token: accessToken,
            autocomplete: true,
            limit: 5,
          },
        }
      );
      setSuggestions(res.data.features);
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.place_name);
    setSuggestions([]);

    const context = suggestion.context || [];
    const city = context.find((c) => c.id.includes("place"))?.text;
    const state = context.find((c) => c.id.includes("region"))?.text;
    const zip = context.find((c) => c.id.includes("postcode"))?.text;
    const country = context.find((c) => c.id.includes("country"))?.text;

    onSelect({
      fullAddress: suggestion.place_name,
      city,
      state,
      zip,
      country,
      coordinates: suggestion.geometry.coordinates,
    });
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded"
      />
      {loading && (
        <div className="absolute top-full left-0 mt-1 text-sm text-gray-500">
          Loading...
        </div>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(s)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
