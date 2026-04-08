console.clear()
console.log("🌑 Starting NOCTURNAL-MD...")

// ============ GLOBAL ANTI-CRASH ============
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err)
})
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason)
})

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  isJidGroup,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const { Boom } = require("@hapi/boom");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const path = require('path');
const config = require('./config');
const zlib = require('zlib');

// ==================== SESSION SYSTEM (Like SILA-MD) ====================
// Create sessions directory if not exists
const sessionDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// Check if we have SESSION_ID from config
if (!fs.existsSync(path.join(sessionDir, 'creds.json'))) {
  // Get SESSION_ID from config.js
  let sessionId = config.SESSION_ID || '';
  
  if (!sessionId || sessionId.trim() === '') {
    console.log('❌ No SESSION_ID found! Please add your session to SESSION_ID in config.js');
    console.log('📌 How to get SESSION_ID:');
    console.log('   1. Change printQRInTerminal to true temporarily');
    console.log('   2. Scan QR code with WhatsApp');
    console.log('   3. The bot will generate a session in sessions/ folder');
    console.log('   4. Convert the session to base64');
    console.log('   5. Copy the base64 string starting with "sila~" to config.js');
    process.exit(1);
  }

  // Check if session starts with "sila~" (SILA-MD format)
  let sessdata = sessionId;
  if (sessionId.startsWith('sila~')) {
    sessdata = sessionId.replace("sila~", '').trim();
  }
  
  if (!sessdata || sessdata.trim() === '') {
    console.log('❌ SESSION_ID is empty after processing');
    process.exit(1);
  }

  console.log('📥 Extracting session from base64 string...');

  try {
    // Decode base64 to compressed buffer
    const compressedBuffer = Buffer.from(sessdata, 'base64');
    
    // Decompress using zlib
    const sessionBuffer = zlib.gunzipSync(compressedBuffer);
    
    // Write to creds.json
    fs.writeFileSync(path.join(sessionDir, 'creds.json'), sessionBuffer);
    
    console.log("✅ Session extracted and saved successfully");
    console.log(`📊 Session size: ${sessionBuffer.length} bytes`);
    
  } catch (err) {
    console.log('❌ Failed to extract session:', err.message);
    console.log('⚠️ Make sure you copied the FULL session string');
    console.log('⚠️ Session should start with "sila~" followed by base64 string');
    process.exit(1);
  }
}

// Load central bot configuration
const silaConfig = require('./silamd/sila.js');
let botIdentity = silaConfig.getBotConfig();

// Import database functions
const { 
  initializeDatabase,
  setAnti,
  getAnti,
  saveMessage,
  loadMessage 
} = require('./data-json');

// Import sila modules
const antilinkLib = require('./sila/antilink');
const { 
  AntiDelete, 
  DeletedText, 
  DeletedMedia, 
  getMessageType,
  getOwnerJid 
} = require('./sila/antidelete');
const {
  AntiMedia,
  detectMediaType,
  shouldDeleteMedia,
  defaultAntiMediaTypes
} = require('./sila/antimedia');

// Import anti modules
const { handleAntiBug } = require('./sila/antibug');
const { handleAntiSpam } = require('./sila/antispam');
const { handleAntiTag } = require('./sila/antitag');
const { handleAntiFake } = require('./sila/antifake');
const { handleAntiBadWords } = require('./sila/antibadwords');
const { handleAntiViewOnce } = require('./sila/antiviewonce');
const { handleAntiForward } = require('./sila/antiforward');
const { handleAntiGroupLink } = require('./sila/antigrouplink');
const { handleAntiVirtex } = require('./sila/antivirtex');
const { handleAntiCall } = require('./sila/anticall');
const { handleAntiTagAll } = require('./sila/antitagall');
const { handleAntiMentionStatus } = require('./sila/antimentionstatus');
const { handleAntiEdit } = require('./sila/antiedit');

// Import group events handler
const { handleGroupEvents } = require('./sila/silaevents');

// Import chatbot handler
const { handleChatbotMessage } = require('./sila/chatbot');

