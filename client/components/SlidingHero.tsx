import { ArrowRight, Phone, Clock, MapPin, Shield, Bell, User as UserIcon, Truck, Navigation, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SlidingHero() {
  const [currentImage, setCurrentImage] = useState(0);

  const slidingImages = [
    "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1612006567758-1846b36dd130?w=1200&h=600&fit=crop",
    "https://images.unsplash.com/photo-1723986550735-a1f8d8e661ba?w=1200&h=600&fit=crop",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slidingImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-background pt-20 pb-10 overflow-hidden flex items-center transition-colors duration-300">
      {/* Sliding Background Images */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 select-none overflow-hidden">
        {slidingImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Delivery visual ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}
        {/* Gradient overlays to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 md:via-background/80 to-background/20 dark:to-background/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-muted border border-primary/20 mb-8 animate-fade-in">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
            <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-primary">
              ROCS CREW DELIVERY
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-8xl font-black text-foreground leading-[0.95] tracking-tight mb-4 animate-slide-up">
            Fast &<br />Reliable<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rocs-green-dark">
              Delivery
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground max-w-md mb-10 animate-slide-up delay-100 font-medium">
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
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-muted/80 backdrop-blur-sm border border-border"
              >
                <feature.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground/90">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md animate-slide-up delay-300">
            <Link to="/book-delivery" className="flex-1">
              <button className="w-full bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-extrabold h-14 rounded-2xl flex items-center justify-center space-x-3 shadow-lg transition-all transform hover:-translate-y-1">
                <span>Book Delivery Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>

            <a href="tel:+254700898950" className="flex-1">
              <button className="w-full bg-transparent border-2 border-muted hover:border-primary/30 text-foreground font-bold h-14 rounded-2xl flex items-center justify-center space-x-3 transition-all backdrop-blur-sm">
                <div className="p-2 rounded-full bg-primary/10">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">+254 700 898 950</span>
              </button>
            </a>
          </div>

          {/* Quick Access Desktop (visible on larger screens) */}
          <div className="hidden md:flex gap-6 mt-12 animate-slide-up delay-400">
            <Link to="/calculate-price" className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:border-primary/30">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide">Calculate Price</span>
            </Link>
            <Link to="/tracking" className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:border-primary/30">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide">Track Order</span>
            </Link>
          </div>
        </div>

        {/* Quick Access Mobile Cards (visible only on mobile) */}
        <div className="mt-16 flex gap-4 md:hidden animate-slide-up delay-400">
          <Link to="/calculate-price" className="flex-1 p-5 rounded-3xl bg-muted border border-primary/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-rocs-green-dark flex items-center justify-center mb-3 shadow-md">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-[11px] font-black text-foreground uppercase tracking-wider">Calculate Rate</span>
          </Link>
          <Link to="/tracking" className="flex-1 p-5 rounded-3xl bg-transparent border border-muted flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-2xl bg-background border border-primary/30 flex items-center justify-center mb-3 group-hover:border-primary transition-all">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[11px] font-black text-foreground/60 uppercase tracking-wider">Track Order</span>
          </Link>
        </div>
      </div>

      {/* Subtle Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 dark:bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-rocs-yellow/20 dark:bg-rocs-green/5 blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
}

