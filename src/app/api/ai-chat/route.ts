import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { User } from '@supabase/supabase-js';

export const POST = withAuth(async function POST(
  request: NextRequest,
  context: any,
  user: User
) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // AI Chat response placeholder
    return NextResponse.json({
      response: `Hello ${user.email}, this is a stub for the AI Chat feature.`,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
});
