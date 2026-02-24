import { Capacitor } from '@capacitor/core';

// For production Android app, this must point to the hosted backend.
// You can override this using VITE_API_BASE_URL in your .env file
// for local development (e.g., VITE_API_BASE_URL=http://192.168.x.x:3001)
export const API_BASE_URL = Capacitor.getPlatform() === 'web'
    ? ''
    : (import.meta.env.VITE_API_BASE_URL || 'https://rocscrewdelivery.netlify.app');
