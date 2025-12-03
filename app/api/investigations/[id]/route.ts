import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/investigations/[id]
 * Get investigation details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch investigation
    const { data: investigation, error } = await supabase
      .from('investigations')
      .select('*')
      .eq('id', id)
      .eq('created_by', user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Investigation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ investigation });
  } catch (error: any) {
    console.error('Get investigation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch investigation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/investigations/[id]
 * Delete an investigation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete investigation
    const { error } = await supabase
      .from('investigations')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete investigation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Investigation deleted',
    });
  } catch (error: any) {
    console.error('Delete investigation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete investigation' },
      { status: 500 }
    );
  }
}
