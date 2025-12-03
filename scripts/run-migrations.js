#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  // Read migration files
  const migration1 = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/001_initial_schema.sql'),
    'utf-8'
  );

  const migration2 = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/002_fix_no_auth.sql'),
    'utf-8'
  );

  try {
    // Run first migration
    console.log('📦 Running migration 1: Initial schema...');
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1 });

    if (error1 && !error1.message.includes('already exists')) {
      console.error('❌ Migration 1 failed:', error1);
    } else {
      console.log('✅ Migration 1 completed');
    }

    // Run second migration
    console.log('📦 Running migration 2: No-auth fixes...');
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: migration2 });

    if (error2 && !error2.message.includes('already exists')) {
      console.error('❌ Migration 2 failed:', error2);
    } else {
      console.log('✅ Migration 2 completed');
    }

    // Verify tables exist
    console.log('\n🔍 Verifying database setup...');
    const { data: tables, error: tablesError } = await supabase
      .from('investigations')
      .select('id')
      .limit(1);

    if (tablesError && !tablesError.message.includes('0 rows')) {
      console.log('⚠️  Tables may not be created yet. Error:', tablesError.message);
    } else {
      console.log('✅ Database tables verified!');
    }

    console.log('\n🎉 Migrations complete! Ready to test.\n');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