// Import permission handlers
const premiumHandler = require('./sila/premium');
const sudoHandler = require('./sila/sudo');
const ownerHandler = require('./sila/owner');
const { checkPermissions, getUserLevel, getUserLevelEmoji } = require('./sila/permissions');

global.silaCommands = new Map();
global.categories = new Map();
global.userWarnings = new Map();
global.mutedUsers = new Map();

// ==================== PREMIUM & SUDO SYSTEM ====================
const isPremium = premiumHandler.isPremium;
const isSudo = sudoHandler.isSudo;
const isOwner = ownerHandler.isOwner;
const SILA_NUMBER = botIdentity.creatorNumber;

const addPremiumUser = premiumHandler.addPremiumUser;
const removePremiumUser = premiumHandler.removePremiumUser;
const getPremiumUsers = premiumHandler.getPremiumUsers;

const addSudoUser = sudoHandler.addSudoUser;
const removeSudoUser = sudoHandler.removeSudoUser;
const getSudoUsers = sudoHandler.getSudoUsers;

const isSila = (number) => number === SILA_NUMBER;

// ==================== FONT FUNCTION ====================
const smallFont = (text) => {
    return silaConfig.applyFont(text);
};

// ==================== GROUP SETTINGS MANAGER ====================
const groupSettingsPath = './silatz/group-settings.json';

function loadGroupSettings() {
    if (!fs.existsSync(groupSettingsPath)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(groupSettingsPath));
    } catch (e) {
        return {};
    }
}

function saveGroupSettings(settings) {
    const dir = path.dirname(groupSettingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(groupSettingsPath, JSON.stringify(settings, null, 2));
}

function getGroupSetting(groupId, feature) {
    const settings = loadGroupSettings();
    if (!settings[groupId]) return null;
    return settings[groupId][feature];
}

function setGroupSetting(groupId, feature, value) {
    const settings = loadGroupSettings();
    if (!settings[groupId]) settings[groupId] = {};
    settings[groupId][feature] = value;
    saveGroupSettings(settings);
    return true;
}

// ==================== CHECK IF USER IS ADMIN ====================
async function isUserAdmin(conn, groupId, userId) {
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (e) {
        return false;
    }
}

// ==================== CHECK PERMISSIONS ====================
async function hasCommandPermission(conn, from, sender, senderNumber) {
    if (isOwner(senderNumber) || isSudo(senderNumber) || isSila(senderNumber)) {
        return true;
    }
    
    if (from.includes('g.us')) {
        const isAdmin = await isUserAdmin(conn, from, sender);
        if (isAdmin) return true;
    }
    
    return false;
}

// ==================== CHECK IF USER IS MUTED ====================
function isUserMuted(userId) {
    if (!global.mutedUsers.has(userId)) return false;
    const muteUntil = global.mutedUsers.get(userId);
    if (Date.now() > muteUntil) {
        global.mutedUsers.delete(userId);
        return false;
    }
    return true;
}

// ==================== SETTINGS DATABASE ====================
const settingsPath = './settings.json';

function initializeSettings() {
    const defaultSettings = {
        autotyping: config.AUTO_TYPING || false,
        autorecording: config.AUTO_RECORDING || false,
        autoviewstatus: config.AUTO_VIEW_STATUS || false,
        autolikestatus: config.AUTO_LIKE_STATUS || false,
        autoreply: config.AUTO_REPLY || false,
        autoreact: config.AUTO_REACT || false,
        prefix: config.PREFIX || '.',
        MODE: config.MODE || 'public',
        botname: botIdentity.botName,
        antilink: config.ANTI_LINK || false,
        antimedia: false,
        antibug: true,
        antispam: true,
        antitag: true,
        antifake: false,
        antibadwords: true,
        antiviewonce: true,
        antiforward: false,
        antigrouplink: true,
        antivirtex: true,
        antitagall: true,
        anticall: config.ANTI_CALL || false,
        antimentionstatus: true,
        antiedit: true,
        // Actions
        antispam_action: 'delete',
        antitag_action: 'delete',
        antibadwords_action: 'delete',
        antivirtex_action: 'kick',
        antitagall_action: 'delete',
        antigrouplink_action: 'delete',
        antifake_action: 'delete',
        antiforward_action: 'delete',
        antibug_action: 'kick',
        antimentionstatus_action: 'delete',
        antiedit_action: 'delete',
        antimediaTypes: { ...defaultAntiMediaTypes },
        antidelete_dm: true,
        antidelete_group: true
    };
    
    if (!fs.existsSync(settingsPath)) {
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
        return defaultSettings;
    }
    
    const existing = JSON.parse(fs.readFileSync(settingsPath));
    
    if (!existing.antimediaTypes) {
        existing.antimediaTypes = { ...defaultAntiMediaTypes };
    }
    
    const newFeatures = ['antibug', 'antispam', 'antitag', 'antifake', 'antibadwords', 
                         'antiviewonce', 'antiforward', 'antigrouplink', 'antivirtex', 
                         'antitagall', 'anticall', 'antimentionstatus', 'antiedit', 'MODE'];
    
    for (const feature of newFeatures) {
        if (typeof existing[feature] !== 'boolean' && feature !== 'MODE') {
            existing[feature] = defaultSettings[feature] || false;
        }
        if (feature === 'MODE' && !existing.MODE) {
            existing.MODE = defaultSettings.MODE;
        }
    }
    
    const newActions = ['antispam_action', 'antitag_action', 'antibadwords_action', 
                        'antivirtex_action', 'antitagall_action', 'antigrouplink_action',
                        'antifake_action', 'antiforward_action', 'antibug_action',
                        'antimentionstatus_action', 'antiedit_action'];
    
    for (const action of newActions) {
        if (!existing[action]) {
            existing[action] = defaultSettings[action];
        }
    }
    
    if (typeof existing.antidelete_dm !== 'boolean') existing.antidelete_dm = true;
    if (typeof existing.antidelete_group !== 'boolean') existing.antidelete_group = true;
    if (typeof existing.antilink !== 'boolean') existing.antilink = config.ANTI_LINK || false;
    
    fs.writeFileSync(settingsPath, JSON.stringify(existing, null, 2));
    return existing;
}

const getSettings = () => {
    try {
        const settings = JSON.parse(fs.readFileSync(settingsPath));
        
        if (!settings.antimediaTypes || typeof settings.antimediaTypes !== 'object') {
            settings.antimediaTypes = { ...defaultAntiMediaTypes };
            saveSettings(settings);
        }
        
        return settings;
    } catch (e) {
        return initializeSettings();
    }
};

const saveSettings = (data) => {
    if (!data.antimediaTypes || typeof data.antimediaTypes !== 'object') {
        data.antimediaTypes = { ...defaultAntiMediaTypes };
    }
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
};

// ==================== HELPER FUNCTIONS ====================
const decodeJid = (jid) => {
    if (!jid) return null;
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
    }
    return jid;
};

