import { useState, useEffect } from "react";
import { Zap, Phone } from "lucide-react";

const heroSlides = [
  {
    id: 1,
    title: "Fast & Reliable Delivery",
    subtitle: "Your parcels delivered safely across Nairobi",
    description:
      "Professional motorcycle delivery service with real-time tracking and guaranteed safety. Experience the fastest delivery in Kenya.",
    image: "https://images.pexels.com/photos/7363190/pexels-photo-7363190.jpeg",
    cta: "Book Delivery Now",
    features: [
      "Same Day Delivery",
      "Real-time Tracking",
      "Professional Riders",
    ],
  },
  {
    id: 2,
    title: "Track Your Order Live",
    subtitle: "Real-time updates on your delivery",
    description:
      "Know exactly where your parcel is with our advanced GPS tracking system. Get live updates from pickup to delivery.",
    image:
      "https://images.pexels.com/photos/29019655/pexels-photo-29019655.jpeg",
    cta: "Track Order",
    features: ["GPS Tracking", "Live Updates", "Delivery Confirmation"],
  },
  {
    id: 3,
    title: "Affordable Rates",
    subtitle: "KES 30 per kilometer",
    description:
      "Transparent pricing with no hidden fees. Calculate your delivery cost instantly and enjoy competitive rates across Nairobi.",
    image: "https://images.pexels.com/photos/6868558/pexels-photo-6868558.jpeg",
    cta: "Calculate Price",
    features: ["Transparent Pricing", "No Hidden Fees", "Instant Quotes"],
  },
  {
    id: 4,
    title: "Professional Service",
    subtitle: "Trained & experienced riders",
    description:
      "Our team of professional motorcycle riders ensures your packages are handled with care and delivered on time, every time.",
    image: "https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg",
    cta: "Learn More",
    features: ["Trained Riders", "Insured Packages", "24/7 Support"],
  },
];

export default function SlidingHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section
      className="relative h-screen overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          }`}
        >
          <div className="relative h-full">
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl">
                  <div className="text-white space-y-6">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-rocs-yellow/20 backdrop-blur-sm border border-rocs-yellow/30 rounded-full px-4 py-2">
                      <Zap className="w-4 h-4 text-rocs-yellow" />
                      <span className="text-rocs-yellow font-medium">
                        Rocs Crew Delivery
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-3xl text-rocs-yellow font-semibold">
                      {slide.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-lg md:text-xl leading-relaxed max-w-2xl opacity-90">
                      {slide.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-4">
                      {slide.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1"
                        >
                          <div className="w-2 h-2 bg-rocs-yellow rounded-full" />
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <a href="/book-delivery">
                        <button className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                          {slide.cta}
                        </button>
                      </a>
                      <button className="border-2 border-white text-white hover:bg-white hover:text-gray-800 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-5 h-5" />
                          <span>Call +254 700 898 950</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-rocs-yellow scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-rocs-yellow transition-all duration-6000 ease-linear"
          style={{
            width: `${((currentSlide + 1) / heroSlides.length) * 100}%`,
            transition: isAutoPlaying ? "width 6s linear" : "width 0.3s ease",
          }}
        />
      </div>
    </section>
  );
}
