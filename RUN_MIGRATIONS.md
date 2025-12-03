# 🗄️ RUN DATABASE MIGRATIONS

## ⚡ QUICK START

You need to run **TWO SQL files** in your Supabase database.

---

## Method 1: Supabase Dashboard (EASIEST)

### Step 1: Open SQL Editor
Go to: https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/sql

### Step 2: Run First Migration

1. Click **"New query"** button
2. Copy **ALL** content from:
   ```
   /home/innovativeautomations/investigator-ai/supabase/migrations/001_initial_schema.sql
   ```
3. Paste into SQL editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for "Success. No rows returned"

### Step 3: Run Second Migration

1. Click **"New query"** button again
2. Copy **ALL** content from:
   ```
   /home/innovativeautomations/investigator-ai/supabase/migrations/002_fix_no_auth.sql
   ```
3. Paste into SQL editor
4. Click **"Run"**
5. Wait for "Success"

### Step 4: Verify

Go to: https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/editor

You should see these tables:
- ✅ profiles
- ✅ investigation_forms
- ✅ investigations
- ✅ portal_tokens
- ✅ email_logs

Go to Storage: https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/storage/buckets

You should see:
- ✅ investigation-files
- ✅ reports

---

## Method 2: Using Cat Command (if dashboard doesn't work)

```bash
# Show first migration
cat /home/innovativeautomations/investigator-ai/supabase/migrations/001_initial_schema.sql

# Show second migration
cat /home/innovativeautomations/investigator-ai/supabase/migrations/002_fix_no_auth.sql
```

Then copy each output and paste into Supabase SQL Editor.

---

## ✅ SUCCESS INDICATORS

After running both migrations, you should see:

**In SQL Editor:**
- "Success. No rows returned" message
- No error messages

**In Table Editor:**
- 5 tables created
- Each table has columns defined

**In Storage:**
- 2 buckets created
- Both set to public

---

## 🚨 Common Errors

### "relation already exists"
✅ **Good!** Tables already created, you're fine.

### "permission denied"
❌ Make sure you're logged into the right Supabase project

### "syntax error"
❌ You didn't copy the entire SQL file. Try again.

---

## After Migrations Complete

Run this command to start testing:

```bash
cd /home/innovativeautomations/investigator-ai
npm run dev
```

Then open: http://localhost:3000

---

**I'll wait here. Let me know when migrations are done!** ⏳
