
/**
 * Verifies a reCAPTCHA token with Google
 * @param token The token received from the frontend
 * @returns boolean indicating if the token is valid
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.warn('⚠️  RECAPTCHA_SECRET_KEY not set. Skipping verification.');
        return true; // Skip verification if not configured to avoid blocking app
    }

    if (!token) {
        return false;
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${token}`
        });

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
}
