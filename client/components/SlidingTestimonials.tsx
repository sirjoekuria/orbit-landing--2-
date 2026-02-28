import { useState, useEffect } from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

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
      "We use Rocs Crew for all our food deliveries. Their motorcycles are perfect for navigating Nairobi traffic, and they always handle our orders with care.",
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
          className={`w-5 h-5 ${i < rating ? "text-primary fill-current drop-shadow-md" : "text-muted/30"
            }`}
        />
      ))}
    </div>
  );
}

export default function SlidingTestimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleTestimonials, setVisibleTestimonials] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      setVisibleTestimonials(window.innerWidth < 768 ? 1 : 2);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= testimonials.length - visibleTestimonials ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, visibleTestimonials]);

  const maxSlides = testimonials.length - visibleTestimonials + 1;

  return (
    <section className="py-24 bg-background relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-primary/5 rounded-full blur-[150px] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-6 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-primary font-black text-xs uppercase tracking-widest">
              Customer Stories
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-foreground leading-tight tracking-tight font-outfit">
            What Our<br />Customers Say
          </h2>
        </div>

        <div
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden py-8">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (100 / visibleTestimonials)}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="px-4 flex-shrink-0"
                  style={{ width: `${100 / visibleTestimonials}%` }}
                >
                  <div className="bg-card rounded-[3rem] p-10 h-full border border-border shadow-xl flex flex-col relative transition-all hover:shadow-2xl hover:-translate-y-2 duration-300">
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <Quote className="w-8 h-8 text-primary fill-primary" />
                      </div>
                      <StarRating rating={testimonial.rating} />
                    </div>

                    <blockquote className="text-muted-foreground mb-10 leading-relaxed text-lg font-medium flex-grow italic">
                      "{testimonial.content}"
                    </blockquote>

                    <div className="flex items-center space-x-4 mb-8">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-border shadow-md"
                      />
                      <div>
                        <h4 className="font-black text-foreground text-lg font-outfit">
                          {testimonial.name}
                        </h4>
                        <p className="text-muted-foreground text-sm font-medium">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex items-center self-start bg-primary/10 px-5 py-2.5 rounded-2xl border border-primary/20">
                      <span className="text-primary font-black text-xs uppercase tracking-wider">
                        {testimonial.deliveries} Successful Deliveries
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center mt-12 space-x-3">
            {Array.from({ length: maxSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${index === currentSlide ? "w-10 h-3 bg-primary" : "w-3 h-3 bg-muted hover:bg-muted-foreground"}`}
              />
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-border/50 mt-24 mb-16" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 text-center font-outfit">
          <div className="lg:border-r border-border px-4">
            <div className="text-4xl md:text-5xl font-black text-foreground mb-3">5000+</div>
            <div className="text-primary font-black text-xs uppercase tracking-widest leading-tight">Deliveries Completed</div>
          </div>
          <div className="lg:border-r border-border px-4">
            <div className="text-4xl md:text-5xl font-black text-foreground mb-3">98%</div>
            <div className="text-primary font-black text-xs uppercase tracking-widest leading-tight">Customer Satisfaction</div>
          </div>
          <div className="lg:border-r border-border px-4">
            <div className="text-4xl md:text-5xl font-black text-foreground mb-3">24/7</div>
            <div className="text-primary font-black text-xs uppercase tracking-widest leading-tight">Customer Support</div>
          </div>
          <div className="px-4">
            <div className="text-4xl md:text-5xl font-black text-foreground mb-3">500+</div>
            <div className="text-primary font-black text-xs uppercase tracking-widest leading-tight">Happy Businesses</div>
          </div>
        </div>
      </div>
    </section>
  );
}
