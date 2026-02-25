import { Users, Target, Award, Heart, Clock, Shield, Zap, CheckCircle, Package, Handshake, MapPin, Truck } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0a110d] pb-24 relative overflow-x-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22c55e]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 pt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          About Rocs Crew
        </h1>
        <p className="text-[#8b9d93] text-sm md:text-base text-center max-w-xl mx-auto mb-10 leading-relaxed px-2">
          We're more than just a delivery company. We're your trusted partner in connecting Nairobi through fast, reliable, and secure motorcycle delivery services.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: "5000+", label: "Successful Deliveries", icon: Package },
            { value: "500+", label: "Happy Businesses", icon: Handshake },
            { value: "98%", label: "Customer Satisfaction", icon: Heart },
            { value: "24/7", label: "Service Available", icon: Clock }
          ].map((stat, index) => (
            <div key={index} className="bg-gradient-to-b from-[#112417] to-[#0a110d] border border-[#22c55e]/30 rounded-2xl p-4 text-center shadow-[0_0_15px_rgba(34,197,94,0.05)] flex flex-col items-center">
              <stat.icon className="w-6 h-6 text-[#eab308] mb-3" />
              <div className="text-lg md:text-xl font-bold text-[#eab308] mb-1">{stat.value}</div>
              <div className="text-[10px] md:text-xs text-white leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Our Journey Timeline */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-8">Our Journey</h2>
          <div className="relative max-w-3xl mx-auto">
            {/* Center Line for desktop, left for mobile - wait mock is mobile so line is center-ish or slightly off center? The mock shows alternating cards on mobile! Let's do a central line. */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#eab308] via-[#eab308]/50 to-transparent" />

            <div className="space-y-6">
              {milestones.map((milestone, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={index} className="relative flex items-center justify-between w-full">

                    {/* Left Card */}
                    <div className={`w-[45%] ${isLeft ? 'opacity-100' : 'opacity-0 invisible'}`}>
                      <div className="bg-[#112417] border border-white/5 p-4 rounded-xl text-right">
                        <div className="text-xs font-bold text-[#8b9d93] mb-1 border border-white/10 rounded px-2 py-0.5 inline-block">{milestone.year}</div>
                        <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-end gap-2">
                          {milestone.title}
                          {index === 0 && <span className="text-lg">🚩</span>}
                          {index === 2 && <MapPin className="w-4 h-4 text-[#eab308]" />}
                        </h3>
                        <p className="text-[10px] text-[#8b9d93] leading-tight">{milestone.description}</p>
                      </div>
                    </div>

                    {/* Center Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-[#112417] border-2 border-[#eab308] shadow-[0_0_10px_rgba(234,179,8,0.5)] z-10" />

                    {/* Right Card */}
                    <div className={`w-[45%] ${!isLeft ? 'opacity-100' : 'opacity-0 invisible'}`}>
                      <div className="bg-[#112417] border border-white/5 p-4 rounded-xl text-left">
                        <div className="text-xs font-bold text-[#8b9d93] mb-1 border border-white/10 rounded px-2 py-0.5 inline-block">{milestone.year}</div>
                        <h3 className="text-sm font-bold text-white mb-1 flex items-center justify-start gap-2">
                          {milestone.title}
                          {index === 1 && <Truck className="w-4 h-4 text-[#eab308]" />}
                          {index === 3 && <Zap className="w-4 h-4 text-[#eab308]" />}
                        </h3>
                        <p className="text-[10px] text-[#8b9d93] leading-tight">{milestone.description}</p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Our Core Values */}
        <div className="mb-16 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Our Core Values</h2>
          <div className="grid grid-cols-2 gap-4">
            {values.map((value, index) => (
              <div key={index} className="bg-[#112417] border border-white/5 rounded-2xl p-5 hover:border-[#22c55e]/30 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <value.icon className="w-5 h-5 text-[#eab308]" />
                  <h3 className="font-bold text-white text-sm">{value.title}</h3>
                </div>
                <p className="text-[10px] text-[#8b9d93] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Meet Our Team */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-8">Meet Our Team</h2>
          <div className="flex justify-between items-start gap-2 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center w-1/4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-gradient-to-b from-[#eab308] to-transparent mb-3 shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#112417]">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 leading-tight">{member.name}</h3>
                <p className="text-[9px] sm:text-[10px] text-[#eab308] mb-1">{member.role}</p>
                <p className="text-[8px] sm:text-[9px] text-[#8b9d93] leading-tight line-clamp-3">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Rocs Crew? */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Why Choose Rocs Crew?</h2>
            <p className="text-[#8b9d93] text-xs">Here's what makes us different from other delivery services.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "Professional Riders", desc: "Professional trained riders with extensive Nairobi knowledge." },
              { title: "Real-time GPS", desc: "Real-time GPS tracking for complete transparency." },
              { title: "Competitive Pricing", desc: "Competitive pricing starting at KES 30 per kilometer." },
              { title: "Insurance Coverage", desc: "Insurance coverage for all deliveries." },
              { title: "24/7 Support", desc: "24/7 customer support and emergency services." },
              { title: "Eco-friendly Fleet", desc: "Environmentally friendly motorcycle fleet." },
              { title: "Same-day Delivery", desc: "Same-day delivery guarantee within Nairobi." },
              { title: "Flexible Payments", desc: "Flexible payment options including mobile money." }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#112417] border border-[#eab308] rounded-2xl p-4 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-[#eab308] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3 h-3 text-black" />
                  </div>
                  <h3 className="text-xs font-bold text-white leading-tight">{item.title}</h3>
                </div>
                <p className="text-[9px] text-[#8b9d93] leading-tight mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ready to Experience CTA */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-[#112417] rounded-3xl p-8 text-center relative overflow-hidden">
            {/* Inner background glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#eab308]/5 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-[#eab308] mb-3">Ready to Experience the Difference?</h2>
              <p className="text-sm text-white mb-6">Join thousands of satisfied customers who trust Rocs Crew for their delivery needs.</p>

              <div className="flex justify-center gap-4">
                <button className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold h-10 px-6 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all text-xs">
                  Book Delivery Now
                </button>
                <button className="bg-transparent border border-white hover:bg-white/5 text-white font-bold h-10 px-6 rounded-full transition-all text-xs">
                  Contact Our Team
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
