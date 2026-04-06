// silatech/settings.js
// Bot mode settings - Private, Public, Self, Inbox, Group

const fs = require('fs');
const path = require('path');

// Paths
const settingsPath = './settings.json';

// Helper functions
function getGlobalSettings() {
    if (!fs.existsSync(settingsPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(settingsPath));
    } catch (e) {
        return {};
    }
}

function saveGlobalSettings(data) {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
}

// Get context info
function getContextInfo(sender, botConfig) {
    return {
        mentionedJid: sender ? [sender] : [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: botConfig?.newsletterJid || '120363402325089913@newsletter',
            newsletterName: botConfig?.newsletterName || '© 𝐒𝐈𝐋𝐀 𝐌𝐃',
            serverMessageId: 143
        }
    };
}

// ==================== MODE COMMAND ====================
const mode = {
    silacmd: "mode",
    alias: ["setmode", "botmode"],
    category: "owner",
    description: "Set bot mode (public/private/inbox/group/self)",
    usage: "mode <public|private|inbox|group|self>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, sender, prefixe }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const modeType = args[0]?.toLowerCase();
        
        const validModes = ['public', 'private', 'inbox', 'group', 'self'];
        
        if (!modeType || !validModes.includes(modeType)) {
            const currentMode = conf.MODE || 'public';
            let modeDesc = '';
            
            switch(currentMode) {
                case 'public': modeDesc = '✅ ʀᴇᴘʟɪᴇs ᴛᴏ ᴀʟʟ ᴍᴇssᴀɢᴇs ɪɴ ɢʀᴏᴜᴘs ᴀɴᴅ ᴅᴍ'; break;
                case 'private': modeDesc = '🔒 ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ᴏᴡɴᴇʀ/ꜱᴜᴅᴏ'; break;
                case 'inbox': modeDesc = '📥 ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ᴅᴍ ᴍᴇssᴀɢᴇs'; break;
                case 'group': modeDesc = '👥 ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ɢʀᴏᴜᴘ ᴍᴇssᴀɢᴇs'; break;
                case 'self': modeDesc = '🤖 ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ɪᴛs ᴏᴡɴ ᴍᴇssᴀɢᴇs'; break;
            }
            
            return repondre(`> ♱ *ʙᴏᴛ ᴍᴏᴅᴇ sᴇᴛᴛɪɴɢs* ♱\n\n> 📌 ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *${currentMode.toUpperCase()}*\n> 📝 ${modeDesc}\n\n> ♱ ᴀᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs:\n> • ${prefixe}mode ᴘᴜʙʟɪᴄ - ʀᴇᴘʟʏ ᴀʟʟ\n> • ${prefixe}mode ᴘʀɪᴠᴀᴛᴇ - ᴏᴡɴᴇʀ/ꜱᴜᴅᴏ ᴏɴʟʏ\n> • ${prefixe}mode ɪɴʙᴏx - ᴅᴍ ᴏɴʟʏ\n> • ${prefixe}mode ɢʀᴏᴜᴘ - ɢʀᴏᴜᴘ ᴏɴʟʏ\n> • ${prefixe}mode sᴇʟꜰ - sᴇʟꜰ ʀᴇᴘʟʏ ♱`);
        }
        
        conf.MODE = modeType;
        saveGlobalSettings(conf);
        
        let modeMessage = '';
        switch(modeType) {
            case 'public': modeMessage = '✅ ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ᴘᴜʙʟɪᴄ* ᴍᴏᴅᴇ - ʀᴇᴘʟɪᴇs ᴛᴏ ᴀʟʟ ᴍᴇssᴀɢᴇs'; break;
            case 'private': modeMessage = '🔒 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ᴘʀɪᴠᴀᴛᴇ* ᴍᴏᴅᴇ - ᴏɴʟʏ ᴏᴡɴᴇʀ/ꜱᴜᴅᴏ ᴄᴀɴ ᴜsᴇ'; break;
            case 'inbox': modeMessage = '📥 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ɪɴʙᴏx* ᴍᴏᴅᴇ - ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ᴅᴍ'; break;
            case 'group': modeMessage = '👥 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ɢʀᴏᴜᴘ* ᴍᴏᴅᴇ - ᴏɴʟʏ ʀᴇᴘʟɪᴇs ɪɴ ɢʀᴏᴜᴘs'; break;
            case 'self': modeMessage = '🤖 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *sᴇʟꜰ* ᴍᴏᴅᴇ - ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ɪᴛsᴇʟꜰ'; break;
        }
        
        return conn.sendMessage(from, {
            text: `> ♱ ${botConfig.mainSymbol} ${modeMessage} ${botConfig.mainSymbol} ♱`,
            contextInfo: getContextInfo(sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== PUBLIC MODE COMMAND ====================
const publicmode = {
    silacmd: "public",
    alias: ["publicmode"],
    category: "owner",
    description: "Set bot to public mode",
    usage: "public",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, sender }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        
        conf.MODE = 'public';
        saveGlobalSettings(conf);
        
        return conn.sendMessage(from, {
            text: `> ♱ ${botConfig.mainSymbol} ✅ ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ᴘᴜʙʟɪᴄ* ᴍᴏᴅᴇ - ʀᴇᴘʟɪᴇs ᴛᴏ ᴀʟʟ ᴍᴇssᴀɢᴇs ${botConfig.mainSymbol} ♱`,
            contextInfo: getContextInfo(sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== PRIVATE MODE COMMAND ====================
const privatemode = {
    silacmd: "private",
    alias: ["privatemode"],
    category: "owner",
    description: "Set bot to private mode (owner/sudo only)",
    usage: "private",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, sender }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        
        conf.MODE = 'private';
        saveGlobalSettings(conf);
        
        return conn.sendMessage(from, {
            text: `> ♱ ${botConfig.mainSymbol} 🔒 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ᴘʀɪᴠᴀᴛᴇ* ᴍᴏᴅᴇ - ᴏɴʟʏ ᴏᴡɴᴇʀ/ꜱᴜᴅᴏ ᴄᴀɴ ᴜsᴇ ${botConfig.mainSymbol} ♱`,
            contextInfo: getContextInfo(sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== INBOX MODE COMMAND ====================
const inboxmode = {
    silacmd: "inbox",
    alias: ["inboxmode"],
    category: "owner",
    description: "Set bot to inbox mode (DM only)",
    usage: "inbox",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, sender }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        
        conf.MODE = 'inbox';
        saveGlobalSettings(conf);
        
        return conn.sendMessage(from, {
            text: `> ♱ ${botConfig.mainSymbol} 📥 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ɪɴʙᴏx* ᴍᴏᴅᴇ - ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ᴅᴍ ${botConfig.mainSymbol} ♱`,
            contextInfo: getContextInfo(sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== GROUP MODE COMMAND ====================
const groupmode = {
    silacmd: "groupmode",
    alias: ["group"],
    category: "owner",
    description: "Set bot to group mode (groups only)",
    usage: "groupmode",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, sender }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        
        conf.MODE = 'group';
        saveGlobalSettings(conf);
        
        return conn.sendMessage(from, {
            text: `> ♱ ${botConfig.mainSymbol} 👥 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *ɢʀᴏᴜᴘ* ᴍᴏᴅᴇ - ᴏɴʟʏ ʀᴇᴘʟɪᴇs ɪɴ ɢʀᴏᴜᴘs ${botConfig.mainSymbol} ♱`,
            contextInfo: getContextInfo(sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== SELF MODE COMMAND ====================
const selfmode = {
    silacmd: "self",
    alias: ["selfmode"],
    category: "owner",
    description: "Set bot to self mode (only replies to itself)",
    usage: "self",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, sender }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        
        conf.MODE = 'self';
        saveGlobalSettings(conf);
        
        return conn.sendMessage(from, {
            text: `> ♱ ${botConfig.mainSymbol} 🤖 ʙᴏᴛ ɪs ɴᴏᴡ ɪɴ *sᴇʟꜰ* ᴍᴏᴅᴇ - ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ɪᴛsᴇʟꜰ ${botConfig.mainSymbol} ♱`,
            contextInfo: getContextInfo(sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== STATUS COMMAND ====================
const modestatus = {
    silacmd: "modestatus",
    alias: ["modeinfo", "botstatus"],
    category: "general",
    description: "Check current bot mode",
    usage: "modestatus",
    
    async function(from, conn, { repondre, silaConfig, ms, sender, prefixe }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const currentMode = conf.MODE || 'public';
        
        let modeIcon = '';
        let modeDesc = '';
        
        switch(currentMode) {
            case 'public': 
                modeIcon = '🌍';
                modeDesc = 'ʀᴇᴘʟɪᴇs ᴛᴏ ᴀʟʟ ᴍᴇssᴀɢᴇs ɪɴ ɢʀᴏᴜᴘs ᴀɴᴅ ᴅᴍ';
                break;
            case 'private': 
                modeIcon = '🔒';
                modeDesc = 'ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ᴏᴡɴᴇʀ/ꜱᴜᴅᴏ';
                break;
            case 'inbox': 
                modeIcon = '📥';
                modeDesc = 'ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ᴅᴍ ᴍᴇssᴀɢᴇs';
                break;
            case 'group': 
                modeIcon = '👥';
                modeDesc = 'ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ɢʀᴏᴜᴘ ᴍᴇssᴀɢᴇs';
                break;
            case 'self': 
                modeIcon = '🤖';
                modeDesc = 'ᴏɴʟʏ ʀᴇᴘʟɪᴇs ᴛᴏ ɪᴛs ᴏᴡɴ ᴍᴇssᴀɢᴇs';
                break;
        }
        
        return repondre(`> ${modeIcon} ♱ *ʙᴏᴛ ᴍᴏᴅᴇ sᴛᴀᴛᴜs* ♱ ${modeIcon}\n\n> 📌 ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *${currentMode.toUpperCase()}*\n> 📝 ${modeDesc}\n\n> ♱ ᴛᴏ ᴄʜᴀɴɢᴇ ᴍᴏᴅᴇ:\n> • ${prefixe}mode ᴘᴜʙʟɪᴄ\n> • ${prefixe}mode ᴘʀɪᴠᴀᴛᴇ\n> • ${prefixe}mode ɪɴʙᴏx\n> • ${prefixe}mode ɢʀᴏᴜᴘ\n> • ${prefixe}mode sᴇʟꜰ ♱`);
    }
};

// ==================== EXPORT ALL COMMANDS ====================
module.exports = [
    mode,
    publicmode,
    privatemode,
    inboxmode,
    groupmode,
    selfmode,
    modestatus
];