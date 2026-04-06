// silamd/sila.js
// CENTRAL BOT CONFIGURATION - Encrypt this file

const fs = require('fs');
const path = require('path');

// ==================== STORAGE PATHS ====================
const STORAGE_PATHS = {
    botConfig: path.join(__dirname, '../silatz/bot-config.json'),
    menuImage: path.join(__dirname, '../silatz/menu-image.json'),
    aliveImage: path.join(__dirname, '../silatz/alive-image.json'),
    repoImage: path.join(__dirname, '../silatz/repo-image.json'),
    infoImage: path.join(__dirname, '../silatz/info-image.json'),
    footerImage: path.join(__dirname, '../silatz/footer-image.json'),
    fontStyle: path.join(__dirname, '../silatz/font-style.json'),
    groupSettings: path.join(__dirname, '../silatz/group-settings.json'),
    premiumUsers: path.join(__dirname, '../silatz/premium.json'),
    sudoUsers: path.join(__dirname, '../silatz/sudo.json'),
    welcomeMessage: path.join(__dirname, '../silatz/welcome-msg.json'),
    goodbyeMessage: path.join(__dirname, '../silatz/goodbye-msg.json'),
    autoreplyMessage: path.join(__dirname, '../silatz/autoreply-msg.json'),
    aliveMessage: path.join(__dirname, '../silatz/alive-msg.json')
};

// ==================== DEFAULT BOT IDENTITY ====================
const DEFAULT_BOT_IDENTITY = {
    botName: "♱ ɴ o c т u r n a l ♱",
    botShortName: "NOCTURNAL",
    botFullName: "♱ ɴ o c т u r n a l ♱",
    mainSymbol: "♱",
    secondarySymbol: "🌑",
    accentSymbol: "💀",
    botEmoji: "🌑",
    statusEmoji: "⚡",
    errorEmoji: "👻",
    successEmoji: "✅",
    warningEmoji: "⚠️",
    creatorName: "SILA",
    creatorNumber: "255637351031",
    creatorJid: "255637351031@s.whatsapp.net",
    creatorTag: "@SilaTech",
    creatorTitle: "ᴄʀᴇᴀᴛᴏʀ",
    version: "1.0.0",
    releaseDate: "2024",
    newsletterJid: "120363402325089913@newsletter",
    newsletterName: "©𝚂𝙸𝙻𝙰 𝚃𝙴𝙲𝙷",
    footer: "♱ 𝐏𝐨𝐰𝐞𝐝 𝐛𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡 ♱",
    defaultPrefix: ".",
    status: "online",
    description: "⚡ ʙᴇsᴛ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ᴇᴠᴇʀ",
    theme: {
        primary: "🌑",
        secondary: "♱",
        accent: "💀",
        highlight: "✨"
    }
};

