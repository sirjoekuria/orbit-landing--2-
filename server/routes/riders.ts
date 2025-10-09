import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { logRiderActivity } from "../utils/riderActivity";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/riders";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs only
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed!"));
    }
  },
});

// Multer middleware for multiple file fields
export const uploadRiderDocuments = upload.fields([
  { name: "passportPhoto", maxCount: 1 },
  { name: "motorcyclePhoto", maxCount: 1 },
  { name: "idCardFront", maxCount: 1 },
  { name: "idCardBack", maxCount: 1 },
  { name: "drivingLicense", maxCount: 1 },
  { name: "goodConductCertificate", maxCount: 1 },
  { name: "motorcycleInsurance", maxCount: 1 },
]);

// In-memory storage for riders (in production, use a proper database)
let riders: any[] = [];
let riderIdCounter = 1;

// Sample data for demonstration - enhanced with earnings tracking
const sampleRiders = [
  {
    id: "RD-001",
    fullName: "John Mwangi",
    email: "john.mwangi@example.com",
    phone: "+254 712 345 678",
    password: "password123", // In production, this would be hashed
    nationalId: "12345678",
    motorcycle: "Honda CB 150R, 2020",
    experience: "3-5 years",
    area: "Westlands",
    motivation:
      "I want to earn extra income and provide excellent delivery service to customers.",
    status: "approved",
    rating: 4.8,
    totalDeliveries: 156,
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    userType: "rider",
    currentBalance: 12480, // KES
    totalEarnings: 24960, // KES
    totalWithdrawn: 12480, // KES
    lastWithdrawal: new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    earnings: [
      {
        orderId: "RC-2024-001",
        amount: 156,
        commission: 31.2, // 20% commission
        riderEarning: 124.8, // 80% to rider
        deliveryDate: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "pending",
      },
    ],
  },
  {
    id: "RD-002",
    fullName: "Peter Kimani",
    email: "peter.kimani@example.com",
    phone: "+254 700 123 456",
    password: "password123", // In production, this would be hashed
    nationalId: "87654321",
    motorcycle: "Yamaha YBR 125, 2019",
    experience: "5+ years",
    area: "CBD",
    motivation:
      "I have extensive experience in Nairobi and want to help businesses with reliable delivery.",
    status: "approved",
    rating: 4.9,
    totalDeliveries: 203,
    joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    userType: "rider",
    currentBalance: 8960, // KES
    totalEarnings: 32480, // KES
    totalWithdrawn: 23520, // KES
    lastWithdrawal: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    earnings: [],
  },
  {
    id: "RD-003",
    fullName: "David Ochieng",
    email: "david.ochieng@example.com",
    phone: "+254 722 987 654",
    password: "password123", // In production, this would be hashed
    nationalId: "11223344",
    motorcycle: "TVS Apache 160, 2021",
    experience: "1-2 years",
    area: "Karen",
    motivation:
      "I am a recent graduate looking for flexible work opportunities while I pursue other goals.",
    status: "pending",
    rating: 0,
    totalDeliveries: 0,
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    userType: "rider",
    currentBalance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
    earnings: [],
  },
  {
    id: "RD-004",
    fullName: "James Mwangi",
    email: "james.mwangi@example.com",
    phone: "+254 701 987 654",
    password: "password123", // In production, this would be hashed
    nationalId: "44332211",
    motorcycle: "Bajaj Pulsar 150, 2020",
    experience: "2-3 years",
    area: "Kilimani",
    motivation:
      "I want to provide reliable delivery services while earning a good income.",
    status: "approved",
    rating: 4.7,
    totalDeliveries: 89,
    joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    userType: "rider",
    currentBalance: 3460, // KES
    totalEarnings: 15680, // KES
    totalWithdrawn: 12220, // KES
    lastWithdrawal: new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    earnings: [],
  },
];

// Initialize with sample data
riders = [];
riderIdCounter = 1;

// Export function to get riders data (for auth purposes)
export const getRidersData = () => riders;

