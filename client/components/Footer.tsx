import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

// Using simple SVG icons for Socials to exactly match the white thin-line circular aesthetic
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white text-white">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white text-white">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white text-white">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white text-white">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#0a110d] text-white pt-16 pb-12 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Top Section - Logo & Socials */}
        <div className="mb-12 max-w-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[#eab308] rounded-full flex items-center justify-center p-1.5 shrink-0">
              <img src="/logo.webp" alt="Rocs Crew Logo" className="w-full h-full object-contain filter brightness-0" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Rocs Crew</span>
          </div>
          <p className="text-[#8b9d93] mb-8 text-sm md:text-base leading-relaxed">
            Nairobi's premier motorcycle delivery service.<br />
            Fast, reliable, and affordable.
          </p>
          <div className="flex space-x-5">
            <a href="https://facebook.com" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white transition-colors group">
              <FacebookIcon />
            </a>
            <a href="https://twitter.com" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white transition-colors group">
              <XIcon />
            </a>
            <a href="https://instagram.com" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white transition-colors group">
              <InstagramIcon />
            </a>
            <a href="https://linkedin.com" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white transition-colors group">
              <LinkedinIcon />
            </a>
          </div>
        </div>

        {/* Middle Section - 4 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 pb-12 border-b border-white/10">

          {/* Column 1: Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base tracking-wide">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Join as Rider
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Our Services */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base tracking-wide">Our Services</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/services" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Same-day Delivery
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Express Delivery
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Real-time Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white font-bold mb-6 text-base tracking-wide">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#8b9d93] hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold mb-6 text-base tracking-wide">Contact Information</h3>
            <div className="space-y-5">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#eab308] mt-0.5 shrink-0" />
                <a href="tel:+254700898950" className="text-[#8b9d93] hover:text-white transition-colors text-sm mt-0.5">
                  +254 700 898 950
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#eab308] mt-0.5 shrink-0" />
                <a href="mailto:Kuriajoe85@gmail.com" className="text-[#8b9d93] hover:text-white transition-colors text-sm break-all mt-0.5">
                  Kuriajoe85@gmail.com
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#eab308] mt-0.5 shrink-0" />
                <div className="text-[#8b9d93] text-sm mt-0.5 leading-snug">
                  Nairobi & Surrounding<br />Areas
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#eab308] mt-0.5 shrink-0" />
                <div className="text-[#8b9d93] text-sm mt-0.5">
                  24/7 Service Available
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm">
            <div className="text-[#8b9d93] tracking-wider text-center md:text-left">
              © {new Date().getFullYear()} Rocs Crew. All rights reserved.
            </div>
            <div className="flex space-x-6 md:space-x-8">
              <Link to="/privacy" className="text-[#8b9d93] hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-[#8b9d93] hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-[#8b9d93] hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
