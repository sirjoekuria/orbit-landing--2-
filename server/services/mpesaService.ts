import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Get current M-Pesa configuration from environment
 */
const getConfig = () => {
    return {
        CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
        CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
        PASSKEY: process.env.MPESA_PASSKEY,
        SHORTCODE: process.env.MPESA_SHORTCODE || process.env.MPESA_BUSINESS_SHORTCODE || '174379',
        CALLBACK_URL: process.env.MPESA_CALLBACK_URL,
        ENVIRONMENT: process.env.MPESA_ENVIRONMENT || 'sandbox'
    };
};

/**
 * Check if M-Pesa credentials are configured
 */
const checkCredentials = () => {
    const config = getConfig();
    if (!config.CONSUMER_KEY || config.CONSUMER_KEY.includes('your_')) {
        console.error('M-Pesa Consumer Key missing or placeholder:', config.CONSUMER_KEY);
        throw new Error(`M-Pesa Consumer Key is not configured in .env (Current: ${config.CONSUMER_KEY})`);
    }
    if (!config.CONSUMER_SECRET || config.CONSUMER_SECRET.includes('your_')) {
        console.error('M-Pesa Consumer Secret missing or placeholder');
        throw new Error('M-Pesa Consumer Secret is not configured in .env');
    }
    if (!config.PASSKEY || config.PASSKEY.includes('your_')) {
        console.error('M-Pesa Passkey missing or placeholder');
        throw new Error('M-Pesa Passkey is not configured in .env');
    }
    if (!config.CALLBACK_URL || config.CALLBACK_URL.includes('your_') || config.CALLBACK_URL.includes('your-ngrok-url')) {
        console.error('M-Pesa Callback URL missing or placeholder:', config.CALLBACK_URL);
        throw new Error(`M-Pesa Callback URL is not configured or still contains placeholder in .env (Current: ${config.CALLBACK_URL})`);
    }
    return config;
};

const getBaseUrl = () => {
    const config = getConfig();
    return config.ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
};

export interface MpesaResponse {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
}

/**
 * Get OAuth2 access token from Safaricom
 */
export const getAccessToken = async (): Promise<string> => {
    try {
        const config = checkCredentials();
        const auth = Buffer.from(`${config.CONSUMER_KEY}:${config.CONSUMER_SECRET}`).toString('base64');
        const response = await axios.get(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return (response.data as any).access_token;
    } catch (error: any) {
        const errorData = error.response?.data || error.message;
        console.error('Error generating M-Pesa access token:', errorData);
        // Log to file as well if we were using logMpesa, but mpesaService doesn't have it.
        // Let's just throw with more info.
        throw new Error(`Failed to generate M-Pesa access token: ${JSON.stringify(errorData)}`);
    }
};

/**
 * Generate Timestamp for STK Push (YYYYMMDDHHmmss)
 */
const getTimestamp = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Initiate STK Push (C2B)
 */
export const initiateStkPush = async (phoneNumber: string, amount: number, accountReference: string): Promise<MpesaResponse> => {
    try {
        const config = checkCredentials();
        const accessToken = await getAccessToken();
        const timestamp = getTimestamp();
        const password = Buffer.from(`${config.SHORTCODE}${config.PASSKEY}${timestamp}`).toString('base64');

        // Normalize phone number (ensure it starts with 254)
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
        const finalPhone = formattedPhone.startsWith('0') ? `254${formattedPhone.substring(1)}` : formattedPhone;

        const body = {
            BusinessShortCode: config.SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: finalPhone,
            PartyB: config.SHORTCODE,
            PhoneNumber: finalPhone,
            CallBackURL: config.CALLBACK_URL,
            AccountReference: accountReference,
            TransactionDesc: `Payment for order ${accountReference}`,
        };

        const response = await axios.post(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data as MpesaResponse;
    } catch (error: any) {
        console.error('Error initiating M-Pesa STK Push:', error.response?.data || error.message);
        throw error;
    }
};

export interface MpesaB2CResponse {
    ConversationID: string;
    OriginatorConversationID: string;
    ResponseCode: string;
    ResponseDescription: string;
}

/**
 * Initiate B2C Payment (Payout to Rider)
 */
export const initiateB2C = async (phoneNumber: string, amount: number, remarks: string, occasion: string = 'Salary Payment'): Promise<MpesaB2CResponse> => {
    try {
        const config = checkCredentials();
        const accessToken = await getAccessToken();

        // Normalize phone number
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
        const finalPhone = formattedPhone.startsWith('0') ? `254${formattedPhone.substring(1)}` : formattedPhone;

        const body = {
            InitiatorName: config.SHORTCODE === '174379' ? 'testapi' : (process.env.MPESA_B2C_INITIATOR_NAME || 'testapi'),
            SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL || 'test_credential',
            CommandID: 'BusinessPayment',
            Amount: Math.round(amount),
            PartyA: config.SHORTCODE === '174379' ? '600999' : (process.env.MPESA_B2C_SHORTCODE || '600999'),
            PartyB: finalPhone,
            Remarks: remarks,
            QueueTimeOutURL: config.CALLBACK_URL,
            ResultURL: config.CALLBACK_URL,
            Occasion: occasion
        };

        const response = await axios.post(`${getBaseUrl()}/mpesa/b2c/v1/paymentrequest`, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data as MpesaB2CResponse;
    } catch (error: any) {
        console.error('Error initiating M-Pesa B2C:', error.response?.data || error.message);
        throw error;
    }
};
