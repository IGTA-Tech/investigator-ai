# 🚀 Netlify Deployment Instructions

Your code is successfully pushed to GitHub! Now let's deploy to Netlify.

## ✅ What's Ready

- ✅ Code pushed to GitHub: `https://github.com/IGTA-Tech/investigator-ai`
- ✅ Netlify configuration file ready (`netlify.toml`)
- ✅ All environment variables documented

---

## 📋 Deploy to Netlify (Web Interface)

### Step 1: Create New Site

1. Go to **[Netlify Dashboard](https://app.netlify.com/)**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select repository: **`IGTA-Tech/investigator-ai`**
5. Click **"Deploy"**

### Step 2: Configure Environment Variables

After the site is created, go to:
**Site Settings → Environment Variables → Add a variable**

Add ALL of these variables (copy the actual values from your `.env.local` file):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Anthropic Claude API
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# SendGrid Email Service
SENDGRID_API_KEY=<your-sendgrid-api-key>

# Perplexity AI (Optional - for enhanced research)
PERPLEXITY_API_KEY=<your-perplexity-api-key>

# OpenAI (Optional fallback) - Leave empty if not using
OPENAI_API_KEY=

# API2PDF (PDF Generation Service)
API2PDF_API_KEY=<your-api2pdf-api-key>

# Application URLs - UPDATE THIS AFTER DEPLOYMENT
NEXT_PUBLIC_APP_URL=https://YOUR-SITE-NAME.netlify.app

# Security
JWT_SECRET=<your-jwt-secret>
NEXTAUTH_SECRET=<your-nextauth-secret>
```

**IMPORTANT:** Copy the actual values from your local `.env.local` file located at:
`/home/innovativeautomations/investigator-ai/.env.local`

### Step 3: Update App URL

1. After the first deployment, copy your Netlify URL (e.g., `https://investigator-ai-fraud-detection.netlify.app`)
2. Go back to **Site Settings → Environment Variables**
3. Edit `NEXT_PUBLIC_APP_URL` and paste your Netlify URL
4. Click **"Save"**
5. Go to **Deploys** → **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## ⚡ Quick Deploy (Alternative - Using CLI)

If you prefer CLI deployment:

```bash
cd /home/innovativeautomations/investigator-ai
netlify link --name investigator-ai-fraud-detection
netlify env:import .env.local
netlify deploy --prod
```

---

## 🎯 Post-Deployment Checklist

After deployment completes:

### 1. Verify SendGrid Sender Email
- Go to [SendGrid Dashboard](https://app.sendgrid.com/)
- Verify `applications@innovativeautomations.dev` is verified
- If not, verify the email address

### 2. Test the Application
- Visit your Netlify URL
- Create a test investigation
- Verify:
  - [ ] Homepage loads
  - [ ] Can create investigation
  - [ ] AI analysis completes
  - [ ] PDF report downloads
  - [ ] Email is received

### 3. Custom Domain (Optional)
If you want to use a custom domain:
1. Go to **Site Settings → Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

---

## 📊 Expected Results

**Build Time:** ~3-5 minutes
**Site URL:** `https://YOUR-SITE-NAME.netlify.app`

**What Should Work:**
- ✅ AI-powered fraud detection
- ✅ Document upload and analysis
- ✅ PDF report generation
- ✅ Email delivery
- ✅ Real-time investigation tracking

---

## 🔧 Troubleshooting

### Build Fails
**Error:** "Build failed"
**Solution:** Check build logs in Netlify dashboard. Most common issue is missing environment variables.

### Site Works but Features Don't
**Error:** "Investigation fails" or "No email sent"
**Solution:**
1. Check all environment variables are set correctly
2. Verify SendGrid sender email is verified
3. Check Netlify function logs for errors

### SendGrid Email Issues
**Error:** "Email not received"
**Solution:**
1. Verify `applications@innovativeautomations.dev` in SendGrid
2. Check SendGrid sending limits (free tier: 100 emails/day)
3. Check spam folder

---

## 💰 Cost Estimate

**Netlify Free Tier:**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**If You Exceed Free Tier:**
- Bandwidth: $20/100GB
- Build minutes: $7/500 minutes

**Total Monthly Cost (with free tiers):**
- Netlify: $0 (free tier)
- Supabase: $0 (free tier)
- SendGrid: $0 (free tier - 100 emails/day)
- Claude API: ~$1 per investigation
- **Total:** ~$1 per investigation until free tiers exceeded

---

## 🎉 You're Ready to Launch!

Once deployed, your InvestigatorAI platform will be live and ready to detect fraud!

**Repository:** https://github.com/IGTA-Tech/investigator-ai
**Status:** ✅ Code Pushed, Ready to Deploy

---

**Need Help?** Check the Netlify deployment logs or the project documentation.
