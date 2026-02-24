import { Capacitor } from '@capacitor/core';

// For production Android app, this must point to the hosted backend.
// In this case, the Netlify deployed domain. You can alter this to your
// development Netlify URL if you are testing on a staging environment.
export const API_BASE_URL = Capacitor.getPlatform() === 'web'
    ? ''
    : 'https://rocscrew.com';