// ==================== FONT STYLES ====================
const FONT_STYLES = {
    small: {
        name: "ᴛɪɴʏ",
        mapping: {
            "a": "ᴀ", "b": "ʙ", "c": "ᴄ", "d": "ᴅ", "e": "ᴇ", "f": "ꜰ", "g": "ɢ", "h": "ʜ", "i": "ɪ",
            "j": "ᴊ", "k": "ᴋ", "l": "ʟ", "m": "ᴍ", "n": "ɴ", "o": "ᴏ", "p": "ᴘ", "q": "ǫ", "r": "ʀ",
            "s": "s", "t": "ᴛ", "u": "ᴜ", "v": "ᴠ", "w": "ᴡ", "x": "x", "y": "ʏ", "z": "ᴢ",
            "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ", "G": "ɢ", "H": "ʜ", "I": "ɪ",
            "J": "ᴊ", "K": "ᴋ", "L": "ʟ", "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ", "Q": "ǫ", "R": "ʀ",
            "S": "s", "T": "ᴛ", "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x", "Y": "ʏ", "Z": "ᴢ",
            "0": "𝟶", "1": "𝟷", "2": "𝟸", "3": "𝟹", "4": "𝟺", "5": "𝟻", "6": "𝟼", "7": "𝟽", "8": "𝟾", "9": "𝟿"
        }
    },
    bold: {
        name: "ʙᴏʟᴅ",
        mapping: {
            "a": "𝗮", "b": "𝗯", "c": "𝗰", "d": "𝗱", "e": "𝗲", "f": "𝗳", "g": "𝗴", "h": "𝗵", "i": "𝗶",
            "j": "𝗷", "k": "𝗸", "l": "𝗹", "m": "𝗺", "n": "𝗻", "o": "𝗼", "p": "𝗽", "q": "𝗾", "r": "𝗿",
            "s": "𝘀", "t": "𝘁", "u": "𝘂", "v": "𝘃", "w": "𝘄", "x": "𝘅", "y": "𝘆", "z": "𝘇",
            "A": "𝗔", "B": "𝗕", "C": "𝗖", "D": "𝗗", "E": "𝗘", "F": "𝗙", "G": "𝗚", "H": "𝗛", "I": "𝗜",
            "J": "𝗝", "K": "𝗞", "L": "𝗟", "M": "𝗠", "N": "𝗡", "O": "𝗢", "P": "𝗣", "Q": "𝗤", "R": "𝗥",
            "S": "𝗦", "T": "𝗧", "U": "𝗨", "V": "𝗩", "W": "𝗪", "X": "𝗫", "Y": "𝗬", "Z": "𝗭",
            "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
        }
    },
    italic: {
        name: "ɪᴛᴀʟɪᴄ",
        mapping: {
            "a": "𝘢", "b": "𝘣", "c": "𝘤", "d": "𝘥", "e": "𝘦", "f": "𝘧", "g": "𝘨", "h": "𝘩", "i": "𝘪",
            "j": "𝘫", "k": "𝘬", "l": "𝘭", "m": "𝘮", "n": "𝘯", "o": "𝘰", "p": "𝘱", "q": "𝘲", "r": "𝘳",
            "s": "𝘴", "t": "𝘵", "u": "𝘶", "v": "𝘷", "w": "𝘸", "x": "𝘹", "y": "𝘺", "z": "𝘻",
            "A": "𝘈", "B": "𝘉", "C": "𝘊", "D": "𝘋", "E": "𝘌", "F": "𝘍", "G": "𝘎", "H": "𝘏", "I": "𝘐",
            "J": "𝘑", "K": "𝘒", "L": "𝘓", "M": "𝘔", "N": "𝘕", "O": "𝘖", "P": "𝘗", "Q": "𝘘", "R": "𝘙",
            "S": "𝘚", "T": "𝘛", "U": "𝘜", "V": "𝘝", "W": "𝘞", "X": "𝘟", "Y": "𝘠", "Z": "𝘡"
        }
    },
    fancy: {
        name: "ꜰᴀɴᴄʏ",
        mapping: {
            "a": "𝓪", "b": "𝓫", "c": "𝓬", "d": "𝓭", "e": "𝓮", "f": "𝓯", "g": "𝓰", "h": "𝓱", "i": "𝓲",
            "j": "𝓳", "k": "𝓴", "l": "𝓵", "m": "𝓶", "n": "𝓷", "o": "𝓸", "p": "𝓹", "q": "𝓺", "r": "𝓻",
            "s": "𝓼", "t": "𝓽", "u": "𝓾", "v": "𝓿", "w": "𝔀", "x": "𝔁", "y": "𝔂", "z": "𝔃",
            "A": "𝓐", "B": "𝓑", "C": "𝓒", "D": "𝓓", "E": "𝓔", "F": "𝓕", "G": "𝓖", "H": "𝓗", "I": "𝓘",
            "J": "𝓙", "K": "𝓚", "L": "𝓛", "M": "𝓜", "N": "𝓝", "O": "𝓞", "P": "𝓟", "Q": "𝓠", "R": "𝓡",
            "S": "𝓢", "T": "𝓣", "U": "𝓤", "V": "𝓥", "W": "𝓦", "X": "𝓧", "Y": "𝓨", "Z": "𝓩"
        }
    },
    double: {
        name: "ᴅᴏᴜʙʟᴇ",
        mapping: {
            "a": "𝕒", "b": "𝕓", "c": "𝕔", "d": "𝕕", "e": "𝕖", "f": "𝕗", "g": "𝕘", "h": "𝕙", "i": "𝕚",
            "j": "𝕛", "k": "𝕜", "l": "𝕝", "m": "𝕞", "n": "𝕟", "o": "𝕠", "p": "𝕡", "q": "𝕢", "r": "𝕣",
            "s": "𝕤", "t": "𝕥", "u": "𝕦", "v": "𝕧", "w": "𝕨", "x": "𝕩", "y": "𝕪", "z": "𝕫",
            "A": "𝔸", "B": "𝔹", "C": "ℂ", "D": "𝔻", "E": "𝔼", "F": "𝔽", "G": "𝔾", "H": "ℍ", "I": "𝕀",
            "J": "𝕁", "K": "𝕂", "L": "𝕃", "M": "𝕄", "N": "ℕ", "O": "𝕆", "P": "ℙ", "Q": "ℚ", "R": "ℝ",
            "S": "𝕊", "T": "𝕋", "U": "𝕌", "V": "𝕍", "W": "𝕎", "X": "𝕏", "Y": "𝕐", "Z": "ℤ"
        }
    }
};

