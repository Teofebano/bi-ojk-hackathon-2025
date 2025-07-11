import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, getChatsForUser } from '@/db/chatUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const firebase_uid = searchParams.get('firebase_uid');
    const email = searchParams.get('email');
    if (!firebase_uid || !email) {
      return NextResponse.json({ error: 'Missing firebase_uid or email' }, { status: 400 });
    }
    // Get or create user
    const user = await getOrCreateUser(firebase_uid, email);
    // Get all chats for user
    const chats = await getChatsForUser(user.id);
    return NextResponse.json({ chats });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
} 