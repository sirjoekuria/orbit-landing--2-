import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from '../lib/api';
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
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
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

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            'x-csrf-token': csrfToken
          },
          body: submitData,
        });
      } else {
        // Send JSON for customer signup
        const jsonData = {
          ...data,
          userType,
          timestamp: new Date().toISOString()
        };

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-csrf-token': csrfToken
          },
          body: JSON.stringify(jsonData),
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
    <div>
      <Label
        htmlFor={name}
        className="text-gray-700 font-medium flex items-center gap-2"
      >
        <Icon className="w-4 h-4" />
        {label} {required && "*"}
      </Label>
      {description && (
        <p className="text-sm text-gray-500 mt-1 mb-2">{description}</p>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          required={required}
          onChange={(e) => handleFileChange(e, name)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-rocs-green transition-colors">
          <Icon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {fileUploads[name as keyof typeof fileUploads]
              ? fileUploads[name as keyof typeof fileUploads]?.name
              : `Click to upload ${label.toLowerCase()}`}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rocs-green rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-rocs-green mb-2">
            Join Rocs Crew
          </h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Choose Account Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setUserType("customer")}
              className={`p-6 rounded-lg border-2 transition-all ${userType === "customer"
                ? "border-rocs-green bg-rocs-green/5"
                : "border-gray-200 hover:border-rocs-green/50"
                }`}
            >
              <User
                className={`w-8 h-8 mx-auto mb-3 ${userType === "customer" ? "text-rocs-green" : "text-gray-400"}`}
              />
              <h3 className="font-semibold text-gray-800 mb-2">Customer</h3>
              <p className="text-sm text-gray-600">Book and track deliveries</p>
            </button>

            <button
              onClick={() => setUserType("rider")}
              className={`p-6 rounded-lg border-2 transition-all ${userType === "rider"
                ? "border-rocs-green bg-rocs-green/5"
                : "border-gray-200 hover:border-rocs-green/50"
                }`}
            >
              <MapPin
                className={`w-8 h-8 mx-auto mb-3 ${userType === "rider" ? "text-rocs-green" : "text-gray-400"}`}
              />
              <h3 className="font-semibold text-gray-800 mb-2">Rider</h3>
              <p className="text-sm text-gray-600">
                Deliver packages and earn money
              </p>
            </button>
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {userType === "rider"
              ? "Rider Application"
              : "Customer Registration"}
          </h2>

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-gray-700 font-medium"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    {...register("fullName")}
                    className={`mt-1 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email username"
                    {...register("email")}
                    className={`mt-1 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    {...register("phone")}
                    className={`mt-1 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="+254 7XX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {userType === "rider" && (
                  <div>
                    <Label
                      htmlFor="nationalId"
                      className="text-gray-700 font-medium"
                    >
                      National ID Number *
                    </Label>
                    <Input
                      id="nationalId"
                      type="text"
                      {...register("nationalId")}
                      className={`mt-1 ${errors.nationalId ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Your ID number"
                    />
                    {errors.nationalId && (
                      <p className="mt-1 text-sm text-red-600">{errors.nationalId.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password")}
                      className={`mt-1 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 font-medium"
                  >
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={`mt-1 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rider Specific Fields */}
            {userType === "rider" && (
              <>
                {/* Motorcycle Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Motorcycle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="motorcycleColor"
                        className="text-gray-700 font-medium"
                      >
                        Motorcycle Color *
                      </Label>
                      <Input
                        id="motorcycleColor"
                        type="text"
                        {...register("motorcycleColor")}
                        className={`mt-1 ${errors.motorcycleColor ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g., Red, Blue, Black"
                      />
                      {errors.motorcycleColor && (
                        <p className="mt-1 text-sm text-red-600">{errors.motorcycleColor.message}</p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="motorcycleModel"
                        className="text-gray-700 font-medium"
                      >
                        Motorcycle Model *
                      </Label>
                      <Input
                        id="motorcycleModel"
                        type="text"
                        {...register("motorcycleModel")}
                        className={`mt-1 ${errors.motorcycleModel ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g., Honda CB 150F, Yamaha FZ"
                      />
                      {errors.motorcycleModel && (
                        <p className="mt-1 text-sm text-red-600">{errors.motorcycleModel.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label
                        htmlFor="experience"
                        className="text-gray-700 font-medium"
                      >
                        Riding Experience *
                      </Label>
                      <select
                        id="experience"
                        {...register("experience")}
                        className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rocs-green ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select experience</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                      {errors.experience && (
                        <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="area"
                        className="text-gray-700 font-medium"
                      >
                        Preferred Working Area *
                      </Label>
                      <select
                        id="area"
                        {...register("area")}
                        className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rocs-green ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select area</option>
                        <option value="CBD">CBD</option>
                        <option value="Westlands">Westlands</option>
                        <option value="Karen">Karen</option>
                        <option value="Eastleigh">Eastleigh</option>
                        <option value="Kasarani">Kasarani</option>
                        <option value="Embakasi">Embakasi</option>
                        <option value="All areas">All areas</option>
                      </select>
                      {errors.area && (
                        <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Uploads */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Document Uploads
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Licenses and Certificates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FileUpload
                        label="Driving License"
                        name="drivingLicense"
                        accept="image/*,application/pdf"
                        icon={FileText}
                        description="Valid motorcycle driving license"
                      />
                      <div>
                        <Label
                          htmlFor="drivingLicenseExpiry"
                          className="text-gray-700 font-medium"
                        >
                          Driving License Expiry Date *
                        </Label>
                        <Input
                          id="drivingLicenseExpiry"
                          type="date"
                          {...register("drivingLicenseExpiry")}
                          className={`mt-1 ${errors.drivingLicenseExpiry ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.drivingLicenseExpiry && (
                          <p className="mt-1 text-sm text-red-600">{errors.drivingLicenseExpiry.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FileUpload
                        label="Good Conduct Certificate"
                        name="goodConductCertificate"
                        accept="image/*,application/pdf"
                        icon={FileText}
                        description="Certificate of good conduct from DCI"
                      />
                      <div>
                        <Label
                          htmlFor="goodConductExpiry"
                          className="text-gray-700 font-medium"
                        >
                          Good Conduct Certificate Expiry Date *
                        </Label>
                        <Input
                          id="goodConductExpiry"
                          type="date"
                          {...register("goodConductExpiry")}
                          className={`mt-1 ${errors.goodConductExpiry ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.goodConductExpiry && (
                          <p className="mt-1 text-sm text-red-600">{errors.goodConductExpiry.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FileUpload
                        label="Motorcycle Insurance"
                        name="motorcycleInsurance"
                        accept="image/*,application/pdf"
                        icon={FileText}
                        description="Valid motorcycle insurance certificate"
                      />
                      <div>
                        <Label
                          htmlFor="motorcycleInsuranceExpiry"
                          className="text-gray-700 font-medium"
                        >
                          Insurance Expiry Date *
                        </Label>
                        <Input
                          id="motorcycleInsuranceExpiry"
                          type="date"
                          {...register("motorcycleInsuranceExpiry")}
                          className={`mt-1 ${errors.motorcycleInsuranceExpiry ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.motorcycleInsuranceExpiry && (
                          <p className="mt-1 text-sm text-red-600">{errors.motorcycleInsuranceExpiry.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Statement */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Personal Statement
                  </h3>
                  <div>
                    <Label
                      htmlFor="motivation"
                      className="text-gray-700 font-medium"
                    >
                      Why do you want to join Rocs Crew? *
                    </Label>
                    <textarea
                      id="motivation"
                      {...register("motivation")}
                      rows={4}
                      className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rocs-green resize-none ${errors.motivation ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Tell us why you want to be part of our team..."
                    />
                    {errors.motivation && (
                      <p className="mt-1 text-sm text-red-600">{errors.motivation.message}</p>
                    )}
                  </div>
                </div>
              </>
            )}


            <div className="text-xs text-gray-500 text-center">
              By clicking {userType === "rider" ? "Submit Application" : "Create Account"}, you agree to our{" "}
              <Link to="/terms" className="text-rocs-green hover:underline font-medium">Terms of Service</Link> and{" "}
              <Link to="/privacy" className="text-rocs-green hover:underline font-medium">Privacy Policy</Link>.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rocs-green hover:bg-rocs-green-dark text-white font-semibold py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {userType === "rider"
                    ? "Submit Application"
                    : "Create Account"}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-rocs-green hover:text-rocs-green-dark font-medium"
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
