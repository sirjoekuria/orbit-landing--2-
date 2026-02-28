import { Users, Heart, Clock, Shield, Zap, CheckCircle, Package, Handshake, MapPin, Truck } from 'lucide-react';

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
    role: "Customer Success",
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
    <div className="min-h-screen bg-background py-24 relative overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 font-outfit tracking-tight">
            About <span className="text-primary">Rocs Crew</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            We're more than just a delivery company. We're your trusted partner in connecting Nairobi through fast, reliable, and secure motorcycle delivery services.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {[
            { value: "5000+", label: "Deliveries", icon: Package },
            { value: "500+", label: "Businesses", icon: Handshake },
            { value: "98%", label: "Satisfaction", icon: Heart },
            { value: "24/7", label: "Availability", icon: Clock }
          ].map((stat, index) => (
            <div key={index} className="bg-card border border-border/50 rounded-[2rem] p-8 text-center shadow-xl flex flex-col items-center hover:-translate-y-2 transition-transform">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-black text-foreground mb-1 font-outfit">{stat.value}</div>
              <div className="text-xs text-primary font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline Journey */}
        <div className="mb-24">
          <h2 className="text-3xl font-black text-foreground mb-12 text-center font-outfit tracking-tight">Our Journey</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-1 bg-muted group-hover:bg-primary/20 transition-colors" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={index} className={`relative flex items-center justify-between w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-[45%]">
                      <div className={`bg-card border border-border/50 p-8 rounded-[2.5rem] shadow-xl hover:border-primary/30 transition-all ${isLeft ? 'text-right' : 'text-left'}`}>
                        <div className="text-xs font-black text-primary mb-3 bg-primary/10 px-3 py-1 rounded-full inline-block uppercase tracking-widest">{milestone.year}</div>
                        <h3 className="text-xl font-black text-foreground mb-3 font-outfit tracking-tight">
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-background border-4 border-primary shadow-xl z-10" />
                    <div className="w-[45%]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <h2 className="text-3xl font-black text-foreground mb-12 text-center font-outfit tracking-tight">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-card border border-border/50 rounded-[2.5rem] p-8 hover:border-primary/30 transition-all group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-black text-foreground text-xl mb-4 font-outfit tracking-tight">{value.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-black text-foreground mb-12 text-center font-outfit tracking-tight">Meet Our Team</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] p-1 bg-gradient-to-br from-primary to-transparent mb-6 shadow-2xl group-hover:scale-105 transition-all duration-500 overflow-hidden">
                  <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-muted">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-black text-foreground mb-1 font-outfit">{member.name}</h3>
                <p className="text-xs text-primary font-black uppercase tracking-widest mb-3">{member.role}</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[200px]">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] p-12 text-center shadow-xl">
          <h2 className="text-3xl font-black text-foreground mb-12 font-outfit tracking-tight">Why Choose Rocs Crew?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: "Pro Riders", desc: "Expert local knowledge." },
              { title: "Real-time", desc: "Live GPS tracking." },
              { title: "Fair Pricing", desc: "Starting KES 30/km." },
              { title: "24/7 Support", desc: "Always here for you." }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                  <CheckCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-black text-foreground text-sm uppercase tracking-tight mb-1">{item.title}</h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
