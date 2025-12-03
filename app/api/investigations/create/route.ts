import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInvestigation } from '@/lib/ai/investigate';

/**
 * POST /api/investigations/create
 * Create a new investigation
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      target_name,
      target_type,
      target_url,
      investigation_mode,
      form_id,
      client_email,
      client_name,
    } = body;

    // Validate required fields
    if (!target_name) {
      return NextResponse.json(
        { error: 'Target name is required' },
        { status: 400 }
      );
    }

    if (!investigation_mode || !['form', 'portal'].includes(investigation_mode)) {
      return NextResponse.json(
        { error: 'Invalid investigation mode' },
        { status: 400 }
      );
    }

    // Create investigation
    const investigationId = await createInvestigation({
      created_by: user.id,
      target_name,
      target_type,
      target_url,
      investigation_mode,
      form_id,
      client_email,
      client_name,
    });

    return NextResponse.json({
      success: true,
      investigationId,
      message: 'Investigation created successfully',
    });
  } catch (error: any) {
    console.error('Create investigation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create investigation' },
      { status: 500 }
    );
  }
}
