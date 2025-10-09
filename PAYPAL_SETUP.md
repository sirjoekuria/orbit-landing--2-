# PayPal Integration Setup Guide

## Overview
This document explains how to set up PayPal payment integration for the Rocs Crew delivery website.

## PayPal Developer Account Setup

### 1. Create PayPal Developer Account
1. Go to [PayPal Developer Portal](https://developer.paypal.com)
2. Sign in with your PayPal account or create a new one
3. Navigate to "My Apps & Credentials"

### 2. Create a New App
1. Click "Create App"
2. Choose "Default Application" 
3. Select your merchant account
4. Choose "Sandbox" for testing or "Live" for production
5. Select features: "Accept payments" and "Log in with PayPal"

### 3. Get Your Credentials
After creating the app, you'll receive:
- **Client ID**: Used in the frontend
- **Client Secret**: Used in the backend (keep secure)

## Environment Variables Configuration

You need to set these environment variables in your application:

### Backend Environment Variables
```bash
PAYPAL_CLIENT_ID=your_actual_paypal_client_id
PAYPAL_CLIENT_SECRET=your_actual_paypal_client_secret
NODE_ENV=development  # or production
```

### Frontend Environment Variables
```bash
REACT_APP_PAYPAL_CLIENT_ID=your_actual_paypal_client_id
```

## Setting Up Environment Variables

### Option 1: Using DevServerControl (Current Setup)
The environment variables have been set using the DevServerControl tool. To update them with your actual PayPal credentials:

1. Replace `your-paypal-client-id-here` with your actual PayPal Client ID
2. Replace `your-paypal-client-secret-here` with your actual PayPal Client Secret

### Option 2: Using .env File (Alternative)
Create a `.env` file in the root directory:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_actual_paypal_client_id
PAYPAL_CLIENT_SECRET=your_actual_paypal_client_secret
REACT_APP_PAYPAL_CLIENT_ID=your_actual_paypal_client_id
NODE_ENV=development
```

## Testing PayPal Integration

### Sandbox Testing
1. Use sandbox credentials from PayPal Developer Portal
2. Set `NODE_ENV=development` to use sandbox URLs
3. Test with PayPal sandbox test accounts

### Test Credit Cards (Sandbox)
PayPal provides test credit card numbers for sandbox testing:
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- American Express: 378282246310005

### Test PayPal Accounts (Sandbox)
Create test buyer and seller accounts in the PayPal sandbox dashboard.

## Production Deployment

### 1. Update Environment Variables
```bash
PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_CLIENT_SECRET=your_live_paypal_client_secret
REACT_APP_PAYPAL_CLIENT_ID=your_live_paypal_client_id
NODE_ENV=production
```

### 2. PayPal App Review
Before going live:
1. Complete PayPal's app review process
2. Verify your business account
3. Enable live payments in your PayPal app

## Currency Configuration

### Current Setup
- Frontend displays amounts in KES (Kenyan Shillings)
- PayPal processes payments in USD (with automatic conversion)
- Conversion rate: ~130 KES = 1 USD (approximate)

### Customizing Currency
To change the currency handling:

1. Update the conversion logic in `PaymentSelection.tsx`
2. Modify the PayPal currency parameter
3. Update display formatting throughout the application

## Security Best Practices

### 1. Client Secret Security
- **Never** expose the Client Secret in frontend code
- Store it securely in backend environment variables
- Use secure deployment practices

### 2. Webhook Verification
For production, implement PayPal webhook verification:
- Verify webhook signatures
- Validate payment notifications
- Handle duplicate notifications

### 3. Payment Validation
- Always verify payments on the backend
- Don't rely solely on frontend payment confirmations
- Implement proper error handling

## Troubleshooting

### Common Issues

#### 1. "PayPal SDK failed to load"
- Check your Client ID is correct
- Verify internet connection
- Ensure the PayPal script is not blocked by ad blockers

#### 2. "Authentication failed"
- Verify Client ID and Client Secret are correct
- Check if using sandbox vs live credentials correctly
- Ensure environment variables are set properly

#### 3. "Currency not supported"
- PayPal supports limited currencies
- Use supported currencies or implement conversion
- Check PayPal's currency support documentation

## Integration Features

### Current Implementation
✅ PayPal payment processing
✅ Cash on delivery option
✅ Payment method selection
✅ Order creation with payment info
✅ Payment status tracking
✅ Admin payment management

### Future Enhancements
- PayPal webhook integration
- Refund processing
- Subscription payments
- Multi-currency support
- Payment analytics dashboard

## Support

For PayPal-specific issues:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)
- PayPal Merchant Technical Support

For implementation questions:
- Review the code in `client/components/PayPalPayment.tsx`
- Check backend logic in `server/routes/payments.ts`
- Test with provided sandbox credentials
