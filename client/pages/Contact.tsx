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
  CheckCircle2,
  Clock
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
      <section className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full relative z-10 text-center">
          <div className="bg-card rounded-[3rem] shadow-2xl border border-border p-12 backdrop-blur-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-rocs-green-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
              <Send className="w-12 h-12 text-primary-foreground -rotate-3" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight font-outfit">
              Message Sent!
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-medium">
              Thank you for reaching out. Our team will get back to you within 24 hours.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              className="w-full h-16 bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-black text-xl rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest"
            >
              Send Another
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background min-h-screen relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left Column: Info & Signup */}
          <div className="flex flex-col">
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 font-outfit tracking-tight leading-none">
                Get In <span className="text-primary italic">Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-lg leading-relaxed">
                Have questions about our delivery services? Our team is available 24/7 to assist you.
              </p>
            </div>

            {/* Rider Recruitment Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-[2.5rem] p-8 mb-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground font-outfit">Join Our Team</h3>
                    <p className="text-sm text-muted-foreground font-medium">Become a Rocs Crew Rider</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-8 font-medium leading-relaxed">
                  Looking for a flexible way to earn? Join the most reliable motorcycle delivery platform in Nairobi.
                </p>
                <Button
                  onClick={() => setShowRiderSignup(!showRiderSignup)}
                  className="w-full bg-primary hover:brightness-110 text-primary-foreground font-black h-14 rounded-2xl shadow-xl transition-all uppercase tracking-widest"
                >
                  {showRiderSignup ? "Close Signup Form" : "Apply Now"}
                </Button>
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/50 p-6 rounded-[2rem] hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-black text-foreground mb-1 font-outfit">Call Us</h4>
                <a href="tel:+254700898950" className="text-muted-foreground font-bold hover:text-primary transition-colors">+254 700 898 950</a>
              </div>

              <div className="bg-card border border-border/50 p-6 rounded-[2rem] hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-black text-foreground mb-1 font-outfit">Email Us</h4>
                <a href="mailto:Kuriajoe85@gmail.com" className="text-muted-foreground font-bold hover:text-primary transition-colors break-all">Kuriajoe85@gmail.com</a>
              </div>

              <div className="bg-card border border-border/50 p-6 rounded-[2rem] hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-black text-foreground mb-1 font-outfit">Coverage</h4>
                <p className="text-muted-foreground font-bold">Nairobi & Suburbs</p>
              </div>

              <div className="bg-card border border-border/50 p-6 rounded-[2rem] hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-black text-foreground mb-1 font-outfit">Hours</h4>
                <p className="text-muted-foreground font-bold">24/7 Availability</p>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="relative">
            {showRiderSignup ? (
              <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                <RiderSignupForm />
              </div>
            ) : (
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] p-10 md:p-12 shadow-2xl animate-in fade-in slide-in-from-left-10 duration-500">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-foreground font-outfit tracking-tight">Send a Message</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="bg-muted/50 border-none rounded-[2rem] focus-visible:ring-1 focus-visible:ring-primary p-6 resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-black text-xl rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-[0.2em] mt-8"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Rider Signup Form Component
function RiderSignupForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (riderData.password !== riderData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.entries(riderData).forEach(([key, value]) => submitData.append(key, value));
      Object.entries(fileUploads).forEach(([key, file]) => {
        if (file) submitData.append(key, file);
      });

      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const response = await fetch(`${API_BASE_URL}/api/riders/signup`, {
        method: "POST",
        headers: { "x-csrf-token": csrfToken },
        body: submitData,
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

  const FileUploadItem = ({
    label,
    name,
    accept,
    icon: Icon = Upload,
  }: {
    label: string;
    name: string;
    accept: string;
    icon?: any;
  }) => (
    <div className="space-y-4">
      <Label htmlFor={name} className="text-foreground font-black text-xs uppercase tracking-widest ml-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        {label}
      </Label>
      <div className="relative">
        <input
          id={name}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e, name)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed ${fileUploads[name as keyof typeof fileUploads] ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'} rounded-2xl p-6 text-center transition-all`}>
          <Upload className={`w-8 h-8 mx-auto mb-2 ${fileUploads[name as keyof typeof fileUploads] ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm font-bold truncate">
            {fileUploads[name as keyof typeof fileUploads] ? fileUploads[name as keyof typeof fileUploads]?.name : "Choose File"}
          </p>
        </div>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-3xl font-black text-foreground mb-4 font-outfit">Application Received!</h3>
        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
          Our team will review your application and get back to you within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -mr-24 -mt-24" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-black text-foreground font-outfit tracking-tight">Rider Signup</h3>
          </div>
          <div className="text-primary font-black text-xs uppercase tracking-[0.3em] bg-primary/10 px-4 py-2 rounded-full">Step {step}/3</div>
        </div>

        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
              <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">1. Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Full Name</Label>
                  <Input name="fullName" required value={riderData.fullName} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="John Doe" />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Email</Label>
                  <Input name="email" type="email" required value={riderData.email} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="john@example.com" />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Phone</Label>
                  <Input name="phone" required value={riderData.phone} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="+254 700 000 000" />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">National ID</Label>
                  <Input name="nationalId" required value={riderData.nationalId} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="12345678" />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Password</Label>
                  <Input name="password" type="password" required value={riderData.password} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="••••••••" />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Confirm Password</Label>
                  <Input name="confirmPassword" type="password" required value={riderData.confirmPassword} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="••••••••" />
                </div>
              </div>
              <Button onClick={nextStep} className="w-full h-16 bg-primary text-primary-foreground font-black rounded-2xl mt-6 uppercase tracking-widest">Next Step</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
              <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">2. Motorcycle Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Motorcycle Model</Label>
                  <Input name="motorcycleModel" required value={riderData.motorcycleModel} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="e.g. TVS Star HLX" />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Color</Label>
                  <Input name="motorcycleColor" required value={riderData.motorcycleColor} onChange={handleInputChange} className="h-14 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary pl-6" placeholder="e.g. Black" />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Working Area</Label>
                  <select name="area" required value={riderData.area} onChange={handleInputChange} className="h-14 w-full bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary px-6 outline-none">
                    <option value="">Select Area</option>
                    <option value="CBD">CBD</option>
                    <option value="Westlands">Westlands</option>
                    <option value="Karen">Karen</option>
                    <option value="All">All Nairobi</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground font-black text-xs uppercase tracking-widest ml-2">Experience</Label>
                  <select name="experience" required value={riderData.experience} onChange={handleInputChange} className="h-14 w-full bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary px-6 outline-none">
                    <option value="">Select Exp</option>
                    <option value="1-2">1-2 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={prevStep} variant="outline" className="flex-1 h-16 border-2 font-black rounded-2xl uppercase tracking-widest">Back</Button>
                <Button onClick={nextStep} className="flex-1 h-16 bg-primary text-primary-foreground font-black rounded-2xl uppercase tracking-widest">Next Step</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5">
              <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">3. Document Verification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FileUploadItem label="Passport Photo" name="passportPhoto" accept="image/*" icon={Camera} />
                <FileUploadItem label="Motorcycle Photo" name="motorcyclePhoto" accept="image/*" icon={Camera} />
                <FileUploadItem label="ID Front" name="idCardFront" accept="image/*" icon={FileText} />
                <FileUploadItem label="License" name="drivingLicense" accept="image/*" icon={FileText} />
              </div>
              <div className="flex gap-4 mt-8">
                <Button onClick={prevStep} variant="outline" className="flex-1 h-16 border-2 font-black rounded-2xl uppercase tracking-widest">Back</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-16 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl uppercase tracking-widest">
                  {isSubmitting ? "Submitting..." : "Finish Signup"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

