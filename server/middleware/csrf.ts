import { doubleCsrf } from "csrf-csrf";
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
        httpOnly: false, // CSRF token needs to be accessible by client-side JS
        // Since the site is served over HTTPS via basicSsl in dev, 
        // we should keep secure: true to avoid browser rejection. But we will disable
        // it if not in production to allow the Android App to pass it over HTTP.
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    // Use client IP as a stable session identifier (safe under HTTP/2 unlike req.socket)
    // Use a stable and safe session identifier. 
    // In HTTP/2 req.socket.remoteAddress might be undefined, so we use common headers.
    getSessionIdentifier: (req) => {
        const identifier = req.ip ||
            req.headers["x-forwarded-for"] ||
            req.headers["user-agent"] ||
            "static-session-id";
        return Array.isArray(identifier) ? identifier[0] : identifier;
    },
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"] as string | undefined,
});

