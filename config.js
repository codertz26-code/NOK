// config.js
// Bot features configuration - References sila.js for bot identity

const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

// Load bot identity from sila.js
const silaConfig = require('./silamd/sila.js');
const botIdentity = silaConfig.loadBotConfig();

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // =========================== SESSION ===========================
    SESSION_ID: process.env.SESSION_ID || "nocturnal~your_session_id_here",
    
    // =========================== OWNER SETTINGS ===========================
    // Only owner number is stored here, names come from sila.js
    OWNER_NUMBER: process.env.OWNER_NUMBER || "255650034217",
    DEV: process.env.DEV || "255789661031",
    
    // =========================== BOT FEATURES ===========================
    PREFIX: process.env.PREFIX || botIdentity.defaultPrefix || ".",
    MODE: process.env.MODE || "public",
    PUBLIC_MODE: convertToBool(process.env.PUBLIC_MODE || "true"),
    
    // =========================== AUTO STATUS ===========================
    AUTO_VIEW_STATUS: convertToBool(process.env.AUTO_VIEW_STATUS || "true"),
    AUTO_LIKE_STATUS: convertToBool(process.env.AUTO_LIKE_STATUS || "true"),
    AUTO_STATUS_REACT: convertToBool(process.env.AUTO_STATUS_REACT || "true"),
    STATUS_REACT_EMOJIS: process.env.STATUS_REACT_EMOJIS || "♱,💀,🌀,⚡,✨,🩸,🌑,🔥,⭐",
    
    // =========================== AUTO REACT & REPLY ===========================
    AUTO_REACT: convertToBool(process.env.AUTO_REACT || "false"),
    AUTO_REACT_EMOJIS: process.env.AUTO_REACT_EMOJIS || "♱,💀,🌀,⚡,✨",
    AUTO_REPLY: convertToBool(process.env.AUTO_REPLY || "true"),
    AUTO_REPLY_MSG: process.env.AUTO_REPLY_MSG || "I am currently online",
    AUTO_TYPING: convertToBool(process.env.AUTO_TYPING || "false"),
    AUTO_RECORDING: convertToBool(process.env.AUTO_RECORDING || "false"),
    READ_MESSAGE: convertToBool(process.env.READ_MESSAGE || "false"),
    READ_CMD: convertToBool(process.env.READ_CMD || "false"),
    
    // =========================== ANTI FEATURES ===========================
    ANTI_CALL: convertToBool(process.env.ANTI_CALL || "false"),
    ANTI_DELETE: convertToBool(process.env.ANTI_DELETE || "true"),
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "inbox",
    ANTI_LINK: convertToBool(process.env.ANTI_LINK || "true"),
    ANTI_BAD: convertToBool(process.env.ANTI_BAD || "true"),
    ANTI_VV: convertToBool(process.env.ANTI_VV || "true"),
    DELETE_LINKS: convertToBool(process.env.DELETE_LINKS || "true"),
    
    LINK_WHITELIST: process.env.LINK_WHITELIST || "youtube.com,github.com,whatsapp.com",
    LINK_ACTION: process.env.LINK_ACTION || "mute",
    LINK_WARN_LIMIT: parseInt(process.env.LINK_WARN_LIMIT) || 3,
    
    // =========================== GROUP SETTINGS ===========================
    WELCOME: convertToBool(process.env.WELCOME || "true"),
    ADMIN_EVENTS: convertToBool(process.env.ADMIN_EVENTS || "true"),
    MENTION_REPLY: convertToBool(process.env.MENTION_REPLY || "false"),
    
    // =========================== STICKER SETTINGS ===========================
    STICKER_NAME: process.env.STICKER_NAME || "♱ NOCTURNAL-MD ♱",
    AUTO_STICKER: convertToBool(process.env.AUTO_STICKER || "false"),
    
    // =========================== MENU SETTINGS ===========================
    // Images are managed via sila.js commands
    ALIVE_MSG: process.env.ALIVE_MSG || "> ♱ NOCTURNAL-MD IS ONLINE ♱",
    DESCRIPTION: process.env.DESCRIPTION || "♱ 𝐏𝐨𝐰𝐞𝐝 𝐛𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡 ♱",
    
    // =========================== AUTO BIO ===========================
    AUTO_BIO: convertToBool(process.env.AUTO_BIO || "false"),
    TIME_ZONE: process.env.TIME_ZONE || "Africa/Dar_es_Salaam",
    
    // =========================== OTHER ===========================
    SESSION_SECRET: process.env.SESSION_SECRET || "nocturnal-md-secret-key",
    WORK_TYPE: process.env.WORK_TYPE || "private",
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || "",
    HEROKU_API_KEY: process.env.HEROKU_API_KEY || "",
    REPO_URL: process.env.REPO_URL || "https://github.com/SilaTech/Nocturnal-MD"
};