import { useState } from "react";
import { MapPin, Calculator, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const PRICE_PER_KM = 30;
const MINIMUM_PRICE = 200;
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoic2lyam9la3VyaWEiLCJhIjoiY21laGxzZnI0MDBjZzJqcXczc2NtdHZqZCJ9.FhRc9jUcHnkTPuauJrP-Qw";

// Comprehensive landmarks database matching SimpleMapboxLocationPicker
const KENYAN_LANDMARKS = [
  // Major Malls
  { name: "Westgate Mall", coordinates: [36.8065, -1.2676] },
  { name: "Junction Mall", coordinates: [36.7819, -1.3019] },
  { name: "Sarit Centre", coordinates: [36.8103, -1.2676] },
  { name: "Village Market", coordinates: [36.815, -1.243] },
  { name: "Galleria Mall", coordinates: [36.765, -1.335] },
  { name: "Thika Road Mall", coordinates: [36.8833, -1.2167] },
  { name: "Garden City Mall", coordinates: [36.895, -1.21] },
  { name: "Yaya Centre", coordinates: [36.785, -1.295] },
  { name: "Two Rivers Mall", coordinates: [36.81, -1.23] },
  { name: "TRM Drive", coordinates: [36.8833, -1.2167] },
  { name: "Greenspan Mall", coordinates: [36.9, -1.27] },

  // Government Buildings & Landmarks
  { name: "KICC", coordinates: [36.8172, -1.2873] },
  { name: "Parliament Buildings", coordinates: [36.8181, -1.2884] },
  { name: "State House", coordinates: [36.805, -1.27] },
  { name: "City Hall", coordinates: [36.8172, -1.2864] },

  // Major Areas
  { name: "CBD", coordinates: [36.8172, -1.2864] },
  { name: "Westlands", coordinates: [36.8103, -1.2676] },
  { name: "Karen", coordinates: [36.7026, -1.3318] },
  { name: "Kilimani", coordinates: [36.7833, -1.2833] },
  { name: "Kileleshwa", coordinates: [36.7833, -1.2833] },
  { name: "Eastleigh", coordinates: [36.85, -1.2833] },
  { name: "Kasarani", coordinates: [36.9, -1.2167] },
  { name: "Embakasi", coordinates: [36.8833, -1.3167] },
  { name: "Upper Hill", coordinates: [36.805, -1.295] },
  { name: "Lavington", coordinates: [36.765, -1.28] },
  { name: "Parklands", coordinates: [36.82, -1.26] },
  { name: "Riverside", coordinates: [36.81, -1.27] },
  { name: "Mirema Drive", coordinates: [36.9, -1.2167] },

  // Transport Hubs
  { name: "JKIA Airport", coordinates: [36.9275, -1.3192] },
  { name: "Wilson Airport", coordinates: [36.815, -1.322] },
  { name: "Railway Station", coordinates: [36.8181, -1.289] },
  { name: "Bus Station", coordinates: [36.8181, -1.289] },

  // Hotels
  { name: "Hilton Hotel", coordinates: [36.8181, -1.2864] },
  { name: "Serena Hotel", coordinates: [36.8181, -1.2873] },
  { name: "Safari Park Hotel", coordinates: [36.8833, -1.2167] },
  { name: "Ole Sereni Hotel", coordinates: [36.92, -1.33] },

  // Hospitals
  { name: "Kenyatta National Hospital", coordinates: [36.805, -1.3] },
  { name: "Nairobi Hospital", coordinates: [36.785, -1.295] },
  { name: "Aga Khan Hospital", coordinates: [36.82, -1.26] },
  { name: "MP Shah Hospital", coordinates: [36.805, -1.29] },

  // Universities
  { name: "University of Nairobi", coordinates: [36.8181, -1.279] },
  { name: "Strathmore University", coordinates: [36.795, -1.305] },
  { name: "USIU", coordinates: [36.89, -1.22] },
  { name: "Kenyatta University", coordinates: [36.93, -1.18] },
  { name: "JKUAT", coordinates: [37.01, -1.1] },

  // Popular Apartments
  { name: "Delta Towers", coordinates: [36.7833, -1.29] },
  { name: "Brookside Drive", coordinates: [36.8103, -1.2676] },
  { name: "Yaya Towers", coordinates: [36.785, -1.295] },
  { name: "Kileleshwa Apartments", coordinates: [36.7833, -1.2833] },

  // Kiambu County Major Towns
  { name: "Kiambu Town", coordinates: [36.834, -1.174] },
  { name: "Thika Town", coordinates: [37.0691, -1.0332] },
  { name: "Limuru Town", coordinates: [36.6435, -1.1175] },
  { name: "Kikuyu Town", coordinates: [36.6621, -1.2438] },
  { name: "Ruiru Town", coordinates: [36.9633, -1.1439] },
  { name: "Juja Town", coordinates: [36.9936, -1.1055] },
  { name: "Kahawa West", coordinates: [36.93, -1.18] },
  { name: "Kahawa Sukari", coordinates: [36.94, -1.17] },
  { name: "Githurai", coordinates: [36.92, -1.15] },

  // Major Roads & Streets
  { name: "Thika Road", coordinates: [36.8833, -1.2167] },
  { name: "Ngong Road", coordinates: [36.77, -1.3] },
  { name: "Mombasa Road", coordinates: [36.84, -1.34] },
  { name: "Waiyaki Way", coordinates: [36.8, -1.26] },
  { name: "Kiambu Road", coordinates: [36.85, -1.23] },
  { name: "Kenyatta Avenue", coordinates: [36.8181, -1.2873] },
  { name: "Uhuru Highway", coordinates: [36.8181, -1.289] },
];

export default function PriceEstimator() {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced geocoding function with better matching
  const geocodeLocation = async (
    locationName: string,
  ): Promise<[number, number] | null> => {
    const queryLower = locationName.toLowerCase().trim();

    // Enhanced local landmark matching with multiple strategies
    let landmark = KENYAN_LANDMARKS.find((l) => {
      const nameLower = l.name.toLowerCase();
      // Exact match
      if (nameLower === queryLower) return true;
      // Contains match (both directions)
      if (nameLower.includes(queryLower) || queryLower.includes(nameLower))
        return true;
      // Word matching for compound names
      const queryWords = queryLower.split(/\s+/);
      const nameWords = nameLower.split(/\s+/);
      return queryWords.some((qWord) =>
        nameWords.some(
          (nWord) => qWord.includes(nWord) || nWord.includes(qWord),
        ),
      );
    });

    if (landmark) {
      console.log("Found local landmark:", landmark.name);
      return landmark.coordinates as [number, number];
    }

    // Try fuzzy matching for common abbreviations and variations
    const fuzzyMatches: { [key: string]: string } = {
      jkia: "JKIA Airport",
      knh: "Kenyatta National Hospital",
      uon: "University of Nairobi",
      usiu: "USIU",
      kicc: "KICC",
      cbd: "CBD",
      tmall: "Thika Road Mall",
      trm: "TRM Drive",
      "village market": "Village Market",
      sarit: "Sarit Centre",
      westgate: "Westgate Mall",
      junction: "Junction Mall",
      yaya: "Yaya Centre",
      galleria: "Galleria Mall",
      "kahawa west": "Kahawa West",
      "kahawa sukari": "Kahawa Sukari",
    };

    const fuzzyMatch = fuzzyMatches[queryLower];
    if (fuzzyMatch) {
      landmark = KENYAN_LANDMARKS.find((l) => l.name === fuzzyMatch);
      if (landmark) {
        console.log("Found fuzzy match:", landmark.name);
        return landmark.coordinates as [number, number];
      }
    }

    // Use Mapbox Geocoding API as fallback
    try {
      console.log("Trying Mapbox geocoding for:", locationName);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?` +
          `access_token=${MAPBOX_ACCESS_TOKEN}&` +
          `country=KE&` +
          `proximity=36.8219,-1.2921&` + // Bias towards Nairobi
          `types=place,locality,neighborhood,address,poi&` +
          `limit=1`,
      );

      if (!response.ok) {
        console.error("Mapbox geocoding failed with status:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        console.log("Found via Mapbox:", data.features[0].place_name);
        return data.features[0].center as [number, number];
      } else {
        console.log("No results from Mapbox for:", locationName);
      }
    } catch (error) {
      console.error("Mapbox geocoding error:", error);
    }

    console.log("Could not geocode location:", locationName);
    return null;
  };

  // Calculate route using Mapbox Directions API
  const calculateRouteDistance = async (
    pickup: [number, number],
    delivery: [number, number],
  ): Promise<number | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup[0]},${pickup[1]};${delivery[0]},${delivery[1]}?` +
          `access_token=${MAPBOX_ACCESS_TOKEN}&` +
          `geometries=geojson&` +
          `overview=simplified`,
      );

      if (!response.ok) {
        throw new Error("Directions request failed");
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return route.distance / 1000; // Convert meters to kilometers
      }
    } catch (error) {
      console.error("Route calculation error:", error);
    }

    return null;
  };

  // Fallback: straight-line distance calculation
  const calculateStraightLineDistance = (
    pickup: [number, number],
    delivery: [number, number],
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const [lng1, lat1] = pickup;
    const [lng2, lat2] = delivery;

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

  const calculatePrice = async () => {
    if (!pickup || !delivery) {
      setError("Please enter both pickup and delivery locations");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Geocode both locations
      const pickupCoords = await geocodeLocation(pickup);
      const deliveryCoords = await geocodeLocation(delivery);

      if (!pickupCoords && !deliveryCoords) {
        throw new Error(
          `Could not find either "${pickup}" or "${delivery}". Try searching for: Westgate Mall, KICC, Karen, Thika Road, JKIA Airport, etc.`,
        );
      } else if (!pickupCoords) {
        throw new Error(
          `Could not find pickup location "${pickup}". Try: Westgate Mall, CBD, Kiambu Town, Thika Town, or enter a more specific address.`,
        );
      } else if (!deliveryCoords) {
        throw new Error(
          `Could not find delivery location "${delivery}". Try: KICC, Karen, JKIA Airport, University of Nairobi, or enter a more specific address.`,
        );
      }

      // Calculate route distance
      let calculatedDistance = await calculateRouteDistance(
        pickupCoords,
        deliveryCoords,
      );

      // Fallback to straight-line distance if route calculation fails
      if (!calculatedDistance) {
        calculatedDistance = calculateStraightLineDistance(
          pickupCoords,
          deliveryCoords,
        );
        calculatedDistance *= 1.3; // Add 30% to account for actual roads vs straight line
      }

      // Calculate base price
      const basePrice = calculatedDistance * PRICE_PER_KM;

      // Apply minimum price
      const priceWithMinimum = Math.max(basePrice, MINIMUM_PRICE);

      // Round to nearest 10
      const finalPrice = Math.round(priceWithMinimum / 10) * 10;

      setDistance(Math.round(calculatedDistance * 10) / 10); // Round to 1 decimal place
      setEstimatedPrice(finalPrice);
    } catch (error) {
      console.error("Price calculation error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to calculate price. Please try again.",
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const resetCalculator = () => {
    setPickup("");
    setDelivery("");
    setDistance(null);
    setEstimatedPrice(null);
    setError(null);
  };

  return (
    <section className="py-16 bg-rocs-green-light">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-rocs-green mb-4">
              Calculate Your Delivery Cost
            </h2>
            <p className="text-lg text-gray-600">
              Get an instant price estimate for your delivery in Nairobi
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calculator Form */}
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="pickup"
                    className="text-rocs-green font-semibold"
                  >
                    Pickup Location
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="pickup"
                      type="text"
                      placeholder="e.g. Westgate Mall, KICC, Karen, Thika Road..."
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-rocs-green"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="delivery"
                    className="text-rocs-green font-semibold"
                  >
                    Delivery Location
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="delivery"
                      type="text"
                      placeholder="e.g. JKIA Airport, CBD, Kiambu Town, University..."
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-rocs-green"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    onClick={calculatePrice}
                    disabled={!pickup || !delivery || isCalculating}
                    className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 flex-1"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Price
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetCalculator}
                    variant="outline"
                    disabled={isCalculating}
                    className="border-rocs-green text-rocs-green hover:bg-rocs-green hover:text-white"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                {estimatedPrice ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Estimated Distance
                      </div>
                      <div className="text-2xl font-bold text-rocs-green">
                        {distance} km
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-sm text-gray-600 mb-2">
                        Estimated Cost
                      </div>
                      <div className="text-4xl font-bold text-rocs-yellow">
                        KES {estimatedPrice.toLocaleString()}
                      </div>
                    </div>

                    <Link to="/book-delivery">
                      <Button className="bg-rocs-green hover:bg-rocs-green-dark text-white w-full">
                        Book This Delivery
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>
                      Enter pickup and delivery locations to calculate price
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Popular Locations Examples */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">
                💡 Popular Locations You Can Try:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="text-blue-700">
                  <div className="font-medium">Shopping:</div>
                  <div>Westgate Mall</div>
                  <div>Junction Mall</div>
                  <div>Sarit Centre</div>
                </div>
                <div className="text-blue-700">
                  <div className="font-medium">Areas:</div>
                  <div>CBD, Karen</div>
                  <div>Kilimani, Westlands</div>
                  <div>Kiambu Town</div>
                </div>
                <div className="text-blue-700">
                  <div className="font-medium">Transport:</div>
                  <div>JKIA Airport</div>
                  <div>Railway Station</div>
                  <div>Thika Road</div>
                </div>
                <div className="text-blue-700">
                  <div className="font-medium">Universities:</div>
                  <div>University of Nairobi</div>
                  <div>Strathmore University</div>
                  <div>JKUAT</div>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="mt-8 bg-rocs-yellow-light rounded-lg p-6">
              <h3 className="text-lg font-semibold text-rocs-green mb-4">
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Service Area:</strong> Nairobi and surrounding areas
                </div>
                <div>
                  <strong>Payment:</strong> Cash or Mobile Money accepted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
