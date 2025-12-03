#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n');

  const tables = ['investigations', 'investigation_forms', 'portal_tokens', 'email_logs', 'profiles'];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          results[table] = '❌ Does not exist';
        } else {
          results[table] = `⚠️  ${error.message}`;
        }
      } else {
        results[table] = `✅ Exists (${data ? data.length : 0} rows checked)`;
      }
    } catch (err) {
      results[table] = `❌ Error: ${err.message}`;
    }
  }

  console.log('Database Tables Status:');
  console.log('─'.repeat(50));
  Object.entries(results).forEach(([table, status]) => {
    console.log(`${table.padEnd(25)} ${status}`);
  });
  console.log('─'.repeat(50));

  const allExist = Object.values(results).every(status => status.startsWith('✅'));

  if (allExist) {
    console.log('\n✅ All tables exist! Database is ready.');
    console.log('🎉 You can proceed with testing the application.\n');
  } else {
    console.log('\n❌ Some tables are missing.');
    console.log('📋 You need to run the migrations in Supabase SQL Editor.');
    console.log('\nInstructions:');
    console.log('1. Go to: https://supabase.com/dashboard/project/jkwrbufaroppzhpocnrv/sql/new');
    console.log('2. Copy the contents of COMPLETE_MIGRATION.sql');
    console.log('3. Paste into the SQL Editor');
    console.log('4. Click "Run" to execute\n');
  }
}

checkDatabaseStatus();
