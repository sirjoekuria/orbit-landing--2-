# Quick Guide: Set Up Email on Netlify (5 Minutes)

## Step 1: Get Your Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Make sure **2-Step Verification** is **ON**
3. Scroll down and click **"App passwords"**
4. Select **"Mail"** and **"Other (Custom name)"**
5. Enter **"Rocs Crew"** as the name
6. Click **"Generate"**
7. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

## Step 2: Get Your Netlify Site URL

1. Go to: https://app.netlify.com
2. Click on your site
3. Your site URL is shown at the top (e.g., `https://your-site-name.netlify.app`)

## Step 3: Set Environment Variables in Netlify

1. In your Netlify dashboard, go to your site
2. Click **Site settings** (gear icon on the right)
3. Scroll down to **Build & deploy** → **Environment variables**
4. Click **Add variable** and add these **ONE BY ONE**:

### Variable 1:
- **Key:** `EMAIL_USER`
- **Value:** `Kuriajoe85@gmail.com`
- Click **Save**

### Variable 2:
- **Key:** `EMAIL_PASSWORD`
- **Value:** `[paste your 16-character app password here]`
- Click **Save**

### Variable 3:
- **Key:** `APP_URL`
- **Value:** `https://your-site-name.netlify.app` (replace with your actual Netlify URL)
- Click **Save**

## Step 4: Redeploy Your Site

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

## Step 5: Test It!

1. Go to your site: `https://your-site-name.netlify.app/forgot-password`
2. Enter your email address
3. Click "Send reset link"
4. Check your email inbox (and spam folder)

## ✅ Done!

After these steps, password reset emails will work!

---

**Security Note:** Never share your Gmail App Password with anyone. It gives access to your email account.

