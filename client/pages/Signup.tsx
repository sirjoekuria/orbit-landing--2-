import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, apiFetch } from '../lib/api';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Upload,
  Camera,
  FileText,
  CheckCircle,
  Bike,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../shared/validation";
import { z } from "zod";

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [userType, setUserType] = useState<"customer" | "rider">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
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
      motorcycleInsuranceExpiry: ""
    }
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

  // Removed handleInputChange as react-hook-form handles it

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

  const onSubmit = async (data: SignupFormValues) => {
    // Validate rider specific requirements
    if (userType === "rider") {
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
        alert(
          `Please upload the following required documents: ${missingFiles.join(", ")}`,
        );
        return;
      }

      const requiredDates = [
        "nationalId",
        "motorcycleColor",
        "motorcycleModel",
        "experience",
        "area",
        "motivation",
        "drivingLicenseExpiry",
        "goodConductExpiry",
        "motorcycleInsuranceExpiry",
      ];
      const missingDates = requiredDates.filter(
        (field) => !data[field as keyof typeof data],
      );

      if (missingDates.length > 0) {
        alert(`Please provide all required rider information.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const csrfRes = await apiFetch(`${API_BASE_URL}/api/csrf-token`, {
        credentials: 'include'
      });
      const { token: csrfToken } = await csrfRes.json();

      const endpoint =
        userType === "rider" ? `${API_BASE_URL}/api/riders/signup` : `${API_BASE_URL}/api/auth/signup`;

      let response;

      if (userType === "rider") {
        // Create FormData for file uploads (riders)
        const submitData = new FormData();

        // Add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) submitData.append(key, value);
        });

        submitData.append("userType", userType);
        submitData.append("timestamp", new Date().toISOString());

        // Add files for rider applications
        Object.entries(fileUploads).forEach(([key, file]) => {
          if (file) {
            submitData.append(key, file);
          }
        });

        response = await apiFetch(endpoint, {
          method: "POST",
          headers: {
            'x-csrf-token': csrfToken
          },
          body: submitData,
          credentials: 'include'
        });
      } else {
        // Send JSON for customer signup
        const jsonData = {
          ...data,
          userType,
          timestamp: new Date().toISOString()
        };

        response = await apiFetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-csrf-token': csrfToken
          },
          body: JSON.stringify(jsonData),
          credentials: 'include'
        });
      }

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('rememberedEmail', data.email);

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: result.user?.id || result.rider?.id,
            name: data.fullName,
            email: data.email,
            userType,
            isAuthenticated: true,
            loginTime: Date.now()
          }),
        );

        if (userType === "rider") {
          alert(
            "Rider application submitted successfully! You will be notified once approved.",
          );
          window.location.href = "/";
        } else {
          alert("Account created successfully!");
          window.location.href = "/book-delivery";
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create account");
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error creating account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUpload = ({
    label,
    name,
    accept,
    required = true,
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
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="text-white font-medium flex items-center gap-2"
      >
        <Icon className="w-4 h-4 text-[#eab308]" />
        {label} {required && "*"}
      </Label>
      {description && (
        <p className="text-xs text-[#8b9d93] mt-1 mb-2">{description}</p>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e, name)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-[#eab308]/50 transition-all bg-[#0a110d]/50 group">
          <Icon className="w-10 h-10 mx-auto text-[#8b9d93] mb-3 group-hover:text-[#eab308] transition-colors" />
          <p className="text-sm text-[#8b9d93] group-hover:text-white transition-colors">
            {fileUploads[name as keyof typeof fileUploads]
              ? fileUploads[name as keyof typeof fileUploads]?.name
              : `Tap to upload ${label.toLowerCase()}`}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a110d] py-12 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rocs-green/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#eab308]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <UserPlus className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Join Rocs Crew
          </h1>
          <p className="text-[#8b9d93] text-lg">Create your account to get started</p>
        </div>

        {/* User Type Selection */}
        <div className="bg-[#112417] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">
            Choose Account Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setUserType("customer")}
              className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${userType === "customer"
                ? "border-[#eab308] bg-[#eab308]/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                : "border-white/5 bg-[#0a110d]/50 hover:border-[#eab308]/30"
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${userType === "customer" ? "bg-[#eab308] text-black" : "bg-white/5 text-[#8b9d93]"}`}>
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1">Customer</h3>
              <p className="text-xs text-[#8b9d93]">Book and track your deliveries with ease</p>
              {userType === "customer" && (
                <div className="absolute top-4 right-4 text-[#eab308]">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </button>

            <button
              onClick={() => setUserType("rider")}
              className={`p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${userType === "rider"
                ? "border-[#eab308] bg-[#eab308]/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                : "border-white/5 bg-[#0a110d]/50 hover:border-[#eab308]/30"
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${userType === "rider" ? "bg-[#eab308] text-black" : "bg-white/5 text-[#8b9d93]"}`}>
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1">Rider</h3>
              <p className="text-xs text-[#8b9d93]">Earn money by delivering packages on your bike</p>
              {userType === "rider" && (
                <div className="absolute top-4 right-4 text-[#eab308]">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-[#112417] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-8">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-2 h-8 bg-[#eab308] rounded-full" />
            {userType === "rider"
              ? "Rider Application"
              : "Customer Registration"}
          </h2>

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-10">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white/90 mb-4 border-b border-white/5 pb-2">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-white/80 text-sm font-medium"
                  >
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9d93]" />
                    <Input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      {...register("fullName")}
                      className={`h-12 pl-11 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.fullName ? 'border-red-500/50' : ''}`}
                      placeholder="Your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80 text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9d93]" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email username"
                      {...register("email")}
                      className={`h-12 pl-11 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.email ? 'border-red-500/50' : ''}`}
                      placeholder="name@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80 text-sm font-medium">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9d93]" />
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      {...register("phone")}
                      className={`h-12 pl-11 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.phone ? 'border-red-500/50' : ''}`}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                {userType === "rider" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="nationalId"
                      className="text-white/80 text-sm font-medium"
                    >
                      National ID Number *
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9d93]" />
                      <Input
                        id="nationalId"
                        type="text"
                        {...register("nationalId")}
                        className={`h-12 pl-11 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.nationalId ? 'border-red-500/50' : ''}`}
                        placeholder="Your ID number"
                      />
                    </div>
                    {errors.nationalId && (
                      <p className="mt-1 text-xs text-red-400">{errors.nationalId.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-white/80 text-sm font-medium"
                  >
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9d93]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password")}
                      className={`h-12 pl-11 pr-12 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.password ? 'border-red-500/50' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b9d93] hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-white/80 text-sm font-medium"
                  >
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9d93]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      className={`h-12 pl-11 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rider Specific Fields */}
            {userType === "rider" && (
              <>
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  {/* Motorcycle Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white/90 mb-4 border-b border-white/5 pb-2">
                      Motorcycle Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="motorcycleColor"
                          className="text-white/80 text-sm font-medium"
                        >
                          Motorcycle Color *
                        </Label>
                        <Input
                          id="motorcycleColor"
                          type="text"
                          {...register("motorcycleColor")}
                          className={`h-12 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.motorcycleColor ? 'border-red-500/50' : ''}`}
                          placeholder="e.g., Red, Blue, Black"
                        />
                        {errors.motorcycleColor && (
                          <p className="mt-1 text-xs text-red-400">{errors.motorcycleColor.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="motorcycleModel"
                          className="text-white/80 text-sm font-medium"
                        >
                          Motorcycle Model *
                        </Label>
                        <Input
                          id="motorcycleModel"
                          type="text"
                          {...register("motorcycleModel")}
                          className={`h-12 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl ${errors.motorcycleModel ? 'border-red-500/50' : ''}`}
                          placeholder="e.g., Honda CB 150F, Yamaha FZ"
                        />
                        {errors.motorcycleModel && (
                          <p className="mt-1 text-xs text-red-400">{errors.motorcycleModel.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="experience"
                          className="text-white/80 text-sm font-medium"
                        >
                          Riding Experience *
                        </Label>
                        <select
                          id="experience"
                          {...register("experience")}
                          className={`h-12 w-full px-4 bg-[#0a110d]/50 border-white/10 border text-white focus:outline-none focus:ring-1 focus:ring-[#eab308] focus:border-[#eab308] rounded-xl transition-all ${errors.experience ? 'border-red-500/50' : ''}`}
                        >
                          <option value="" className="bg-[#112417]">Select experience</option>
                          <option value="1-2 years" className="bg-[#112417]">1-2 years</option>
                          <option value="3-5 years" className="bg-[#112417]">3-5 years</option>
                          <option value="5+ years" className="bg-[#112417]">5+ years</option>
                        </select>
                        {errors.experience && (
                          <p className="mt-1 text-xs text-red-400">{errors.experience.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="area"
                          className="text-white/80 text-sm font-medium"
                        >
                          Preferred Working Area *
                        </Label>
                        <select
                          id="area"
                          {...register("area")}
                          className={`h-12 w-full px-4 bg-[#0a110d]/50 border-white/10 border text-white focus:outline-none focus:ring-1 focus:ring-[#eab308] focus:border-[#eab308] rounded-xl transition-all ${errors.area ? 'border-red-500/50' : ''}`}
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
                        {errors.area && (
                          <p className="mt-1 text-xs text-red-400">{errors.area.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white/90 mb-4 border-b border-white/5 pb-2">
                      Required Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FileUpload
                        label="Passport Photo"
                        name="passportPhoto"
                        accept="image/*"
                        icon={Camera}
                        description="Professional clear photo"
                      />

                      <FileUpload
                        label="Motorcycle Photo"
                        name="motorcyclePhoto"
                        accept="image/*"
                        icon={Bike}
                        description="Photo showing plate number"
                      />

                      <FileUpload
                        label="ID Card (Front)"
                        name="idCardFront"
                        accept="image/*"
                        icon={FileText}
                        description="Front of National ID"
                      />

                      <FileUpload
                        label="ID Card (Back)"
                        name="idCardBack"
                        accept="image/*"
                        icon={FileText}
                        description="Back of National ID"
                      />
                    </div>
                  </div>

                  {/* Licenses and Certificates */}
                  <div className="space-y-8">
                    <h3 className="text-lg font-bold text-white/90 mb-4 border-b border-white/5 pb-2">
                      Certifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <FileUpload
                          label="Driving License"
                          name="drivingLicense"
                          accept="image/*,application/pdf"
                          icon={FileText}
                          description="Valid motorcycle license"
                        />
                        <div className="space-y-2">
                          <Label
                            htmlFor="drivingLicenseExpiry"
                            className="text-white/80 text-sm font-medium"
                          >
                            License Expiry Date *
                          </Label>
                          <Input
                            id="drivingLicenseExpiry"
                            type="date"
                            {...register("drivingLicenseExpiry")}
                            className={`h-12 bg-[#0a110d]/50 border-white/10 text-white focus:border-[#eab308] focus:ring-[#eab308] rounded-xl ${errors.drivingLicenseExpiry ? 'border-red-500/50' : ''}`}
                          />
                          {errors.drivingLicenseExpiry && (
                            <p className="mt-1 text-xs text-red-400">{errors.drivingLicenseExpiry.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <FileUpload
                          label="Good Conduct Certificate"
                          name="goodConductCertificate"
                          accept="image/*,application/pdf"
                          icon={Shield}
                          description="Valid DCI Certificate"
                        />
                        <div className="space-y-2">
                          <Label
                            htmlFor="goodConductExpiry"
                            className="text-white/80 text-sm font-medium"
                          >
                            Certificate Expiry Date *
                          </Label>
                          <Input
                            id="goodConductExpiry"
                            type="date"
                            {...register("goodConductExpiry")}
                            className={`h-12 bg-[#0a110d]/50 border-white/10 text-white focus:border-[#eab308] focus:ring-[#eab308] rounded-xl ${errors.goodConductExpiry ? 'border-red-500/50' : ''}`}
                          />
                          {errors.goodConductExpiry && (
                            <p className="mt-1 text-xs text-red-400">{errors.goodConductExpiry.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <FileUpload
                          label="Motorcycle Insurance"
                          name="motorcycleInsurance"
                          accept="image/*,application/pdf"
                          icon={Shield}
                          description="Valid insurance cover"
                        />
                        <div className="space-y-2">
                          <Label
                            htmlFor="motorcycleInsuranceExpiry"
                            className="text-white/80 text-sm font-medium"
                          >
                            Insurance Expiry Date *
                          </Label>
                          <Input
                            id="motorcycleInsuranceExpiry"
                            type="date"
                            {...register("motorcycleInsuranceExpiry")}
                            className={`h-12 bg-[#0a110d]/50 border-white/10 text-white focus:border-[#eab308] focus:ring-[#eab308] rounded-xl ${errors.motorcycleInsuranceExpiry ? 'border-red-500/50' : ''}`}
                          />
                          {errors.motorcycleInsuranceExpiry && (
                            <p className="mt-1 text-xs text-red-400">{errors.motorcycleInsuranceExpiry.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Statement */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white/90 border-b border-white/5 pb-2">
                      Personal Statement
                    </h3>
                    <div className="space-y-2">
                      <Label
                        htmlFor="motivation"
                        className="text-white/80 text-sm font-medium"
                      >
                        Why do you want to join Rocs Crew? *
                      </Label>
                      <textarea
                        id="motivation"
                        {...register("motivation")}
                        rows={5}
                        className={`w-full px-4 py-3 bg-[#0a110d]/50 border-white/10 border text-white focus:outline-none focus:ring-1 focus:ring-[#eab308] focus:border-[#eab308] rounded-2xl resize-none transition-all placeholder:text-white/10 ${errors.motivation ? 'border-red-500/50' : ''}`}
                        placeholder="Tell us about your experience and why you're a great fit for the crew..."
                      />
                      {errors.motivation && (
                        <p className="mt-1 text-xs text-red-400">{errors.motivation.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 flex flex-col items-center space-y-8">
              <div className="text-[12px] text-[#8b9d93] text-center max-w-sm px-4">
                By clicking <span className="text-[#eab308] font-medium">{userType === "rider" ? "Submit Application" : "Create Account"}</span>, you agree to our{" "}
                <Link to="/terms" className="text-[#eab308] hover:underline hover:text-[#ca8a04] transition-colors">Terms of Service</Link> and{" "}
                <Link to="/privacy" className="text-[#eab308] hover:underline hover:text-[#ca8a04] transition-colors">Privacy Policy</Link>.
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-3"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-3" />
                    {userType === "rider"
                      ? "Submit Application"
                      : "Create Account"}
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[#8b9d93]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#eab308] hover:text-[#ca8a04] font-bold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
