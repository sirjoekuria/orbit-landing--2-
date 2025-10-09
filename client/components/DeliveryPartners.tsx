import { useState } from 'react';
import { ExternalLink, Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';

const partners = [
  {
    id: 1,
    name: "Jumia Kenya",
    logo: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=100&h=50",
    category: "E-commerce",
    description: "Leading online marketplace in Kenya",
    services: ["Same-day delivery", "Express shipping", "Cash on delivery"],
    deliveries: "2000+",
    partnership: "Premium Partner",
    website: "jumia.co.ke",
  },
  {
    id: 2,
    name: "Glovo Kenya",
    logo: "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?auto=format&fit=crop&w=100&h=50",
    category: "Food Delivery",
    description: "On-demand food and grocery delivery platform",
    services: ["Food delivery", "Grocery delivery", "Pharmacy delivery"],
    deliveries: "1500+",
    partnership: "Strategic Partner",
    website: "glovoapp.com",
  },
  {
    id: 3,
    name: "Uber Eats",
    logo: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=100&h=50",
    category: "Food Tech",
    description: "Global food delivery platform",
    services: ["Restaurant delivery", "Fast food", "Grocery delivery"],
    deliveries: "1200+",
    partnership: "Technology Partner",
    website: "ubereats.com",
  },
  {
    id: 4,
    name: "KCB Bank",
    logo: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=100&h=50",
    category: "Financial",
    description: "Leading commercial bank in East Africa",
    services: ["Document delivery", "Card delivery", "Cheque delivery"],
    deliveries: "800+",
    partnership: "Financial Partner",
    website: "kcbgroup.com",
  },
  {
    id: 5,
    name: "Naivas Supermarket",
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=100&h=50",
    category: "Retail",
    description: "Kenya's leading supermarket chain",
    services: ["Grocery delivery", "Bulk delivery", "Express delivery"],
    deliveries: "1000+",
    partnership: "Retail Partner",
    website: "naivas.co.ke",
  },
  {
    id: 6,
    name: "Safaricom",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=100&h=50",
    category: "Telecommunications",
    description: "Leading telecommunications company",
    services: ["SIM card delivery", "Device delivery", "Accessory delivery"],
    deliveries: "600+",
    partnership: "Tech Partner",
    website: "safaricom.co.ke",
  }
];

const partnerStats = [
  {
    icon: "🤝",
    number: "50+",
    label: "Trusted Partners",
    description: "From startups to enterprises"
  },
  {
    icon: "📦",
    number: "10K+",
    label: "Partner Deliveries",
    description: "Monthly delivery volume"
  },
  {
    icon: "✅",
    number: "99.5%",
    label: "Success Rate",
    description: "Partner delivery success"
  },
  {
    icon: "📈",
    number: "25%",
    label: "Monthly Growth",
    description: "Partner network expansion"
  }
];

const partnerBenefits = [
  {
    title: "Dedicated Account Manager",
    description: "Personal support from our experienced team to optimize your delivery operations",
    icon: "👥"
  },
  {
    title: "Competitive Rates",
    description: "Special pricing for partners starting from KES 25 per kilometer",
    icon: "💰"
  },
  {
    title: "Real-time Tracking",
    description: "Advanced tracking system for complete visibility of your deliveries",
    icon: "📍"
  },
  {
    title: "Flexible Solutions",
    description: "Customized delivery solutions tailored to your business needs",
    icon: "⚡"
  },
  {
    title: "Priority Support",
    description: "24/7 priority customer support for all partner delivery requests",
    icon: "🎯"
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive reports and insights to track your delivery performance",
    icon: "📊"
  }
];

export default function DeliveryPartners() {
  const [activeTab, setActiveTab] = useState<'partners' | 'benefits' | 'join'>('partners');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessCategory: '',
    deliveryVolume: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/partnership-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          type: 'partnership'
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          businessCategory: '',
          deliveryVolume: '',
          message: ''
        });
      } else {
        throw new Error('Failed to submit partnership request');
      }
    } catch (error) {
      alert('Error submitting partnership request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-rocs-green mb-6">
            Our Delivery Partners
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Rocs Crew partners with leading businesses across Kenya to provide reliable, 
            fast, and secure delivery services. Join our growing network of satisfied partners.
          </p>
        </div>

        {/* Partner Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {partnerStats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-rocs-green/5 transition-colors">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-rocs-green mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-800 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            {[
              { key: 'partners', label: 'Our Partners' },
              { key: 'benefits', label: 'Partner Benefits' },
              { key: 'join', label: 'Join Us' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-rocs-green text-white shadow-md'
                    : 'text-gray-600 hover:text-rocs-green'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner) => (
                <div key={partner.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Partner Logo */}
                  <div className="flex items-center justify-between mb-4">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-12 w-24 object-cover rounded-lg"
                    />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      partner.partnership === 'Premium Partner' ? 'bg-yellow-100 text-yellow-800' :
                      partner.partnership === 'Strategic Partner' ? 'bg-blue-100 text-blue-800' :
                      partner.partnership === 'Technology Partner' ? 'bg-purple-100 text-purple-800' :
                      partner.partnership === 'Financial Partner' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {partner.partnership}
                    </span>
                  </div>

                  {/* Partner Info */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{partner.name}</h3>
                  <p className="text-gray-600 mb-4">{partner.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-rocs-green/10 text-rocs-green px-3 py-1 rounded-full text-sm font-medium">
                      {partner.category}
                    </span>
                    <span className="text-gray-600 text-sm font-medium">
                      {partner.deliveries} deliveries
                    </span>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.services.map((service, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Website Link */}
                  <a
                    href={`https://${partner.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-rocs-green hover:text-rocs-green-dark transition-colors"
                  >
                    <span className="text-sm">{partner.website}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Benefits Tab */}
          {activeTab === 'benefits' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {partnerBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-xl hover:bg-rocs-green/5 transition-colors">
                    <div className="text-3xl">{benefit.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <button
                  onClick={() => setActiveTab('join')}
                  className="bg-rocs-green hover:bg-rocs-green-dark text-white font-bold py-4 px-8 rounded-lg transition-colors"
                >
                  Become a Partner Today
                </button>
              </div>
            </div>
          )}

          {/* Join Us Tab */}
          {activeTab === 'join' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {isSubmitted ? (
                /* Success Message */
                <div className="lg:col-span-2 bg-white rounded-xl p-8 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-4">Partnership Request Submitted!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for your interest in partnering with Rocs Crew. Our partnership team will review your request and get back to you within 48 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-rocs-green hover:bg-rocs-green-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <>
                  {/* Contact Form */}
                  <div className="bg-gray-50 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-rocs-green mb-6">Partner with Rocs Crew</h3>
                    <form onSubmit={handlePartnershipSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Company Name *</label>
                          <input
                            type="text"
                            name="companyName"
                            required
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                            placeholder="Your company name"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Contact Person *</label>
                          <input
                            type="text"
                            name="contactPerson"
                            required
                            value={formData.contactPerson}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                            placeholder="Your full name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Email *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                            placeholder="business@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Phone *</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                            placeholder="+254 7XX XXX XXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Business Category *</label>
                        <select 
                          name="businessCategory"
                          required
                          value={formData.businessCategory}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                        >
                          <option value="">Select category</option>
                          <option value="E-commerce">E-commerce</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Retail">Retail</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Financial Services">Financial Services</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Monthly Delivery Volume *</label>
                        <select
                          name="deliveryVolume"
                          required
                          value={formData.deliveryVolume}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                        >
                          <option value="">Select volume</option>
                          <option value="1-50 deliveries">1-50 deliveries</option>
                          <option value="51-200 deliveries">51-200 deliveries</option>
                          <option value="201-500 deliveries">201-500 deliveries</option>
                          <option value="500+ deliveries">500+ deliveries</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Message *</label>
                        <textarea
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green resize-none"
                          placeholder="Tell us about your delivery needs and partnership goals..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-rocs-green hover:bg-rocs-green-dark text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Request...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <Send className="w-4 h-4 mr-2" />
                            Submit Partnership Request
                          </span>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-rocs-green mb-6">Get in Touch</h3>
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        Ready to partner with Rocs Crew? Contact our partnership team to discuss 
                        how we can help grow your business with reliable delivery solutions.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-rocs-yellow p-3 rounded-lg">
                          <Phone className="w-6 h-6 text-gray-800" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Partnership Hotline</h4>
                          <p className="text-gray-600">+254 700 898 950</p>
                          <p className="text-sm text-gray-500">Available 9 AM - 6 PM, Mon-Fri</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="bg-rocs-yellow p-3 rounded-lg">
                          <Mail className="w-6 h-6 text-gray-800" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Partnership Email</h4>
                          <p className="text-gray-600">partners@rocscrew.co.ke</p>
                          <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="bg-rocs-yellow p-3 rounded-lg">
                          <MapPin className="w-6 h-6 text-gray-800" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">Office Location</h4>
                          <p className="text-gray-600">Nairobi, Kenya</p>
                          <p className="text-sm text-gray-500">Visit by appointment only</p>
                        </div>
                      </div>
                    </div>

                    {/* Partnership Process */}
                    <div className="bg-rocs-green/5 rounded-xl p-6">
                      <h4 className="font-bold text-rocs-green mb-4">Partnership Process</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-rocs-green text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                          <span>Submit partnership request</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-rocs-green text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                          <span>Initial consultation call</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-rocs-green text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                          <span>Custom solution proposal</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-rocs-green text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                          <span>Partnership agreement & launch</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
