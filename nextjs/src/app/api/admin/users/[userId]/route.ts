import { NextRequest, NextResponse } from 'next/server';
import { getUserWithFinancialInfo } from '@/db/chatUtils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // TODO: Add admin authentication here
    const resolvedParams = await params;
    const user_id = parseInt(resolvedParams.userId, 10);
    
    if (isNaN(user_id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await getUserWithFinancialInfo(user_id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
} 