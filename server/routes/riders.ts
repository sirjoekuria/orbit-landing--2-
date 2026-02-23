import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { DatabaseService } from '../services/database';
import { supabase } from '../lib/supabase';
import { logRiderActivity } from "../utils/riderActivity";
import sharp from "sharp";

// JSON file operations (fallback when Supabase is not available)
const RIDERS_FILE = path.join(process.cwd(), 'server', 'data', 'riders.json');

function isSupabaseAvailable() {
  return !!supabase;
}

function loadRiders(): any[] {
  try {
    if (!fs.existsSync(RIDERS_FILE)) return [];
    const raw = fs.readFileSync(RIDERS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Failed to load riders:', e);
    return [];
  }
}

function saveRiders(riders: any[]) {
  try {
    const dir = path.dirname(RIDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RIDERS_FILE, JSON.stringify(riders, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save riders:', e);
  }
}

function getNextRiderId(existingRiders: any[]): string {
  if (existingRiders.length === 0) return 'RD-001';

  const ids = existingRiders
    .map(r => {
      const parts = r.id.split('-');
      return parts.length === 2 ? parseInt(parts[1]) : 0;
    })
    .filter(id => !isNaN(id));

  const maxId = Math.max(0, ...ids);
  return `RD-${(maxId + 1).toString().padStart(3, '0')}`;
}

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


// Export function to get riders data (for auth purposes)
export const getRidersData = () => {
  // This is synchronous, so we'll use the JSON fallback for now
  // In a real production app, this should be async or use a cached version
  return loadRiders();
};

// POST /api/riders/signup - Submit rider application
export const riderSignup: RequestHandler = async (req, res) => {
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

    let riders = loadRiders();

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

    // Extract file paths for storage and convert images to WebP
    const documents: any = {};
    for (const field of requiredFiles) {
      if (files[field] && files[field][0]) {
        const file = files[field][0];
        const originalPath = file.path;

        // Only convert images, keep PDFs as is
        if (file.mimetype.startsWith('image/')) {
          const webpPath = originalPath.replace(path.extname(originalPath), '.webp');
          try {
            await sharp(originalPath)
              .webp({ quality: 80 })
              .toFile(webpPath);

            // Delete original file if conversion was successful
            if (fs.existsSync(originalPath) && originalPath !== webpPath) {
              fs.unlinkSync(originalPath);
            }
            documents[field] = webpPath;
          } catch (err) {
            console.error(`Failed to convert ${field} to WebP:`, err);
            documents[field] = originalPath; // Fallback to original if conversion fails
          }
        } else {
          documents[field] = originalPath;
        }
      }
    }

    const newRider = {
      id: getNextRiderId(riders),
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

    if (isSupabaseAvailable()) {
      try {
        // We'd need to create a user first then a rider, or use a combined service
        // For simplicity during this migration, we'll ensure JSON persistence first
        // and optionally try to create in Supabase if DatabaseService supports it fully
        // DatabaseService.createRider(newRider as any);
      } catch (e) {
        console.error('Supabase rider signup failed:', e);
      }
    }

    riders.push(newRider);
    saveRiders(riders);

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
export const getRiders: RequestHandler = async (req, res) => {
  try {
    let riders: any[] = [];

    if (isSupabaseAvailable()) {
      try {
        riders = await DatabaseService.getRiders();
      } catch (e) {
        console.error('Supabase getRiders failed, falling back to JSON:', e);
      }
    }

    if (riders.length === 0) {
      riders = loadRiders();
    }

    // Sort riders by join date (newest first)
    const sortedRiders = [...riders].sort(
      (a, b) => new Date(b.joinedAt || b.created_at).getTime() - new Date(a.joinedAt || a.created_at).getTime(),
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
export const updateRiderStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    let rider;
    let riders = loadRiders();
    const riderIndex = riders.findIndex((rider) => rider.id === id);

    if (isSupabaseAvailable()) {
      try {
        rider = await DatabaseService.updateRider(id, { status } as any);
      } catch (e) {
        console.error('Supabase updateRiderStatus failed, falling back to JSON:', e);
      }
    }

    if (!rider) {
      if (riderIndex === -1) {
        return res.status(404).json({ error: "Rider not found" });
      }
      rider = riders[riderIndex];
      rider.status = status;
      rider.updatedAt = new Date().toISOString();

      if (status === "approved") {
        rider.isActive = true;
      } else if (status === "rejected") {
        rider.isActive = false;
      }
      saveRiders(riders);
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
export const toggleRiderActive: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    let rider;
    let riders = loadRiders();
    const riderIndex = riders.findIndex((rider) => rider.id === id);

    if (isSupabaseAvailable()) {
      try {
        rider = await DatabaseService.updateRider(id, { is_active: isActive } as any);
      } catch (e) {
        console.error('Supabase toggleRiderActive failed, falling back to JSON:', e);
      }
    }

    if (!rider) {
      if (riderIndex === -1) {
        return res.status(404).json({ error: "Rider not found" });
      }
      rider = riders[riderIndex];
      rider.isActive = isActive;
      rider.updatedAt = new Date().toISOString();
      saveRiders(riders);
    }

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
export const getAvailableRiders: RequestHandler = async (req, res) => {
  try {
    let riders: any[] = [];

    if (isSupabaseAvailable()) {
      try {
        riders = await DatabaseService.getRiders();
      } catch (e) {
        console.error('Supabase getAvailableRiders failed, falling back to JSON:', e);
      }
    }

    if (riders.length === 0) {
      riders = loadRiders();
    }

    const availableRiders = riders
      .filter((rider) => (rider.status === "approved" || rider.status === undefined) && (rider.isActive || rider.is_active))
      .map((rider) => ({
        id: rider.id,
        fullName: rider.fullName || rider.full_name,
        phone: rider.phone,
        area: rider.area,
        rating: rider.rating,
        totalDeliveries: rider.totalDeliveries || rider.total_deliveries || 0,
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
export const deleteRider: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseAvailable()) {
      try {
        // Find user_id first if needed, or delete by rider id if supported
        // await DatabaseService.deleteRider(id);
      } catch (e) {
        console.error('Supabase deleteRider failed:', e);
      }
    }

    let riders = loadRiders();
    const riderIndex = riders.findIndex((rider) => rider.id === id);
    if (riderIndex === -1) {
      return res.status(404).json({ error: "Rider not found" });
    }

    const deletedRider = riders.splice(riderIndex, 1)[0];
    saveRiders(riders);

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
export const getRiderEarnings: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    let rider;

    if (isSupabaseAvailable()) {
      try {
        rider = await DatabaseService.getRiderById(id);
      } catch (e) {
        console.error('Supabase getRiderById failed, falling back to JSON:', e);
      }
    }

    if (!rider) {
      const riders = loadRiders();
      rider = riders.find((r) => r.id === id);
    }

    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    res.json({
      riderId: rider.id,
      fullName: rider.fullName || rider.full_name,
      email: rider.email,
      currentBalance: rider.currentBalance || rider.current_balance || 0,
      totalEarnings: rider.totalEarnings || rider.total_earnings || 0,
      totalWithdrawn: rider.totalWithdrawn || rider.total_withdrawn || 0,
      lastWithdrawal: rider.lastWithdrawal || rider.last_withdrawal,
      earnings: rider.earnings || [],
      totalDeliveries: rider.totalDeliveries || rider.total_deliveries || 0,
      rating: rider.rating || 0,
    });
  } catch (error) {
    console.error("Error getting rider earnings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/admin/riders/:id/add-earning - Add earning for completed delivery
export const addRiderEarning: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, orderAmount, deliveryDate } = req.body;

    let rider;
    let riders = loadRiders();
    const riderIndex = riders.findIndex((r) => r.id === id);

    if (isSupabaseAvailable()) {
      try {
        // update rider stats in Supabase if supported
      } catch (e) {
        console.error('Supabase addRiderEarning failed:', e);
      }
    }

    if (riderIndex === -1 && !rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    rider = riders[riderIndex];

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

    saveRiders(riders);

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
export const processRiderPayment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, notes } = req.body;

    let riders = loadRiders();
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

    saveRiders(riders);

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
