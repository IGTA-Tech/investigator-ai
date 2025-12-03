import { NextRequest, NextResponse } from 'next/server';
import { conductInvestigation } from '@/lib/ai/investigate';

/**
 * POST /api/investigate
 * Trigger an investigation for a given investigation ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { investigationId } = body;

    if (!investigationId) {
      return NextResponse.json(
        { error: 'Investigation ID is required' },
        { status: 400 }
      );
    }

    // Start investigation (runs async)
    conductInvestigation(investigationId)
      .then(() => {
        console.log(`Investigation ${investigationId} completed successfully`);
      })
      .catch(error => {
        console.error(`Investigation ${investigationId} failed:`, error);
      });

    return NextResponse.json({
      success: true,
      message: 'Investigation started',
      investigationId,
    });
  } catch (error: any) {
    console.error('Investigation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Investigation failed' },
      { status: 500 }
    );
  }
}
