# Netlify Email Setup Guide for Password Reset

This guide helps you configure email sending on Netlify for password reset functionality.

## 🔍 Problem: Not Receiving Password Reset Emails

If you're not receiving password reset emails, it's likely because:
1. Email credentials are not configured in Netlify environment variables
2. The email service is falling back to Ethereal (test account) which doesn't send real emails
3. Netlify URL environment variables are not set correctly

## ✅ Solution: Configure Email on Netlify

### Step 1: Get Gmail App Password

1. **Go to your Gmail account** (e.g., Kuriajoe85@gmail.com)
2. **Enable 2-Factor Authentication** if not already enabled
   - Go to Google Account → Security
   - Turn on 2-Step Verification
3. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App Passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "Rocs Crew" as the name
   - Click "Generate"
   - **Copy the 16-character password** (you'll only see it once!)

### Step 2: Set Environment Variables in Netlify

1. **Go to your Netlify Dashboard**
   - Navigate to your site
   - Click **Site settings** → **Environment variables**

2. **Add the following environment variables**:

   ```
   EMAIL_USER=Kuriajoe85@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password-here
   APP_URL=https://your-site-name.netlify.app
   ```

   **Important Notes:**
   - Replace `Kuriajoe85@gmail.com` with your actual Gmail address
   - Replace `your-16-character-app-password-here` with the App Password from Step 1
   - Replace `https://your-site-name.netlify.app` with your actual Netlify site URL
   - `EMAIL_PASSWORD` is also supported as `EMAIL_PASS` for compatibility

3. **Save the environment variables**

### Step 3: Redeploy Your Site

After setting environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deployment to complete

## 🧪 Testing the Password Reset

1. Go to your site's forgot password page: `https://your-site.netlify.app/forgot-password`
2. Enter your email address
3. Click "Send reset link"
4. Check your email inbox (and spam folder)
5. You should receive an email with a password reset link

## 🔍 Troubleshooting

### Check Netlify Function Logs

1. Go to Netlify Dashboard → Your site
2. Click **Functions** tab
3. Look for error messages related to email sending

Common errors and fixes:

- **"EAUTH" (Authentication failed)**
  - Check that `EMAIL_USER` and `EMAIL_PASSWORD` are correct
  - Make sure you're using an App Password, not your regular Gmail password
  - Verify 2-Step Verification is enabled

- **"ECONNECTION" (Connection failed)**
  - Check your internet connection
  - Verify SMTP settings (should be smtp.gmail.com:587)
  - Check firewall settings

- **"Using Ethereal test account"**
  - This means `EMAIL_USER` or `EMAIL_PASSWORD` is not set correctly
  - Emails are going to a test account, not your real inbox
  - Fix: Configure environment variables properly

### Verify Environment Variables

Check that these variables are set in Netlify:
- ✅ `EMAIL_USER` - Your Gmail address
- ✅ `EMAIL_PASSWORD` - Your Gmail App Password
- ✅ `APP_URL` or `NETLIFY_URL` or `URL` - Your site URL

### Check Email Template

The password reset email includes:
- A reset link that expires in 1 hour
- Professional Rocs Crew branding
- Instructions for resetting your password

## 📝 Alternative: Use Different Email Provider

If you want to use a different email provider (not Gmail):

### Outlook/Hotmail:
```bash
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

Update `server/services/emailService.ts`:
```typescript
host: 'smtp-mail.outlook.com',
port: 587,
```

### Custom SMTP:
```bash
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-smtp-password
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
```

## 🔐 Security Notes

- ✅ Never commit email passwords to code
- ✅ Always use App Passwords (not regular passwords)
- ✅ Environment variables are encrypted in Netlify
- ✅ Each environment (production/staging) can have different credentials

## 📞 Need Help?

If you're still not receiving emails:
1. Check Netlify function logs for error messages
2. Verify all environment variables are set correctly
3. Test with a different email address
4. Check spam/junk folders
5. Verify Gmail App Password is still valid (they can expire)

---

**After configuring:** Redeploy your site and test the password reset flow! 🚀

