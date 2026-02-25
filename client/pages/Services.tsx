import { Package, Clock, Shield, Truck, MapPin, Phone, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    id: 1,
    name: "Same-Day Delivery",
    description: "Get your packages delivered within the same day across Nairobi",
    icon: Clock,
    features: ["Delivery within 2-6 hours", "Real-time tracking", "SMS notifications"],
    price: "From KES 150",
    popular: true
  },
  {
    id: 2,
    name: "Express Delivery",
    description: "Urgent deliveries for time-sensitive packages",
    icon: Truck,
    features: ["Delivery within 1-2 hours", "Priority handling", "Direct route"],
    price: "From KES 300",
    popular: false
  },
  {
    id: 3,
    name: "Document Delivery",
    description: "Secure delivery of important documents and contracts",
    icon: Package,
    features: ["Secure handling", "Signature confirmation", "Insurance included"],
    price: "From KES 100",
    popular: false
  },
  {
    id: 4,
    name: "Package Delivery",
    description: "Reliable delivery for all types of packages and goods",
    icon: Shield,
    features: ["Weight up to 20kg", "Fragile item handling", "Package insurance"],
    price: "From KES 30/km",
    popular: true
  },
  {
    id: 5,
    name: "Food Delivery",
    description: "Hot food delivery from restaurants to your doorstep",
    icon: MapPin,
    features: ["Insulated delivery bags", "Temperature control", "Quick delivery"],
    price: "From KES 120",
    popular: false
  },
  {
    id: 6,
    name: "Bulk Delivery",
    description: "Cost-effective solutions for multiple deliveries",
    icon: Package,
    features: ["Volume discounts", "Route optimization", "Dedicated support"],
    price: "Custom pricing",
    popular: false
  }
];

const coverage = [
  "Nairobi CBD", "Westlands", "Karen", "Kilimani", "Kileleshwa", "Lavington",
  "Parklands", "Eastleigh", "South B", "South C", "Langata", "Kasarani",
  "Thika Road", "Ngong Road", "Waiyaki Way", "Riverside", "Upperhill",
  "Gigiri", "Runda", "Muthaiga", "Spring Valley", "Loresho"
];

export default function Services() {
  return (
    <div className="min-h-screen bg-[#0a110d] pb-24 relative overflow-x-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22c55e]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
          Premium Services
        </h1>

        {/* Horizontal Service Cards */}
        <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="snap-center shrink-0 w-[140px] md:w-[160px] bg-gradient-to-b from-[#112417] to-[#0a110d] border border-[#22c55e]/30 p-4 rounded-3xl flex flex-col items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:border-[#22c55e]/80 transition-all group"
            >
              <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center mb-3">
                <service.icon className="w-6 h-6 text-[#eab308] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center flex-grow flex flex-col justify-center mb-4">
                <h3 className="text-sm font-bold text-white mb-1 leading-tight">
                  {service.name.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h3>
                <p className="text-[10px] text-[#8b9d93] leading-tight">
                  {service.description.split('.')[0]} {/* Keep it very short */}
                </p>
              </div>
              <div className="w-full bg-[#1c2c1a] border border-[#eab308]/60 text-[#eab308] text-[10px] font-bold py-1.5 px-2 rounded-full text-center whitespace-nowrap shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                {service.price}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-8">How It Works</h2>

          <div className="relative pl-4">
            {/* Vertical Line */}
            <div className="absolute left-[34px] top-6 bottom-6 w-[2px] bg-[#eab308]/40" />

            <div className="space-y-8">
              {[
                { step: 1, title: "Book Online", description: "Book your delivery online through our app or mobile phone.", icon: Phone },
                { step: 2, title: "Package Pickup", description: "Choose early pickup for your package driver delivery.", icon: Package },
                { step: 3, title: "Real-time Tracking", description: "Real-time tracking pin and real time in our platform.", icon: MapPin },
                { step: 4, title: "Safe Delivery", description: "Secure checkmark  meaning you're tracking and protects delivery.", icon: Shield }
              ].map((item, index) => (
                <div key={index} className="flex flex-row items-center relative z-10 w-full">
                  <div className="w-10 h-10 bg-gradient-to-b from-[#eab308] to-[#9a6b0c] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.4)] mr-6 border-2 border-[#112417]">
                    <span className="text-black font-bold text-lg">{item.step}</span>
                  </div>
                  <div className="bg-transparent flex-grow flex items-center space-x-4">
                    <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base mb-1">{item.title}</h3>
                      <p className="text-[#8b9d93] text-xs leading-relaxed max-w-[260px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Coverage */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Service Coverage</h2>
          <div className="flex flex-wrap gap-3">
            {[...coverage].slice(0, 12).map((area, index) => (
              <div
                key={index}
                className="bg-[#112417] border border-[#22c55e]/30 px-4 py-2 rounded-full text-sm text-[#8b9d93] hover:text-white hover:border-[#22c55e] transition-colors"
              >
                {area}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ready to Send CTA */}
      <div className="container mx-auto px-4 mt-16 mt-auto">
        <div className="max-w-md mx-auto bg-gradient-to-b from-[#112417] to-[#0a110d] rounded-t-[2.5rem] rounded-b-xl border border-white/5 p-8 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-20">
          <h2 className="text-2xl font-bold text-white mb-6">
            Ready to Send Your Package?
          </h2>
          <Link to="/calculate-price" className="block w-full">
            <button className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold py-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.3)] text-lg transition-all">
              Calculate Price
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
