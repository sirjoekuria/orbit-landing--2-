import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod';
const TOKEN_EXPIRY = '7d';

/**
 * Generates a JWT for a user
 * @param payload Data to include in the token
 * @returns The generated token
 */
export function generateToken(payload: any): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Sets a secure, httpOnly cookie with the JWT
 * @param res Express response object
 * @param token The JWT to set
 */
export function setAuthCookie(res: Response, token: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('auth_token', token, {
        httpOnly: true,
        // Always use secure: true because the site is served over HTTPS 
        // via basicSsl in dev, and browsers require it for HTTPS.
        secure: true,
        sameSite: 'lax',     // 'lax' allows cookie on page refresh/navigation
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
}

/**
 * Verifies a JWT
 * @param token The token to verify
 * @returns The decoded payload or null if invalid
 */
export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Clears the authentication cookie
 * @param res Express response object
 */
export function clearAuthCookie(res: Response): void {
    res.clearCookie('auth_token', {
        path: '/',
    });
}
