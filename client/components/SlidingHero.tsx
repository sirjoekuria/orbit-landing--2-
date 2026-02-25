import { useRef } from "react";
import { Clock, ShieldCheck, Zap, MapPin } from "lucide-react";

export default function SlidingHero() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Clock,
      title: "Quick Delivery",
      description: "Same-day delivery across Nairobi.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Safe",
      description: "Insured and protected parcels.",
    },
    {
      icon: Zap,
      title: "Real-time Tracking",
      description: "Track live on our platform.",
    },
    {
      icon: MapPin,
      title: "Wide Coverage",
      description: "Nairobi and suburbs.",
    },
  ];

  return (
    <section className="relative min-h-[90vh] md:min-h-screen bg-[#0a110d] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Subtle top background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-[#1a3824] rounded-[100%] blur-[120px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">

          {/* Header Typography */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Experience<br />Fast Delivery
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium">
              Nairobi's most trusted motorcycle service.
            </p>
          </div>

          {/* Horizontal Scrolling Feature Cards */}
          <div className="relative w-full max-w-5xl mx-auto mt-8 mb-4">
            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar pt-4 px-4 -mx-4 md:mx-0 md:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
              `}} />

              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex-none w-[200px] sm:w-[220px] bg-[#112417] border border-green-900/50 rounded-2xl p-6 text-left flex flex-col justify-start shadow-[0_4px_20px_rgba(26,56,36,0.5)] snap-center transition-transform hover:scale-105 duration-300 pointer-events-auto"
                >
                  <div className="w-10 h-10 rounded-full border border-[#eab308]/30 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-[#eab308]" />
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-snug">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination Indicators (Mockup shows a pill and dots) */}
            <div className="flex justify-center items-center space-x-2 -mt-2 mb-8">
              <div className="w-8 h-1.5 bg-white rounded-full opacity-80" />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-row justify-center items-center gap-4 sm:gap-6 pt-4">
            <a href="/book-delivery">
              <button className="bg-gradient-to-b from-[#fde047] to-[#ca8a04] hover:brightness-110 text-black font-bold px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-sm sm:text-base transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] whitespace-nowrap">
                Calculate Price
              </button>
            </a>
            <a href="/tracking">
              <button className="bg-transparent border border-white/40 text-white hover:bg-white/10 font-bold px-6 sm:px-10 py-3.5 sm:py-4 rounded-full text-sm sm:text-base transition-all duration-300 whitespace-nowrap">
                Track Your Order
              </button>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
