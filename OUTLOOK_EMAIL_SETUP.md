# Outlook Email Setup Guide for Password Reset

This guide helps you configure Outlook/Hotmail email sending for password reset functionality.

## ✅ Why Outlook?

Outlook is a great alternative to Gmail for sending emails. It's easy to set up and works well with Netlify.

## Step 1: Get Your Outlook App Password

### Option A: Using App Password (Recommended)

1. **Go to your Microsoft Account**: https://account.microsoft.com/security
2. **Make sure 2-Step Verification is ON**:
   - Click "Security" → "Advanced security options"
   - Enable "Two-step verification" if not already enabled
3. **Generate App Password**:
   - Go to: https://account.microsoft.com/security
   - Click "Advanced security options"
   - Scroll down to "App passwords"
   - Click "Create a new app password"
   - Select "Mail" for the app
   - Select "Windows Computer" or "Other" for device
   - Enter "Rocs Crew" as the name
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd-efgh-ijkl-mnop`)

### Option B: Using Regular Password (Less Secure)

If you can't use App Password, you can use your regular Outlook password, but it's less secure:
- Use your Outlook email password
- Make sure "Less secure app access" is enabled (not recommended)

## Step 2: Get Your Netlify Site URL

1. Go to: https://app.netlify.com
2. Click on your site
3. Your site URL is shown at the top (e.g., `https://your-site-name.netlify.app`)

## Step 3: Set Environment Variables in Netlify

1. **Go to Netlify Dashboard** → Your site
2. Click **Site settings** (gear icon)
3. Go to **Build & deploy** → **Environment variables**
4. Click **Add variable** and add these **ONE BY ONE**:

### Variable 1: EMAIL_USER
- **Key:** `EMAIL_USER`
- **Value:** `your-email@outlook.com` (or `@hotmail.com` or `@live.com`)
- Click **Save**

### Variable 2: EMAIL_PASSWORD
- **Key:** `EMAIL_PASSWORD`
- **Value:** `[paste your Outlook App Password here]` (16 characters)
- Click **Save**

### Variable 3: EMAIL_PROVIDER
- **Key:** `EMAIL_PROVIDER`
- **Value:** `outlook`
- Click **Save**

### Variable 4: APP_URL
- **Key:** `APP_URL`
- **Value:** `https://your-site-name.netlify.app` (your actual Netlify URL)
- Click **Save**

### Optional: Custom SMTP Settings

If you need custom SMTP settings:
- **Key:** `EMAIL_HOST`
- **Value:** `smtp-mail.outlook.com` (default, usually not needed)

- **Key:** `EMAIL_PORT`
- **Value:** `587` (default, usually not needed)

## Step 4: Redeploy Your Site

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

## Step 5: Test It!

1. Go to your site: `https://your-site-name.netlify.app/forgot-password`
2. Enter your email address
3. Click "Send reset link"
4. Check your Outlook inbox (and spam folder)

## ✅ Done!

After these steps, password reset emails will be sent from your Outlook account!

---

## 🔧 Troubleshooting

### "Authentication failed" Error

**Solution:**
- Make sure you're using an **App Password**, not your regular Outlook password
- Verify 2-Step Verification is enabled
- Check that EMAIL_PROVIDER is set to `outlook`

### "Connection failed" Error

**Solution:**
- Verify EMAIL_HOST is set to `smtp-mail.outlook.com`
- Check EMAIL_PORT is `587`
- Make sure your Netlify function can connect to Outlook servers

### "Using test account" Message

**Solution:**
- Check that EMAIL_USER and EMAIL_PASSWORD are set correctly
- Verify EMAIL_PROVIDER is set to `outlook`
- Redeploy your site after setting variables

## 📧 Outlook SMTP Settings Summary

- **SMTP Server:** `smtp-mail.outlook.com`
- **Port:** `587`
- **Security:** TLS (STARTTLS)
- **Authentication:** Required (use App Password)

## 🔒 Security Notes

- ✅ **Use App Passwords** instead of regular passwords
- ✅ **Never share** your App Password
- ✅ **Environment variables** are encrypted in Netlify
- ✅ **2-Step Verification** must be enabled to use App Passwords

---

**Need Help?** Check Netlify Function logs for detailed error messages.

