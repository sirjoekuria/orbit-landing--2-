import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Navigation, Package, Zap } from "lucide-react";
import MapboxMap from "./MapboxMap";
import { Input } from "./ui/input";

const PRICE_PER_KM = 35;
const BASE_FARE = 100;
const MINIMUM_PRICE = 150;
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

      const rawPrice = BASE_FARE + (dist * PRICE_PER_KM);
      const finalPrice = Math.max(Math.round(rawPrice / 10) * 10, MINIMUM_PRICE);
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
    <div className="relative h-[calc(100vh-64px)] w-full bg-background overflow-hidden flex flex-col transition-colors duration-300">
      {/* Absolute Back Button Header (Overlaid on Map) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="bg-card/90 backdrop-blur border border-border w-10 h-10 rounded-full flex items-center justify-center text-foreground pointer-events-auto hover:bg-muted transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-black text-foreground tracking-widest bg-card/80 px-6 py-2 rounded-2xl backdrop-blur-md pointer-events-auto shadow-sm border border-border/50 text-xs uppercase">Check Pricing</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapboxMap
          pickup={pickupLoc}
          dropoff={dropoffLoc}
          height="100%"
          className="w-full h-full opacity-40 saturate-[0.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background pointer-events-none" />
      </div>

      {/* Floating Inputs Card */}
      <div className="relative z-10 mx-6 mt-20 bg-card/80 backdrop-blur-xl rounded-[2rem] p-6 border border-primary/20 shadow-2xl pointer-events-auto overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />

        <div className="flex flex-col space-y-4 relative z-10">
          <div className="flex flex-col relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm z-10" />
            <Input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Pickup Location"
              className="bg-muted/50 border-none text-foreground placeholder:text-muted-foreground/40 pl-11 h-14 focus-visible:ring-1 focus-visible:ring-primary rounded-2xl"
            />
          </div>

          <div className="flex flex-col relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white shadow-sm z-10" />
            <Input
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              placeholder="Drop-off Location"
              className="bg-muted/50 border-none text-foreground placeholder:text-muted-foreground/40 pl-11 h-14 focus-visible:ring-1 focus-visible:ring-primary rounded-2xl"
            />
          </div>

          <button
            onClick={calculatePrice}
            className="mt-2 w-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest py-4 rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all flex items-center justify-center gap-3"
          >
            {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {isCalculating ? "Calculating Route..." : "Update Route"}
          </button>

          {error && <p className="text-destructive text-xs text-center font-bold">{error}</p>}
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom Sheet Drawer */}
      <div className="relative z-20 bg-card/90 backdrop-blur-2xl rounded-t-[3rem] border-t border-border p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] pb-12 transition-all duration-500">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-foreground font-outfit">Pricing Details</h3>
          {estimatedPrice && (
            <div className="bg-primary/10 px-5 py-2 rounded-2xl border border-primary/30 text-primary font-black text-sm uppercase tracking-wider">
              KES {selectedPlan === 'express' ? Math.round(estimatedPrice * 1.5) : estimatedPrice}.00
            </div>
          )}
        </div>

        {estimatedPrice ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {/* Standard Delivery */}
            <div
              onClick={() => setSelectedPlan("standard")}
              className={`relative cursor-pointer transition-all duration-300 rounded-[2rem] p-6 flex flex-col justify-between border-2 group ${selectedPlan === "standard"
                ? "border-primary bg-primary/5 shadow-inner"
                : "border-transparent bg-muted/40 hover:bg-muted/60"
                }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${selectedPlan === "standard" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Package className="w-6 h-6" />
                </div>
                {selectedPlan === "standard" && (
                  <div className="bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">SELECTED</div>
                )}
              </div>
              <div>
                <h4 className="font-black text-foreground text-xl font-outfit uppercase tracking-tight mb-1">Standard</h4>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium">45-60 mins</p>
                  <p className="font-black text-foreground text-lg">KES {estimatedPrice}.00</p>
                </div>
              </div>
            </div>

            {/* Express Delivery */}
            <div
              onClick={() => setSelectedPlan("express")}
              className={`relative cursor-pointer transition-all duration-300 rounded-[2rem] p-6 flex flex-col justify-between border-2 group ${selectedPlan === "express"
                ? "border-primary bg-primary/5 shadow-inner"
                : "border-transparent bg-muted/40 hover:bg-muted/60"
                }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${selectedPlan === "express" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Zap className="w-6 h-6" />
                </div>
                {selectedPlan === "express" && (
                  <div className="bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">SELECTED</div>
                )}
              </div>
              <div>
                <h4 className="font-black text-foreground text-xl font-outfit uppercase tracking-tight mb-1">Express</h4>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium">20-30 mins</p>
                  <p className="font-black text-foreground text-lg">KES {Math.round(estimatedPrice * 1.5)}.00</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground font-medium text-lg italic">
            Enter your pickup and delivery locations to see pricing.
          </div>
        )}

        <Link to="/book-delivery">
          <button className="w-full bg-gradient-to-r from-primary to-rocs-green-dark hover:scale-[1.02] active:scale-[0.98] text-primary-foreground font-black text-xl py-5 rounded-[2rem] shadow-2xl transition-all uppercase tracking-[0.2em]">
            BOOK NOW
          </button>
        </Link>
      </div>
    </div>
  );
}