// ==================== DEFAULT IMAGES ====================
const DEFAULT_IMAGES = {
    menu: "https://raw.githubusercontent.com/Sila-Md/Sila-data/refs/heads/main/Sila/nocturnal2.png",
    alive: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800",
    repo: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800",
    info: "https://raw.githubusercontent.com/Sila-Md/Sila-data/refs/heads/main/Sila/nocturnal1.png",
    footer: "https://raw.githubusercontent.com/Sila-Md/Sila-data/refs/heads/main/Sila/nocturnal1.png"
};

// ==================== DEFAULT MESSAGES ====================
const DEFAULT_MESSAGES = {
    welcome: "♱ {botSymbol} ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ! {botSymbol}\n\n✨ @{user} ᴊᴏɪɴᴇᴅ ᴛʜᴇ ɢʀᴏᴜᴘ\n📊 ᴍᴇᴍʙᴇʀs: {count}\n\n♱ ᴇɴᴊᴏʏ ʏᴏᴜʀ sᴛᴀʏ ♱",
    goodbye: "♱ {botSymbol} ɢᴏᴏᴅʙʏᴇ! {botSymbol}\n\n💔 @{user} ʟᴇғᴛ ᴛʜᴇ ɢʀᴏᴜᴘ\n📊 ᴍᴇᴍʙᴇʀs: {count}",
    autoreply: "♱ {botSymbol} ɪ ᴀᴍ ᴏɴʟɪɴᴇ ᴠɪᴀ {botName} {botSymbol}",
    alive: "♱ {botSymbol} {botName} ɪs ᴀʟɪᴠᴇ ᴀɴᴅ ʀᴜɴɴɪɴɢ {botSymbol}\n\n⏰ ᴜᴘᴛɪᴍᴇ: {uptime}\n👤 ᴄʀᴇᴀᴛᴏʀ: {creator}\n📡 sᴛᴀᴛᴜs: {status}"
};

// ==================== LOAD/SAVE FUNCTIONS ====================
function loadBotConfig() {
    try {
        if (fs.existsSync(STORAGE_PATHS.botConfig)) {
            const saved = JSON.parse(fs.readFileSync(STORAGE_PATHS.botConfig));
            return { ...DEFAULT_BOT_IDENTITY, ...saved };
        }
    } catch (e) {
        console.error('Error loading bot config:', e);
    }
    return { ...DEFAULT_BOT_IDENTITY };
}

function saveBotConfig(config) {
    try {
        const dir = path.dirname(STORAGE_PATHS.botConfig);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(STORAGE_PATHS.botConfig, JSON.stringify(config, null, 2));
        return true;
    } catch (e) {
        console.error('Error saving bot config:', e);
        return false;
    }
}

function getBotConfig() {
    return loadBotConfig();
}

// ==================== FONT FUNCTIONS ====================
function loadFontStyle() {
    try {
        if (fs.existsSync(STORAGE_PATHS.fontStyle)) {
            return JSON.parse(fs.readFileSync(STORAGE_PATHS.fontStyle));
        }
    } catch (e) {}
    return { current: "small" };
}

