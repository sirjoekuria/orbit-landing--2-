import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Shield, Zap } from 'lucide-react';
import { Button } from './ui/button';

const heroSlides = [
  {
    id: 1,
    title: "Fast & Reliable Delivery",
    subtitle: "Your parcels delivered safely across Nairobi",
    description: "Professional motorcycle delivery service with real-time tracking and guaranteed safety.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
    cta: "Book Delivery Now"
  },
  {
    id: 2,
    title: "Track Your Order Live",
    subtitle: "Real-time updates on your delivery",
    description: "Know exactly where your parcel is with our advanced GPS tracking system.",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&h=600&fit=crop",
    cta: "Track Order"
  },
  {
    id: 3,
    title: "Affordable Rates",
    subtitle: "KES 30 per kilometer",
    description: "Transparent pricing with no hidden fees. Calculate your delivery cost instantly.",
    image: "https://images.unsplash.com/photo-1574116194873-cf8b53ad7c3a?w=1200&h=600&fit=crop",
    cta: "Calculate Price"
  }
];

const features = [
  {
    icon: Clock,
    title: "Quick Delivery",
    description: "Same-day delivery across Nairobi"
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Your parcels are insured and protected"
  },
  {
    icon: Zap,
    title: "Real-time Tracking",
    description: "Track your delivery live on our platform"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-4 text-rocs-yellow">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg mb-8 leading-relaxed">
                    {slide.description}
                  </p>
                  <Button size="lg" className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-semibold px-8 py-3">
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-rocs-yellow' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>

      {/* Feature Cards */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-white">
                <feature.icon className="w-8 h-8 text-rocs-yellow mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm opacity-90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
