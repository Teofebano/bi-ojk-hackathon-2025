import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/db/chatUtils';

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication here
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
} 