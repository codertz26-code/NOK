// sila/antilink.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Path for antilink settings
const antilinkPath = path.join(__dirname, '..', 'silatz', 'antilink.json');

// Ensure directory exists
const antilinkDir = path.dirname(antilinkPath);
if (!fs.existsSync(antilinkDir)) {
    fs.mkdirSync(antilinkDir, { recursive: true });
}

// Initialize antilink file if not exists
if (!fs.existsSync(antilinkPath)) {
    fs.writeFileSync(antilinkPath, JSON.stringify({}, null, 2));
}

// Global warnings storage
global.antilinkWarnings = global.antilinkWarnings || new Map();

// Load antilink settings
const getAntilinkSettings = () => {
    try {
        if (fs.existsSync(antilinkPath)) {
            return JSON.parse(fs.readFileSync(antilinkPath));
        }
        return {};
    } catch (err) {
        return {};
    }
};

// Save antilink settings
const saveAntilinkSettings = (data) => {
    fs.writeFileSync(antilinkPath, JSON.stringify(data, null, 2));
};

// Check if antilink is enabled for a group
const isAntilinkEnabled = (groupId) => {
    const settings = getAntilinkSettings();
    return settings[groupId] === true;
};

// Enable/disable antilink for a group
const setAntilink = (groupId, enabled) => {
    const settings = getAntilinkSettings();
    if (enabled) {
        settings[groupId] = true;
    } else {
        delete settings[groupId];
    }
    saveAntilinkSettings(settings);
};

// Check if message contains link
const containsLink = (text) => {
    if (!text) return false;
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|gov|edu|co|tz|uk|us|info|xyz|me|io|app|dev|site|online|tech|link|live|club|space|website|web|blog|news|media|tv|video|photo|image|file|download|music|movie|game|shop|store|market|buy|sell|deal|coupon|offer|promo|code|link|url|http|https))/gi;
    return linkRegex.test(text);
};

// Check if link is whitelisted
const isWhitelistedLink = (text) => {
    if (!text) return false;
    const whitelist = config.LINK_WHITELIST.split(',');
    for (const domain of whitelist) {
        if (text.toLowerCase().includes(domain.toLowerCase())) {
            return true;
        }
    }
    return false;
};

// Get warning count for user
const getWarnCount = (groupId, userId) => {
    const key = `${groupId}|${userId}`;
    return global.antilinkWarnings.get(key) || 0;
};

// Increase warning count
const addWarn = (groupId, userId) => {
    const key = `${groupId}|${userId}`;
    const current = getWarnCount(groupId, userId);
    global.antilinkWarnings.set(key, current + 1);
    return current + 1;
};

// Reset warning count
const resetWarn = (groupId, userId) => {
    const key = `${groupId}|${userId}`;
    global.antilinkWarnings.delete(key);
};

// Clear all warnings for a group
const clearGroupWarnings = (groupId) => {
    for (const [key, value] of global.antilinkWarnings.entries()) {
        if (key.startsWith(`${groupId}|`)) {
            global.antilinkWarnings.delete(key);
        }
    }
};

// Handle antilink action
const handleAntilink = async (sila, from, msg, sender, senderNumber, conf) => {
    if (!from.includes('g.us')) return false;
    if (!conf.antilink) return false;
    if (msg.key.fromMe) return false;
    
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";
    
    if (containsLink(body) && !isWhitelistedLink(body)) {
        // Check if sender is admin
        let isAdmin = false;
        try {
            const groupMetadata = await sila.groupMetadata(from);
            const participants = groupMetadata.participants;
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const participant = participants.find(p => p.id === senderJid);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (err) {}
        
        // Check if sender is authorized (owner, sudo, premium)
        const { isOwner, isSudo, isPremium } = require('../index');
        const isAuthorized = isOwner(senderNumber) || isSudo(senderNumber) || isPremium(senderNumber);
        
        if (!isAdmin && !isAuthorized) {
            const warnCount = addWarn(from, senderNumber);
            const remaining = config.LINK_WARN_LIMIT - warnCount;
            
            // Delete the message
            await sila.sendMessage(from, { delete: msg.key });
            
            // Send warning
            let warningMsg = `⚠️ *ANTI-LINK WARNING* ⚠️\n\n`;
            warningMsg += `@${senderNumber} you are not allowed to send links in this group!\n\n`;
            warningMsg += `📝 *Warning:* ${warnCount}/${config.LINK_WARN_LIMIT}\n`;
            
            if (remaining <= 0) {
                // Take action based on config
                if (config.LINK_ACTION === 'kick') {
                    await sila.groupParticipantsUpdate(from, [sender], 'remove');
                    warningMsg += `\n❌ *Action:* You have been removed from the group!`;
                    resetWarn(from, senderNumber);
                } else if (config.LINK_ACTION === 'mute') {
                    await sila.groupParticipantsUpdate(from, [sender], 'demote');
                    warningMsg += `\n🔇 *Action:* You have been muted! Contact admin to be unmuted.`;
                } else {
                    warningMsg += `\n⚠️ *Final Warning:* Next time action will be taken!`;
                }
            } else {
                warningMsg += `\n⚠️ *Remaining warnings:* ${remaining}`;
                warningMsg += `\n📌 *Action:* Message deleted. Don't send links again!`;
            }
            
            await sila.sendMessage(from, { text: warningMsg, mentions: [sender] });
            return true;
        }
    }
    return false;
};

module.exports = {
    getAntilinkSettings,
    saveAntilinkSettings,
    isAntilinkEnabled,
    setAntilink,
    containsLink,
    isWhitelistedLink,
    getWarnCount,
    addWarn,
    resetWarn,
    clearGroupWarnings,
    handleAntilink
};