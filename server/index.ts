import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
} from "./routes/messages";
import {
  createOrder,
  trackOrder,
  getOrders,
  updateOrderStatus,
  assignRiderToOrder,
  confirmPaymentAndSendReceipt,
  resendReceipt,
  getUserOrders,
  rateRider,
  getAssignedOrders,
} from "./routes/orders";
import {
  createPayPalOrder,
  capturePayPalOrder,
  verifyPayPalPayment,
  processCashOnDelivery,
  getPayment,
  getAllPayments,
  updatePaymentStatus,
  initiateMpesaStkPush,
  mpesaCallback,
  getMpesaStatus,
} from "./routes/payments";
import {
  riderSignup,
  getRiders,
  updateRiderStatus,
  toggleRiderActive,
  getAvailableRiders,
  deleteRider,
  getRiderEarnings,
  addRiderEarning,
  processRiderPayment,
  uploadRiderDocuments,
} from "./routes/riders";
import {
  userSignup,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getMe,
  logout
} from "./routes/auth-hybrid";
import {
  submitPartnershipRequest,
  getPartnershipRequests,
  updatePartnershipRequestStatus,
  deletePartnershipRequest,
  getPartnershipRequest,
} from "./routes/partnerships";
import {
  getAllActivities,
  getActivitiesStats,
  getRiderSpecificActivities,
  getOrderSpecificActivities,
  getRiderEarningsHistory,
  createActivity,
  getActivityTypes,
  exportActivities,
  importActivities,
  deleteActivity,
} from "./routes/riderActivity";
import {
  createWithdrawal,
  getAdminWithdrawalRequests,
  getRiderWithdrawals,
  updateWithdrawalStatus,
  getAdminAutomatedPayments,
  getRiderAutomatedPaymentHistory,
  triggerAutomatedPayments,
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
  calculateFee,
} from "./routes/withdrawals";
import { initializeScheduler } from "./services/cronScheduler";
import { getLocations, updateLocation, addLocation, deleteLocation } from "./routes/locations";
import {
  aiHealthCheck,
  optimizeRoutes,
  predictDemand,
  aiCustomerSupport,
  calculateDynamicPrice,
  detectFraud,
  analyzeSentiment,
  bulkSentimentAnalysis,
  getAIInsights,
} from "./routes/ai";