const addWarning = (groupId, userId) => {
    const key = `${groupId}|${userId}`;
    const current = global.userWarnings.get(key) || 0;
    global.userWarnings.set(key, current + 1);
    return current + 1;
};

const getWarnings = (groupId, userId) => {
    return global.userWarnings.get(`${groupId}|${userId}`) || 0;
};

const resetWarnings = (groupId, userId) => {
    global.userWarnings.delete(`${groupId}|${userId}`);
};

const clearGroupWarnings = (groupId) => {
    for (const [key] of global.userWarnings.entries()) {
        if (key.startsWith(`${groupId}|`)) global.userWarnings.delete(key);
    }
};

// ==================== LOAD COMMANDS ====================
function loadNocturnalCommands() {
    const silatechDir = path.join(__dirname, 'silatech');
    if (!fs.existsSync(silatechDir)) fs.mkdirSync(silatechDir, { recursive: true });
    
    global.silaCommands.clear();
    global.categories.clear();
    
    const files = fs.readdirSync(silatechDir).filter(file => file.endsWith('.js'));
    
    for (const file of files) {
        try {
            const command = require(path.join(silatechDir, file));
            
            const commands = Array.isArray(command) ? command : [command];
            
            for (const cmd of commands) {
                if (cmd && cmd.silacmd) {
                    global.silaCommands.set(cmd.silacmd, cmd);
                    if (cmd.alias) cmd.alias.forEach(a => global.silaCommands.set(a, cmd));
                    
                    if (cmd.category) {
                        if (!global.categories.has(cmd.category)) {
                            global.categories.set(cmd.category, []);
                        }
                        global.categories.get(cmd.category).push({
                            name: cmd.silacmd,
                            desc: cmd.description || "No description",
                            usage: cmd.usage || cmd.silacmd,
                            premium: cmd.premium || false,
                            owner: cmd.owner || false,
                            sudo: cmd.sudo || false
                        });
                    }
                }
            }
        } catch (e) { 
            console.error(`Error loading command ${file}:`, e);
        }
    }
    
    console.log(`📚 Loaded ${global.silaCommands.size} commands`);
}

