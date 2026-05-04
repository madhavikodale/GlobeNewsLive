// Load environment variables from .env.local FIRST
require('dotenv').config({ path: '.env.local' });

const https = require("https");
const Anthropic = require("@anthropic-ai/sdk");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN environment variable is required");
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

let lastId = 0;

function getUpdates(cb) {
  https.get(`https://api.telegram.org/bot${TOKEN}/getUpdates`, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => cb(JSON.parse(data)));
  });
}

function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  https.get(url);
}

async function getAIResponse(userMessage) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are GlobeNewsLive Bot 🌐 — a smart assistant specializing in:
- 🚨 Global conflict & disaster alerts
- 📈 Market updates and financial news
- ⚙️ XDC Apothem blockchain development
- 💻 Coding assistance

Be concise and helpful. Keep replies short and clear for Telegram.
If asked about real-time data, suggest visiting https://globenews.live`,
    messages: [{ role: "user", content: userMessage }],
  });
  return response.content[0].text;
}

setInterval(() => {
  getUpdates(async (data) => {
   if (!data || !data.ok || !data.result || !data.result.length) return; 
if (!data.result.length) return;

    const msg = data.result[data.result.length - 1];

    if (msg.update_id !== lastId) {
      lastId = msg.update_id;

      const chatId = msg.message.chat.id;
      const text = msg.message.text || "";

      // ── Commands (static, instant) ──────────────────────────
      if (text === "/start" || text === "/help") {
        return sendMessage(chatId,
          "I am GlobeNewsLive Bot 🌐\n\nI can help you with:\n• 🚨 Conflict & disaster alerts\n• 📈 Market updates\n• ⚙️ XDC Apothem development\n• 💻 Coding assistance\n\nJust type anything to ask me!"
        );
      }

      if (text === "/status") {
        return sendMessage(chatId,
          "🌐 GlobeNewsLive Status\n\n✅ Bot is online and responding\n✅ Monitoring active conflicts globally\n✅ Market alerts enabled\n✅ XDC Apothem assistance available\n\nVisit https://globenews.live for full dashboard."
        );
      }

      if (text === "/latest") {
        return sendMessage(chatId, "📡 Visit https://globenews.live for the latest real-time updates.");
      }

      // ── AI response for all other messages ──────────────────
      try {
        sendMessage(chatId, "⏳ Thinking...");
        const aiReply = await getAIResponse(text);
        sendMessage(chatId, aiReply);
      } catch (err) {
        console.error("AI error:", err.message);
        sendMessage(chatId, "⚠️ Could not process that right now. Try again or visit https://globenews.live");
      }
    }
  });
}, 2000);

console.log("✅ GlobeNewsLive Bot started...");
