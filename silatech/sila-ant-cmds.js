// silatech/security.js - Full Security Menu with All Anti Features

const fs = require('fs');
const path = require('path');

// Paths
const groupSettingsPath = './silatz/group-settings.json';
const globalSettingsPath = './settings.json';

// Developer Info
const DEV_NAME = "♱ 𝐒𝐈𝐋𝐀 ♱";
const TELEGRAM = "@sir_sila";
const YOUTUBE = "https://youtube.com/@silatrix22";
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02";

// Helper functions
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

function getGlobalSettings() {
    if (!fs.existsSync(globalSettingsPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(globalSettingsPath));
    } catch (e) {
        return {};
    }
}

function saveGlobalSettings(data) {
    fs.writeFileSync(globalSettingsPath, JSON.stringify(data, null, 2));
}

// Get context info function
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

// ==================== SECURITY MENU (FULL) ====================
const securityMenu = {
    silacmd: "security",
    alias: ["sec", "s", "smenu"],
    category: "security",
    description: "Show complete security menu",
    usage: "security",
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe, senderNumber }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        // Header with Crosses
        let menuText = `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱           ${botConfig.mainSymbol} *${DEV_NAME}* ${botConfig.mainSymbol}            ♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱\n\n`;
        
        menuText += `✨ *ᴅᴇᴠᴇʟᴏᴘᴇʀ*\n`;
        menuText += `👤 ${DEV_NAME}\n`;
        menuText += `📱 ${TELEGRAM}\n`;
        menuText += `📺 ${YOUTUBE}\n`;
        menuText += `📢 ${WHATSAPP_CHANNEL}\n\n`;
        
        menuText += `🛡️ *sᴇᴄᴜʀɪᴛʏ ғᴇᴀᴛᴜʀᴇs*\n`;
        menuText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        // Anti Features List with Icons
        const features = [
            { cmd: "antispam", icon: "🔄", desc: "Prevents message flooding", actions: "delete/kick", default: "delete" },
            { cmd: "antitag", icon: "🏷️", desc: "Prevents mass tagging (>10 mentions)", actions: "delete/kick", default: "delete" },
            { cmd: "antibadwords", icon: "🔞", desc: "Blocks inappropriate words", actions: "delete/kick", default: "delete" },
            { cmd: "antivirtex", icon: "🦠", desc: "Blocks viral text messages", actions: "delete/kick", default: "kick" },
            { cmd: "antitagall", icon: "🔔", desc: "Blocks @everyone/@all tags", actions: "delete/kick", default: "delete" },
            { cmd: "antigrouplink", icon: "🔗", desc: "Blocks external group links", actions: "delete/kick", default: "delete" },
            { cmd: "antiforward", icon: "↪️", desc: "Blocks forwarded messages", actions: "delete/kick", default: "delete" },
            { cmd: "antibug", icon: "🐛", desc: "Blocks buggy/crash messages", actions: "delete/kick", default: "kick" },
            { cmd: "antifake", icon: "📱", desc: "Blocks non-Tanzanian numbers", actions: "delete/kick", default: "delete" },
            { cmd: "antimentionstatus", icon: "📢", desc: "Blocks status mentions", actions: "delete/kick", default: "delete" },
            { cmd: "antiedit", icon: "✏️", desc: "Detects and blocks edited messages", actions: "delete/kick", default: "delete" },
            { cmd: "anticall", icon: "📞", desc: "Rejects calls automatically", actions: "on/off", default: "off" },
            { cmd: "antiviewonce", icon: "👁️", desc: "Saves view-once messages", actions: "on/off", default: "on" }
        ];
        
        for (const f of features) {
            const groupSetting = isGroup ? getGroupSetting(groupId, f.cmd) : null;
            const globalSetting = conf[f.cmd];
            const isEnabled = groupSetting !== null ? groupSetting : (globalSetting || false);
            const statusIcon = isEnabled ? '✅' : '❌';
            const actionIcon = isEnabled ? (f.actions !== "on/off" ? '⚙️' : '🔘') : '⚪';
            
            // Get current action
            let currentAction = '';
            if (isEnabled && f.actions !== "on/off") {
                const actionSetting = getGroupSetting(groupId, `${f.cmd}_action`) || conf[`${f.cmd}_action`] || f.default;
                currentAction = ` [${actionSetting.toUpperCase()}]`;
            }
            
            menuText += `${statusIcon} ${f.icon} *${prefixe}${f.cmd}* ${actionIcon}${currentAction}\n`;
            menuText += `   └ ${f.desc}\n\n`;
        }
        
        // Commands Section
        menuText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        menuText += `📌 *ᴄᴏᴍᴍᴀɴᴅs*\n\n`;
        
        menuText += `┌── *ᴇɴᴀʙʟᴇ/ᴅɪsᴀʙʟᴇ*\n`;
        menuText += `│  ${prefixe}antispam on/off\n`;
        menuText += `│  ${prefixe}antitag on/off\n`;
        menuText += `│  ${prefixe}antibadwords on/off\n`;
        menuText += `│  ${prefixe}antivirtex on/off\n`;
        menuText += `│  ${prefixe}antitagall on/off\n`;
        menuText += `│  ${prefixe}antigrouplink on/off\n`;
        menuText += `│  ${prefixe}antiforward on/off\n`;
        menuText += `│  ${prefixe}antibug on/off\n`;
        menuText += `│  ${prefixe}antifake on/off\n`;
        menuText += `│  ${prefixe}antimentionstatus on/off\n`;
        menuText += `│  ${prefixe}antiedit on/off\n`;
        menuText += `│  ${prefixe}anticall on/off\n`;
        menuText += `│  ${prefixe}antiviewonce on/off\n`;
        menuText += `│\n`;
        
        menuText += `├── *sᴇᴛ ᴀᴄᴛɪᴏɴ*\n`;
        menuText += `│  ${prefixe}antispam action delete/kick\n`;
        menuText += `│  ${prefixe}antitag action delete/kick\n`;
        menuText += `│  ${prefixe}antibadwords action delete/kick\n`;
        menuText += `│  ${prefixe}antivirtex action delete/kick\n`;
        menuText += `│  ${prefixe}antitagall action delete/kick\n`;
        menuText += `│  ${prefixe}antigrouplink action delete/kick\n`;
        menuText += `│  ${prefixe}antiforward action delete/kick\n`;
        menuText += `│  ${prefixe}antibug action delete/kick\n`;
        menuText += `│  ${prefixe}antifake action delete/kick\n`;
        menuText += `│  ${prefixe}antimentionstatus action delete/kick\n`;
        menuText += `│  ${prefixe}antiedit action delete/kick\n`;
        menuText += `│\n`;
        
        menuText += `├── *ᴄʜᴇᴄᴋ sᴛᴀᴛᴜs*\n`;
        menuText += `│  ${prefixe}antispam\n`;
        menuText += `│  ${prefixe}antitag\n`;
        menuText += `│  ${prefixe}antibadwords\n`;
        menuText += `│  ${prefixe}security\n`;
        menuText += `│\n`;
        
        menuText += `└── *ᴏᴛʜᴇʀ*\n`;
        menuText += `   ${prefixe}securitymenu - sʜᴏᴡ ᴛʜɪs ᴍᴇɴᴜ\n`;
        menuText += `   ${prefixe}resetsecurity - ʀᴇsᴇᴛ ᴀʟʟ ᴛᴏ ᴅᴇғᴀᴜʟᴛ\n\n`;
        
        // Footer with Crosses
        menuText += `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱           ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${DEV_NAME}           ♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱`;
        
        // Send menu with context info
        try {
            await conn.sendMessage(from, {
                text: menuText,
                contextInfo: getContextInfo(senderNumber, botConfig)
            }, { quoted: ms });
        } catch (e) {
            console.error('Security menu error:', e);
            await repondre(menuText);
        }
    }
};

