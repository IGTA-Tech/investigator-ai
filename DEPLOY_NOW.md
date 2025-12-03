# 🚀 DEPLOY NOW - 5 Minute Guide

## Method 1: Web Interface (EASIEST - Recommended)

### Step 1: Go to Netlify & Import Project (2 minutes)

1. Open: **https://app.netlify.com/**
2. Click **"Add new site"** button (top right)
3. Select **"Import an existing project"**
4. Click **"Deploy with GitHub"**
5. Find and select: **`IGTA-Tech/investigator-ai`**
6. Click **"Deploy investigator-ai"** (use default settings for now)

**The first deployment will fail - that's expected. Continue to Step 2.**

---

### Step 2: Add Environment Variables (3 minutes)

After site is created:

1. Go to **Site Settings** (in the site menu)
2. Click **"Environment variables"** (left sidebar)
3. Click **"Add a variable"** button

**Copy these exact values from your `.env.local` file:**

| Variable Name | Value (copy from .env.local) |
|--------------|------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://jkwrbufaroppzhpocnrv.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| `ANTHROPIC_API_KEY` | sk-ant-api03-hLMVYywfCrqxv6fwawpSXq... |
| `SENDGRID_API_KEY` | SG.HvZjFYaRScCX9YZlF7nGgA... |
| `PERPLEXITY_API_KEY` | pplx-iLeJxbYxpQsgZ7BEkxRUmsVjmq6D... |
| `API2PDF_API_KEY` | dad3a124-8287-4637-83e8-597d905212dd |
| `OPENAI_API_KEY` | (leave empty) |
| `JWT_SECRET` | HOAESrjjy+p3YNYuELz7JETsCVzd813T... |
| `NEXTAUTH_SECRET` | HOAESrjjy+p3YNYuELz7JETsCVzd813T... |
| `NEXT_PUBLIC_APP_URL` | (Skip for now - will add after deployment) |

**Each variable:**
- Click "Add a variable"
- Enter variable name (e.g., `ANTHROPIC_API_KEY`)
- Paste the value
- Click "Create variable"
- Repeat for all variables above

---

### Step 3: Redeploy (1 minute)

1. Click **"Deploys"** (top menu)
2. Click **"Trigger deploy"** button
3. Select **"Clear cache and deploy site"**
4. Wait 3-5 minutes for build to complete

---

### Step 4: Update App URL (30 seconds)

After deployment succeeds:

1. Copy your site URL (e.g., `https://your-site-name.netlify.app`)
2. Go back to **Site Settings → Environment variables**
3. Click **"Add a variable"**
4. Name: `NEXT_PUBLIC_APP_URL`
5. Value: Paste your Netlify URL
6. Click **"Create variable"**
7. Go to **Deploys** → **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## Method 2: GitHub Repository Settings (For Secret Sharing)

Since GitHub blocked the push with secrets in DEPLOYMENT_INSTRUCTIONS.md, you can either:

### Option A: Allow the Secrets (if you want them in the repo)

1. Go to the URLs GitHub provided in the error message:
   - Anthropic API: https://github.com/IGTA-Tech/investigator-ai/security/secret-scanning/unblock-secret/36M350Hb6Qiz2QbYOxtQwF1ujt9
   - SendGrid API: https://github.com/IGTA-Tech/investigator-ai/security/secret-scanning/unblock-secret/36M34xkyAaiaHGVKPttn8H6k6I9
   - Perplexity API: https://github.com/IGTA-Tech/investigator-ai/security/secret-scanning/unblock-secret/36M34x6oSJR6QQT6LLxgy5G2PKB

2. Click **"Allow secret"** for each one

3. Then retry the push:
   ```bash
   git -C /home/innovativeautomations/investigator-ai push
   ```

### Option B: Keep Secrets Out of Repo (Recommended - Already Done)

The current version has placeholder values, which is the secure approach. The secrets are safely in your `.env.local` file which is gitignored.

---

## ✅ What Should Happen

After successful deployment:

- ✅ Site URL will be live (e.g., `https://your-site-name.netlify.app`)
- ✅ Homepage loads with "InvestigatorAI" branding
- ✅ Can create investigations
- ✅ AI analysis works
- ✅ PDF reports generate
- ✅ Emails send successfully

---

## 🐛 Common Issues

### Build Fails
**Error:** "Build command failed"
**Fix:** Make sure ALL environment variables are added in Netlify

### Site Loads but Nothing Works
**Error:** "Investigation fails" or blank pages
**Fix:** Check environment variables are correct (no typos, complete values)

### Email Not Sending
**Fix:**
1. Verify `applications@innovativeautomations.dev` in SendGrid
2. Check SendGrid API key is correct
3. Verify sender email in code matches SendGrid verified sender

---

## 🎯 Total Time: ~5 minutes

**Your app will be live at:** `https://[your-site-name].netlify.app`

---

**After deployment, test it by creating an investigation for "Microsoft" - should score 10/10!**
