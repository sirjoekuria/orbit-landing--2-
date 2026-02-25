import { useState } from "react";
import { MapPin, Calculator, ArrowRight, Loader2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const PRICE_PER_KM = 30;
const MINIMUM_PRICE = 200;
const MAPBOX_ACCESS_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const KENYAN_LANDMARKS = [
  { name: "Westgate Mall", coordinates: [36.8065, -1.2676] },
  { name: "Junction Mall", coordinates: [36.7819, -1.3019] },
  { name: "Sarit Centre", coordinates: [36.8103, -1.2676] },
  { name: "Village Market", coordinates: [36.815, -1.243] },
  { name: "Galleria Mall", coordinates: [36.765, -1.335] },
  { name: "Thika Road Mall", coordinates: [36.8833, -1.2167] },
  { name: "Garden City Mall", coordinates: [36.895, -1.21] },
  { name: "Yaya Centre", coordinates: [36.785, -1.295] },
  { name: "Two Rivers Mall", coordinates: [36.81, -1.23] },
  { name: "CBD", coordinates: [36.8172, -1.2864] },
  { name: "Westlands", coordinates: [36.8103, -1.2676] },
  { name: "Karen", coordinates: [36.7026, -1.3318] },
  { name: "JKIA Airport", coordinates: [36.9275, -1.3192] },
];

export default function PriceEstimator() {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeLocation = async (locationName: string): Promise<[number, number] | null> => {
    const queryLower = locationName.toLowerCase().trim();
    let landmark = KENYAN_LANDMARKS.find((l) => l.name.toLowerCase().includes(queryLower));
    if (landmark) return landmark.coordinates as [number, number];

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=KE&proximity=36.8219,-1.2921&limit=1`
      );
      const data = await response.json();
      return data.features?.[0]?.center;
    } catch (e) { return null; }
  };

  const calculateRouteDistance = async (p: [number, number], d: [number, number]): Promise<number | null> => {
    try {
      const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${p[0]},${p[1]};${d[0]},${d[1]}?access_token=${MAPBOX_ACCESS_TOKEN}`);
      const data = await response.json();
      return data.routes?.[0]?.distance / 1000;
    } catch (e) { return null; }
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
      const dist = await calculateRouteDistance(pCoords, dCoords);
      if (!dist) throw new Error("Could not calculate distance.");
      const finalPrice = Math.max(Math.round(dist * PRICE_PER_KM / 10) * 10, MINIMUM_PRICE);
      setDistance(Math.round(dist * 10) / 10);
      setEstimatedPrice(finalPrice);
    } catch (e: any) { setError(e.message); } finally { setIsCalculating(false); }
  };

  return (
    <section className="py-20 bg-[#0a110d] min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Calculate Delivery <span className="text-[#eab308]">Cost</span>
            </h2>
            <p className="text-[#8b9d93] max-w-md mx-auto font-medium">
              Transparent pricing for all zones across Nairobi.
            </p>
          </div>

          <div className="bg-[#112417] rounded-[2.5rem] border border-white/5 shadow-2xl p-8 md:p-12 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <Label htmlFor="pickup" className="text-white font-extrabold uppercase tracking-widest text-[10px] mb-3 block">
                    Pickup Point
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#eab308]" />
                    <Input
                      id="pickup"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Enter pickup area..."
                      className="bg-[#0a110d] border-[#eab308]/20 focus:border-[#eab308] text-white pl-12 h-14 rounded-2xl placeholder:text-gray-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="delivery" className="text-white font-extrabold uppercase tracking-widest text-[10px] mb-3 block">
                    Delivery Area
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#eab308]" />
                    <Input
                      id="delivery"
                      value={delivery}
                      onChange={(e) => setDelivery(e.target.value)}
                      placeholder="Where are we delivering?"
                      className="bg-[#0a110d] border-[#eab308]/20 focus:border-[#eab308] text-white pl-12 h-14 rounded-2xl placeholder:text-gray-600 transition-all font-medium"
                    />
                  </div>
                </div>

                {error && <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-xl border border-red-400/20">{error}</div>}

                <Button
                  onClick={calculatePrice}
                  disabled={isCalculating}
                  className="w-full h-14 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] text-black font-extrabold text-lg rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.2)]"
                >
                  {isCalculating ? <Loader2 className="animate-spin mr-2" /> : <Calculator className="mr-2" />}
                  {isCalculating ? "Calculating..." : "Estimate Now"}
                </Button>
              </div>

              <div className="bg-[#0a110d] rounded-3xl p-8 border border-white/5 flex flex-col justify-center items-center text-center">
                {estimatedPrice ? (
                  <div className="animate-fade-in w-full space-y-6">
                    <div>
                      <p className="text-[#8b9d93] text-sm uppercase font-bold tracking-widest mb-1">Total Distance</p>
                      <p className="text-3xl font-black text-white">{distance} km</p>
                    </div>
                    <div>
                      <p className="text-[#8b9d93] text-sm uppercase font-bold tracking-widest mb-1">Estimated Rate</p>
                      <p className="text-6xl font-black text-[#eab308]">KES {estimatedPrice}</p>
                    </div>
                    <Link to="/book-delivery" className="block pt-4">
                      <Button className="w-full h-14 bg-[#112417] border border-[#eab308]/30 hover:bg-[#eab308] hover:text-black text-[#eab308] font-bold rounded-2xl transition-all group">
                        Confirm & Book Now
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="opacity-30 flex flex-col items-center">
                    <Calculator className="w-20 h-20 text-[#8b9d93] mb-4" />
                    <p className="text-[#8b9d93] max-w-[200px] font-medium leading-tight">Enter your route to see the rate instantly.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 flex items-start space-x-4 p-6 rounded-2xl bg-[#0a110d] border border-white/5">
              <div className="p-3 rounded-xl bg-[#eab308]/10">
                <Info className="w-6 h-6 text-[#eab308] shrink-0" />
              </div>
              <div className="text-xs text-[#8b9d93] leading-relaxed">
                <p className="font-bold text-white mb-1 uppercase tracking-wider">Pricing Note</p>
                Rates start from KES 30/km with a minimum charge of KES 200. Estimates include standard loading time. Final pricing may vary based on specific package requirements or extreme traffic conditions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
