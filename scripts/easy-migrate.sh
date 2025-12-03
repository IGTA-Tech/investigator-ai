#!/bin/bash

echo "🚀 InvestigatorAI - Easy Database Migration Setup"
echo "================================================="
echo ""
echo "📋 I'll help you run the database migrations."
echo ""
echo "Step 1: Opening Supabase SQL Editor in your browser..."
echo ""

# Try to open the browser
if command -v xdg-open > /dev/null; then
  xdg-open "https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/sql/new" &
  echo "✅ Browser opened!"
elif command -v open > /dev/null; then
  open "https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/sql/new" &
  echo "✅ Browser opened!"
else
  echo "⚠️  Could not auto-open browser. Please manually open:"
  echo "   https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/sql/new"
fi

echo ""
echo "Step 2: The SQL migration file is located at:"
echo "   $(pwd)/COMPLETE_MIGRATION.sql"
echo ""
echo "Step 3: Instructions:"
echo "   1. In the Supabase SQL Editor that just opened:"
echo "   2. Copy ALL the contents from: COMPLETE_MIGRATION.sql"
echo "   3. Paste into the SQL Editor"
echo "   4. Click the 'RUN' button"
echo "   5. Wait for confirmation (should complete in 2-3 seconds)"
echo ""
echo "Step 4: After running the migration, come back here and press Enter..."
read -p "" _

echo ""
echo "🔍 Verifying migration status..."
node scripts/check-db-status.js

echo ""
echo "✅ If all tables show as existing above, you're ready to test!"
echo "📱 The dev server is already running at: http://localhost:3000"
echo ""
