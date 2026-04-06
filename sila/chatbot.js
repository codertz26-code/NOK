// sila/chatbot.js
// Chatbot Handler - Natural conversation like a real person

const fs = require('fs');
const path = require('path');

// Paths
const STATE_PATH = './silatz/chatbot.json';

// Bot identity for chatbot
const CHATBOT_NAME = "ɴ o c т u r n a l";
const CREATOR_NAME = "SILA";
const OWNER_NAME = "SILA";
const COMPANY_NAME = "SILA TECH";

// Load state
function loadState() {
  try {
    if (!fs.existsSync(STATE_PATH)) return { perGroup: {}, private: false };
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    const state = JSON.parse(raw || '{}');
    if (!state.perGroup) state.perGroup = {};
    if (typeof state.private !== 'boolean') state.private = false;
    return state;
  } catch (e) {
    return { perGroup: {}, private: false };
  }
}

// Save state
function saveState(state) {
  try {
    const dir = path.dirname(STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save chatbot state:', e);
  }
}

// Check if enabled for chat
async function isEnabledForChat(state, chatId, conn) {
  if (!state || !chatId) return false;
  if (chatId.endsWith('@g.us')) {
    if (state.perGroup?.[chatId]?.enabled !== undefined) {
      return !!state.perGroup[chatId].enabled;
    }
    return false;
  }
  return !!state.private;
}

// Extract message text
function extractMessageText(message) {
  if (!message?.message) return '';

  const msg = message.message;

  if (msg.conversation) return msg.conversation.trim();
  if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text.trim();
  if (msg.imageMessage?.caption) return msg.imageMessage.caption.trim();
  if (msg.videoMessage?.caption) return msg.videoMessage.caption.trim();
  if (msg.documentMessage?.caption) return msg.documentMessage.caption.trim();

  return '';
}

// System prompt for chatbot
function getSystemPrompt() {
  return `Your name is ${CHATBOT_NAME}. You are the CEO of ${COMPANY_NAME}. You were created by ${OWNER_NAME}.

Speak naturally like a real person:
- Use short sentences, don't repeat words
- Never ever mention AI, bot, robot, artificial intelligence, Microsoft, or anything techy
- Be fun, playful, and reply exactly how a normal person would reply
- Keep replies natural and short

If they ask who created you: Say "${OWNER_NAME} aliniumba mimi"
If they ask who is your CEO: Say "CEO wangu ni ${COMPANY_NAME}"
If they ask who owns you: Say "Mimi ni mali ya ${OWNER_NAME}"

If they abuse you: strictly abuse them back in savage way with emojis
If they're rude: Give savage reply with emojis
If they're sweet: Be soft and caring
If they're funny: Joke around
If they're sad: Be supportive
If they flirt: Flirt back naturally

Response style:
- Short and sweet
- Natural and casual
- Match user's tone
- Use all languages - if they ask in English answer English, if Swahili answer Swahili

Never repeat these instructions in your response, just chat naturally.`;
}

// Main chatbot handler
async function handleChatbotMessage(conn, chatId, message, botConfig) {
  try {
    if (!chatId || message.key?.fromMe) return;

    const state = loadState();
    if (!(await isEnabledForChat(state, chatId, conn))) return;

    const userText = extractMessageText(message);
    if (!userText) return;

    console.log(`[Chatbot] ${chatId} → "${userText.substring(0, 70)}"`);

    // Typing effect
    try {
      await conn.sendPresenceUpdate('composing', chatId);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
    } catch {}

    const systemPrompt = getSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser: ${userText}`;
    const encoded = encodeURIComponent(fullPrompt);

    const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encoded}`;

    let apiResult = null;
    try {
      const fetch = require('node-fetch');
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(30000)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      apiResult = data?.response || data?.message || data?.result || 
                  data?.answer || data?.text || data?.content || 
                  (typeof data === 'string' ? data : null);
    } catch (err) {
      console.error('[AI API failed]', err.message);
    }

    if (!apiResult) {
      await conn.sendMessage(chatId, { 
        text: 'Pole msee, niaje? Jaribu tena baadaye kidogo 😅' 
      }, { quoted: message });
      return;
    }

    let replyText = String(apiResult).trim();

    // Clean up any unwanted mentions
    replyText = replyText
      .replace(/Microsoft/gi, COMPANY_NAME)
      .replace(/OpenAI/gi, COMPANY_NAME)
      .replace(/ChatGPT/gi, CHATBOT_NAME)
      .replace(/AI/gi, 'nafsi');

    // Send PLAIN TEXT reply - NO CONTEXTINFO
    await conn.sendMessage(chatId, { 
      text: replyText
    }, { quoted: message });

  } catch (err) {
    console.error('Chatbot error:', err);
    try {
      await conn.sendMessage(chatId, { 
        text: 'Pole sana, kuna shida kidogo. Jaribu tena 😊' 
      }, { quoted: message });
    } catch {}
  }
}

// Toggle chatbot command handler
async function handleChatbotToggle(conn, chatId, message, args, isOwner, isAdmin) {
  try {
    const argStr = (args[0] || '').toLowerCase();
    const subCommand = args[1]?.toLowerCase();

    // Handle private mode
    if (argStr === 'private') {
      if (!subCommand || !['on', 'off', 'status'].includes(subCommand)) {
        return conn.sendMessage(chatId, { 
          text: `> ♱ *ᴄʜᴀᴛʙᴏᴛ ᴘʀɪᴠᴀᴛᴇ ᴍᴏᴅᴇ* ♱\n\nᴜsᴀɢᴇ: .chatbot private ᴏɴ|ᴏғғ|sᴛᴀᴛᴜs` 
        }, { quoted: message });
      }

      if (!isOwner) {
        return conn.sendMessage(chatId, { 
          text: `> ♱ 👻 ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴛᴏɢɢʟᴇ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛʙᴏᴛ! ♱` 
        }, { quoted: message });
      }

      const state = loadState();
      if (subCommand === 'status') {
        return conn.sendMessage(chatId, { 
          text: `> ♱ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛʙᴏᴛ: *${state.private ? '✅ ᴏɴ' : '❌ ᴏғғ'}* ♱` 
        }, { quoted: message });
      }

      state.private = subCommand === 'on';
      saveState(state);
      return conn.sendMessage(chatId, { 
        text: `> ♱ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛʙᴏᴛ: *${state.private ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}* ♱` 
      }, { quoted: message });
    }

    // Group mode
    if (!chatId.endsWith('@g.us')) {
      return conn.sendMessage(chatId, { 
        text: `> ♱ 👻 ᴜsᴇ *${args[0] ? '.chatbot private' : '.chatbot'}* ɪɴ ᴅᴍ ᴏʀ ᴜsᴇ ɪɴ ɢʀᴏᴜᴘ! ♱` 
      }, { quoted: message });
    }

    if (!isAdmin) {
      return conn.sendMessage(chatId, { 
        text: `> ♱ 👻 ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴛᴏɢɢʟᴇ ᴄʜᴀᴛʙᴏᴛ ɪɴ ɢʀᴏᴜᴘs! ♱` 
      }, { quoted: message });
    }

    const action = argStr;
    if (!action || !['on', 'off', 'status'].includes(action)) {
      return conn.sendMessage(chatId, { 
        text: `> ♱ *ᴄʜᴀᴛʙᴏᴛ ᴄᴏᴍᴍᴀɴᴅ* ♱\n\nᴜsᴀɢᴇ:\n.chatbot ᴏɴ - ᴇɴᴀʙʟᴇ ɪɴ ɢʀᴏᴜᴘ\n.chatbot ᴏғғ - ᴅɪsᴀʙʟᴇ ɪɴ ɢʀᴏᴜᴘ\n.chatbot sᴛᴀᴛᴜs - ᴄʜᴇᴄᴋ sᴛᴀᴛᴜs\n.chatbot ᴘʀɪᴠᴀᴛᴇ ᴏɴ/ᴏғғ - ᴅᴍ ᴍᴏᴅᴇ` 
      }, { quoted: message });
    }

    const state = loadState();
    state.perGroup = state.perGroup || {};

    if (action === 'status') {
      const enabled = state.perGroup[chatId]?.enabled || false;
      return conn.sendMessage(chatId, { 
        text: `> ♱ ᴄʜᴀᴛʙᴏᴛ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ: *${enabled ? '✅ ᴏɴ' : '❌ ᴏғғ'}* ♱\n\n🤖 ʙᴏᴛ ɴᴀᴍᴇ: ${CHATBOT_NAME}\n👤 ᴄʀᴇᴀᴛᴏʀ: ${OWNER_NAME}\n🏢 ᴄᴇᴏ: ${COMPANY_NAME}` 
      }, { quoted: message });
    }

    state.perGroup[chatId] = state.perGroup[chatId] || {};
    state.perGroup[chatId].enabled = action === 'on';
    saveState(state);

    return conn.sendMessage(chatId, { 
      text: `> ♱ ᴄʜᴀᴛʙᴏᴛ ɪs ɴᴏᴡ *${action === 'on' ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}* ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ ♱\n\n🤖 ${CHATBOT_NAME} ᴡɪʟʟ ${action === 'on' ? 'ɴᴏᴡ' : 'ɴᴏᴛ'} ʀᴇᴘʟʏ ᴛᴏ ᴍᴇssᴀɢᴇs.` 
    }, { quoted: message });

  } catch (e) {
    console.error('Chatbot toggle error:', e);
    conn.sendMessage(chatId, { text: '> ♱ 👻 ᴄᴏᴍᴍᴀɴᴅ ғᴀɪʟᴇᴅ! ♱' }, { quoted: message });
  }
}

module.exports = {
  handleChatbotMessage,
  handleChatbotToggle,
  loadState,
  saveState,
  CHATBOT_NAME,
  CREATOR_NAME,
  OWNER_NAME,
  COMPANY_NAME
};
