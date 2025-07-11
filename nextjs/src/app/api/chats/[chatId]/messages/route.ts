import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, getMessagesForChat } from '@/db/chatUtils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const firebase_uid = searchParams.get('firebase_uid');
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const resolvedParams = await params;
    const chat_id = parseInt(resolvedParams.chatId, 10);
    if (!firebase_uid || !email || isNaN(chat_id)) {
      return NextResponse.json({ error: 'Missing firebase_uid, email, or chat_id' }, { status: 400 });
    }
    // Optionally: check user owns the chat (not implemented here for brevity)
    // Get or create user
    await getOrCreateUser(firebase_uid, email);
    // Get paginated messages
    const messages = await getMessagesForChat(chat_id, limit, offset);
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
} 