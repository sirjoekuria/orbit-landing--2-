import { Package, Clock, Shield, Truck, MapPin, Phone, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rocs-green to-rocs-green-dark py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-6">Our Delivery Services</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              From same-day delivery to bulk shipments, we provide comprehensive motorcycle 
              delivery solutions across Nairobi at competitive rates.
            </p>
            <button className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-bold px-8 py-4 rounded-lg text-lg transition-all">
              Get Quote Now
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-rocs-green mb-4">Choose Your Service</h2>
            <p className="text-lg text-gray-600">
              Select from our range of delivery options designed to meet your specific needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`relative bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 ${
                  service.popular ? 'border-2 border-rocs-yellow' : 'border border-gray-200'
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-rocs-yellow text-gray-800 px-4 py-1 rounded-full text-sm font-bold">
                      Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-rocs-green rounded-full mb-4">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-rocs-green flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center border-t pt-6">
                  <div className="text-2xl font-bold text-rocs-green mb-4">{service.price}</div>
                  <button className="w-full bg-rocs-green hover:bg-rocs-green-dark text-white font-semibold py-3 rounded-lg transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-rocs-green mb-4">Service Coverage</h2>
            <p className="text-lg text-gray-600">
              We deliver across Nairobi and its surrounding areas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {coverage.map((area, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-rocs-green hover:text-white transition-colors">
                <span className="font-medium">{area}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Don't see your area? Contact us for custom delivery solutions.</p>
            <button className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-bold px-6 py-3 rounded-lg">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-rocs-green mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">
              Simple steps to get your packages delivered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Book Online", description: "Place your order through our website or call us", icon: Phone },
              { step: 2, title: "Package Pickup", description: "Our rider collects your package from the pickup location", icon: Package },
              { step: 3, title: "Real-time Tracking", description: "Track your delivery live with GPS updates", icon: MapPin },
              { step: 4, title: "Safe Delivery", description: "Package delivered safely to the destination", icon: Shield }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-rocs-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-rocs-yellow rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-800">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-rocs-green">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Send Your Package?</h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Get started with Rocs Crew today and experience reliable delivery service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/calculate-price"
              className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-bold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Calculate Price
            </Link>
            <a
              href="tel:+254700898950"
              className="border-2 border-white text-white hover:bg-white hover:text-rocs-green font-bold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Call +254 700 898 950
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