import cookieParser from "cookie-parser";
import { generateToken, setAuthCookie, verifyToken, clearAuthCookie } from './utils/jwt';
import { globalLimiter, authLimiter } from "./middleware/rateLimiter";
import {
  invalidCsrfTokenError,
  doubleCsrfProtection,
  generateCsrfToken,
} from "./middleware/csrf";
import {
  validate,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "./middleware/validation";

export function createServer() {
  const app = express();

  // Trust first proxy (required for secure cookies behind Vite proxy)
  app.set('trust proxy', 1);


  // Middleware
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());

  // apply global rate limiting
  app.use(globalLimiter);

  // Request logger for debugging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Alias for signup to support both endpoints
  app.post("/api/users/signup", validate(signupSchema), userSignup);

  // CSRF Token endpoint
  app.get("/api/csrf-token", (req, res) => {
    if (typeof generateCsrfToken === 'function') {
      const token = generateCsrfToken(req, res);
      res.json({ token });
    } else {
      console.warn('CSRF generateCsrfToken is not a function');
      res.status(500).json({ error: 'CSRF initialization failed' });
    }
  });

  // M-Pesa Callback (Exempt from CSRF)
  app.post("/api/payments/mpesa/callback", mpesaCallback);

  // Apply CSRF protection to all API routes except GET/HEAD/OPTIONS (configured in csrf.ts)
  app.use("/api", doubleCsrfProtection);

  // Existing routes
  app.get("/api/ping", (req, res) => {
    res.json({ message: "Server is running!", version: "1.0.1" });
  });
  app.get("/api/version", (req, res) => {
    res.json({ version: "1.0.1", timestamp: new Date().toISOString() });
  });
  app.get("/api/demo", handleDemo);

  // Message routes
  app.post("/api/messages", createMessage);
  app.get("/api/admin/messages", getMessages);
  app.patch("/api/admin/messages/:id", updateMessageStatus);
  app.delete("/api/admin/messages/:id", deleteMessage);

  // Order routes
  app.post("/api/orders", createOrder);
  app.get("/api/orders/track/:id", trackOrder);
  app.get("/api/orders/user/:email", getUserOrders);
  app.post("/api/orders/:id/rate-rider", rateRider);
  app.get("/api/riders/assigned-orders", getAssignedOrders);
  app.get("/api/admin/orders", getOrders);
  app.patch("/api/admin/orders/:id", updateOrderStatus);
  app.patch("/api/admin/orders/:id/assign-rider", assignRiderToOrder);
  app.post(
    "/api/admin/orders/:id/confirm-payment",
    confirmPaymentAndSendReceipt,
  );
  app.post("/api/admin/orders/:id/resend-receipt", resendReceipt);

  // Payment routes
  app.post("/api/payments/create-paypal-order", createPayPalOrder);
  app.post("/api/payments/capture-paypal-order", capturePayPalOrder);
  app.post("/api/payments/verify-paypal", verifyPayPalPayment);
  app.post("/api/payments/cash-on-delivery", processCashOnDelivery);
  app.get("/api/payments/:id", getPayment);
  app.get("/api/admin/payments", getAllPayments);
  app.patch("/api/payments/:id/status", updatePaymentStatus);

  // M-Pesa routes
  app.post("/api/payments/mpesa/stkpush", initiateMpesaStkPush);
  app.get("/api/payments/mpesa/status/:checkoutRequestId", getMpesaStatus);

  // Rider routes
  app.post("/api/riders/signup", uploadRiderDocuments, validate(signupSchema), riderSignup);
  app.get("/api/admin/riders", getRiders);
  app.patch("/api/admin/riders/:id/status", updateRiderStatus);
  app.patch("/api/admin/riders/:id/active", toggleRiderActive);
  app.get("/api/riders/available", getAvailableRiders);
  app.delete("/api/admin/riders/:id", deleteRider);
  app.get("/api/admin/riders/:id/earnings", getRiderEarnings);
  app.post("/api/admin/riders/:id/add-earning", addRiderEarning);
  app.post("/api/admin/riders/:id/process-payment", processRiderPayment);

  // Auth routes
  app.post("/api/auth/signup", validate(signupSchema), userSignup);
  app.post("/api/auth/login", validate(loginSchema), login);
  app.post("/api/auth/forgot-password", validate(forgotPasswordSchema), forgotPassword);
  app.post("/api/auth/reset-password", validate(resetPasswordSchema), resetPassword);
  app.get("/api/auth/me", getMe);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/profile/:userId", getProfile);
  app.patch("/api/auth/profile/:userId", updateProfile);
  app.get("/api/admin/users", getAllUsers);
  app.patch("/api/admin/users/:userId/status", toggleUserStatus);
  app.delete("/api/admin/users/:userId", deleteUser);

  // Locations admin endpoints
  app.get("/api/admin/locations", getLocations);
  app.post("/api/admin/locations", addLocation);
  app.patch("/api/admin/locations/:id", updateLocation);
  app.delete("/api/admin/locations/:id", deleteLocation);

  // Partnership routes
  app.post("/api/partnership-requests", submitPartnershipRequest);
  app.get("/api/admin/partnership-requests", getPartnershipRequests);
  app.patch(
    "/api/admin/partnership-requests/:id/status",
    updatePartnershipRequestStatus,
  );
  app.delete("/api/admin/partnership-requests/:id", deletePartnershipRequest);
  app.get("/api/partnership-requests/:id", getPartnershipRequest);

  // Rider Activity routes
  app.get("/api/admin/rider-activities", getAllActivities);
  app.get("/api/admin/rider-activities/stats", getActivitiesStats);
  app.get(
    "/api/admin/rider-activities/rider/:riderId",
    getRiderSpecificActivities,
  );
  app.get(
    "/api/admin/rider-activities/order/:orderId",
    getOrderSpecificActivities,
  );
  app.get(
    "/api/admin/rider-activities/earnings/:riderId",
    getRiderEarningsHistory,
  );
  app.post("/api/admin/rider-activities/log", createActivity);
  app.get("/api/admin/rider-activities/types", getActivityTypes);
  app.get("/api/admin/rider-activities/export", exportActivities);
  app.post("/api/admin/rider-activities/import", importActivities);
  app.delete("/api/admin/rider-activities/:id", deleteActivity);

  // Withdrawal and Automated Payment routes
  app.post("/api/riders/:riderId/withdrawal-request", createWithdrawal);
  app.get("/api/riders/:riderId/withdrawal-requests", getRiderWithdrawals);
  app.get(
    "/api/riders/:riderId/automated-payments",
    getRiderAutomatedPaymentHistory,
  );
  app.get("/api/admin/withdrawal-requests", getAdminWithdrawalRequests);
  app.patch(
    "/api/admin/withdrawal-requests/:requestId",
    updateWithdrawalStatus,
  );
  app.get("/api/admin/automated-payments", getAdminAutomatedPayments);
  app.post("/api/admin/trigger-automated-payments", triggerAutomatedPayments);
  app.get("/api/admin/payment-scheduler/status", getSchedulerStatus);
  app.post("/api/admin/payment-scheduler/start", startScheduler);
  app.post("/api/admin/payment-scheduler/stop", stopScheduler);
  app.get("/api/withdrawal-fee-calculator", calculateFee);

  // AI Routes
  app.get("/api/ai/health", aiHealthCheck);
  app.post("/api/ai/optimize-routes", optimizeRoutes);
  app.post("/api/ai/predict-demand", predictDemand);
  app.post("/api/ai/customer-support", aiCustomerSupport);
  app.post("/api/ai/dynamic-pricing", calculateDynamicPrice);
  app.post("/api/ai/detect-fraud", detectFraud);
  app.post("/api/ai/analyze-sentiment", analyzeSentiment);
  app.post("/api/ai/bulk-sentiment-analysis", bulkSentimentAnalysis);
  app.get("/api/ai/insights", getAIInsights);

  // Initialize the automated payment scheduler only if not in a serverless environment
  if (
    !process.env.AWS_LAMBDA_FUNCTION_VERSION &&
    !process.env.NETLIFY &&
    process.env.NODE_ENV !== "production" // Often we don't want this running on every express instance if scaled
  ) {
    initializeScheduler();
  }

  // Error handling for CSRF
  app.use((err: any, req: any, res: any, next: any) => {
    if (err === invalidCsrfTokenError) {
      console.error('CSRF Error for', req.path, 'from', req.ip);
      res.status(403).json({
        error: "Invalid CSRF token",
      });
    } else {
      next(err);
    }
  });

  return app;
}
