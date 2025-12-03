import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (no auth required for quick investigations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/investigations/quick-create
 * Create a quick investigation without authentication
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target_name, target_url, client_email } = body;

    // Validate required fields
    if (!target_name || !target_name.trim()) {
      return NextResponse.json(
        { error: 'Target name is required' },
        { status: 400 }
      );
    }

    // Create investigation with anonymous user
    const { data: investigation, error } = await supabase
      .from('investigations')
      .insert({
        target_name: target_name.trim(),
        target_url: target_url?.trim() || null,
        investigation_mode: 'portal',
        client_email: client_email?.trim() || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create investigation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      investigationId: investigation.id,
      message: 'Investigation created successfully',
    });
  } catch (error: any) {
    console.error('Quick create error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create investigation' },
      { status: 500 }
    );
  }
}
