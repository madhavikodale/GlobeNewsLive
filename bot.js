const https = require("https");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN environment variable is required");
  console.error("   Set it before running: TELEGRAM_BOT_TOKEN=your_token node bot.js");
  process.exit(1);
}

let lastId = 0;

function getUpdates(cb) {
  https.get(`https://api.telegram.org/bot${TOKEN}/getUpdates`, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => cb(JSON.parse(data)));
  });
}

function sendMessage(chatId, text) {
  const url = 
`https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  https.get(url);
}

setInterval(() => {
  getUpdates((data) => {
    if (!data.result.length) return;

    const msg = data.result[data.result.length - 1];

    if (msg.update_id !== lastId) {
      lastId = msg.update_id;

      const chatId = msg.message.chat.id;
      const text = msg.message.text;

      // 👉 Yaha reply customize kar sakti ho
      let reply = "Hello 👋";

      if (text === "hi" || text === "hello") {
        reply = "Hello Madhavi 🚀";
      } else if (text === "/help") {
        reply = "Commands:\n/latest\n/help";
      } else {
        reply = `You said: ${text}`;
      }

      sendMessage(chatId, reply);
    }
  });
}, 2000);



console.log("Bot started...");

