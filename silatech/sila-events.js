// silatech/events.js
// Group Events Commands - Welcome, Goodbye, Promote, Demote, Group Updates

const fs = require('fs');
const path = require('path');

// Paths
const eventsSettingsPath = './silatz/events-settings.json';

// Helper functions for events settings
function loadEventsSettings() {
    if (!fs.existsSync(eventsSettingsPath)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(eventsSettingsPath));
    } catch (e) {
        return {};
    }
}

function saveEventsSettings(settings) {
    const dir = path.dirname(eventsSettingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(eventsSettingsPath, JSON.stringify(settings, null, 2));
}

function getEventSetting(groupId, feature) {
    const settings = loadEventsSettings();
    if (!settings[groupId]) return null;
    return settings[groupId][feature];
}

function setEventSetting(groupId, feature, value) {
    const settings = loadEventsSettings();
    if (!settings[groupId]) settings[groupId] = {};
    settings[groupId][feature] = value;
    saveEventsSettings(settings);
    return true;
}

function getEventMessage(groupId, eventType) {
    const settings = loadEventsSettings();
    if (settings[groupId] && settings[groupId][`${eventType}_message`]) {
        return settings[groupId][`${eventType}_message`];
    }
    return null;
}

function setEventMessage(groupId, eventType, message) {
    const settings = loadEventsSettings();
    if (!settings[groupId]) settings[groupId] = {};
    settings[groupId][`${eventType}_message`] = message;
    saveEventsSettings(settings);
    return true;
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

// ==================== EVENTS MENU ====================
const eventsmenu = {
    silacmd: "eventsmenu",
    alias: ["evmenu", "eventmenu"],
    category: "group",
    description: "Show group events menu",
    usage: "eventsmenu",
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        // Get current settings
        const welcome = getEventSetting(groupId, 'welcome') !== null ? getEventSetting(groupId, 'welcome') : true;
        const goodbye = getEventSetting(groupId, 'goodbye') !== null ? getEventSetting(groupId, 'goodbye') : true;
        const adminEvents = getEventSetting(groupId, 'admin_events') !== null ? getEventSetting(groupId, 'admin_events') : true;
        const groupUpdates = getEventSetting(groupId, 'group_updates') !== null ? getEventSetting(groupId, 'group_updates') : true;
        
        let menuText = `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱           ${botConfig.mainSymbol} *ɢʀᴏᴜᴘ ᴇᴠᴇɴᴛs* ${botConfig.mainSymbol}           ♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱\n\n`;
        
        menuText += `📌 *ᴄᴜʀʀᴇɴᴛ sᴇᴛᴛɪɴɢs*\n\n`;
        menuText += `${welcome ? '✅' : '❌'} *ᴡᴇʟᴄᴏᴍᴇ* - Sends welcome message when someone joins\n`;
        menuText += `${goodbye ? '✅' : '❌'} *ɢᴏᴏᴅʙʏᴇ* - Sends goodbye message when someone leaves\n`;
        menuText += `${adminEvents ? '✅' : '❌'} *ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛs* - Sends promote/demote messages\n`;
        menuText += `${groupUpdates ? '✅' : '❌'} *ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇs* - Sends group settings change messages\n\n`;
        
        menuText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        menuText += `📌 *ᴄᴏᴍᴍᴀɴᴅs*\n\n`;
        
        menuText += `┌── *ᴇɴᴀʙʟᴇ/ᴅɪsᴀʙʟᴇ*\n`;
        menuText += `│  ${prefixe}welcome on/off\n`;
        menuText += `│  ${prefixe}goodbye on/off\n`;
        menuText += `│  ${prefixe}adminevents on/off\n`;
        menuText += `│  ${prefixe}groupupdates on/off\n`;
        menuText += `│  ${prefixe}events on/off - Enable/disable all events\n`;
        menuText += `│\n`;
        
        menuText += `├── *sᴇᴛ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇs*\n`;
        menuText += `│  ${prefixe}setwelcome <message>\n`;
        menuText += `│  ${prefixe}setgoodbye <message>\n`;
        menuText += `│  ${prefixe}setpromote <message>\n`;
        menuText += `│  ${prefixe}setdemote <message>\n`;
        menuText += `│  ${prefixe}setgroupupdate <message>\n`;
        menuText += `│\n`;
        
        menuText += `├── *ᴠᴀʀɪᴀʙʟᴇs*\n`;
        menuText += `│  {botSymbol} - Bot symbol (${botConfig.mainSymbol})\n`;
        menuText += `│  {user} - Mention user (@number)\n`;
        menuText += `│  {username} - User's name\n`;
        menuText += `│  {count} - Member count\n`;
        menuText += `│  {groupName} - Group name\n`;
        menuText += `│  {by} - Who made the change\n`;
        menuText += `│  {change} - What changed\n`;
        menuText += `│\n`;
        
        menuText += `└── *ᴏᴛʜᴇʀ*\n`;
        menuText += `   ${prefixe}resetevents - ʀᴇsᴇᴛ ᴀʟʟ ᴇᴠᴇɴᴛs ᴛᴏ ᴅᴇғᴀᴜʟᴛ\n`;
        menuText += `   ${prefixe}eventsmenu - sʜᴏᴡ ᴛʜɪs ᴍᴇɴᴜ\n\n`;
        
        menuText += `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱           ᴘᴏᴡᴇʀᴇᴅ ʙʏ ♱ 𝐒𝐈𝐋𝐀 ♱           ♱\n`;
        menuText += `♱                                                              ♱\n`;
        menuText += `♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱♱`;
        
        await conn.sendMessage(from, {
            text: menuText,
            contextInfo: getContextInfo(ms.sender, botConfig)
        }, { quoted: ms });
    }
};

// ==================== WELCOME COMMAND ====================
const welcome = {
    silacmd: "welcome",
    alias: ["wel"],
    category: "group",
    description: "Enable/disable welcome messages",
    usage: "welcome on/off",
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        const status = args[0]?.toLowerCase();
        
        if (status === 'on') {
            setEventSetting(groupId, 'welcome', true);
            return repondre(`♱ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (status === 'off') {
            setEventSetting(groupId, 'welcome', false);
            return repondre(`♱ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const current = getEventSetting(groupId, 'welcome') !== null ? getEventSetting(groupId, 'welcome') : true;
        return repondre(`♱ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs: ${current ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n\nᴜsᴀɢᴇ: ${args[2]?.prefixe || '.'}welcome ᴏɴ/ᴏғғ`);
    }
};

// ==================== GOODBYE COMMAND ====================
const goodbye = {
    silacmd: "goodbye",
    alias: ["bye", "gb"],
    category: "group",
    description: "Enable/disable goodbye messages",
    usage: "goodbye on/off",
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        const status = args[0]?.toLowerCase();
        
        if (status === 'on') {
            setEventSetting(groupId, 'goodbye', true);
            return repondre(`♱ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (status === 'off') {
            setEventSetting(groupId, 'goodbye', false);
            return repondre(`♱ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const current = getEventSetting(groupId, 'goodbye') !== null ? getEventSetting(groupId, 'goodbye') : true;
        return repondre(`♱ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs: ${current ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n\nᴜsᴀɢᴇ: ${args[2]?.prefixe || '.'}goodbye ᴏɴ/ᴏғғ`);
    }
};

// ==================== ADMIN EVENTS COMMAND ====================
const adminevents = {
    silacmd: "adminevents",
    alias: ["adminev", "promotevent"],
    category: "group",
    description: "Enable/disable admin events (promote/demote)",
    usage: "adminevents on/off",
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        const status = args[0]?.toLowerCase();
        
        if (status === 'on') {
            setEventSetting(groupId, 'admin_events', true);
            return repondre(`♱ ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛs (ᴘʀᴏᴍᴏᴛᴇ/ᴅᴇᴍᴏᴛᴇ) ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (status === 'off') {
            setEventSetting(groupId, 'admin_events', false);
            return repondre(`♱ ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛs (ᴘʀᴏᴍᴏᴛᴇ/ᴅᴇᴍᴏᴛᴇ) ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const current = getEventSetting(groupId, 'admin_events') !== null ? getEventSetting(groupId, 'admin_events') : true;
        return repondre(`♱ ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛs: ${current ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n\nᴜsᴀɢᴇ: ${args[2]?.prefixe || '.'}adminevents ᴏɴ/ᴏғғ`);
    }
};

// ==================== GROUP UPDATES COMMAND ====================
const groupupdates = {
    silacmd: "groupupdates",
    alias: ["groupupd", "gupdates"],
    category: "group",
    description: "Enable/disable group update messages",
    usage: "groupupdates on/off",
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        const status = args[0]?.toLowerCase();
        
        if (status === 'on') {
            setEventSetting(groupId, 'group_updates', true);
            return repondre(`♱ ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (status === 'off') {
            setEventSetting(groupId, 'group_updates', false);
            return repondre(`♱ ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const current = getEventSetting(groupId, 'group_updates') !== null ? getEventSetting(groupId, 'group_updates') : true;
        return repondre(`♱ ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇs: ${current ? '✅ ᴇɴᴀʙʟᴇᴅ' : '❌ ᴅɪsᴀʙʟᴇᴅ'}\n\nᴜsᴀɢᴇ: ${args[2]?.prefixe || '.'}groupupdates ᴏɴ/ᴏғғ`);
    }
};

// ==================== EVENTS ALL COMMAND ====================
const events = {
    silacmd: "events",
    alias: ["allevents"],
    category: "group",
    description: "Enable/disable all group events at once",
    usage: "events on/off",
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        const status = args[0]?.toLowerCase();
        
        if (status === 'on') {
            setEventSetting(groupId, 'welcome', true);
            setEventSetting(groupId, 'goodbye', true);
            setEventSetting(groupId, 'admin_events', true);
            setEventSetting(groupId, 'group_updates', true);
            return repondre(`♱ ᴀʟʟ ɢʀᴏᴜᴘ ᴇᴠᴇɴᴛs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        if (status === 'off') {
            setEventSetting(groupId, 'welcome', false);
            setEventSetting(groupId, 'goodbye', false);
            setEventSetting(groupId, 'admin_events', false);
            setEventSetting(groupId, 'group_updates', false);
            return repondre(`♱ ᴀʟʟ ɢʀᴏᴜᴘ ᴇᴠᴇɴᴛs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ ғᴏʀ ᴛʜɪs ɢʀᴏᴜᴘ ♱`);
        }
        
        const welcomeStatus = getEventSetting(groupId, 'welcome') !== null ? getEventSetting(groupId, 'welcome') : true;
        const goodbyeStatus = getEventSetting(groupId, 'goodbye') !== null ? getEventSetting(groupId, 'goodbye') : true;
        const adminStatus = getEventSetting(groupId, 'admin_events') !== null ? getEventSetting(groupId, 'admin_events') : true;
        const groupStatus = getEventSetting(groupId, 'group_updates') !== null ? getEventSetting(groupId, 'group_updates') : true;
        
        return repondre(`♱ *ɢʀᴏᴜᴘ ᴇᴠᴇɴᴛs sᴛᴀᴛᴜs* ♱\n\nᴡᴇʟᴄᴏᴍᴇ: ${welcomeStatus ? '✅' : '❌'}\nɢᴏᴏᴅʙʏᴇ: ${goodbyeStatus ? '✅' : '❌'}\nᴀᴅᴍɪɴ ᴇᴠᴇɴᴛs: ${adminStatus ? '✅' : '❌'}\nɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇs: ${groupStatus ? '✅' : '❌'}\n\nᴜsᴀɢᴇ: ${args[2]?.prefixe || '.'}events ᴏɴ/ᴏғғ`);
    }
};

// ==================== RESET EVENTS COMMAND ====================
const resetevents = {
    silacmd: "resetevents",
    alias: ["resetevent"],
    category: "owner",
    description: "Reset all group events to default",
    usage: "resetevents",
    owner: true,
    
    async function(from, conn, { repondre, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        // Reset all event settings to default (null = use default)
        setEventSetting(groupId, 'welcome', null);
        setEventSetting(groupId, 'goodbye', null);
        setEventSetting(groupId, 'admin_events', null);
        setEventSetting(groupId, 'group_updates', null);
        
        // Reset custom messages
        const settings = loadEventsSettings();
        if (settings[groupId]) {
            delete settings[groupId].welcome_message;
            delete settings[groupId].goodbye_message;
            delete settings[groupId].promote_message;
            delete settings[groupId].demote_message;
            delete settings[groupId].group_update_message;
            saveEventsSettings(settings);
        }
        
        return repondre(`♱ ᴀʟʟ ɢʀᴏᴜᴘ ᴇᴠᴇɴᴛs ʜᴀᴠᴇ ʙᴇᴇɴ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ sᴇᴛᴛɪɴɢs ♱`);
    }
};

// ==================== SET WELCOME MESSAGE ====================
const setwelcome = {
    silacmd: "setwelcome",
    alias: ["setwel"],
    category: "owner",
    description: "Set custom welcome message",
    usage: "setwelcome <message>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!args.length) {
            const current = getEventMessage(groupId, 'welcome');
            if (current) {
                return repondre(`♱ ᴄᴜʀʀᴇɴᴛ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇ:\n\n${current}\n\nᴜsᴇ ${args[2]?.prefixe || '.'}setwelcome ʀᴇsᴇᴛ ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ`);
            } else {
                return repondre(`♱ ᴜsɪɴɢ ᴅᴇғᴀᴜʟᴛ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇ\n\nᴛᴏ sᴇᴛ ᴄᴜsᴛᴏᴍ: ${args[2]?.prefixe || '.'}setwelcome <ʏᴏᴜʀ ᴍᴇssᴀɢᴇ>\n\nᴀᴠᴀɪʟᴀʙʟᴇ ᴠᴀʀɪᴀʙʟᴇs:\n{botSymbol}, {user}, {username}, {count}, {groupName}`);
            }
        }
        
        const message = args.join(' ');
        
        if (message.toLowerCase() === 'reset') {
            const settings = loadEventsSettings();
            if (settings[groupId]) {
                delete settings[groupId].welcome_message;
                saveEventsSettings(settings);
            }
            return repondre(`♱ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ ♱`);
        }
        
        setEventMessage(groupId, 'welcome', message);
        return repondre(`♱ ᴄᴜsᴛᴏᴍ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇ sᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ! ♱\n\n${message}`);
    }
};

// ==================== SET GOODBYE MESSAGE ====================
const setgoodbye = {
    silacmd: "setgoodbye",
    alias: ["setbye"],
    category: "owner",
    description: "Set custom goodbye message",
    usage: "setgoodbye <message>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!args.length) {
            const current = getEventMessage(groupId, 'goodbye');
            if (current) {
                return repondre(`♱ ᴄᴜʀʀᴇɴᴛ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇ:\n\n${current}\n\nᴜsᴇ ${args[2]?.prefixe || '.'}setgoodbye ʀᴇsᴇᴛ ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ`);
            } else {
                return repondre(`♱ ᴜsɪɴɢ ᴅᴇғᴀᴜʟᴛ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇ\n\nᴛᴏ sᴇᴛ ᴄᴜsᴛᴏᴍ: ${args[2]?.prefixe || '.'}setgoodbye <ʏᴏᴜʀ ᴍᴇssᴀɢᴇ>\n\nᴀᴠᴀɪʟᴀʙʟᴇ ᴠᴀʀɪᴀʙʟᴇs:\n{botSymbol}, {user}, {username}, {count}, {groupName}`);
            }
        }
        
        const message = args.join(' ');
        
        if (message.toLowerCase() === 'reset') {
            const settings = loadEventsSettings();
            if (settings[groupId]) {
                delete settings[groupId].goodbye_message;
                saveEventsSettings(settings);
            }
            return repondre(`♱ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ ♱`);
        }
        
        setEventMessage(groupId, 'goodbye', message);
        return repondre(`♱ ᴄᴜsᴛᴏᴍ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇ sᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ! ♱\n\n${message}`);
    }
};

// ==================== SET PROMOTE MESSAGE ====================
const setpromote = {
    silacmd: "setpromote",
    alias: ["setprom"],
    category: "owner",
    description: "Set custom promote message",
    usage: "setpromote <message>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!args.length) {
            const current = getEventMessage(groupId, 'promote');
            if (current) {
                return repondre(`♱ ᴄᴜʀʀᴇɴᴛ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ:\n\n${current}\n\nᴜsᴇ ${args[2]?.prefixe || '.'}setpromote ʀᴇsᴇᴛ ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ`);
            } else {
                return repondre(`♱ ᴜsɪɴɢ ᴅᴇғᴀᴜʟᴛ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ\n\nᴛᴏ sᴇᴛ ᴄᴜsᴛᴏᴍ: ${args[2]?.prefixe || '.'}setpromote <ʏᴏᴜʀ ᴍᴇssᴀɢᴇ>\n\nᴀᴠᴀɪʟᴀʙʟᴇ ᴠᴀʀɪᴀʙʟᴇs:\n{botSymbol}, {user}, {groupName}`);
            }
        }
        
        const message = args.join(' ');
        
        if (message.toLowerCase() === 'reset') {
            const settings = loadEventsSettings();
            if (settings[groupId]) {
                delete settings[groupId].promote_message;
                saveEventsSettings(settings);
            }
            return repondre(`♱ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ ♱`);
        }
        
        setEventMessage(groupId, 'promote', message);
        return repondre(`♱ ᴄᴜsᴛᴏᴍ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ sᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ! ♱\n\n${message}`);
    }
};

// ==================== SET DEMOTE MESSAGE ====================
const setdemote = {
    silacmd: "setdemote",
    alias: ["setdemo"],
    category: "owner",
    description: "Set custom demote message",
    usage: "setdemote <message>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!args.length) {
            const current = getEventMessage(groupId, 'demote');
            if (current) {
                return repondre(`♱ ᴄᴜʀʀᴇɴᴛ ᴅᴇᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ:\n\n${current}\n\nᴜsᴇ ${args[2]?.prefixe || '.'}setdemote ʀᴇsᴇᴛ ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ`);
            } else {
                return repondre(`♱ ᴜsɪɴɢ ᴅᴇғᴀᴜʟᴛ ᴅᴇᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ\n\nᴛᴏ sᴇᴛ ᴄᴜsᴛᴏᴍ: ${args[2]?.prefixe || '.'}setdemote <ʏᴏᴜʀ ᴍᴇssᴀɢᴇ>\n\nᴀᴠᴀɪʟᴀʙʟᴇ ᴠᴀʀɪᴀʙʟᴇs:\n{botSymbol}, {user}, {groupName}`);
            }
        }
        
        const message = args.join(' ');
        
        if (message.toLowerCase() === 'reset') {
            const settings = loadEventsSettings();
            if (settings[groupId]) {
                delete settings[groupId].demote_message;
                saveEventsSettings(settings);
            }
            return repondre(`♱ ᴅᴇᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ ♱`);
        }
        
        setEventMessage(groupId, 'demote', message);
        return repondre(`♱ ᴄᴜsᴛᴏᴍ ᴅᴇᴍᴏᴛᴇ ᴍᴇssᴀɢᴇ sᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ! ♱\n\n${message}`);
    }
};

// ==================== SET GROUP UPDATE MESSAGE ====================
const setgroupupdate = {
    silacmd: "setgroupupdate",
    alias: ["setgupd", "setupdate"],
    category: "owner",
    description: "Set custom group update message",
    usage: "setgroupupdate <message>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, ms, isOwner, isSudo, isAdmin }) {
        const isGroup = from.includes('g.us');
        const groupId = isGroup ? from : null;
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        const hasPermission = isOwner || isSudo || (isGroup && isAdmin);
        if (!hasPermission) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴀᴅᴍɪɴs! ♱`);
        }
        
        if (!args.length) {
            const current = getEventMessage(groupId, 'group_update');
            if (current) {
                return repondre(`♱ ᴄᴜʀʀᴇɴᴛ ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇ ᴍᴇssᴀɢᴇ:\n\n${current}\n\nᴜsᴇ ${args[2]?.prefixe || '.'}setgroupupdate ʀᴇsᴇᴛ ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴄᴜsᴛᴏᴍ ᴍᴇssᴀɢᴇ`);
            } else {
                return repondre(`♱ ᴜsɪɴɢ ᴅᴇғᴀᴜʟᴛ ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇ ᴍᴇssᴀɢᴇ\n\nᴛᴏ sᴇᴛ ᴄᴜsᴛᴏᴍ: ${args[2]?.prefixe || '.'}setgroupupdate <ʏᴏᴜʀ ᴍᴇssᴀɢᴇ>\n\nᴀᴠᴀɪʟᴀʙʟᴇ ᴠᴀʀɪᴀʙʟᴇs:\n{botSymbol}, {by}, {change}, {groupId}`);
            }
        }
        
        const message = args.join(' ');
        
        if (message.toLowerCase() === 'reset') {
            const settings = loadEventsSettings();
            if (settings[groupId]) {
                delete settings[groupId].group_update_message;
                saveEventsSettings(settings);
            }
            return repondre(`♱ ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇ ᴍᴇssᴀɢᴇ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ ♱`);
        }
        
        setEventMessage(groupId, 'group_update', message);
        return repondre(`♱ ᴄᴜsᴛᴏᴍ ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇ ᴍᴇssᴀɢᴇ sᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ! ♱\n\n${message}`);
    }
};

// ==================== EXPORT ALL COMMANDS ====================
module.exports = [
    eventsmenu,
    welcome,
    goodbye,
    adminevents,
    groupupdates,
    events,
    resetevents,
    setwelcome,
    setgoodbye,
    setpromote,
    setdemote,
    setgroupupdate
];