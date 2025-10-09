import { useState, useEffect } from "react";
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Grace Wanjiku",
    role: "Small Business Owner",
    company: "Grace's Boutique",
    location: "Westlands, Nairobi",
    rating: 5,
    content:
      "Rocs Crew has been amazing for my business. Their riders are professional and my packages always arrive on time. The tracking system gives me peace of mind and my customers love the transparency.",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b9090fd8?w=150&h=150&fit=crop&crop=face",
    deliveries: 45,
    joinDate: "March 2024",
  },
  {
    id: 2,
    name: "David Muturi",
    role: "E-commerce Manager",
    company: "TechMart Kenya",
    location: "CBD, Nairobi",
    rating: 5,
    content:
      "Fast, reliable, and affordable. We've been using Rocs Crew for our daily deliveries for 6 months now. Their rates are unbeatable at KES 30 per km and the service quality is consistently excellent.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    deliveries: 120,
    joinDate: "January 2024",
  },
  {
    id: 3,
    name: "Sarah Akinyi",
    role: "Online Seller",
    company: "Sarah's Fashion",
    location: "Kilimani, Nairobi",
    rating: 5,
    content:
      "The real-time tracking is fantastic! My customers love being able to see exactly where their orders are. Rocs Crew has helped grow my business significantly with their reliable service.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    deliveries: 78,
    joinDate: "February 2024",
  },
  {
    id: 4,
    name: "Michael Kiprop",
    role: "Restaurant Owner",
    company: "Mama's Kitchen",
    location: "Karen, Nairobi",
    rating: 5,
    content:
      "We use Rocs Crew for all our food deliveries. Their motorcycles are perfect for navigating Nairobi traffic, and they always handle our orders with care. Hot food arrives hot!",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    deliveries: 200,
    joinDate: "December 2023",
  },
  {
    id: 5,
    name: "Jane Njoki",
    role: "Freelance Designer",
    company: "Creative Studio",
    location: "Kileleshwa, Nairobi",
    rating: 5,
    content:
      "Excellent service! I regularly send documents and design materials to clients across Nairobi and Rocs Crew never disappoints. Professional, punctual, and reasonably priced.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    deliveries: 89,
    joinDate: "March 2024",
  },
  {
    id: 6,
    name: "Peter Macharia",
    role: "IT Consultant",
    company: "Tech Solutions Ltd",
    location: "Upperhill, Nairobi",
    rating: 5,
    content:
      "The admin dashboard for tracking orders is intuitive and the customer service is top-notch. Rocs Crew understands the needs of modern businesses and delivers accordingly.",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    deliveries: 156,
    joinDate: "November 2023",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-rocs-yellow fill-current" : "text-gray-300"
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
    // Initialize with correct value based on screen size
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    }
    return 3;
  });

  // Responsive testimonials per view
  useEffect(() => {
    const handleResize = () => {
      const newVisible =
        window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      setVisibleTestimonials(newVisible);
      // Reset to first slide when changing responsive view
      setCurrentSlide(0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlide = testimonials.length - visibleTestimonials;
        return prev >= maxSlide ? 0 : prev + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, visibleTestimonials]);

  const nextSlide = () => {
    const maxSlide = testimonials.length - visibleTestimonials;
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxSlide = testimonials.length - visibleTestimonials;
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const maxSlides = testimonials.length - visibleTestimonials + 1;

  return (
    <section className="py-10 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rocs-green rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-rocs-yellow rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-2 md:px-4 relative">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center space-x-2 bg-rocs-yellow/20 border border-rocs-yellow/30 rounded-full px-4 py-2 mb-4">
            <Quote className="w-4 h-4 text-rocs-green" />
            <span className="text-rocs-green font-medium text-sm md:text-base">
              Customer Stories
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-rocs-green mb-4 md:mb-6">
            What Our Customers Say
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Join thousands of satisfied customers who trust Rocs Crew for their
            delivery needs across Nairobi. Here's what they have to say about
            our service.
          </p>
        </div>

        {/* Testimonials Slider */}
        <div
          className="relative min-h-[400px] md:min-h-[500px]"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={() => setIsAutoPlaying(false)}
          onTouchEnd={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / visibleTestimonials)}%)`,
                width: `${(testimonials.length / visibleTestimonials) * 100}%`,
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="px-2 md:px-3"
                  style={{ width: `${100 / testimonials.length}%` }}
                >
                  <div className="bg-white rounded-2xl p-4 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full border border-gray-100">
                    {/* Quote Icon */}
                    <div className="flex items-start justify-between mb-6">
                      <Quote className="w-10 h-10 text-rocs-yellow flex-shrink-0" />
                      <StarRating rating={testimonial.rating} />
                    </div>

                    {/* Testimonial Content */}
                    <blockquote className="text-gray-700 mb-6 md:mb-8 leading-relaxed text-sm md:text-lg">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-4 border-rocs-yellow/20"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-rocs-green text-base md:text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-600 font-medium text-sm md:text-base">
                          {testimonial.role}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-rocs-green" />
                          <span className="truncate">
                            {testimonial.location}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-rocs-green" />
                          <span>Since {testimonial.joinDate}</span>
                        </div>
                      </div>
                      <div className="mt-3 bg-rocs-green/10 rounded-lg p-2 md:p-3">
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-rocs-green">
                            {testimonial.deliveries}+
                          </div>
                          <div className="text-xs text-gray-600">
                            Successful Deliveries
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-rocs-green" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide >= testimonials.length - visibleTestimonials}
            className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-rocs-green" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-6 md:mt-8 space-x-2 md:space-x-3">
          {Array.from({ length: maxSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 md:w-3 md:h-3 rounded-full transition-all duration-300 touch-manipulation ${
                index === currentSlide
                  ? "bg-rocs-green scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-rocs-green mb-2">
                5000+
              </div>
              <div className="text-gray-600">Deliveries Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-rocs-green mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-rocs-green mb-2">
                24/7
              </div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-rocs-green mb-2">
                500+
              </div>
              <div className="text-gray-600">Happy Businesses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
