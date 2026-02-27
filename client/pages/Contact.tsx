import { useState } from "react";
import { API_BASE_URL } from '../lib/api';
import {
  Send,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  Upload,
  Camera,
  FileText,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showRiderSignup, setShowRiderSignup] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error Sending Message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="min-h-screen bg-[#0a110d] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rocs-green/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#eab308]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full relative z-10 text-center">
          <div className="bg-[#112417] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-10 backdrop-blur-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-rocs-green to-rocs-green-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(33,197,94,0.3)]">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Message Sent!
            </h2>
            <p className="text-[#8b9d93] text-lg mb-10 leading-relaxed font-outfit">
              Thank you for reaching out. Our team will get back to you within 24 hours.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              className="w-full h-14 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all active:scale-[0.98]"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#0a110d] min-h-screen relative overflow-hidden">
      {/* Central glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rocs-green/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Get In Touch
            </h1>
            <p className="text-sm md:text-base text-[#8b9d93] mb-8 max-w-xs mx-auto">
              Have questions about our delivery services? We're here to help!
            </p>

            {/* Rider Signup Button */}
            <div className="mb-10">
              <Button
                onClick={() => setShowRiderSignup(!showRiderSignup)}
                className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold h-12 px-8 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all"
              >
                <Upload className="w-5 h-5 mr-2" />
                {showRiderSignup ? "Hide Rider Signup" : "Join Our Riders Team"}
              </Button>
            </div>
          </div>

          {/* Rider Signup Form */}
          {showRiderSignup && (
            <div className="mb-12 border border-[#eab308]/30 rounded-3xl p-6 bg-[#0a110d]">
              <RiderSignupForm />
            </div>
          )}

          <div className="flex flex-col gap-4 mb-10">
            {/* Contact Information Vertical Stack */}

            {/* Phone */}
            <div className="border border-[#eab308]/50 rounded-2xl p-4 md:p-5 flex items-center space-x-4 bg-transparent hover:bg-white/5 transition-colors">
              <div className="border border-[#eab308] rounded-full p-3 shrink-0">
                <Phone className="w-5 h-5 text-[#eab308]" />
              </div>
              <div>
                <a href="tel:+254700898950" className="text-white font-semibold block mb-0.5 hover:text-[#eab308] transition-colors">+254 700 898 950</a>
                <p className="text-sm text-[#8b9d93]">
                  Available 24/7 for emergency deliveries
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="border border-[#eab308]/50 rounded-2xl p-4 md:p-5 flex items-center space-x-4 bg-transparent hover:bg-white/5 transition-colors">
              <div className="border border-[#eab308] rounded-full p-3 shrink-0">
                <Mail className="w-5 h-5 text-[#eab308]" />
              </div>
              <div>
                <a href="mailto:Kuriajoe85@gmail.com" className="text-white font-semibold block mb-0.5 hover:text-[#eab308] transition-colors">Kuriajoe85@gmail.com</a>
                <p className="text-sm text-[#8b9d93]">
                  We'll respond within 24 hours
                </p>
              </div>
            </div>

            {/* Area */}
            <div className="border border-[#eab308]/50 rounded-2xl p-4 md:p-5 flex items-center space-x-4 bg-transparent hover:bg-white/5 transition-colors">
              <div className="border border-[#eab308] rounded-full p-3 shrink-0">
                <MapPin className="w-5 h-5 text-[#eab308]" />
              </div>
              <div>
                <span className="text-white font-semibold block mb-0.5">Nairobi & Surrounding Areas</span>
                <p className="text-sm text-[#8b9d93]">
                  Same-day delivery available
                </p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="border border-white/5 rounded-3xl p-6 md:p-8 bg-[#112417] shadow-[0_0_30px_rgba(0,0,0,0.3)] relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab308]/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#eab308]/10 transition-colors" />
              <h4 className="font-bold text-white text-center mb-6 text-xl tracking-tight">
                Business Hours
              </h4>
              <div className="space-y-4 text-sm max-w-[280px] mx-auto font-outfit">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[#8b9d93]">Mon - Fri</span>
                  <span className="text-white font-bold">6:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[#eab308]/80 font-medium">Saturday</span>
                  <span className="text-white font-bold">7:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[#eab308]/80 font-medium">Sunday</span>
                  <span className="text-white font-bold">8:00 AM - 8:00 PM</span>
                </div>
                <div className="pt-6 mt-2 border-t border-white/5 text-center text-[#8b9d93] text-xs italic">
                  Emergency deliveries available 24/7
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-rocs-green/20 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-rocs-green" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Send Us a Message
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">Your Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-3xl resize-none py-4 px-5 transition-all"
                  placeholder="Type your message here..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-rocs-green to-rocs-green-dark hover:from-rocs-green-dark hover:to-[#065f46] text-white font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(33,197,94,0.2)] transition-all active:scale-[0.98] mt-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Rider Signup Form Component
function RiderSignupForm() {
  const { toast } = useToast();
  const [riderData, setRiderData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    nationalId: "",
    motorcycleColor: "",
    motorcycleModel: "",
    experience: "",
    area: "",
    motivation: "",
    drivingLicenseExpiry: "",
    goodConductExpiry: "",
    motorcycleInsuranceExpiry: "",
  });

  const [fileUploads, setFileUploads] = useState({
    passportPhoto: null as File | null,
    motorcyclePhoto: null as File | null,
    idCardFront: null as File | null,
    idCardBack: null as File | null,
    drivingLicense: null as File | null,
    goodConductCertificate: null as File | null,
    motorcycleInsurance: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setRiderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileUploads((prev) => ({
        ...prev,
        [fieldName]: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (riderData.password !== riderData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate required files
    const requiredFiles = [
      "passportPhoto",
      "motorcyclePhoto",
      "idCardFront",
      "idCardBack",
      "drivingLicense",
      "goodConductCertificate",
      "motorcycleInsurance",
    ];
    const missingFiles = requiredFiles.filter(
      (field) => !fileUploads[field as keyof typeof fileUploads],
    );

    if (missingFiles.length > 0) {
      toast({
        title: "Missing Documents",
        description: `Please upload the following required documents: ${missingFiles.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const requiredDates = [
      "drivingLicenseExpiry",
      "goodConductExpiry",
      "motorcycleInsuranceExpiry",
    ];
    const missingDates = requiredDates.filter(
      (field) => !riderData[field as keyof typeof riderData],
    );

    if (missingDates.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please provide expiry dates for: ${missingDates.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();

      // Add text fields
      Object.entries(riderData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      submitData.append("timestamp", new Date().toISOString());
      submitData.append("status", "pending");

      // Add files
      Object.entries(fileUploads).forEach(([key, file]) => {
        if (file) {
          submitData.append(key, file);
        }
      });

      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const response = await fetch(`${API_BASE_URL}/api/riders/signup`, {
        method: "POST",
        headers: {
          "x-csrf-token": csrfToken,
        },
        body: submitData, // Don't set Content-Type header, let browser set it for FormData
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error("Failed to submit rider application");
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Error submitting application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUpload = ({
    label,
    name,
    accept,
    icon: Icon = Upload,
    description,
  }: {
    label: string;
    name: string;
    accept: string;
    required?: boolean;
    icon?: any;
    description?: string;
  }) => (
    <div className="space-y-3">
      <Label
        htmlFor={name}
        className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1 flex items-center gap-2"
      >
        <Icon className="w-4 h-4 text-[#eab308]" />
        {label}
      </Label>
      {description && (
        <p className="text-xs text-[#8b9d93] ml-1">{description}</p>
      )}
      <div className="relative group">
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e, name)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed ${fileUploads[name as keyof typeof fileUploads] ? 'border-rocs-green bg-rocs-green/5' : 'border-white/10 bg-[#0a110d]/50'} rounded-2xl p-6 text-center group-hover:border-[#eab308]/50 transition-all duration-300`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${fileUploads[name as keyof typeof fileUploads] ? 'bg-rocs-green/20' : 'bg-[#eab308]/10'}`}>
            <Icon className={`w-6 h-6 ${fileUploads[name as keyof typeof fileUploads] ? 'text-rocs-green' : 'text-[#eab308]'}`} />
          </div>
          <p className={`text-sm font-medium ${fileUploads[name as keyof typeof fileUploads] ? 'text-white' : 'text-[#8b9d93]'}`}>
            {fileUploads[name as keyof typeof fileUploads]
              ? fileUploads[name as keyof typeof fileUploads]?.name
              : `Upload ${label}`}
          </p>
          {!fileUploads[name as keyof typeof fileUploads] && (
            <p className="text-[10px] text-[#8b9d93]/50 mt-1 uppercase tracking-tighter">Click or drag and drop</p>
          )}
        </div>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="bg-[#112417] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-10 backdrop-blur-sm animate-in fade-in zoom-in duration-500 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-rocs-green to-rocs-green-dark rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(33,197,94,0.3)]">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Application Received!
        </h3>
        <p className="text-[#8b9d93] text-lg leading-relaxed font-outfit">
          Thank you for your interest in joining Rocs Crew. Our team will review your application and documents and get back to you within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#112417] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-10 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#eab308]/20 rounded-2xl flex items-center justify-center border border-[#eab308]/20">
          <UserPlus className="w-6 h-6 text-[#eab308]" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Join Our Riders Team
          </h3>
          <p className="text-[#8b9d93] text-sm font-outfit">Become a partner and start earning today.</p>
        </div>
      </div>

      <p className="text-[#8b9d93] mb-10 text-sm leading-relaxed max-w-2xl font-outfit">
        Become a part of Rocs Crew and start earning money delivering packages
        across Nairobi. Please fill out all fields and upload required
        documents.
      </p>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Basic Information */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-[#eab308] uppercase tracking-[0.2em] border-b border-white/5 pb-3">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={riderData.fullName}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="Full Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={riderData.email}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={riderData.phone}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="+254 7XX XXX XXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                National ID Number
              </Label>
              <Input
                id="nationalId"
                name="nationalId"
                type="text"
                required
                value={riderData.nationalId}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="ID Number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={riderData.password}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={riderData.confirmPassword}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Motorcycle Information */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-[#eab308] uppercase tracking-[0.2em] border-b border-white/5 pb-3">
            Motorcycle Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="motorcycleColor"
                className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1"
              >
                Motorcycle Color
              </Label>
              <Input
                id="motorcycleColor"
                name="motorcycleColor"
                type="text"
                required
                value={riderData.motorcycleColor}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="e.g., Black"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="motorcycleModel"
                className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1"
              >
                Motorcycle Model
              </Label>
              <Input
                id="motorcycleModel"
                name="motorcycleModel"
                type="text"
                required
                value={riderData.motorcycleModel}
                onChange={handleInputChange}
                className="h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all"
                placeholder="e.g., TVS Star HLX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Riding Experience
              </Label>
              <select
                id="experience"
                name="experience"
                required
                value={riderData.experience}
                onChange={handleInputChange}
                className="h-14 w-full bg-[#0a110d]/50 border border-white/10 text-white rounded-2xl px-4 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#112417]">Select experience</option>
                <option value="1-2 years" className="bg-[#112417]">1-2 years</option>
                <option value="3-5 years" className="bg-[#112417]">3-5 years</option>
                <option value="5+ years" className="bg-[#112417]">5+ years</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Preferred Working Area
              </Label>
              <select
                id="area"
                name="area"
                required
                value={riderData.area}
                onChange={handleInputChange}
                className="h-14 w-full bg-[#0a110d]/50 border border-white/10 text-white rounded-2xl px-4 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#112417]">Select area</option>
                <option value="CBD" className="bg-[#112417]">CBD</option>
                <option value="Westlands" className="bg-[#112417]">Westlands</option>
                <option value="Karen" className="bg-[#112417]">Karen</option>
                <option value="Eastleigh" className="bg-[#112417]">Eastleigh</option>
                <option value="Kasarani" className="bg-[#112417]">Kasarani</option>
                <option value="Embakasi" className="bg-[#112417]">Embakasi</option>
                <option value="All areas" className="bg-[#112417]">All areas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-[#eab308] uppercase tracking-[0.2em] border-b border-white/5 pb-3">
            Identity Documents
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FileUpload
              label="Passport Photo"
              name="passportPhoto"
              accept="image/*"
              icon={Camera}
              description="Clear passport-size photo"
            />

            <FileUpload
              label="Motorcycle Photo"
              name="motorcyclePhoto"
              accept="image/*"
              icon={Camera}
              description="Photo showing number plates clearly"
            />

            <FileUpload
              label="ID Card (Front)"
              name="idCardFront"
              accept="image/*"
              icon={FileText}
              description="Front side of your national ID"
            />

            <FileUpload
              label="ID Card (Back)"
              name="idCardBack"
              accept="image/*"
              icon={FileText}
              description="Back side of your national ID"
            />
          </div>
        </div>

        {/* Licenses and Certificates */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-[#eab308] uppercase tracking-[0.2em] border-b border-white/5 pb-3">
            Licenses and Certificates
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <FileUpload
                label="Driving License"
                name="drivingLicense"
                accept="image/*,application/pdf"
                icon={FileText}
                description="Valid motorcycle driving license"
              />
              <div className="space-y-2">
                <Label
                  htmlFor="drivingLicenseExpiry"
                  className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1"
                >
                  Driving License Expiry
                </Label>
                <Input
                  id="drivingLicenseExpiry"
                  name="drivingLicenseExpiry"
                  type="date"
                  required
                  value={riderData.drivingLicenseExpiry}
                  onChange={handleInputChange}
                  className="h-14 bg-[#0a110d]/50 border-white/10 text-white focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-4">
              <FileUpload
                label="Good Conduct Certificate"
                name="goodConductCertificate"
                accept="image/*,application/pdf"
                icon={FileText}
                description="Certificate from DCI"
              />
              <div className="space-y-2">
                <Label
                  htmlFor="goodConductExpiry"
                  className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1"
                >
                  Good Conduct Expiry
                </Label>
                <Input
                  id="goodConductExpiry"
                  name="goodConductExpiry"
                  type="date"
                  required
                  value={riderData.goodConductExpiry}
                  onChange={handleInputChange}
                  className="h-14 bg-[#0a110d]/50 border-white/10 text-white focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-4">
              <FileUpload
                label="Motorcycle Insurance"
                name="motorcycleInsurance"
                accept="image/*,application/pdf"
                icon={FileText}
                description="Valid insurance certificate"
              />
              <div className="space-y-2">
                <Label
                  htmlFor="motorcycleInsuranceExpiry"
                  className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1"
                >
                  Insurance Expiry Date
                </Label>
                <Input
                  id="motorcycleInsuranceExpiry"
                  name="motorcycleInsuranceExpiry"
                  type="date"
                  required
                  value={riderData.motorcycleInsuranceExpiry}
                  onChange={handleInputChange}
                  className="h-14 bg-[#0a110d]/50 border-white/10 text-white focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Statement */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-[#eab308] uppercase tracking-[0.2em] border-b border-white/5 pb-3">
            Personal Statement
          </h4>
          <div className="space-y-2">
            <Label htmlFor="motivation" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
              Why do you want to join Rocs Crew?
            </Label>
            <Textarea
              id="motivation"
              name="motivation"
              required
              value={riderData.motivation}
              onChange={handleInputChange}
              rows={5}
              className="bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-3xl resize-none py-4 px-5 transition-all"
              placeholder="Tell us about yourself and your experience..."
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-16 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold text-xl rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-3"></div>
              Submitting Application...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <UserPlus className="w-6 h-6" />
              <span>SUBMIT COMPLETE APPLICATION</span>
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
