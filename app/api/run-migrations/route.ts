import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST() {
  try {
    console.log('🚀 Running database migrations...');

    // Read migration files
    const migration1 = readFileSync(
      join(process.cwd(), 'COMPLETE_MIGRATION.sql'),
      'utf-8'
    );

    // Split SQL into individual statements
    const statements = migration1
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        // Use raw SQL via fetch
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: statement })
        });

        if (response.ok || response.status === 409) { // 409 = already exists
          successCount++;
        } else {
          errorCount++;
          const error = await response.text();
          errors.push(`Statement ${i}: ${error}`);
        }
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`Statement ${i}: ${error.message}`);
        }
      }
    }

    // Try to verify tables exist
    const { data, error } = await supabase
      .from('investigations')
      .select('id')
      .limit(1);

    const tablesExist = !error || error.message.includes('0 rows');

    return NextResponse.json({
      success: true,
      message: 'Migrations attempted',
      details: {
        statements: statements.length,
        successCount,
        errorCount,
        tablesExist,
        errors: errors.slice(0, 5) // Only show first 5 errors
      }
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
