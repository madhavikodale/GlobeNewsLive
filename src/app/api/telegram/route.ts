import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';
      const caption = update.message.caption || '';
      const name = update.message.from?.first_name || 'there';
      const hasPhoto = update.message.photo !== undefined;
      const hasDocument = update.message.document !== undefined;

      const lowerText = (text || caption).toLowerCase().trim();
      let replyText = '';

      // Greetings
      if (['hi','hello','hey','namaste','hola','bonjour','ciao','salam'].includes(lowerText)) {
        replyText = `👋 Hello ${name}!\n\nI am GlobeNewsLive Bot 🤖\n\nI can help you with:\n• 🚨 Conflict & disaster alerts\n• 📈 Market updates\n• 🛠️ XDC Apothem development\n• 💻 Coding assistance\n\nWhat can I do for you today?\n\nType /help for commands.`;
      }
      // Commands
      else if (text === '/start') {
        replyText = `🌐 GlobeNewsLive Bot\n\nWelcome ${name}!\n\nI can help you with:\n• 🚨 Real-time conflict alerts\n• 📈 Market & crypto updates\n• 🌍 Disaster notifications\n• ✈️ Military aircraft tracking\n• 🚢 Ship tracking\n• 🛠️ XDC Apothem development\n\nType /help for all commands or just chat with me! 😊`;
      } else if (text === '/help') {
        replyText = `🌐 GlobeNewsLive Bot - Commands\n\n/start - Start the bot\n/help - Show this help\n/status - Check server status\n/alerts - Get latest alerts\n/xdc - XDC Apothem project help\n\nYou will automatically receive HIGH and CRITICAL alerts.\n\nWebsite: https://globenews.live`;
      } else if (text === '/alerts' || text === '/status') {
        replyText = `🌐 GlobeNewsLive Status\n\n✅ Bot is online and responding\n✅ Monitoring active conflicts globally\n✅ Market alerts enabled\n✅ XDC Apothem assistance available\n\nVisit https://globenews.live for full dashboard.`;
      } else if (text === '/xdc' || lowerText.includes('xdc')) {
        replyText = `🔗 XDC Apothem Development Help\n\nI can assist with XDC Apothem projects:\n\n📝 Common Use Cases:\n• Supply chain tracking\n• Document verification\n• Cross-border payments\n• Tokenized assets\n• Identity management\n\n🛠️ Resources:\n• XDC Apothem Faucet\n• Remix IDE integration\n• Web3.js / Ethers.js setup\n• Smart contract templates\n\nWhat are you building? Share your idea! 🔥`;
      }
      // Default fallback
      else {
        replyText = `🌐 GlobeNewsLive Bot\n\nHi ${name}!\n\nI understand:\n• Greetings: hi, hello, hey\n• Commands: /start, /help, /alerts, /status, /xdc\n\nI am here to help with alerts AND development projects! 😊`;
      }

      await sendTelegramMessage(chatId, replyText);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        // No parse_mode — plain text avoids all escaping issues
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Telegram] HTTP ${res.status}: ${err}`);
    } else {
      console.log(`[Telegram] Sent to ${chatId}: ${text.substring(0, 60)}...`);
    }
  } catch (error) {
    console.error('[Telegram] Send failed:', error);
  }
}
