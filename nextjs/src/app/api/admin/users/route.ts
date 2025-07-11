import { NextRequest, NextResponse } from 'next/server';
import { getUsersWithSearch, getTotalUsersCount } from '@/db/chatUtils';

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication here
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [users, totalCount] = await Promise.all([
      getUsersWithSearch(search, limit, offset),
      getTotalUsersCount(search)
    ]);

    return NextResponse.json({
      users,
      totalCount,
      hasMore: offset + limit < totalCount
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 