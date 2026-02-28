import { Package, Clock, Shield, Truck, MapPin, Phone, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background py-24 relative overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 font-outfit tracking-tight">
            Our <span className="text-primary italic">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and reliable delivery solutions tailored for your personal and business needs across Nairobi.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-card border border-border/50 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
            >
              {service.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest shadow-md">
                  Most Popular
                </div>
              )}

              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-10 h-10 text-primary" />
              </div>

              <h3 className="text-2xl font-black text-foreground mb-4 font-outfit tracking-tight leading-tight">
                {service.name}
              </h3>

              <p className="text-muted-foreground mb-8 font-medium leading-relaxed">
                {service.description}
              </p>

              <div className="w-full space-y-3 mb-10 text-left">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto w-full pt-8 border-t border-border/50 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Pricing</p>
                  <p className="text-lg font-black text-primary font-outfit">{service.price}</p>
                </div>
                <Link to="/calculate-price">
                  <button className="bg-muted hover:bg-primary hover:text-primary-foreground text-foreground px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                    Book
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h2 className="text-3xl font-black text-foreground mb-16 text-center font-outfit tracking-tight">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Book Online", description: "Quickly book through our mobile-friendly dashboard.", icon: Clock },
              { step: 2, title: "Pickup", description: "Our rider arrives at your location within minutes.", icon: Package },
              { step: 3, title: "Track", description: "Follow your package in real-time with GPS tracking.", icon: MapPin },
              { step: 4, title: "Delivered", description: "Safe and secure delivery with digital proof.", icon: Shield }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-card border border-border/50 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <item.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black text-xl shadow-lg rotate-12">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-black text-foreground text-xl mb-4 font-outfit tracking-tight">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[200px]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Container */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] p-12 shadow-xl mb-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h2 className="text-3xl font-black text-foreground mb-6 font-outfit tracking-tight">Extensive Coverage</h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8">
                We operate across all major residential and commercial areas in Nairobi. Wherever you are, ROCS is there.
              </p>
              <div className="flex flex-wrap gap-2">
                {coverage.slice(0, 8).map((area, i) => (
                  <span key={i} className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    {area}
                  </span>
                ))}
                <span className="bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  + More Areas
                </span>
              </div>
            </div>
            <div className="w-full md:w-1/2 h-64 bg-muted/50 rounded-[2.5rem] border border-border/50 flex items-center justify-center relative overflow-hidden group">
              <MapPin className="w-24 h-24 text-primary opacity-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-rocs-green-dark rounded-[3.5rem] p-16 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-primary-foreground mb-8 font-outfit tracking-tight">
              Ready to Send Your Package?
            </h2>
            <Link to="/calculate-price">
              <button className="bg-white text-primary hover:scale-[1.05] active:scale-[0.95] px-12 py-5 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl transition-all">
                Book Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

