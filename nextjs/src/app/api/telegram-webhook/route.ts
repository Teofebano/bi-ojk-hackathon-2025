import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  getOrCreateUser,
  createChat,
  addMessage,
  buildPrompt,
} from '@/db/chatUtils';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'telegram_secret';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Util: Send message to Telegram
async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

// POST: Telegram webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Telegram webhook: { message: { from, chat, text, ... }, ... }
    const message = body.message;
    if (!message || !message.from || !message.text) {
      return NextResponse.json({ ok: true }); // Ignore non-message updates
    }
    const telegramUserId = message.from.id.toString();
    const email = `telegram_${telegramUserId}@telegram`; // Fake email for DB
    const name = message.from.username || `${message.from.first_name || ''} ${message.from.last_name || ''}`.trim() || 'Telegram User';
    const avatar_url = undefined;
    const user = await getOrCreateUser(telegramUserId, email, name, avatar_url);

    // Find or create chat for this Telegram chat
    let chatId: number | undefined = undefined;
    const chats = await (await import('@/db/chatUtils')).getChatsForUser(user.id);
    if (chats && chats.length > 0) {
      chatId = chats[0].id;
    } else {
      const chat = await createChat(user.id);
      chatId = chat.id;
    }
    if (!chatId) {
      return NextResponse.json({ ok: false, error: 'Could not create chat' }, { status: 500 });
    }

    // Store user message
    await addMessage(chatId, 'user', message.text);

    // Build prompt
    const prompt = await buildPrompt(chatId, message.text, 10) as any[];

    // Get LLM reply
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: prompt as any,
      temperature: 0.7,
    });
    const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Store assistant reply
    await addMessage(chatId, 'assistant', reply);

    // Send reply to Telegram
    await sendTelegramMessage(message.chat.id, reply);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST: /api/telegram-webhook/set-webhook
// Body: { url: string, secret?: string }
export async function PUT(request: NextRequest) {
  try {
    const { url, secret } = await request.json();
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }
    const res = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    return NextResponse.json({ ok: true, telegram: data });
  } catch (error) {
    console.error('Error setting Telegram webhook:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
} 