// ==================== MAIN BOT FUNCTION ====================
async function startNocturnalBot() {
    initializeSettings();
    await initializeDatabase();
    console.log('🛡️ AntiDelete database initialized');
    
    const { state, saveCreds } = await useMultiFileAuthState('./sessions');
    const { version } = await fetchLatestBaileysVersion();
    
    const sila = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: [botIdentity.botName || "NOCTURNAL-MD", "Chrome", "3.0.0"]
    });

    sila.ev.on('creds.update', saveCreds);

    sila.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) qrcode.generate(qr, { small: true });
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log('Connection closed:', reason);
            if (reason !== DisconnectReason.loggedOut) {
                setTimeout(startNocturnalBot, 5000);
            }
        } else if (connection === 'open') {
            botIdentity = silaConfig.getBotConfig();
            const conf = getSettings();
            console.log(smallFont(`🌑 ${botIdentity.botName} 🌑`));
            console.log(smallFont(`🚀 ʙᴏᴛ ɪs ᴏɴʟɪɴᴇ!`));
            console.log(smallFont(`👤 ᴏᴡɴᴇʀ: ${config.OWNER_NUMBER}`));
            console.log(smallFont(`🎨 ᴄʀᴇᴀᴛᴏʀ: ${botIdentity.creatorName} (${botIdentity.creatorNumber})`));
            console.log(smallFont(`📌 ᴍᴏᴅᴇ: ${conf.MODE?.toUpperCase() || 'PUBLIC'}`));
            console.log(smallFont(`🛡️ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ: ᴅᴍ=${conf.antidelete_dm ? 'ᴏɴ' : 'ᴏғғ'} | ɢʀᴏᴜᴘ=${conf.antidelete_group ? 'ᴏɴ' : 'ᴏғғ'}`));
            console.log(smallFont(`🔗 ᴀɴᴛɪʟɪɴᴋ: ${conf.antilink ? 'ᴏɴ' : 'ᴏғғ'}`));
            console.log(smallFont(`🗑️ ᴀɴᴛɪᴍᴇᴅɪᴀ: ${conf.antimedia ? 'ᴏɴ' : 'ᴏғғ'}`));
            
            try {
                const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
                await sila.sendMessage(ownerJid, { 
                    text: smallFont(`🌑 ${botIdentity.botName} 🌑\n\n🤖 ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ!\n🎨 ᴄʀᴇᴀᴛᴏʀ: ${botIdentity.creatorName}\n📌 ᴍᴏᴅᴇ: ${conf.MODE?.toUpperCase() || 'PUBLIC'}\n\n🛡️ ᴀʟʟ sᴇᴄᴜʀɪᴛʏ ғᴇᴀᴛᴜʀᴇs ᴀʀᴇ ᴀᴄᴛɪᴠᴇ!`) 
                });
                console.log('✅ Test message sent to owner');
            } catch (e) {
                console.error('❌ Failed to send test message:', e.message);
            }
        }
    });

    // ==================== GROUP EVENTS HANDLER ====================
    sila.ev.on('group-participants.update', async (update) => {
        await handleGroupEvents(sila, update, botIdentity, silaConfig);
    });

    sila.ev.on('group.update', async (update) => {
        await handleGroupEvents(sila, update, botIdentity, silaConfig);
    });

    // ==================== ANTI CALL HANDLER ====================
    sila.ev.on('call', async (call) => {
        const conf = getSettings();
        const isGroupCall = call[0]?.isGroup;
        
        let anticallEnabled = false;
        
        if (isGroupCall && call[0]?.from) {
            const groupAnticall = getGroupSetting(call[0].from, 'anticall');
            anticallEnabled = groupAnticall !== null ? groupAnticall : conf.anticall;
        } else {
            anticallEnabled = conf.anticall;
        }
        
        if (anticallEnabled) {
            await handleAntiCall(sila, call, conf);
        }
    });

    // ==================== ANTIDELETE HANDLER ====================
    sila.ev.on('messages.update', async (updates) => {
        const conf = getSettings();
        
        for (const update of updates) {
            if (update.update?.message === null) {
                const store = await loadMessage(update.key.id);
                if (!store) continue;
                
                const isGroup = isJidGroup(store.jid);
                
                let shouldProcess = false;
                if (isGroup && conf.antidelete_group) shouldProcess = true;
                if (!isGroup && conf.antidelete_dm) shouldProcess = true;
                
                if (!shouldProcess) continue;
                
                console.log("🗑️ Delete detected:", update.key.id);
                await AntiDelete(sila, [update], config, smallFont, silaConfig);
            }
        }
    });

    // ==================== MESSAGE HANDLER ====================
    sila.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        
        const from = msg.key.remoteJid;
        const conf = getSettings();
        botIdentity = silaConfig.getBotConfig();

        // SAVE MESSAGE FOR ANTIDELETE
        try {
            await saveMessage(msg.key.id, {
                message: msg,
                jid: from,
                sender: msg.key.participant || msg.key.remoteJid
            });
        } catch (e) {
            console.error('Error saving message:', e);
        }

        const sender = msg.key.fromMe ? sila.user.id.split(':')[0] : msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.split('@')[0];

        // Check if user is muted
        if (isUserMuted(sender) && !msg.key.fromMe && !isOwner(senderNumber) && !isSudo(senderNumber) && !isSila(senderNumber)) {
            await sila.sendMessage(from, { delete: msg.key });
            return;
        }

        // Check if sender is protected
        let isProtected = isOwner(senderNumber) || isSudo(senderNumber) || isSila(senderNumber);
        
        if (!isProtected && from.includes('g.us')) {
            isProtected = await isUserAdmin(sila, from, sender);
        }

        // ==================== ANTI VIEWONCE (Always active) ====================
        if (conf.antiviewonce) {
            await handleAntiViewOnce(sila, msg, sender, senderNumber, config, silaConfig);
        }

        // ==================== ANTI FEATURES (Skip protected users) ====================
        if (!msg.key.fromMe && !isProtected) {
            if (conf.antibug) await handleAntiBug(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antispam) await handleAntiSpam(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antitag) await handleAntiTag(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antibadwords) await handleAntiBadWords(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antiforward) await handleAntiForward(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antigrouplink) await handleAntiGroupLink(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antivirtex) await handleAntiVirtex(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antitagall) await handleAntiTagAll(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antimentionstatus) await handleAntiMentionStatus(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antiedit) await handleAntiEdit(sila, from, msg, sender, senderNumber, conf, silaConfig);
            if (conf.antifake && from.includes('g.us')) await handleAntiFake(sila, from, msg, sender, senderNumber, conf, silaConfig);
        }

        // ==================== ANTILINK (PER-GROUP) ====================
        if (from.includes('g.us') && !msg.key.fromMe && !isProtected) {
            const groupAntilink = getGroupSetting(from, 'antilink');
            const globalAntilink = conf.antilink;
            const shouldCheckLink = groupAntilink !== null ? groupAntilink : globalAntilink;
            
            if (shouldCheckLink) {
                try {
                    await antilinkLib.handleAntilink(sila, from, msg, sender, senderNumber, conf);
                } catch (e) {
                    console.error('Antilink error:', e);
                }
            }
        }

        // ==================== ANTIMEDIA (PER-GROUP) ====================
        if (from.includes('g.us') && !msg.key.fromMe && !isProtected) {
            const groupAntimedia = getGroupSetting(from, 'antimedia');
            const groupAntimediaTypes = getGroupSetting(from, 'antimediaTypes');
            
            let antimediaEnabled = false;
            let antimediaTypes = null;
            
            if (groupAntimedia !== null) {
                antimediaEnabled = groupAntimedia;
                antimediaTypes = groupAntimediaTypes || conf.antimediaTypes || defaultAntiMediaTypes;
            } else if (conf.antimedia) {
                antimediaEnabled = true;
                antimediaTypes = conf.antimediaTypes || defaultAntiMediaTypes;
            }
            
            if (antimediaEnabled && antimediaTypes) {
                const { shouldDelete, type } = shouldDeleteMedia(msg.message, {
                    enabled: true,
                    types: antimediaTypes
                });
                
                if (shouldDelete) {
                    console.log(`🗑️ Antimedia: Deleting ${type} from ${senderNumber} in ${from}`);
                    try {
                        await sila.sendMessage(from, { delete: msg.key });
                        
                        if (config.OWNER_NUMBER) {
                            const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
                            await sila.sendMessage(ownerJid, {
                                text: smallFont(`> 👻 ᴀɴᴛɪᴍᴇᴅɪᴀ\n\n> ɢʀᴏᴜᴘ: ${from}\n> sᴇɴᴅᴇʀ: @${senderNumber}\n> ᴛʏᴘᴇ: ${type}\n> ᴀᴄᴛɪᴏɴ: ᴅᴇʟᴇᴛᴇᴅ`),
                                mentions: [sender]
                            });
                        }
                        return;
                    } catch (e) {
                        console.error('Antimedia delete error:', e);
                    }
                }
            }
        }

        if (config.READ_MESSAGE && !msg.key.fromMe) {
            await sila.readMessages([msg.key]);
        }

        // Status handler
        if (from === 'status@broadcast') {
            const participant = decodeJid(msg.key.participant || msg.key.remoteJid);
            if (!participant) return;

            if (conf.autoviewstatus) await sila.readMessages([msg.key]);
            
            if (conf.autolikestatus) {
                const emojis = (config.STATUS_REACT_EMOJIS || botIdentity.mainSymbol).split(',');
                await sila.sendMessage('status@broadcast', { 
                    react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } 
                }, { statusJidList: [participant] });
            }
            
            if (config.AUTO_STATUS_REACT) {
                await sila.sendMessage('status@broadcast', { 
                    text: botIdentity.botName 
                }, { quoted: msg, statusJidList: [participant] });
            }
            return;
        }

        if (conf.autotyping) await sila.sendPresenceUpdate('composing', from);
        if (conf.autorecording) await sila.sendPresenceUpdate('recording', from);
        
        if (conf.autoreact && !msg.key.fromMe) {
            const emojis = (config.AUTO_REACT_EMOJIS || botIdentity.mainSymbol).split(',');
            await sila.sendMessage(from, { 
                react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } 
            });
        }

        const body = msg.message.conversation 
            || msg.message.extendedTextMessage?.text 
            || msg.message.buttonsResponseMessage?.selectedButtonId 
            || msg.message.imageMessage?.caption 
            || msg.message.videoMessage?.caption 
            || "";

        if (conf.autoreply && !msg.key.fromMe && body.trim() !== "" && !body.startsWith(conf.prefix)) {
            const autoreplyMsg = silaConfig.getMessage('autoreply');
            const formattedMsg = autoreplyMsg
                .replace(/{botSymbol}/g, botIdentity.mainSymbol)
                .replace(/{botName}/g, botIdentity.botName)
                .replace(/{creator}/g, botIdentity.creatorName);
            
            await sila.sendMessage(from, { 
                text: smallFont(`> ${formattedMsg}`),
                contextInfo: silaConfig.getContextInfo(sender, botIdentity)
            }, { quoted: msg });
        }

        // ==================== MODE CHECK ====================
        const mode = conf.MODE || 'public';
        
        // Private mode - only owner/sudo
        if (mode === 'private' && !isOwner(senderNumber) && !isSudo(senderNumber)) {
            return;
        }
        
        // Inbox mode - DM only
        if (mode === 'inbox' && from.includes('g.us')) {
            return;
        }
        
        // Group mode - groups only
        if (mode === 'group' && !from.includes('g.us')) {
            return;
        }
        
        // Self mode - only self messages
        if (mode === 'self' && !msg.key.fromMe) {
            return;
        }

        // ==================== CHATBOT HANDLER ====================
        if (!msg.key.fromMe && body.trim() !== "" && !body.startsWith(conf.prefix)) {
            await handleChatbotMessage(sila, from, msg, botIdentity);
        }

        if (!body.startsWith(conf.prefix)) return;
        
        const args = body.slice(conf.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (config.READ_CMD && !msg.key.fromMe) await sila.readMessages([msg.key]);

        // Execute command
        const cmd = global.silaCommands.get(commandName);
        if (cmd) {
            try {
                // Check permissions using the new permission system
                const isAdminInGroup = from.includes('g.us') ? await isUserAdmin(sila, from, sender) : false;
                const permCheck = await checkPermissions(cmd, from, sender, senderNumber, isAdminInGroup);
                
                if (!permCheck.allowed) {
                    return await sila.sendMessage(from, { 
                        text: smallFont(`> ${permCheck.message}`),
                        contextInfo: silaConfig.getContextInfo(sender, botIdentity)
                    }, { quoted: msg });
                }
                
                await cmd.function(from, sila, {
                    ms: msg,
                    repondre: async (teks) => {
                        return await sila.sendMessage(from, { 
                            text: smallFont(`${teks}`),
                            contextInfo: silaConfig.getContextInfo(sender, botIdentity)
                        }, { quoted: msg });
                    },
                    prefixe: conf.prefix,
                    args: args,
                    botName: botIdentity.botName,
                    senderNumber: senderNumber,
                    isPremium: isPremium(senderNumber),
                    isSudo: isSudo(senderNumber),
                    isOwner: isOwner(senderNumber),
                    isSila: isSila(senderNumber),
                    addPremiumUser: addPremiumUser,
                    removePremiumUser: removePremiumUser,
                    getPremiumUsers: getPremiumUsers,
                    addSudoUser: addSudoUser,
                    removeSudoUser: removeSudoUser,
                    getSudoUsers: getSudoUsers,
                    addWarning: addWarning,
                    getWarnings: getWarnings,
                    resetWarnings: resetWarnings,
                    clearGroupWarnings: clearGroupWarnings,
                    silaConfig: silaConfig,
                    getFakeContact: silaConfig.getFakeContact,
                    getContextInfo: (s) => silaConfig.getContextInfo(s || sender, botIdentity),
                    getBotConfig: () => silaConfig.getBotConfig(),
                    applyFont: silaConfig.applyFont,
                    getAvailableFonts: silaConfig.getAvailableFonts,
                    setCurrentFont: silaConfig.setCurrentFont,
                    updateBotName: silaConfig.updateBotName,
                    updateCreator: silaConfig.updateCreator,
                    updateSymbols: silaConfig.updateSymbols,
                    updateFooter: silaConfig.updateFooter,
                    updateNewsletter: silaConfig.updateNewsletter,
                    updateStatus: silaConfig.updateStatus,
                    updateEmojis: silaConfig.updateEmojis,
                    resetToDefault: silaConfig.resetToDefault,
                    getImage: silaConfig.getImage,
                    setImage: silaConfig.setImage,
                    getMessage: silaConfig.getMessage,
                    setMessage: silaConfig.setMessage,
                    formatSuccess: silaConfig.formatSuccess,
                    formatError: silaConfig.formatError,
                    formatWarning: silaConfig.formatWarning,
                    getGroupSetting: getGroupSetting,
                    setGroupSetting: setGroupSetting,
                    isUserAdmin: isUserAdmin,
                    isUserMuted: isUserMuted
                });
            } catch (e) { 
                console.error(`Error executing command ${commandName}:`, e);
            }
        }
    });
}

// Start bot
loadNocturnalCommands();
startNocturnalBot().catch((err) => {
    console.error('Fatal error starting bot:', err);
});

module.exports = {
    isPremium,
    isSudo,
    isOwner,
    isSila,
    smallFont,
    addWarning,
    getWarnings,
    resetWarnings,
    clearGroupWarnings,
    isUserMuted
};