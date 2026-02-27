import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Loader2, Navigation, Package, Zap } from "lucide-react";
import MapboxMap from "./MapboxMap";
import { Input } from "./ui/input";

const PRICE_PER_KM = 30;
const MINIMUM_PRICE = 200;
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const KENYAN_LANDMARKS = [
  { name: "Westgate Mall", coordinates: [36.8065, -1.2676] },
  { name: "Junction Mall", coordinates: [36.7819, -1.3019] },
  { name: "Sarit Centre", coordinates: [36.8103, -1.2676] },
  { name: "Village Market", coordinates: [36.815, -1.243] },
  { name: "Galleria Mall", coordinates: [36.765, -1.335] },
  { name: "Thika Road Mall", coordinates: [36.8833, -1.2167] },
  { name: "CBD", coordinates: [36.8172, -1.2864] },
  { name: "Upper Hill", coordinates: [36.8166, -1.2985] },
  { name: "Westlands", coordinates: [36.8103, -1.2676] },
];

export default function PriceEstimator() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("Westlands");
  const [delivery, setDelivery] = useState("Upper Hill");

  const [pickupLoc, setPickupLoc] = useState<any>(null);
  const [dropoffLoc, setDropoffLoc] = useState<any>(null);

  const [distance, setDistance] = useState<number | null>(4.2);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(750);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<"standard" | "express">("standard");

  // Geocode strings to coordinates
  const geocodeLocation = async (locationName: string) => {
    const queryLower = locationName.toLowerCase().trim();
    const landmark = KENYAN_LANDMARKS.find((l) => l.name.toLowerCase().includes(queryLower));
    if (landmark) return landmark.coordinates;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=KE&proximity=36.8219,-1.2921&limit=1`
      );
      const data = await response.json();
      return data.features?.[0]?.center;
    } catch (e) {
      return null;
    }
  };

  const calculateRouteDistance = async (p: [number, number], d: [number, number]) => {
    try {
      const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${p[0]},${p[1]};${d[0]},${d[1]}?access_token=${MAPBOX_ACCESS_TOKEN}`);
      const data = await response.json();
      return data.routes?.[0]?.distance / 1000;
    } catch (e) {
      return null;
    }
  };

  const calculatePrice = async () => {
    if (!pickup || !delivery) {
      setError("Please enter both locations");
      return;
    }
    setIsCalculating(true);
    setError(null);
    try {
      const pCoords = await geocodeLocation(pickup);
      const dCoords = await geocodeLocation(delivery);

      if (!pCoords || !dCoords) throw new Error("Could not find one of the locations.");

      setPickupLoc({ name: pickup, address: pickup, lng: pCoords[0], lat: pCoords[1] });
      setDropoffLoc({ name: delivery, address: delivery, lng: dCoords[0], lat: dCoords[1] });

      const dist = await calculateRouteDistance(pCoords, dCoords);
      if (!dist) throw new Error("Could not calculate distance.");

      const finalPrice = Math.max(Math.round(dist * PRICE_PER_KM / 10) * 10, MINIMUM_PRICE);
      setDistance(Math.round(dist * 10) / 10);
      setEstimatedPrice(finalPrice);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsCalculating(false);
    }
  };

  // Run initial calculation based on defaults
  useEffect(() => {
    calculatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-[calc(100vh-64px)] w-full bg-[#0a110d] overflow-hidden flex flex-col">
      {/* Absolute Back Button Header (Overlaid on Map) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="bg-[#112417]/90 backdrop-blur border border-white/10 w-10 h-10 rounded-full flex items-center justify-center text-white pointer-events-auto hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-white tracking-wide bg-[#112417]/80 px-4 py-2 rounded-full backdrop-blur pointer-events-auto">Check Pricing</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapboxMap
          pickup={pickupLoc}
          dropoff={dropoffLoc}
          height="100%"
          className="w-full h-full opacity-60 saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a110d]/50 via-transparent to-[#0a110d] pointer-events-none" />
      </div>

      {/* Floating Inputs Card */}
      <div className="relative z-10 mx-4 mt-20 bg-[#112417]/90 backdrop-blur-md rounded-2xl p-4 border border-[#eab308]/20 shadow-xl pointer-events-auto">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
            <Input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Pickup Location"
              className="bg-[#0a110d]/50 border-white/5 text-white pl-10 h-12 focus:border-[#eab308] rounded-t-xl rounded-b-none"
            />
          </div>

          <div className="absolute left-4 top-14 bottom-14 w-0.5 bg-gray-700/50 z-20" />

          <div className="flex flex-col relative mt-0.5">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#eab308] rounded-full" />
            <Input
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              placeholder="Drop-off Location"
              className="bg-[#0a110d]/50 border-white/5 text-white pl-10 h-12 focus:border-[#eab308] rounded-b-xl rounded-t-none"
            />
          </div>

          <button
            onClick={calculatePrice}
            className="mt-2 w-full bg-[#1e2f23] text-white text-sm font-semibold py-3 rounded-xl border border-white/10 hover:border-[#eab308]/50 transition-colors flex items-center justify-center gap-2"
          >
            {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-[#eab308]" />}
            {isCalculating ? "Calculating Route..." : "Update Route"}
          </button>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom Sheet Drawer */}
      <div className="relative z-20 bg-[#112417] rounded-t-[32px] border-t border-white/10 p-6 md:p-8 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] animate-slide-up pb-10">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Pricing Details</h3>
          {estimatedPrice && (
            <div className="border border-[#eab308] px-4 py-1.5 rounded-full text-[#eab308] font-bold text-sm bg-[#eab308]/10">
              Total Cost : KES {selectedPlan === 'express' ? Math.round(estimatedPrice * 1.5) : estimatedPrice}.00
            </div>
          )}
        </div>

        {estimatedPrice ? (
          <div className="space-y-4 mb-8">
            {/* Standard Delivery */}
            <div
              onClick={() => setSelectedPlan("standard")}
              className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-4 flex items-center justify-between border-2 ${selectedPlan === "standard"
                  ? "border-[#eab308] bg-[#1a2e20]/50"
                  : "border-transparent bg-[#0a110d] hover:border-white/10"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${selectedPlan === "standard" ? "bg-[#eab308] text-black" : "bg-[#112417] text-white"}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Standard</h4>
                  <p className="text-gray-400 text-sm">45-60 mins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white text-lg">KES {estimatedPrice}.00</p>
                {selectedPlan === "standard" && (
                  <span className="text-xs text-[#eab308] font-semibold bg-[#eab308]/10 px-2 py-1 rounded-md mt-1 inline-block">SELECTED</span>
                )}
              </div>
            </div>

            {/* Express Delivery */}
            <div
              onClick={() => setSelectedPlan("express")}
              className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-4 flex items-center justify-between border-2 ${selectedPlan === "express"
                  ? "border-[#eab308] bg-[#1a2e20]/50"
                  : "border-transparent bg-[#0a110d] hover:border-white/10"
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${selectedPlan === "express" ? "bg-[#eab308] text-black" : "bg-[#112417] text-white"}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Express</h4>
                  <p className="text-gray-400 text-sm">20-30 mins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white text-lg">KES {Math.round(estimatedPrice * 1.5)}.00</p>
                {selectedPlan === "express" && (
                  <span className="text-xs text-[#eab308] font-semibold bg-[#eab308]/10 px-2 py-1 rounded-md mt-1 inline-block">SELECTED</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm">
            Enter your pickup and delivery locations to see pricing.
          </div>
        )}

        <Link to="/book-delivery">
          <button className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-extrabold text-lg py-4 rounded-xl shadow-[0_10px_30px_rgba(234,179,8,0.2)] transition-all">
            BOOK NOW
          </button>
        </Link>
      </div>
    </div>
  );
}
