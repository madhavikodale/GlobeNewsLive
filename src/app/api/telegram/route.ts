import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Simple response handler
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Handle messages
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      
      // Send reply
      await sendTelegramMessage(
        chatId, 
        `🌐 GlobeNewsLive Bot\n\nCommands:\n/alerts - Get latest alerts\n/help - Show help\n\nThis bot sends conflict and market alerts automatically.`
      );
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
}
