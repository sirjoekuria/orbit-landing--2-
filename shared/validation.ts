import { z } from "zod";

export const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    userType: z.enum(["customer", "rider"]).optional(),
    // Rider specific fields (optional in schema, validated in form if userType is rider)
    nationalId: z.string().optional(),
    motorcycleColor: z.string().optional(),
    motorcycleModel: z.string().optional(),
    experience: z.string().optional(),
    area: z.string().optional(),
    motivation: z.string().optional(),
    drivingLicenseExpiry: z.string().optional(),
    goodConductExpiry: z.string().optional(),
    motorcycleInsuranceExpiry: z.string().optional(),
    recaptchaToken: z.string().min(1, "Please complete the reCAPTCHA"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    userType: z.enum(["customer", "rider"]).optional(),
    recaptchaToken: z.string().min(1, "Please complete the reCAPTCHA"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
