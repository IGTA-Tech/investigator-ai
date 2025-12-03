#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  // Extract database connection info from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  // Parse the Supabase URL to get the project reference
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

  // Construct direct PostgreSQL connection string
  // Supabase uses port 6543 for direct database connections
  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(serviceKey.replace('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.', '').split('.')[0])}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;

  console.log('🔌 Connecting to Supabase database...\n');

  // Try alternative connection method using service role key as password
  const client = new Client({
    host: `aws-0-us-west-1.pooler.supabase.com`,
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read the complete migration file
    console.log('📦 Reading COMPLETE_MIGRATION.sql...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../COMPLETE_MIGRATION.sql'),
      'utf-8'
    );

    console.log('🚀 Running migrations...\n');

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✅ Migrations completed successfully!\n');

    // Verify tables exist
    console.log('🔍 Verifying database setup...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('investigations', 'investigation_forms', 'portal_tokens', 'email_logs', 'profiles')
      ORDER BY table_name;
    `);

    console.log('\n✅ Tables created:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 Database is ready! You can now test the application.\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);

    // If it's a "relation already exists" error, that's okay
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some tables already exist. This is okay!');
      console.log('📋 Verifying existing tables...\n');

      try {
        const result = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('investigations', 'investigation_forms', 'portal_tokens', 'email_logs', 'profiles')
          ORDER BY table_name;
        `);

        console.log('✅ Existing tables:');
        result.rows.forEach(row => {
          console.log(`   - ${row.table_name}`);
        });
        console.log('\n✅ Database is ready!\n');
      } catch (verifyError) {
        console.error('Error verifying tables:', verifyError.message);
      }
    } else {
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

runMigrations();