// ==================== SECURITY MENU ALIAS ====================
const securitymenu = {
    silacmd: "securitymenu",
    alias: ["secmenu", "smenu"],
    category: "security",
    description: "Show security menu",
    usage: "securitymenu",
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe, senderNumber }) {
        return securityMenu.function(from, conn, { repondre, ms, silaConfig, prefixe, senderNumber });
    }
};

// ==================== RESET SECURITY ====================
const resetsecurity = {
    silacmd: "resetsecurity",
    alias: ["resetsec", "resetall"],
    category: "owner",
    description: "Reset all security settings to default",
    usage: "resetsecurity",
    owner: true,
    
    async function(from, conn, { repondre, silaConfig, prefixe }) {
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (isGroup) {
            // Reset all group settings
            const features = ['antispam', 'antitag', 'antibadwords', 'antivirtex', 'antitagall', 
                              'antigrouplink', 'antiforward', 'antibug', 'antifake', 'antimentionstatus', 
                              'antiedit', 'anticall', 'antiviewonce'];
            
            for (const feature of features) {
                setGroupSetting(groupId, feature, null);
                setGroupSetting(groupId, `${feature}_action`, null);
            }
            
            return repondre(`♱ ${silaConfig.getBotConfig().mainSymbol} ᴀʟʟ sᴇᴄᴜʀɪᴛʏ sᴇᴛᴛɪɴɢs ʜᴀᴠᴇ ʙᴇᴇɴ ʀᴇsᴇᴛ ᴛᴏ ɢʟᴏʙᴀʟ ᴅᴇғᴀᴜʟᴛs! ${silaConfig.getBotConfig().mainSymbol} ♱`);
        } else {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
    }
};

// ==================== ANTI SPAM ====================
const antispam = {
    silacmd: "antispam",
    alias: ["spam"],
    category: "security",
    description: "Anti spam - delete or kick spam messages",
    usage: "antispam on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        // Set action
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antispam_action', actionValue);
            if (getGroupSetting(groupId, 'antispam') === null || getGroupSetting(groupId, 'antispam') === false) {
                setGroupSetting(groupId, 'antispam', true);
            }
            return repondre(`♱ ᴀɴᴛɪsᴘᴀᴍ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        // On/Off
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antispam', true);
            if (getGroupSetting(groupId, 'antispam_action') === null) {
                setGroupSetting(groupId, 'antispam_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪsᴘᴀᴍ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antispam', false);
            return repondre(`♱ ᴀɴᴛɪsᴘᴀᴍ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        // Show status
        const isEnabled = getGroupSetting(groupId, 'antispam') !== null ? 
            getGroupSetting(groupId, 'antispam') : (conf.antispam || false);
        const currentAction = getGroupSetting(groupId, 'antispam_action') || conf.antispam_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪsᴘᴀᴍ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antispam ᴏɴ/ᴏғғ\n${prefixe}antispam ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI TAG ====================
const antitag = {
    silacmd: "antitag",
    alias: ["tag"],
    category: "security",
    description: "Anti mass tagging - delete or kick mass tags",
    usage: "antitag on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antitag_action', actionValue);
            if (getGroupSetting(groupId, 'antitag') === null || getGroupSetting(groupId, 'antitag') === false) {
                setGroupSetting(groupId, 'antitag', true);
            }
            return repondre(`♱ ᴀɴᴛɪᴛᴀɢ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antitag', true);
            if (getGroupSetting(groupId, 'antitag_action') === null) {
                setGroupSetting(groupId, 'antitag_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪᴛᴀɢ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antitag', false);
            return repondre(`♱ ᴀɴᴛɪᴛᴀɢ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antitag') !== null ? 
            getGroupSetting(groupId, 'antitag') : (conf.antitag || false);
        const currentAction = getGroupSetting(groupId, 'antitag_action') || conf.antitag_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪᴛᴀɢ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antitag ᴏɴ/ᴏғғ\n${prefixe}antitag ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI BAD WORDS ====================
const antibadwords = {
    silacmd: "antibadwords",
    alias: ["badwords", "abw"],
    category: "security",
    description: "Anti bad words - delete or kick inappropriate language",
    usage: "antibadwords on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antibadwords_action', actionValue);
            if (getGroupSetting(groupId, 'antibadwords') === null || getGroupSetting(groupId, 'antibadwords') === false) {
                setGroupSetting(groupId, 'antibadwords', true);
            }
            return repondre(`♱ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅs ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antibadwords', true);
            if (getGroupSetting(groupId, 'antibadwords_action') === null) {
                setGroupSetting(groupId, 'antibadwords_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antibadwords', false);
            return repondre(`♱ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antibadwords') !== null ? 
            getGroupSetting(groupId, 'antibadwords') : (conf.antibadwords || false);
        const currentAction = getGroupSetting(groupId, 'antibadwords_action') || conf.antibadwords_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅs* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antibadwords ᴏɴ/ᴏғғ\n${prefixe}antibadwords ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI VIRTEX ====================
const antivirtex = {
    silacmd: "antivirtex",
    alias: ["virtex", "av"],
    category: "security",
    description: "Anti virtex - delete or kick viral messages",
    usage: "antivirtex on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antivirtex_action', actionValue);
            if (getGroupSetting(groupId, 'antivirtex') === null || getGroupSetting(groupId, 'antivirtex') === false) {
                setGroupSetting(groupId, 'antivirtex', true);
            }
            return repondre(`♱ ᴀɴᴛɪᴠɪʀᴛᴇx ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antivirtex', true);
            if (getGroupSetting(groupId, 'antivirtex_action') === null) {
                setGroupSetting(groupId, 'antivirtex_action', 'kick');
            }
            return repondre(`♱ ᴀɴᴛɪᴠɪʀᴛᴇx ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antivirtex', false);
            return repondre(`♱ ᴀɴᴛɪᴠɪʀᴛᴇx ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antivirtex') !== null ? 
            getGroupSetting(groupId, 'antivirtex') : (conf.antivirtex || false);
        const currentAction = getGroupSetting(groupId, 'antivirtex_action') || conf.antivirtex_action || 'kick';
        
        const statusText = `♱ *ᴀɴᴛɪᴠɪʀᴛᴇx* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antivirtex ᴏɴ/ᴏғғ\n${prefixe}antivirtex ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI TAG ALL ====================
const antitagall = {
    silacmd: "antitagall",
    alias: ["tagall", "everyone"],
    category: "security",
    description: "Anti @everyone/@all - delete or kick",
    usage: "antitagall on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antitagall_action', actionValue);
            if (getGroupSetting(groupId, 'antitagall') === null || getGroupSetting(groupId, 'antitagall') === false) {
                setGroupSetting(groupId, 'antitagall', true);
            }
            return repondre(`♱ ᴀɴᴛɪᴛᴀɢᴀʟʟ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antitagall', true);
            if (getGroupSetting(groupId, 'antitagall_action') === null) {
                setGroupSetting(groupId, 'antitagall_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪᴛᴀɢᴀʟʟ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antitagall', false);
            return repondre(`♱ ᴀɴᴛɪᴛᴀɢᴀʟʟ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antitagall') !== null ? 
            getGroupSetting(groupId, 'antitagall') : (conf.antitagall || false);
        const currentAction = getGroupSetting(groupId, 'antitagall_action') || conf.antitagall_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪᴛᴀɢᴀʟʟ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antitagall ᴏɴ/ᴏғғ\n${prefixe}antitagall ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI GROUP LINK ====================
const antigrouplink = {
    silacmd: "antigrouplink",
    alias: ["grouplink", "glink"],
    category: "security",
    description: "Anti external group links - delete or kick",
    usage: "antigrouplink on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antigrouplink_action', actionValue);
            if (getGroupSetting(groupId, 'antigrouplink') === null || getGroupSetting(groupId, 'antigrouplink') === false) {
                setGroupSetting(groupId, 'antigrouplink', true);
            }
            return repondre(`♱ ᴀɴᴛɪɢʀᴏᴜᴘʟɪɴᴋ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antigrouplink', true);
            if (getGroupSetting(groupId, 'antigrouplink_action') === null) {
                setGroupSetting(groupId, 'antigrouplink_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪɢʀᴏᴜᴘʟɪɴᴋ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antigrouplink', false);
            return repondre(`♱ ᴀɴᴛɪɢʀᴏᴜᴘʟɪɴᴋ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antigrouplink') !== null ? 
            getGroupSetting(groupId, 'antigrouplink') : (conf.antigrouplink || false);
        const currentAction = getGroupSetting(groupId, 'antigrouplink_action') || conf.antigrouplink_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪɢʀᴏᴜᴘʟɪɴᴋ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antigrouplink ᴏɴ/ᴏғғ\n${prefixe}antigrouplink ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI FORWARD ====================
const antiforward = {
    silacmd: "antiforward",
    alias: ["forward", "fw"],
    category: "security",
    description: "Anti forwarded messages - delete or kick",
    usage: "antiforward on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antiforward_action', actionValue);
            if (getGroupSetting(groupId, 'antiforward') === null || getGroupSetting(groupId, 'antiforward') === false) {
                setGroupSetting(groupId, 'antiforward', true);
            }
            return repondre(`♱ ᴀɴᴛɪғᴏʀᴡᴀʀᴅ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antiforward', true);
            if (getGroupSetting(groupId, 'antiforward_action') === null) {
                setGroupSetting(groupId, 'antiforward_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪғᴏʀᴡᴀʀᴅ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antiforward', false);
            return repondre(`♱ ᴀɴᴛɪғᴏʀᴡᴀʀᴅ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antiforward') !== null ? 
            getGroupSetting(groupId, 'antiforward') : (conf.antiforward || false);
        const currentAction = getGroupSetting(groupId, 'antiforward_action') || conf.antiforward_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪғᴏʀᴡᴀʀᴅ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antiforward ᴏɴ/ᴏғғ\n${prefixe}antiforward ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI BUG ====================
const antibug = {
    silacmd: "antibug",
    alias: ["bug"],
    category: "security",
    description: "Anti bug messages - delete or kick",
    usage: "antibug on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antibug_action', actionValue);
            if (getGroupSetting(groupId, 'antibug') === null || getGroupSetting(groupId, 'antibug') === false) {
                setGroupSetting(groupId, 'antibug', true);
            }
            return repondre(`♱ ᴀɴᴛɪʙᴜɢ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antibug', true);
            if (getGroupSetting(groupId, 'antibug_action') === null) {
                setGroupSetting(groupId, 'antibug_action', 'kick');
            }
            return repondre(`♱ ᴀɴᴛɪʙᴜɢ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antibug', false);
            return repondre(`♱ ᴀɴᴛɪʙᴜɢ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antibug') !== null ? 
            getGroupSetting(groupId, 'antibug') : (conf.antibug || false);
        const currentAction = getGroupSetting(groupId, 'antibug_action') || conf.antibug_action || 'kick';
        
        const statusText = `♱ *ᴀɴᴛɪʙᴜɢ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antibug ᴏɴ/ᴏғғ\n${prefixe}antibug ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI FAKE ====================
const antifake = {
    silacmd: "antifake",
    alias: ["fake"],
    category: "security",
    description: "Anti fake numbers - delete or kick non-Tanzanian numbers",
    usage: "antifake on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antifake_action', actionValue);
            if (getGroupSetting(groupId, 'antifake') === null || getGroupSetting(groupId, 'antifake') === false) {
                setGroupSetting(groupId, 'antifake', true);
            }
            return repondre(`♱ ᴀɴᴛɪғᴀᴋᴇ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antifake', true);
            if (getGroupSetting(groupId, 'antifake_action') === null) {
                setGroupSetting(groupId, 'antifake_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪғᴀᴋᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antifake', false);
            return repondre(`♱ ᴀɴᴛɪғᴀᴋᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antifake') !== null ? 
            getGroupSetting(groupId, 'antifake') : (conf.antifake || false);
        const currentAction = getGroupSetting(groupId, 'antifake_action') || conf.antifake_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪғᴀᴋᴇ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antifake ᴏɴ/ᴏғғ\n${prefixe}antifake ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI MENTION STATUS ====================
const antimentionstatus = {
    silacmd: "antimentionstatus",
    alias: ["mentions", "statusmention"],
    category: "security",
    description: "Anti status mentions - delete or kick",
    usage: "antimentionstatus on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antimentionstatus_action', actionValue);
            if (getGroupSetting(groupId, 'antimentionstatus') === null || getGroupSetting(groupId, 'antimentionstatus') === false) {
                setGroupSetting(groupId, 'antimentionstatus', true);
            }
            return repondre(`♱ ᴀɴᴛɪᴍᴇɴᴛɪᴏɴsᴛᴀᴛᴜs ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antimentionstatus', true);
            if (getGroupSetting(groupId, 'antimentionstatus_action') === null) {
                setGroupSetting(groupId, 'antimentionstatus_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪᴍᴇɴᴛɪᴏɴsᴛᴀᴛᴜs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antimentionstatus', false);
            return repondre(`♱ ᴀɴᴛɪᴍᴇɴᴛɪᴏɴsᴛᴀᴛᴜs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antimentionstatus') !== null ? 
            getGroupSetting(groupId, 'antimentionstatus') : (conf.antimentionstatus || false);
        const currentAction = getGroupSetting(groupId, 'antimentionstatus_action') || conf.antimentionstatus_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪᴍᴇɴᴛɪᴏɴsᴛᴀᴛᴜs* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antimentionstatus ᴏɴ/ᴏғғ\n${prefixe}antimentionstatus ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI EDIT ====================
const antiedit = {
    silacmd: "antiedit",
    alias: ["edit"],
    category: "security",
    description: "Anti edited messages - delete or kick",
    usage: "antiedit on/off/action <action>",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        const actionValue = args[1]?.toLowerCase();
        
        if (subCommand === 'action' && (actionValue === 'delete' || actionValue === 'kick')) {
            setGroupSetting(groupId, 'antiedit_action', actionValue);
            if (getGroupSetting(groupId, 'antiedit') === null || getGroupSetting(groupId, 'antiedit') === false) {
                setGroupSetting(groupId, 'antiedit', true);
            }
            return repondre(`♱ ᴀɴᴛɪᴇᴅɪᴛ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ: ${actionValue.toUpperCase()} ♱`);
        }
        
        if (subCommand === 'on') {
            setGroupSetting(groupId, 'antiedit', true);
            if (getGroupSetting(groupId, 'antiedit_action') === null) {
                setGroupSetting(groupId, 'antiedit_action', 'delete');
            }
            return repondre(`♱ ᴀɴᴛɪᴇᴅɪᴛ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (subCommand === 'off') {
            setGroupSetting(groupId, 'antiedit', false);
            return repondre(`♱ ᴀɴᴛɪᴇᴅɪᴛ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const isEnabled = getGroupSetting(groupId, 'antiedit') !== null ? 
            getGroupSetting(groupId, 'antiedit') : (conf.antiedit || false);
        const currentAction = getGroupSetting(groupId, 'antiedit_action') || conf.antiedit_action || 'delete';
        
        const statusText = `♱ *ᴀɴᴛɪᴇᴅɪᴛ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n⚙️ ᴀᴄᴛɪᴏɴ: ${currentAction.toUpperCase()}\n\nᴜsᴀɢᴇ:\n${prefixe}antiedit ᴏɴ/ᴏғғ\n${prefixe}antiedit ᴀᴄᴛɪᴏɴ ᴅᴇʟᴇᴛᴇ/ᴋɪᴄᴋ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI CALL ====================
const anticall = {
    silacmd: "anticall",
    alias: ["call"],
    category: "security",
    description: "Anti call - reject calls and notify caller",
    usage: "anticall on/off",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        
        if (subCommand === 'on') {
            if (isGroup) {
                setGroupSetting(groupId, 'anticall', true);
            } else {
                conf.anticall = true;
                saveGlobalSettings(conf);
            }
            return repondre(`♱ ᴀɴᴛɪᴄᴀʟʟ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ${isGroup ? 'ᴛʜɪs ɢʀᴏᴜᴘ' : 'ᴅᴍ'} ♱`);
        }
        
        if (subCommand === 'off') {
            if (isGroup) {
                setGroupSetting(groupId, 'anticall', false);
            } else {
                conf.anticall = false;
                saveGlobalSettings(conf);
            }
            return repondre(`♱ ᴀɴᴛɪᴄᴀʟʟ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ${isGroup ? 'ᴛʜɪs ɢʀᴏᴜᴘ' : 'ᴅᴍ'} ♱`);
        }
        
        const isEnabled = isGroup ? 
            (getGroupSetting(groupId, 'anticall') !== null ? getGroupSetting(groupId, 'anticall') : (conf.anticall || false)) :
            (conf.anticall || false);
        
        const statusText = `♱ *ᴀɴᴛɪᴄᴀʟʟ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n\nᴜsᴀɢᴇ:\n${prefixe}anticall ᴏɴ/ᴏғғ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== ANTI VIEWONCE ====================
const antiviewonce = {
    silacmd: "antiviewonce",
    alias: ["viewonce", "vo"],
    category: "security",
    description: "Anti view once - save view-once messages",
    usage: "antiviewonce on/off",
    
    async function(from, conn, { repondre, args, silaConfig, prefixe, ms, isOwner, isSudo, isAdmin }) {
        const conf = getGlobalSettings();
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        const subCommand = args[0]?.toLowerCase();
        
        if (subCommand === 'on') {
            if (isGroup) {
                setGroupSetting(groupId, 'antiviewonce', true);
            } else {
                conf.antiviewonce = true;
                saveGlobalSettings(conf);
            }
            return repondre(`♱ ᴀɴᴛɪᴠɪᴇᴡᴏɴᴄᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ♱\n\n👁️ ᴠɪᴇᴡ-ᴏɴᴄᴇ ᴍᴇssᴀɢᴇs ᴡɪʟʟ ʙᴇ sᴀᴠᴇᴅ ᴀɴᴅ ғᴏʀᴡᴀʀᴅᴇᴅ ᴛᴏ ᴏᴡɴᴇʀ`);
        }
        
        if (subCommand === 'off') {
            if (isGroup) {
                setGroupSetting(groupId, 'antiviewonce', false);
            } else {
                conf.antiviewonce = false;
                saveGlobalSettings(conf);
            }
            return repondre(`♱ ᴀɴᴛɪᴠɪᴇᴡᴏɴᴄᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ♱`);
        }
        
        const isEnabled = isGroup ? 
            (getGroupSetting(groupId, 'antiviewonce') !== null ? getGroupSetting(groupId, 'antiviewonce') : (conf.antiviewonce || false)) :
            (conf.antiviewonce || false);
        
        const statusText = `♱ *ᴀɴᴛɪᴠɪᴇᴡᴏɴᴄᴇ* ♱\n\n📌 sᴛᴀᴛᴜs: ${isEnabled ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n\nᴜsᴀɢᴇ:\n${prefixe}antiviewonce ᴏɴ/ᴏғғ`;
        
        await conn.sendMessage(from, {
            text: statusText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== EXPORT ALL COMMANDS ====================
module.exports = [
    securityMenu,
    securitymenu,
    resetsecurity,
    antispam,
    antitag,
    antibadwords,
    antivirtex,
    antitagall,
    antigrouplink,
    antiforward,
    antibug,
    antifake,
    antimentionstatus,
    antiedit,
    anticall,
    antiviewonce
];