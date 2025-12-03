# 🚨 CRITICAL: Run Database Migration NOW

## Status
- ✅ Dev server running on http://localhost:3000
- ❌ Database tables NOT created yet
- 📋 Ready to run migration

## Quick 3-Step Process (Takes 30 seconds)

### Step 1: Open Supabase SQL Editor
Click this link (or copy/paste into browser):
```
https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/sql/new
```

### Step 2: Copy the SQL
The migration SQL is in this file:
```
/home/innovativeautomations/investigator-ai/COMPLETE_MIGRATION.sql
```

**Quick copy command:**
```bash
cat /home/innovativeautomations/investigator-ai/COMPLETE_MIGRATION.sql | xclip -selection clipboard
```

Or open the file and copy all 330 lines.

### Step 3: Run in Supabase
1. Paste the SQL into the Supabase SQL Editor
2. Click the "RUN" button (or press Ctrl+Enter)
3. Wait 2-3 seconds for completion
4. You should see "Success. No rows returned"

## Verify It Worked
Run this command to check:
```bash
node /home/innovativeautomations/investigator-ai/scripts/check-db-status.js
```

Should show all tables with ✅

## After Migration
The app will be fully functional and ready to test!

---

**Why can't this be automated?**
Supabase requires either:
- Direct PostgreSQL connection (requires database password not in env vars)
- Manual SQL execution via their dashboard
- Supabase CLI (not installed)

This is the fastest manual method available.