// POST /api/riders/signup - Submit rider application
export const riderSignup: RequestHandler = (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      nationalId,
      motorcycleColor,
      motorcycleModel,
      experience,
      area,
      motivation,
      drivingLicenseExpiry,
      goodConductExpiry,
      motorcycleInsuranceExpiry,
    } = req.body;

    // Validate required text fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !nationalId ||
      !motorcycleColor ||
      !motorcycleModel ||
      !experience ||
      !area ||
      !motivation ||
      !drivingLicenseExpiry ||
      !goodConductExpiry ||
      !motorcycleInsuranceExpiry
    ) {
      return res.status(400).json({
        error:
          "All fields are required for rider application including password and expiry dates",
      });
    }

    // Validate uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
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
      (field) => !files[field] || files[field].length === 0,
    );

    if (missingFiles.length > 0) {
      return res.status(400).json({
        error: `Missing required documents: ${missingFiles.join(", ")}`,
      });
    }

    // Check if rider already exists
    const existingRider = riders.find(
      (rider) =>
        rider.email === email ||
        rider.phone === phone ||
        rider.nationalId === nationalId,
    );

    if (existingRider) {
      return res.status(400).json({
        error: "A rider with this email, phone, or national ID already exists",
      });
    }

    // Extract file paths for storage
    const documents = {};
    requiredFiles.forEach((field) => {
      if (files[field] && files[field][0]) {
        documents[field] = files[field][0].path;
      }
    });

    const newRider = {
      id: `RD-${riderIdCounter.toString().padStart(3, "0")}`,
      fullName,
      email,
      phone,
      password, // In production, this should be hashed
      nationalId,
      motorcycleColor,
      motorcycleModel,
      experience,
      area,
      motivation,
      drivingLicenseExpiry,
      goodConductExpiry,
      motorcycleInsuranceExpiry,
      documents, // Store all uploaded document paths
      status: "pending",
      rating: 0,
      totalDeliveries: 0,
      joinedAt: new Date().toISOString(),
      isActive: false,
      userType: "rider",
      currentBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      earnings: [],
    };

    riders.push(newRider);
    riderIdCounter++;

    res.status(201).json({
      success: true,
      message:
        "Rider application submitted successfully. You will be notified once approved.",
      rider: {
        id: newRider.id,
        fullName: newRider.fullName,
        email: newRider.email,
        userType: newRider.userType,
        status: newRider.status,
      },
    });
  } catch (error) {
    console.error("Error creating rider application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/riders - Get all riders (admin only)
export const getRiders: RequestHandler = (req, res) => {
  try {
    // Sort riders by join date (newest first)
    const sortedRiders = [...riders].sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
    );

    res.json({
      success: true,
      riders: sortedRiders,
      total: riders.length,
      stats: {
        approved: riders.filter((r) => r.status === "approved").length,
        pending: riders.filter((r) => r.status === "pending").length,
        rejected: riders.filter((r) => r.status === "rejected").length,
        active: riders.filter((r) => r.isActive).length,
      },
    });
  } catch (error) {
    console.error("Error getting riders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/admin/riders/:id/status - Update rider status (approve/reject)
export const updateRiderStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const riderIndex = riders.findIndex((rider) => rider.id === id);
    if (riderIndex === -1) {
      return res.status(404).json({ error: "Rider not found" });
    }

    const rider = riders[riderIndex];
    rider.status = status;
    rider.updatedAt = new Date().toISOString();

    // If approved, activate the rider
    if (status === "approved") {
      rider.isActive = true;
    } else if (status === "rejected") {
      rider.isActive = false;
    }

    res.json({
      success: true,
      message: `Rider ${status} successfully`,
      rider,
    });
  } catch (error) {
    console.error("Error updating rider status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/admin/riders/:id/active - Toggle rider active status
export const toggleRiderActive: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const riderIndex = riders.findIndex((rider) => rider.id === id);
    if (riderIndex === -1) {
      return res.status(404).json({ error: "Rider not found" });
    }

    const rider = riders[riderIndex];
    rider.isActive = isActive;
    rider.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Rider ${isActive ? "activated" : "deactivated"} successfully`,
      rider,
    });
  } catch (error) {
    console.error("Error toggling rider active status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/riders/available - Get available riders for assignment
export const getAvailableRiders: RequestHandler = (req, res) => {
  try {
    const availableRiders = riders
      .filter((rider) => rider.status === "approved" && rider.isActive)
      .map((rider) => ({
        id: rider.id,
        fullName: rider.fullName,
        phone: rider.phone,
        area: rider.area,
        rating: rider.rating,
        totalDeliveries: rider.totalDeliveries,
      }));

    res.json({
      success: true,
      riders: availableRiders,
    });
  } catch (error) {
    console.error("Error getting available riders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/admin/riders/:id - Delete rider
export const deleteRider: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const riderIndex = riders.findIndex((rider) => rider.id === id);
    if (riderIndex === -1) {
      return res.status(404).json({ error: "Rider not found" });
    }

    const deletedRider = riders.splice(riderIndex, 1)[0];

    res.json({
      success: true,
      message: "Rider deleted successfully",
      rider: deletedRider,
    });
  } catch (error) {
    console.error("Error deleting rider:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/admin/riders/:id/earnings - Get rider earnings details
export const getRiderEarnings: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const rider = riders.find((r) => r.id === id);
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    res.json({
      riderId: rider.id,
      fullName: rider.fullName,
      email: rider.email,
      currentBalance: rider.currentBalance || 0,
      totalEarnings: rider.totalEarnings || 0,
      totalWithdrawn: rider.totalWithdrawn || 0,
      lastWithdrawal: rider.lastWithdrawal,
      earnings: rider.earnings || [],
      totalDeliveries: rider.totalDeliveries || 0,
      rating: rider.rating || 0,
    });
  } catch (error) {
    console.error("Error getting rider earnings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/admin/riders/:id/add-earning - Add earning for completed delivery
export const addRiderEarning: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, orderAmount, deliveryDate } = req.body;

    const riderIndex = riders.findIndex((r) => r.id === id);
    if (riderIndex === -1) {
      return res.status(404).json({ error: "Rider not found" });
    }

    const rider = riders[riderIndex];

    // Calculate commission (20% to company, 80% to rider)
    const commission = orderAmount * 0.2;
    const riderEarning = orderAmount * 0.8;

    // Create earning record
    const earning = {
      orderId,
      amount: orderAmount,
      commission,
      riderEarning,
      deliveryDate: deliveryDate || new Date().toISOString(),
      status: "pending",
    };

    // Update rider data
    if (!rider.earnings) rider.earnings = [];
    rider.earnings.push(earning);

    rider.currentBalance = (rider.currentBalance || 0) + riderEarning;
    rider.totalEarnings = (rider.totalEarnings || 0) + riderEarning;
    rider.totalDeliveries = (rider.totalDeliveries || 0) + 1;

    res.json({
      success: true,
      message: "Earning added successfully",
      earning,
      newBalance: rider.currentBalance,
      totalEarnings: rider.totalEarnings,
    });
  } catch (error) {
    console.error("Error adding rider earning:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/admin/riders/:id/process-payment - Process payment to rider
export const processRiderPayment: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, notes } = req.body;

    const riderIndex = riders.findIndex((r) => r.id === id);
    if (riderIndex === -1) {
      return res.status(404).json({ error: "Rider not found" });
    }

    const rider = riders[riderIndex];

    if (amount > (rider.currentBalance || 0)) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update rider balance
    rider.currentBalance = (rider.currentBalance || 0) - amount;
    rider.totalWithdrawn = (rider.totalWithdrawn || 0) + amount;
    rider.lastWithdrawal = new Date().toISOString();

    // Add payment record
    if (!rider.payments) rider.payments = [];
    const paymentId = `PAY-${Date.now()}`;
    rider.payments.push({
      id: paymentId,
      amount,
      paymentMethod,
      notes,
      processedAt: new Date().toISOString(),
      status: "completed",
    });

    // Log rider activity for payment received
    logRiderActivity({
      riderId: id,
      riderName: rider.fullName,
      type: "payment_received",
      description: `Received payment of KES ${amount.toLocaleString()} via ${paymentMethod}`,
      amount: amount,
      metadata: {
        paymentMethod,
        balanceChange: -amount,
        newBalance: rider.currentBalance,
        paymentId,
        notes,
      },
    });

    res.json({
      success: true,
      message: "Payment processed successfully",
      newBalance: rider.currentBalance,
      totalWithdrawn: rider.totalWithdrawn,
      paymentId: paymentId,
    });
  } catch (error) {
    console.error("Error processing rider payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
