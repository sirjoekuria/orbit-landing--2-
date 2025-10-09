import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Search, X } from "lucide-react";
import MapboxMap from "./MapboxMap";

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  onLocationSelect: (pickup: Location, dropoff: Location) => void;
  onDistanceCalculated?: (distance: number, duration: number) => void;
}

export default function LocationPicker({
  onLocationSelect,
  onDistanceCalculated,
}: LocationPickerProps) {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<
    "pickup" | "dropoff"
  >("pickup");
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Common locations in Nairobi for quick selection
  const commonLocations: Location[] = [
    {
      name: "JKIA Airport",
      address: "Jomo Kenyatta International Airport, Nairobi",
      lat: -1.3192,
      lng: 36.9275,
    },
    {
      name: "CBD",
      address: "Central Business District, Nairobi",
      lat: -1.2864,
      lng: 36.8172,
    },
    {
      name: "Westlands",
      address: "Westlands, Nairobi",
      lat: -1.2676,
      lng: 36.8103,
    },
    { name: "Karen", address: "Karen, Nairobi", lat: -1.3318, lng: 36.7026 },
    {
      name: "Kileleshwa",
      address: "Kileleshwa, Nairobi",
      lat: -1.2833,
      lng: 36.7833,
    },
    {
      name: "Eastleigh",
      address: "Eastleigh, Nairobi",
      lat: -1.2833,
      lng: 36.85,
    },
    { name: "Kasarani", address: "Kasarani, Nairobi", lat: -1.2167, lng: 36.9 },
    {
      name: "Embakasi",
      address: "Embakasi, Nairobi",
      lat: -1.3167,
      lng: 36.8833,
    },
    {
      name: "Thika Road Mall",
      address: "Thika Road, Nairobi",
      lat: -1.2167,
      lng: 36.8833,
    },
    {
      name: "Junction Mall",
      address: "Ngong Road, Nairobi",
      lat: -1.3019,
      lng: 36.7819,
    },
  ];

  // This function is now moved to useCallback below to prevent infinite loops

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            name: "Current Location",
            address: "Your current location",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (selectedLocationType === "pickup") {
            setPickupLocation(location);
          } else {
            setDropoffLocation(location);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to get your current location. Please select manually.");
        },
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Handle location selection
  const selectLocation = (location: Location) => {
    if (selectedLocationType === "pickup") {
      setPickupLocation(location);
    } else {
      setDropoffLocation(location);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  // Calculate distance and duration when both locations are selected
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      const calculatedDistance = calculateDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        dropoffLocation.lat,
        dropoffLocation.lng,
      );

      // Estimate duration (assuming average speed of 25 km/h in Nairobi traffic)
      const estimatedDuration = (calculatedDistance / 25) * 60; // in minutes

      setDistance(calculatedDistance);
      setDuration(estimatedDuration);

      onLocationSelect(pickupLocation, dropoffLocation);
      if (onDistanceCalculated) {
        onDistanceCalculated(calculatedDistance, estimatedDuration);
      }
    }
  }, [pickupLocation, dropoffLocation]); // Remove function dependencies

  // Memoize search function to prevent infinite loops
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        // Filter common locations first for quick access
        const filteredCommon = commonLocations.filter(
          (location) =>
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.address.toLowerCase().includes(query.toLowerCase()),
        );

        // Use Mapbox Geocoding API for comprehensive search
        const mapboxAccessToken =
          "pk.eyJ1Ijoic2lyam9la3VyaWEiLCJhIjoiY21laGxzZnI0MDBjZzJqcXczc2NtdHZqZCJ9.FhRc9jUcHnkTPuauJrP-Qw";

        // Search with various types to include buildings, businesses, POIs
        const searchTypes = [
          "place", // neighborhoods, villages, districts
          "poi", // points of interest (buildings, businesses)
          "address", // street addresses
          "locality", // cities, towns
          "neighborhood", // neighborhoods
        ].join(",");

        const geocodingUrl =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${mapboxAccessToken}&` +
          `country=KE&` + // Restrict to Kenya
          `proximity=36.8219,-1.2921&` + // Bias towards Nairobi center
          `types=${searchTypes}&` +
          `limit=10&` +
          `autocomplete=true&` +
          `language=en`;

        const response = await fetch(geocodingUrl);
        const data = await response.json();

        let apiResults: Location[] = [];

        if (data.features && data.features.length > 0) {
          apiResults = data.features.map((feature: any) => ({
            name: feature.text || feature.place_name.split(",")[0],
            address: feature.place_name,
            lat: feature.center[1],
            lng: feature.center[0],
          }));
        }

        // Combine results: common locations first, then API results
        const combinedResults = [...filteredCommon];

        // Add API results that aren't duplicates
        apiResults.forEach((apiResult) => {
          const isDuplicate = combinedResults.some(
            (existing) =>
              existing.name.toLowerCase() === apiResult.name.toLowerCase() ||
              (Math.abs(existing.lat - apiResult.lat) < 0.001 &&
                Math.abs(existing.lng - apiResult.lng) < 0.001),
          );

          if (!isDuplicate) {
            combinedResults.push(apiResult);
          }
        });

        setSearchResults(combinedResults);
      } catch (error) {
        console.error("Location search error:", error);

        // Fallback to common locations if API fails
        const filteredCommon = commonLocations.filter(
          (location) =>
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.address.toLowerCase().includes(query.toLowerCase()),
        );

        setSearchResults(
          filteredCommon.length > 0
            ? filteredCommon
            : commonLocations.slice(0, 5),
        );
      } finally {
        setIsSearching(false);
      }
    },
    [commonLocations],
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-rocs-green" />
        Select Pickup & Drop-off Locations
      </h3>

      {/* Location Type Selector */}
      <div className="flex mb-4">
        <button
          onClick={() => setSelectedLocationType("pickup")}
          className={`flex-1 py-2 px-4 rounded-l-lg border-2 transition-colors ${
            selectedLocationType === "pickup"
              ? "bg-rocs-green text-white border-rocs-green"
              : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          Pickup Location
        </button>
        <button
          onClick={() => setSelectedLocationType("dropoff")}
          className={`flex-1 py-2 px-4 rounded-r-lg border-2 border-l-0 transition-colors ${
            selectedLocationType === "dropoff"
              ? "bg-rocs-green text-white border-rocs-green"
              : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          Drop-off Location
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search for ${selectedLocationType} location...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-rocs-green focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-rocs-yellow text-gray-800 rounded-r-lg hover:bg-rocs-yellow/90 transition-colors flex items-center"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Current
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
          {searchResults.map((location, index) => (
            <button
              key={index}
              onClick={() => selectLocation(location)}
              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-800">{location.name}</div>
              <div className="text-sm text-gray-600">{location.address}</div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Select Common Locations */}
      {!searchQuery && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Quick Select:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {commonLocations.slice(0, 6).map((location, index) => (
              <button
                key={index}
                onClick={() => selectLocation(location)}
                className="p-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-gray-800">{location.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Locations Display */}
      <div className="space-y-3">
        {pickupLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-green-800">
                  Pickup: {pickupLocation.name}
                </div>
                <div className="text-sm text-green-600">
                  {pickupLocation.address}
                </div>
              </div>
              <button
                onClick={() => setPickupLocation(null)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {dropoffLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-800">
                  Drop-off: {dropoffLocation.name}
                </div>
                <div className="text-sm text-blue-600">
                  {dropoffLocation.address}
                </div>
              </div>
              <button
                onClick={() => setDropoffLocation(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Distance and Time Display */}
        {distance && duration && (
          <div className="bg-rocs-green/10 border border-rocs-green/20 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-rocs-green">
                {distance.toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Estimated time: {Math.round(duration)} minutes
              </div>
              <div className="text-lg font-semibold text-gray-800 mt-2">
                Estimated cost: KES {(distance * 30).toFixed(0)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Mapbox Map */}
      <div className="mt-4 relative">
        <MapboxMap
          pickup={pickupLocation}
          dropoff={dropoffLocation}
          height="320px"
          className="border border-gray-200 rounded-lg overflow-hidden"
        />

        {/* Map Status Overlay */}
        {!pickupLocation && !dropoffLocation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-center text-white bg-black bg-opacity-75 p-4 rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <div className="font-medium">
                Select pickup and dropoff locations
              </div>
              <div className="text-sm opacity-90">
                to see them on the interactive map
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