function saveFontStyle(data) {
    try {
        const dir = path.dirname(STORAGE_PATHS.fontStyle);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(STORAGE_PATHS.fontStyle, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

function applyFont(text, fontName = null) {
    const fontStyle = loadFontStyle();
    const font = fontName || fontStyle.current || "small";
    
    if (!FONT_STYLES[font]) return text;
    
    const mapping = FONT_STYLES[font].mapping;
    let result = "";
    for (let char of String(text)) {
        result += mapping[char] || char;
    }
    return result;
}

function getAvailableFonts() {
    const fonts = {};
    for (const [key, value] of Object.entries(FONT_STYLES)) {
        fonts[key] = value.name;
    }
    return fonts;
}

function setCurrentFont(fontName) {
    if (!FONT_STYLES[fontName]) return false;
    return saveFontStyle({ current: fontName });
}

// ==================== IMAGE FUNCTIONS ====================
function getImage(type) {
    try {
        const imagePath = STORAGE_PATHS[`${type}Image`];
        if (imagePath && fs.existsSync(imagePath)) {
            const data = JSON.parse(fs.readFileSync(imagePath));
            if (data.url) return data.url;
        }
    } catch (e) {}
    return DEFAULT_IMAGES[type] || DEFAULT_IMAGES.menu;
}

function setImage(type, url) {
    try {
        const imagePath = STORAGE_PATHS[`${type}Image`];
        if (!imagePath) return false;
        
        const dir = path.dirname(imagePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(imagePath, JSON.stringify({ url, updated: new Date().toISOString() }, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

// ==================== MESSAGE FUNCTIONS ====================
function getMessage(type) {
    try {
        const msgPath = STORAGE_PATHS[`${type}Message`];
        if (msgPath && fs.existsSync(msgPath)) {
            const data = JSON.parse(fs.readFileSync(msgPath));
            if (data.message) return data.message;
        }
    } catch (e) {}
    return DEFAULT_MESSAGES[type] || "";
}

function setMessage(type, message) {
    try {
        const msgPath = STORAGE_PATHS[`${type}Message`];
        if (!msgPath) return false;
        
        const dir = path.dirname(msgPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(msgPath, JSON.stringify({ message, updated: new Date().toISOString() }, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

// ==================== UPDATE FUNCTIONS ====================
function updateBotName(newName) {
    const config = loadBotConfig();
    config.botName = newName;
    config.botFullName = newName;
    config.footer = newName;
    return saveBotConfig(config);
}

function updateCreator(newName, newNumber) {
    const config = loadBotConfig();
    if (newName) config.creatorName = newName;
    if (newNumber) {
        config.creatorNumber = newNumber;
        config.creatorJid = `${newNumber}@s.whatsapp.net`;
    }
    return saveBotConfig(config);
}

function updateSymbols(main, secondary, accent) {
    const config = loadBotConfig();
    if (main) config.mainSymbol = main;
    if (secondary) config.secondarySymbol = secondary;
    if (accent) config.accentSymbol = accent;
    return saveBotConfig(config);
}

function updateFooter(newFooter) {
    const config = loadBotConfig();
    config.footer = newFooter;
    return saveBotConfig(config);
}

function updateNewsletter(jid, name) {
    const config = loadBotConfig();
    if (jid) config.newsletterJid = jid;
    if (name) config.newsletterName = name;
    return saveBotConfig(config);
}

function updateStatus(newStatus, newDescription) {
    const config = loadBotConfig();
    if (newStatus) config.status = newStatus;
    if (newDescription) config.description = newDescription;
    return saveBotConfig(config);
}

function updateEmojis(success, error, warning) {
    const config = loadBotConfig();
    if (success) config.successEmoji = success;
    if (error) config.errorEmoji = error;
    if (warning) config.warningEmoji = warning;
    return saveBotConfig(config);
}

function resetToDefault() {
    return saveBotConfig({ ...DEFAULT_BOT_IDENTITY });
}

// ==================== FAKE CONTACT ====================
function getFakeContact(botName = null) {
    const config = loadBotConfig();
    const name = botName || config.botName;
    return {
        key: { 
            participant: '0@s.whatsapp.net', 
            remoteJid: '0@s.whatsapp.net', 
            fromMe: false, 
            id: "NOCTURNAL_MD" 
        },
        message: { 
            conversation: name 
        }
    };
}

// ==================== CONTEXT INFO ====================
function getContextInfo(sender, botConfig = null) {
    const config = botConfig || loadBotConfig();
    return {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: config.newsletterJid,
            newsletterName: config.newsletterName,
            serverMessageId: 143,
        },
    };
}

// ==================== FORMATTERS ====================
function formatWithSymbols(text) {
    const config = loadBotConfig();
    return `${config.mainSymbol} ${text} ${config.mainSymbol}`;
}

function formatSuccess(text) {
    const config = loadBotConfig();
    return `${config.successEmoji} ${text}`;
}

function formatError(text) {
    const config = loadBotConfig();
    return `${config.errorEmoji} ${text}`;
}

function formatWarning(text) {
    const config = loadBotConfig();
    return `${config.warningEmoji} ${text}`;
}

// ==================== EXPORTS ====================
module.exports = {
    // Identity
    DEFAULT_BOT_IDENTITY,
    loadBotConfig,
    saveBotConfig,
    getBotConfig,
    
    // Fonts
    FONT_STYLES,
    loadFontStyle,
    applyFont,
    getAvailableFonts,
    setCurrentFont,
    
    // Images
    getImage,
    setImage,
    DEFAULT_IMAGES,
    
    // Messages
    getMessage,
    setMessage,
    DEFAULT_MESSAGES,
    
    // Update functions
    updateBotName,
    updateCreator,
    updateSymbols,
    updateFooter,
    updateNewsletter,
    updateStatus,
    updateEmojis,
    resetToDefault,
    
    // Formatters
    formatWithSymbols,
    formatSuccess,
    formatError,
    formatWarning,
    getFakeContact,
    getContextInfo,
    
    // Storage paths
    STORAGE_PATHS
};