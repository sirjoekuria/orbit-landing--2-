import { doubleCsrf } from "csrf-csrf";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

export const {
    invalidCsrfTokenError,
    generateCsrfToken,
    validateRequest,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || "8f2d5a7e9c1b4d0f2a6e8d0c1b3a5f7e",
    cookieName: "x-csrf-token",
    cookieOptions: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getSessionIdentifier: (req) => req.headers["x-csrf-token"] || "default-session-id", // Fallback for stateless
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});
