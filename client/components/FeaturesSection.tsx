import { Clock, Shield, Zap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Clock,
    title: "Quick Delivery",
    description: "Same-day delivery across Nairobi",
    color: "bg-blue-500"
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Your parcels are insured and protected",
    color: "bg-green-500"
  },
  {
    icon: Zap,
    title: "Real-time Tracking",
    description: "Track your delivery live on our platform",
    color: "bg-purple-500"
  },
  {
    icon: MapPin,
    title: "Wide Coverage",
    description: "Delivery across Nairobi and suburbs",
    color: "bg-orange-500"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-rocs-green/10 border border-rocs-green/20 rounded-full px-4 py-2 mb-4">
            <Zap className="w-4 h-4 text-rocs-green" />
            <span className="text-rocs-green font-medium">Why Choose Rocs Crew</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-rocs-green mb-6">
            Our Key Features
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the best motorcycle delivery service in Nairobi with our comprehensive features 
            designed to make your deliveries fast, secure, and reliable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:border-rocs-green/20"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-rocs-green mb-3 group-hover:text-rocs-green-dark transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative bottom border */}
              <div className="mt-6 w-12 h-1 bg-rocs-yellow rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-rocs-green to-rocs-green-dark rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience Fast Delivery?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of satisfied customers and get your first delivery at an amazing rate!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/calculate-price"
                className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Calculate Price
              </Link>
              <Link
                to="/tracking"
                className="border-2 border-white text-white hover:bg-white hover:text-rocs-green font-bold px-8 py-3 rounded-lg transition-all duration-300"
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
