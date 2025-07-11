import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  getOrCreateUser,
  createChat,
  addMessage,
  buildPrompt,
} from '@/db/chatUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebase_uid, email, name, avatar_url, chat_id, message } = body;
    if (!firebase_uid || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get or create user
    const user = await getOrCreateUser(firebase_uid, email, name, avatar_url);

    // 2. Get or create chat
    let chatId = chat_id;
    if (!chatId) {
      const chat = await createChat(user.id);
      chatId = chat.id;
    }

    // 3. Store user message
    await addMessage(chatId, 'user', message);

    // 4. Build prompt (summary + last N messages + user message)
    const prompt = await buildPrompt(chatId, message, 10);

    // 5. Get assistant reply from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: prompt,
      temperature: 0.7,
    });
    const reply = response.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    // 6. Store assistant reply
    await addMessage(chatId, 'assistant', reply);

    // 7. Return reply and chat_id
    return NextResponse.json({ reply, chat_id: chatId });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 