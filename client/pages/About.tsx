import { Users, Target, Award, Heart, Clock, Shield, Zap, CheckCircle } from 'lucide-react';

const team = [
  {
    name: "Joseph Kuria",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    description: "Passionate about transforming delivery services in Kenya with over 10 years of logistics experience."
  },
  {
    name: "Peter Kimani",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    description: "Ensures smooth operations and quality service delivery across all our routes."
  },
  {
    name: "Mary Wanjiku",
    role: "Customer Success Manager",
    image: "https://images.unsplash.com/photo-1494790108755-2616b9090fd8?w=300&h=300&fit=crop&crop=face",
    description: "Dedicated to providing exceptional customer experience and building lasting relationships."
  },
  {
    name: "James Mwangi",
    role: "Lead Rider",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
    description: "Our most experienced rider with over 5000 successful deliveries and perfect safety record."
  }
];

const values = [
  {
    icon: Clock,
    title: "Reliability",
    description: "We deliver on time, every time. Our commitment to punctuality is unwavering."
  },
  {
    icon: Shield,
    title: "Security",
    description: "Your packages are safe with us. We treat every delivery with the utmost care."
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Customer satisfaction drives everything we do. We go above and beyond."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "We leverage technology to provide the best delivery experience in Kenya."
  }
];

const milestones = [
  { year: "2023", title: "Company Founded", description: "Rocs Crew started with a vision to revolutionize delivery in Nairobi" },
  { year: "2023", title: "First 100 Deliveries", description: "Reached our first milestone with 98% customer satisfaction" },
  { year: "2024", title: "1000+ Deliveries", description: "Expanded our team and covered all major areas in Nairobi" },
  { year: "2024", title: "5000+ Deliveries", description: "Now serving 500+ businesses with reliable delivery solutions" }
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rocs-green to-rocs-green-dark py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">About Rocs Crew</h1>
            <p className="text-xl leading-relaxed">
              We're more than just a delivery company. We're your trusted partner in connecting 
              Nairobi through fast, reliable, and secure motorcycle delivery services.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-12">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-rocs-green mr-3" />
                  <h2 className="text-3xl font-bold text-rocs-green">Our Mission</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To provide the fastest, most reliable, and affordable motorcycle delivery 
                  service in Nairobi, connecting businesses and individuals with seamless 
                  logistics solutions that power commerce and community.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-rocs-yellow mr-3" />
                  <h2 className="text-3xl font-bold text-rocs-green">Our Vision</h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To become East Africa's leading last-mile delivery platform, 
                  transforming how goods move across cities while creating sustainable 
                  employment opportunities for motorcycle riders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-rocs-green-light rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-rocs-green mb-2">5000+</div>
                <div className="text-gray-600">Successful Deliveries</div>
              </div>
              <div className="bg-rocs-yellow-light rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-rocs-green mb-2">500+</div>
                <div className="text-gray-600">Happy Businesses</div>
              </div>
              <div className="bg-rocs-green-light rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-rocs-green mb-2">98%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
              <div className="bg-rocs-yellow-light rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-rocs-green mb-2">24/7</div>
                <div className="text-gray-600">Service Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-rocs-green mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do at Rocs Crew
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-rocs-green rounded-full mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-rocs-green mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">
              From a simple idea to Nairobi's trusted delivery partner
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-rocs-green"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 bg-rocs-yellow rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="text-2xl font-bold text-rocs-green mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-rocs-green mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">
              The passionate people behind Rocs Crew's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-rocs-green font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-rocs-green mb-4">Why Choose Rocs Crew?</h2>
              <p className="text-lg text-gray-600">
                Here's what makes us different from other delivery services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                "Professional trained riders with extensive Nairobi knowledge",
                "Real-time GPS tracking for complete transparency",
                "Competitive pricing starting at KES 30 per kilometer",
                "Insurance coverage for all deliveries",
                "24/7 customer support and emergency services",
                "Environmentally friendly motorcycle fleet",
                "Same-day delivery guarantee within Nairobi",
                "Flexible payment options including mobile money"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-rocs-green flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-rocs-green">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Experience the Difference?</h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Join thousands of satisfied customers who trust Rocs Crew for their delivery needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-bold px-8 py-4 rounded-lg text-lg">
              Book Delivery Now
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-rocs-green font-bold px-8 py-4 rounded-lg text-lg">
              Contact Our Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
