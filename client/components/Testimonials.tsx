import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Grace Wanjiku",
    role: "Small Business Owner",
    location: "Westlands, Nairobi",
    rating: 5,
    content: "Rocs Crew has been amazing for my business. Their riders are professional and my packages always arrive on time. The tracking system gives me peace of mind.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b9090fd8?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "David Muturi",
    role: "E-commerce Manager",
    location: "CBD, Nairobi",
    rating: 5,
    content: "Fast, reliable, and affordable. We've been using Rocs Crew for our daily deliveries for 6 months now. Their rates are unbeatable at KES 30 per km.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Sarah Akinyi",
    role: "Online Seller",
    location: "Kilimani, Nairobi",
    rating: 5,
    content: "The real-time tracking is fantastic! My customers love being able to see exactly where their orders are. Rocs Crew has helped grow my business significantly.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Michael Kiprop",
    role: "Restaurant Owner",
    location: "Karen, Nairobi",
    rating: 5,
    content: "We use Rocs Crew for all our food deliveries. Their motorcycles are perfect for navigating Nairobi traffic, and they always handle our orders with care.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Jane Njoki",
    role: "Freelancer",
    location: "Kileleshwa, Nairobi",
    rating: 5,
    content: "Excellent service! I regularly send documents to clients across Nairobi and Rocs Crew never disappoints. Professional, punctual, and reasonably priced.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 6,
    name: "Peter Macharia",
    role: "IT Consultant",
    location: "Upperhill, Nairobi",
    rating: 5,
    content: "The admin dashboard for tracking orders is intuitive and the customer service is top-notch. Rocs Crew understands the needs of modern businesses.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face"
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-primary fill-current' : 'text-muted'
            }`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 font-outfit tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Join thousands of satisfied customers who trust Rocs Crew for their delivery needs across Nairobi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="flex items-start justify-between mb-8">
                <Quote className="w-10 h-10 text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
                <StarRating rating={testimonial.rating} />
              </div>

              <p className="text-muted-foreground mb-10 italic leading-relaxed font-medium">
                "{testimonial.content}"
              </p>

              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-border shadow-sm"
                />
                <div>
                  <h4 className="font-black text-foreground font-outfit">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium">
                    {testimonial.role}
                  </p>
                  <p className="text-[10px] text-primary uppercase font-black tracking-widest mt-1">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-24 bg-muted/30 border border-border/50 rounded-[3rem] p-12 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-center font-outfit">
            <div>
              <div className="text-4xl font-extrabold text-foreground mb-2">5000+</div>
              <div className="text-xs text-primary uppercase font-black tracking-widest">Deliveries Completed</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-foreground mb-2">98%</div>
              <div className="text-xs text-primary uppercase font-black tracking-widest">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-foreground mb-2">24/7</div>
              <div className="text-xs text-primary uppercase font-black tracking-widest">Customer Support</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-foreground mb-2">KES 30</div>
              <div className="text-xs text-primary uppercase font-black tracking-widest">Per Kilometer</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

