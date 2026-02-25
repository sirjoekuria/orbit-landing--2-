import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Akinyi",
    role: "Online Seller",
    company: "Sarah's Fashion",
    rating: 5,
    content:
      "The real-time tracking is fantastic! My customers love being able to see exactly where orders are. Rocs Crew has helped grow my business significantly with their reliable service.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    deliveries: "78+",
  },
  {
    id: 2,
    name: "Michael Kiprop",
    role: "Restaurant Owner",
    company: "Mama's Kitchen",
    rating: 5,
    content:
      "The real-time tracking is fantastic! My customers love being able to see exactly where orders are. Rocs Crew has helped grow my business significantly with their reliable service.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    deliveries: "200+",
  },
  {
    id: 3,
    name: "David Muturi",
    role: "E-commerce Manager",
    company: "TechMart Kenya",
    rating: 5,
    content:
      "Fast, reliable, and affordable. We've been using Rocs Crew for our daily deliveries for 6 months now. Their rates are unbeatable at KES 30 per km and the service quality is consistently excellent.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    deliveries: "120+",
  },
  {
    id: 4,
    name: "Grace Wanjiku",
    role: "Small Business Owner",
    company: "Grace's Boutique",
    rating: 5,
    content:
      "Rocs Crew has been amazing for my business. Their riders are professional and my packages always arrive on time. The tracking system gives me peace of mind and my customers love the transparency.",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b9090fd8?w=150&h=150&fit=crop&crop=face",
    deliveries: "45+",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-[#eab308] fill-current drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "text-gray-600"
            }`}
        />
      ))}
    </div>
  );
}

export default function SlidingTestimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleTestimonials, setVisibleTestimonials] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 2;
    }
    return 2;
  });

  useEffect(() => {
    const handleResize = () => {
      const newVisible =
        window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 2;
      setVisibleTestimonials(newVisible);
      setCurrentSlide(0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlide = testimonials.length - visibleTestimonials;
        return prev >= maxSlide ? 0 : prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, visibleTestimonials]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const maxSlides = testimonials.length - visibleTestimonials + 1;

  return (
    <section className="py-20 bg-[#0a110d] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-[#1a3824] rounded-full blur-[150px] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 bg-[#eab308] rounded-full px-5 py-2 mb-6 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <CheckCircle2 className="w-4 h-4 text-black fill-black/10" />
            <span className="text-black font-extrabold text-sm uppercase tracking-wide">
              Customer Stories
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            What Our<br />Customers Say
          </h2>
        </div>

        {/* Testimonials Slider */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={() => setIsAutoPlaying(false)}
          onTouchEnd={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden px-2 py-4">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / visibleTestimonials)}%)`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="px-4 flex-shrink-0"
                  style={{ width: `${100 / visibleTestimonials}%` }}
                >
                  <div className="bg-[#112417] rounded-[2rem] p-8 md:p-10 h-full border border-[#eab308]/40 shadow-[0_0_30px_rgba(234,179,8,0.15)] flex flex-col relative transition-transform hover:scale-[1.02] duration-300">

                    {/* Header: Quote and Stars */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-14 h-14 rounded-full bg-[#1a3824] flex items-center justify-center border border-[#eab308]/30 shrink-0">
                        <Quote className="w-6 h-6 text-[#eab308] fill-[#eab308]" />
                      </div>
                      <StarRating rating={testimonial.rating} />
                    </div>

                    {/* Testimonial Content */}
                    <blockquote className="text-[#8b9d93] mb-10 leading-relaxed text-lg font-normal flex-grow">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-4 mb-8">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#1a3824]"
                      />
                      <div>
                        <h4 className="font-bold text-white text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-[#8b9d93] text-sm">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>

                    {/* Successful Deliveries Badge */}
                    <div className="inline-flex items-center self-start bg-gradient-to-r from-[#eab308] to-[#ca8a04] px-4 py-2 rounded-full shadow-[0_4px_15px_rgba(234,179,8,0.3)]">
                      <span className="text-black font-bold text-sm">
                        {testimonial.deliveries} Successful Deliveries
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center items-center mt-12 space-x-2">
            {Array.from({ length: maxSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${index === currentSlide
                    ? "w-8 h-2 bg-[#eab308] shadow-[0_0_10px_rgba(234,179,8,0.6)]"
                    : "w-2 h-2 bg-gray-600 hover:bg-gray-400"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Statistics Divider separating sections */}
        <div className="w-full h-px bg-white/10 mt-20 mb-12" />

        {/* Trust Indicators (4 Column Clean Row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4 text-center">
          <div className="lg:border-r border-white/10 px-4 flex flex-col items-center justify-center">
            <div className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3">
              5000+
            </div>
            <div className="text-[#eab308] font-medium text-sm w-min whitespace-pre-wrap leading-tight">
              Deliveries Completed
            </div>
          </div>

          <div className="lg:border-r border-white/10 px-4 flex flex-col items-center justify-center">
            <div className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3">
              98%
            </div>
            <div className="text-[#eab308] font-medium text-sm w-min whitespace-pre-wrap leading-tight">
              Customer Satisfaction
            </div>
          </div>

          <div className="lg:border-r border-white/10 px-4 flex flex-col items-center justify-center">
            <div className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3">
              24/7
            </div>
            <div className="text-[#eab308] font-medium text-sm w-min whitespace-pre-wrap leading-tight">
              Customer Support
            </div>
          </div>

          <div className="px-4 flex flex-col items-center justify-center">
            <div className="text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3">
              500+
            </div>
            <div className="text-[#eab308] font-medium text-sm w-min whitespace-pre-wrap leading-tight">
              Happy Businesses
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
