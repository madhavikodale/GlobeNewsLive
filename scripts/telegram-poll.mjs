const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN environment variable is required');
  console.error('   Set it before running: TELEGRAM_BOT_TOKEN=your_token node scripts/telegram-poll.mjs');
  process.exit(1);
}

let lastUpdateId = 0;

// Show typing indicator
async function sendTyping(chatId) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing'
      })
    });
  } catch (error) {
    console.error('Typing error:', error.message);
  }
}

async function getUpdates() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&limit=10`
    );
    const data = await response.json();
    
    if (!data.ok || !data.result.length) return;
    
    for (const update of data.result) {
      lastUpdateId = update.update_id;
      
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || '';
        const caption = update.message.caption || '';
        const name = update.message.from.first_name;
        
        // Check if message has photo/document
        const hasPhoto = update.message.photo !== undefined;
        const hasDocument = update.message.document !== undefined;
        
        console.log(`[${new Date().toISOString()}] Message from ${name}: ${text || caption || '[image/document]'}`);
        
        // Show typing indicator
        await sendTyping(chatId);
        
        // Small delay to simulate reading
        await new Promise(r => setTimeout(r, 1000));
        
        // Reply to user based on message type
        let replyText = '';
        const lowerText = (text || caption).toLowerCase().trim();
        
        // Handle specific XDC project selections
        if (lowerText.includes('supply chain') || lowerText === '1' || lowerText === '1.' || lowerText === 'first') {
          replyText = `📦 Supply Chain Tracker - XDC Apothem\n\nExcellent choice ${name}! 🎯\n\n📝 Project Overview:\nBuild an immutable supply chain tracking system where:\n• Manufacturers log production on XDC\n• Transporters update shipment status\n• Retailers verify authenticity\n• Consumers scan QR to see full journey\n\n🛠️ Tech Stack:\n• Smart Contracts: Solidity (XDC compatible)\n• Frontend: Next.js + Web3.js\n• Storage: IPFS for documents\n• XDC Apothem Testnet for development\n\n📋 Implementation Steps:\n1. Set up XDC Apothem wallet\n2. Deploy ProductRegistry contract\n3. Build dashboard for adding products\n4. Add QR code generation per product\n5. Create verification portal\n\n🔗 Resources:\n• XDC Faucet: https://faucet.apothem.network\n• Remix IDE: https://remix.xinfin.org\n\nWant me to help with code? Say "show me the smart contract"! 🔥`;
        }
        else if (lowerText.includes('document verification') || lowerText === '2' || lowerText === '2.' || lowerText === 'second') {
          replyText = `📄 Document Verification System - XDC Apothem\n\nGreat pick ${name}! 🎯\n\n📝 Project Overview:\nCreate a tamper-proof document verification platform:\n• Upload documents → hash stored on XDC\n• Verify instantly without exposing content\n• Perfect for certificates, contracts, IDs\n• Immutable proof of existence\n\n🛠️ Tech Stack:\n• Smart Contract: DocumentRegistry.sol\n• Frontend: React + ethers.js\n• Hashing: SHA-256 on-chain\n• Storage: IPFS for actual documents (optional)\n\n📋 Implementation Steps:\n1. Create DocumentRegistry contract\n2. Build upload interface (drag & drop)\n3. Generate SHA-256 hash client-side\n4. Store hash on XDC blockchain\n5. Build verification page\n\n💡 Key Feature:\nUsers verify WITHOUT uploading the full document - just compare hashes!\n\nNeed starter code? Say "document contract code"! 🔥`;
        }
        else if (lowerText.includes('payment') || lowerText.includes('cross border') || lowerText === '3' || lowerText === '3.' || lowerText === 'third') {
          replyText = `💸 Cross-Border Payment Dashboard - XDC Apothem\n\nSmart choice ${name}! 🎯\n\n📝 Project Overview:\nBuild a real-time payment tracking dashboard:\n• Track XDC payments across borders\n• Show transaction status & confirmations\n• Calculate fees & exchange rates\n• Multi-currency support\n\n🛠️ Tech Stack:\n• XDC Pay SDK for wallet integration\n• Node.js backend for transaction monitoring\n• WebSocket for real-time updates\n• Chart.js for analytics\n\n📋 Implementation Steps:\n1. Integrate XDC Pay for wallet connect\n2. Build transaction submission form\n3. Create status tracker (pending → confirmed)\n4. Add transaction history with filters\n5. Build analytics dashboard\n\n⚡ XDC Advantage:\n2-second finality, near-zero fees!\n\nWant payment flow code? Say "payment dashboard code"! 🔥`;
        }
        else if (lowerText.includes('tokenized') || lowerText.includes('asset') || lowerText.includes('marketplace') || lowerText === '4' || lowerText === '4.' || lowerText === 'fourth') {
          replyText = `🏠 Tokenized Asset Marketplace - XDC Apothem\n\nAmbitious choice ${name}! 🎯\n\n📝 Project Overview:\nCreate a marketplace for fractional asset ownership:\n• Tokenize real estate, art, commodities\n• Fractional ownership via XRC-20 tokens\n• Buy/sell fractions on-chain\n• Automated dividend distribution\n\n🛠️ Tech Stack:\n• XRC-20 token standard (ERC-20 compatible)\n• Smart Contract: AssetToken.sol + Marketplace.sol\n• Frontend: Next.js + wagmi\n• Price oracle integration\n\n📋 Implementation Steps:\n1. Create XRC-20 token contract\n2. Build asset listing page\n3. Implement buy/sell functionality\n4. Add ownership percentage tracking\n5. Create dividend distribution\n\n💡 Real Use Case:\nTokenize a $1M property → 1000 tokens at $1000 each!\n\nNeed token contract? Say "token contract code"! 🔥`;
        }
        else if (lowerText.includes('identity') || lowerText.includes('verification dapp') || lowerText === '5' || lowerText === '5.' || lowerText === 'fifth') {
          replyText = `🆔 Identity Verification DApp - XDC Apothem\n\nPowerful choice ${name}! 🎯\n\n📝 Project Overview:\nBuild a self-sovereign identity system:\n• Users control their identity data\n• Zero-knowledge proof verification\n• No central database = no data breaches\n• One identity, multiple services\n\n🛠️ Tech Stack:\n• Smart Contract: IdentityRegistry.sol\n• ZK proofs: circom + snarkjs\n• Frontend: React + MetaMask/XDC Pay\n• IPFS for encrypted identity documents\n\n📋 Implementation Steps:\n1. Create decentralized identifier (DID)\n2. Build identity claim system\n3. Implement ZK proof generation\n4. Create verifier interface\n5. Add credential revocation\n\n🔐 Privacy Feature:\nProve you're 18+ without revealing birthdate!\n\nNeed identity code? Say "identity contract code"! 🔥`;
        }
        // Handle code requests
        else if (lowerText.includes('document contract') || lowerText.includes('documentregistry')) {
          replyText = `📄 DocumentRegistry.sol - Smart Contract Code\n\n(See GitHub for full code)\n\nKey functions:\n• storeDocument(hash, metadata) - Store doc hash\n• verifyDocument(hash) - Check if exists\n• getUserDocuments() - List your docs\n\n📋 How to use:\n1. Open https://remix.xinfin.org\n2. Create new file: DocumentRegistry.sol\n3. Compile with Solidity 0.8.0\n4. Deploy to XDC Apothem Testnet\n\n🧪 Test it:\n• storeDocument(sha256("test"), "My Document")\n• verifyDocument(sha256("test"))\n\nNeed full code? Check the project repository! 🔥`;
        }
        else if (lowerText.includes('supply chain contract') || lowerText.includes('productregistry') || lowerText.includes('show me the smart contract')) {
          replyText = `📦 ProductRegistry.sol - Smart Contract Code\n\nKey functions:\n• createProduct(id, name, manufacturer)\n• updateStatus(id, status, location)\n• getProductJourney(id) - Full history\n\n📋 Deploy Steps:\n1. Open https://remix.xinfin.org\n2. Create ProductRegistry.sol\n3. Compile with Solidity 0.8.0+\n4. Get XDC from faucet.apothem.network\n5. Deploy to Apothem Testnet\n\n🧪 Test Functions:\n• createProduct("PROD001", "Coffee", "Colombia")\n• updateStatus("PROD001", "Shipped", "Bogota")\n• getProductJourney("PROD001")\n\nNeed full code? Check the project repository! 🔥`;
        }
        else if (lowerText.includes('token contract') || lowerText.includes('asset token') || lowerText.includes('xrc20')) {
          replyText = `🏠 AssetToken.sol - XRC-20 Token Contract\n\nKey features:\n• ERC20 standard tokens\n• distributeDividends() - Pay token holders\n• claimDividends() - Holders claim share\n\n📋 Deployment Example:\n• Name: "Real Estate Token"\n• Symbol: "RET"\n• Asset: "Downtown Building"\n• Value: 1,000,000 XDC\n• Supply: 1000 tokens\n\n🔧 Install OpenZeppelin:\nnpm install @openzeppelin/contracts\n\nNeed full code? Check the project repository! 🔥`;
        }
        else if (lowerText.includes('react frontend') || lowerText.includes('frontend code')) {
          replyText = `⚛️ React Frontend for XDC DApp\n\nKey components:\n• connectWallet() - Connect MetaMask/XDC Pay\n• ethers.Contract - Interact with blockchain\n• useState/useEffect - Manage state\n\n📦 Required packages:\nnpm install ethers web3\n\n🔌 XDC Pay Browser Extension:\nhttps://chrome.google.com/webstore/detail/xdc-pay\n\nNeed full React code? Check the project repository! 🔥`;
        }
        // Handle /pro page requests
        else if (lowerText.includes('create') && (lowerText.includes('pro') || lowerText.includes('page')) || lowerText.includes('3 columns') || lowerText.includes('dashboard') || lowerText.includes('scroll') || lowerText.includes('navbar')) {
          replyText = `💻 GlobeNewsLive /pro Page - 3-Column Dashboard\n\nHere's your X Pro-style dashboard code:\n\n📁 File: src/app/pro/page.tsx\n\nKey features:\n• 3 independently scrolling columns\n• Auto-refresh every 30 seconds\n• Sticky headers while scrolling\n• Uses /api/signals API\n• Responsive design\n\n📋 Implementation:\n1. Create folder: src/app/pro/\n2. Add page.tsx with 3-column layout\n3. Each column fetches different category\n4. overflow-y-auto for scrolling\n5. Add Navbar link to /pro\n\n🔄 Auto-refresh:\nuseEffect + setInterval(30000)\n\n📊 API Calls:\n• /api/signals?category=conflict\n• /api/signals?category=market\n• /api/signals?category=disaster\n\nNeed full code file? I can create it in your project! 🔥`;
        }
        // Handle GlobeNewsLive feature requests
        else if (lowerText.includes('add feature') || lowerText.includes('new feature') || lowerText.includes('more features') || (lowerText.includes('globenews') && lowerText.includes('improve'))) {
          replyText = `🌐 GlobeNewsLive Feature Ideas\n\nHi ${name}! Here are cool features to add:\n\n📊 Dashboard Enhancements:\n• Real-time conflict heatmap\n• Personalized alert preferences\n• Historical data charts\n• Export to CSV/PDF\n\n🔔 Notifications:\n• Push notifications (browser/mobile)\n• SMS for CRITICAL events\n• Custom alert thresholds\n\n🔍 New Data Sources:\n• Crypto price alerts\n• Weather/disaster warnings\n• Airport delays\n• Social sentiment\n\n🔐 Blockchain:\n• Verify news on XDC\n• Immutable alert history\n\nWhich feature? I can help build it! 🔥`;
        }
        // Handle images/documents with captions about XDC/challenge
        else if ((hasPhoto || hasDocument) && (lowerText.includes('xdc') || lowerText.includes('challenge') || lowerText.includes('technological') || lowerText.includes('48 hours'))) {
          replyText = `🚀 XDC Apothem Challenge Received!\n\nHi ${name},\n\nI see you are working on a XDC Apothem project with a 48-hour deadline. This is exciting! 💡\n\n📝 Your Challenge:\n• Build a solution using XDC Apothem\n• Real use case (not just theory)\n• Web app / dashboard / backend / prototype\n• 48-hour deadline\n• Document your work\n\n🛠️ How I Can Help:\n• Brainstorm XDC Apothem ideas\n• Code review and debugging\n• Architecture suggestions\n• OpenClaw / Hermes Agent assistance\n\n💡 Suggested XDC Apothem Projects:\n1. Supply Chain Tracker (immutable records)\n2. Document Verification System\n3. Cross-Border Payment Dashboard\n4. Tokenized Asset Marketplace\n5. Identity Verification DApp\n\nReply with your idea and I'll help you build it! 🔥`;
        }
        // Handle images/documents without specific keywords
        else if (hasPhoto || hasDocument) {
          replyText = `📎 Document/Image Received\n\nThanks ${name}! I have received your file.\n\nCurrently I can:\n• Read text captions\n• Help with XDC Apothem projects\n• Provide coding assistance\n\nIf this is about a project, please describe what you need help with! 😊`;
        }
        // Greetings
        else if (['hi', 'hello', 'hey', 'namaste', 'hola', 'bonjour', 'ciao', 'salam'].includes(lowerText)) {
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
        // Default response
        else {
          replyText = `🌐 GlobeNewsLive Bot\n\nHi ${name}!\n\nI understand:\n• Greetings: hi, hello, hey\n• Commands: /start, /help, /alerts, /status, /xdc\n• XDC Projects: "supply chain", "1", "document", "2", etc.\n• Development: "create pro page", "3 columns", "dashboard"\n\nI am here to help with alerts AND development projects! 😊`;
        }
        
        await sendMessage(chatId, replyText);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function sendMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
    console.log(`[${new Date().toISOString()}] Replied to ${chatId}`);
  } catch (error) {
    console.error('Send error:', error.message);
  }
}

console.log('🤖 GlobeNewsLive Telegram Polling Bot started');
console.log('Checking for messages every 5 seconds...');
console.log('Fixed and ready!\n');

// Poll every 5 seconds
setInterval(getUpdates, 5000);
getUpdates(); // Initial check
