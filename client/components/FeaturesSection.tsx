import { Clock, Shield, Zap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Clock,
    title: "Quick Delivery",
    description: "Same-day delivery across Nairobi",
    color: "bg-primary/10",
    iconColor: "text-primary"
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Your parcels are insured and protected",
    color: "bg-rocs-green/10",
    iconColor: "text-rocs-green"
  },
  {
    icon: Zap,
    title: "Real-time Tracking",
    description: "Track your delivery live on our platform",
    color: "bg-yellow-500/10",
    iconColor: "text-yellow-600"
  },
  {
    icon: MapPin,
    title: "Wide Coverage",
    description: "Delivery across Nairobi and suburbs",
    color: "bg-primary/10",
    iconColor: "text-primary"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Why Choose Rocs Crew</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 font-outfit">
            Our Key Features
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium font-outfit">
            Experience the best motorcycle delivery service in Nairobi with our comprehensive features
            designed to make your deliveries fast, secure, and reliable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card border border-border/50 rounded-[2.5rem] p-10 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:border-primary/30"
            >
              <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className={`w-10 h-10 ${feature.iconColor}`} />
              </div>

              <h3 className="text-2xl font-black text-foreground mb-4 font-outfit tracking-tight">
                {feature.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed font-medium">
                {feature.description}
              </p>

              {/* Decorative bottom indicator */}
              <div className="mt-8 w-16 h-1.5 bg-primary/20 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-primary w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="mt-24">
          <div className="bg-gradient-to-br from-primary to-rocs-green-dark rounded-[3rem] p-12 text-primary-foreground text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-card/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-card/10 rounded-full -ml-32 -mb-32 blur-3xl" />

            <h3 className="text-3xl md:text-4xl font-black mb-6 relative z-10 font-outfit">Ready to Experience Fast Delivery?</h3>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto font-medium relative z-10">
              Join thousands of satisfied customers and get your first delivery at an amazing rate!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
              <Link
                to="/calculate-price"
                className="bg-primary-foreground text-primary font-black px-10 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 text-lg"
              >
                Calculate Price
              </Link>
              <Link
                to="/tracking"
                className="bg-card/10 backdrop-blur-md border-2 border-primary-foreground/20 text-primary-foreground hover:bg-card/20 font-black px-10 py-4 rounded-2xl transition-all duration-300 text-lg"
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
