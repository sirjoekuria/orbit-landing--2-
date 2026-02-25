import { ArrowRight, Phone, Clock, MapPin, Shield, Bell, User as UserIcon, Truck, Navigation, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export default function SlidingHero() {
  return (
    <section className="relative min-h-screen bg-[#0a110d] pt-20 pb-10 overflow-hidden flex items-center">
      {/* Background Rider Image with Gradient Overlay */}
      <div className="absolute top-0 right-0 w-full h-full md:w-2/3 pointer-events-none opacity-50 z-0 select-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a110d] via-[#0a110d]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a110d] via-transparent to-[#0a110d]/20 z-10" />
        <img
          src="/hero-rider.webp"
          alt="Delivery Rider"
          className="w-full h-full object-cover object-center translate-x-10 md:translate-x-20 scale-110"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#112417] border border-[#eab308]/20 mb-8 animate-fade-in">
            <div className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308]" />
            <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-[#eab308]">
              ROCS CREW DELIVERY
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-4 animate-slide-up">
            Fast &<br />Reliable<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#ca8a04]">
              Delivery
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-[#8b9d93] max-w-md mb-10 animate-slide-up delay-100 font-medium">
            Your parcels delivered safely across Nairobi and its surrounding areas with speed and precision.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 mb-12 animate-slide-up delay-200">
            {[
              { icon: Clock, label: "Same Day Delivery" },
              { icon: Navigation, label: "Real-time Tracking" },
              { icon: Shield, label: "Professional Riders" }
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#112417]/80 backdrop-blur-sm border border-white/5"
              >
                <feature.icon className="w-3.5 h-3.5 text-[#eab308]" />
                <span className="text-[11px] font-bold text-white/90">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md animate-slide-up delay-300">
            <Link to="/book-delivery" className="flex-1">
              <button className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-extrabold h-14 rounded-2xl flex items-center justify-center space-x-3 shadow-[0_10px_30px_rgba(234,179,8,0.2)] transition-all transform hover:-translate-y-1">
                <span>Book Delivery Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>

            <a href="tel:+254700898950" className="flex-1">
              <button className="w-full bg-transparent border-2 border-[#112417] hover:border-[#eab308]/30 text-white font-bold h-14 rounded-2xl flex items-center justify-center space-x-3 transition-all backdrop-blur-sm">
                <div className="p-2 rounded-full bg-[#eab308]/10">
                  <Phone className="w-4 h-4 text-[#eab308]" />
                </div>
                <span className="text-sm">+254 700 898 950</span>
              </button>
            </a>
          </div>

          {/* Quick Access Desktop (visible on larger screens) */}
          <div className="hidden md:flex gap-6 mt-12 animate-slide-up delay-400">
            <Link to="/calculate-price" className="flex items-center space-x-3 text-[#8b9d93] hover:text-[#eab308] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[#112417] border border-white/5 flex items-center justify-center group-hover:border-[#eab308]/30">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide">Calculate Price</span>
            </Link>
            <Link to="/tracking" className="flex items-center space-x-3 text-[#8b9d93] hover:text-[#eab308] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[#112417] border border-white/5 flex items-center justify-center group-hover:border-[#eab308]/30">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide">Track Order</span>
            </Link>
          </div>
        </div>

        {/* Quick Access Mobile Cards (visible only on mobile) */}
        <div className="mt-16 flex gap-4 md:hidden animate-slide-up delay-400">
          <Link to="/calculate-price" className="flex-1 p-5 rounded-3xl bg-[#112417] border border-[#eab308]/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center mb-3 shadow-[0_5px_15px_rgba(234,179,8,0.3)]">
              <Calculator className="w-6 h-6 text-black" />
            </div>
            <span className="text-[11px] font-black text-white uppercase tracking-wider">Calculate Rate</span>
          </Link>
          <Link to="/tracking" className="flex-1 p-5 rounded-3xl bg-transparent border border-[#112417] flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-2xl bg-[#0a110d] border border-[#eab308]/30 flex items-center justify-center mb-3 group-hover:border-[#eab308] transition-all">
              <MapPin className="w-6 h-6 text-[#eab308]" />
            </div>
            <span className="text-[11px] font-black text-white/60 uppercase tracking-wider">Track Order</span>
          </Link>
        </div>
      </div>

      {/* Subtle Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#eab308]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#22c55e]/5 blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
}

