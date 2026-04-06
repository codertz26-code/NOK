// sila/sila-functions.js
// Central functions for NOCTURNAL-MD Bot

const fs = require('fs');
const path = require('path');
const config = require('../config');

// ==================== LOAD CONFIGURATION ====================
let botIdentity = null;
let silaConfig = null;

function setConfig(configInstance) {
    silaConfig = configInstance;
    botIdentity = configInstance.getBotConfig();
}

// ==================== FONT FUNCTIONS ====================
const smallFont = (text) => {
    if (!silaConfig) return text;
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

function getAllGroupSettings(groupId) {
    const settings = loadGroupSettings();
    return settings[groupId] || {};
}

function deleteGroupSetting(groupId, feature) {
    const settings = loadGroupSettings();
    if (settings[groupId] && settings[groupId][feature]) {
        delete settings[groupId][feature];
        saveGroupSettings(settings);
        return true;
    }
    return false;
}

function deleteAllGroupSettings(groupId) {
    const settings = loadGroupSettings();
    if (settings[groupId]) {
        delete settings[groupId];
        saveGroupSettings(settings);
        return true;
    }
    return false;
}

// ==================== WARNINGS SYSTEM ====================
const userWarnings = new Map();

function addWarning(groupId, userId) {
    const key = `${groupId}|${userId}`;
    const current = userWarnings.get(key) || 0;
    userWarnings.set(key, current + 1);
    return current + 1;
}

function getWarnings(groupId, userId) {
    return userWarnings.get(`${groupId}|${userId}`) || 0;
}

function resetWarnings(groupId, userId) {
    userWarnings.delete(`${groupId}|${userId}`);
}

function clearGroupWarnings(groupId) {
    for (const [key] of userWarnings.entries()) {
        if (key.startsWith(`${groupId}|`)) userWarnings.delete(key);
    }
}

function getAllWarnings() {
    const warnings = {};
    for (const [key, value] of userWarnings.entries()) {
        warnings[key] = value;
    }
    return warnings;
}

// ==================== MUTE SYSTEM ====================
const mutedUsers = new Map();

function muteUser(userId, durationMs = null) {
    if (durationMs) {
        mutedUsers.set(userId, Date.now() + durationMs);
    } else {
        mutedUsers.set(userId, Infinity);
    }
    return true;
}

function unmuteUser(userId) {
    return mutedUsers.delete(userId);
}

function isUserMuted(userId) {
    if (!mutedUsers.has(userId)) return false;
    const muteUntil = mutedUsers.get(userId);
    if (Date.now() > muteUntil) {
        mutedUsers.delete(userId);
        return false;
    }
    return true;
}

function getMutedUsers() {
    const mutes = {};
    for (const [key, value] of mutedUsers.entries()) {
        mutes[key] = value === Infinity ? 'Permanent' : new Date(value).toISOString();
    }
    return mutes;
}

// ==================== ADMIN CHECK ====================
async function isUserAdmin(conn, groupId, userId) {
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (e) {
        return false;
    }
}

async function isUserSuperAdmin(conn, groupId, userId) {
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant && participant.admin === 'superadmin';
    } catch (e) {
        return false;
    }
}

async function getGroupAdmins(conn, groupId) {
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        return groupMetadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id);
    } catch (e) {
        return [];
    }
}

async function getGroupMembers(conn, groupId) {
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        return groupMetadata.participants.map(p => p.id);
    } catch (e) {
        return [];
    }
}

async function isUserInGroup(conn, groupId, userId) {
    try {
        const members = await getGroupMembers(conn, groupId);
        return members.includes(userId);
    } catch (e) {
        return false;
    }
}

// ==================== MESSAGE HELPERS ====================
function getMessageBody(msg) {
    return msg.message?.conversation 
        || msg.message?.extendedTextMessage?.text 
        || msg.message?.buttonsResponseMessage?.selectedButtonId 
        || msg.message?.imageMessage?.caption 
        || msg.message?.videoMessage?.caption 
        || msg.message?.documentMessage?.caption
        || "";
}

function getMessageType(msg) {
    if (msg.message?.conversation) return 'text';
    if (msg.message?.extendedTextMessage) return 'text';
    if (msg.message?.imageMessage) return 'image';
    if (msg.message?.videoMessage) return 'video';
    if (msg.message?.audioMessage) return 'audio';
    if (msg.message?.documentMessage) return 'document';
    if (msg.message?.stickerMessage) return 'sticker';
    if (msg.message?.contactMessage) return 'contact';
    if (msg.message?.locationMessage) return 'location';
    if (msg.message?.buttonsMessage) return 'buttons';
    if (msg.message?.templateMessage) return 'template';
    if (msg.message?.listMessage) return 'list';
    if (msg.message?.viewOnceMessage) return 'viewonce';
    if (msg.message?.viewOnceMessageV2) return 'viewonce';
    if (msg.message?.pollCreationMessage) return 'poll';
    return 'unknown';
}

function getQuotedMessage(msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return null;
    return {
        message: quoted,
        sender: msg.message?.extendedTextMessage?.contextInfo?.participant,
        type: getMessageType({ message: quoted })
    };
}

// ==================== NUMBER FORMATTING ====================
function formatNumber(number) {
    if (!number) return '';
    return number.toString().replace(/[^0-9]/g, '');
}

function getJid(number) {
    const formatted = formatNumber(number);
    return `${formatted}@s.whatsapp.net`;
}

function extractNumberFromJid(jid) {
    if (!jid) return '';
    return jid.split('@')[0];
}

// ==================== TIME HELPERS ====================
function formatDuration(ms) {
    if (ms === Infinity) return 'Permanent';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

function parseDuration(input) {
    const match = input.match(/^(\d+)([smhdw])$/i);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch(unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

function getTimeRemaining(expiryDate) {
    const remaining = expiryDate - Date.now();
    if (remaining <= 0) return 'Expired';
    return formatDuration(remaining);
}

// ==================== PERMISSION HELPERS ====================
function isOwner(senderNumber, ownerNumbers) {
    const owners = Array.isArray(ownerNumbers) ? ownerNumbers : [ownerNumbers];
    return owners.includes(senderNumber);
}

function isSudo(senderNumber, sudoUsers) {
    return sudoUsers.includes(senderNumber);
}

function isPremium(senderNumber, premiumUsers) {
    return premiumUsers.includes(senderNumber);
}

function getUserLevel(senderNumber, ownerNumbers, sudoUsers, premiumUsers) {
    if (isOwner(senderNumber, ownerNumbers)) return 'owner';
    if (isSudo(senderNumber, sudoUsers)) return 'sudo';
    if (isPremium(senderNumber, premiumUsers)) return 'premium';
    return 'user';
}

function getUserLevelEmoji(level) {
    switch(level) {
        case 'owner': return '👑';
        case 'sudo': return '⚡';
        case 'premium': return '💎';
        default: return '👤';
    }
}

// ==================== RESPONSE HELPERS ====================
async function sendMessage(conn, jid, text, quoted = null, mentions = []) {
    const options = {
        text: smallFont(text)
    };
    
    if (quoted) options.quoted = quoted;
    if (mentions.length > 0) {
        options.mentions = mentions;
        options.contextInfo = { mentionedJid: mentions };
    }
    
    return await conn.sendMessage(jid, options);
}

async function sendReply(conn, msg, text) {
    const from = msg.key.remoteJid;
    return await sendMessage(conn, from, text, msg);
}

async function sendReact(conn, msg, emoji) {
    const from = msg.key.remoteJid;
    return await conn.sendMessage(from, {
        react: { text: emoji, key: msg.key }
    });
}

async function sendImage(conn, jid, buffer, caption = '', quoted = null) {
    const options = {
        image: buffer,
        caption: smallFont(caption)
    };
    if (quoted) options.quoted = quoted;
    return await conn.sendMessage(jid, options);
}

async function sendVideo(conn, jid, buffer, caption = '', quoted = null) {
    const options = {
        video: buffer,
        caption: smallFont(caption)
    };
    if (quoted) options.quoted = quoted;
    return await conn.sendMessage(jid, options);
}

async function sendAudio(conn, jid, buffer, quoted = null, ptt = false) {
    const options = {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: ptt
    };
    if (quoted) options.quoted = quoted;
    return await conn.sendMessage(jid, options);
}

async function sendSticker(conn, jid, buffer, quoted = null) {
    const options = {
        sticker: buffer
    };
    if (quoted) options.quoted = quoted;
    return await conn.sendMessage(jid, options);
}

// ==================== GROUP ACTION HELPERS ====================
async function kickUser(conn, groupId, userId) {
    return await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
}

async function addUser(conn, groupId, userId) {
    return await conn.groupParticipantsUpdate(groupId, [userId], 'add');
}

async function promoteUser(conn, groupId, userId) {
    return await conn.groupParticipantsUpdate(groupId, [userId], 'promote');
}

async function demoteUser(conn, groupId, userId) {
    return await conn.groupParticipantsUpdate(groupId, [userId], 'demote');
}

async function makeGroupAdmin(conn, groupId, userId) {
    return await promoteUser(conn, groupId, userId);
}

async function removeGroupAdmin(conn, groupId, userId) {
    return await demoteUser(conn, groupId, userId);
}

async function leaveGroup(conn, groupId) {
    return await conn.groupLeave(groupId);
}

async function updateGroupSubject(conn, groupId, subject) {
    return await conn.groupUpdateSubject(groupId, subject);
}

async function updateGroupDescription(conn, groupId, description) {
    return await conn.groupUpdateDescription(groupId, description);
}

async function updateGroupSettings(conn, groupId, settings) {
    return await conn.groupSettingUpdate(groupId, settings);
}

async function setGroupToAdminsOnly(conn, groupId, adminsOnly) {
    return await conn.groupSettingUpdate(groupId, adminsOnly ? 'announcement' : 'not_announcement');
}

async function setGroupToLocked(conn, groupId, locked) {
    return await conn.groupSettingUpdate(groupId, locked ? 'locked' : 'unlocked');
}

// ==================== DOWNLOAD HELPERS ====================
async function downloadMedia(message, type) {
    let mediaMessage;
    
    switch(type) {
        case 'image':
            mediaMessage = message.message?.imageMessage;
            break;
        case 'video':
            mediaMessage = message.message?.videoMessage;
            break;
        case 'audio':
            mediaMessage = message.message?.audioMessage;
            break;
        case 'document':
            mediaMessage = message.message?.documentMessage;
            break;
        case 'sticker':
            mediaMessage = message.message?.stickerMessage;
            break;
        default:
            return null;
    }
    
    if (!mediaMessage) return null;
    
    const stream = await downloadContentFromMessage(mediaMessage, type);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    
    return buffer;
}

async function downloadImage(message) {
    return await downloadMedia(message, 'image');
}

async function downloadVideo(message) {
    return await downloadMedia(message, 'video');
}

async function downloadAudio(message) {
    return await downloadMedia(message, 'audio');
}

async function downloadDocument(message) {
    return await downloadMedia(message, 'document');
}

async function downloadSticker(message) {
    return await downloadMedia(message, 'sticker');
}

// ==================== PROFILE HELPERS ====================
async function getProfilePicture(conn, jid) {
    try {
        const ppUrl = await conn.profilePictureUrl(jid, 'image');
        return ppUrl;
    } catch {
        return null;
    }
}

async function updateProfilePicture(conn, buffer) {
    return await conn.updateProfilePicture(conn.user.id, buffer);
}

async function removeProfilePicture(conn) {
    return await conn.removeProfilePicture(conn.user.id);
}

async function getUserName(conn, jid) {
    try {
        const contact = await conn.contactQuery(jid);
        return contact?.name || extractNumberFromJid(jid);
    } catch {
        return extractNumberFromJid(jid);
    }
}

// ==================== RANDOM HELPERS ====================
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function truncate(str, length) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// ==================== EXPORT MODULE ====================
module.exports = {
    // Config
    setConfig,
    
    // Font
    smallFont,
    
    // Group Settings
    loadGroupSettings,
    saveGroupSettings,
    getGroupSetting,
    setGroupSetting,
    getAllGroupSettings,
    deleteGroupSetting,
    deleteAllGroupSettings,
    
    // Warnings
    addWarning,
    getWarnings,
    resetWarnings,
    clearGroupWarnings,
    getAllWarnings,
    
    // Mute System
    muteUser,
    unmuteUser,
    isUserMuted,
    getMutedUsers,
    
    // Admin Checks
    isUserAdmin,
    isUserSuperAdmin,
    getGroupAdmins,
    getGroupMembers,
    isUserInGroup,
    
    // Message Helpers
    getMessageBody,
    getMessageType,
    getQuotedMessage,
    
    // Number Formatting
    formatNumber,
    getJid,
    extractNumberFromJid,
    
    // Time Helpers
    formatDuration,
    parseDuration,
    getTimeRemaining,
    
    // Permission Helpers
    isOwner,
    isSudo,
    isPremium,
    getUserLevel,
    getUserLevelEmoji,
    
    // Response Helpers
    sendMessage,
    sendReply,
    sendReact,
    sendImage,
    sendVideo,
    sendAudio,
    sendSticker,
    
    // Group Actions
    kickUser,
    addUser,
    promoteUser,
    demoteUser,
    makeGroupAdmin,
    removeGroupAdmin,
    leaveGroup,
    updateGroupSubject,
    updateGroupDescription,
    updateGroupSettings,
    setGroupToAdminsOnly,
    setGroupToLocked,
    
    // Download Helpers
    downloadMedia,
    downloadImage,
    downloadVideo,
    downloadAudio,
    downloadDocument,
    downloadSticker,
    
    // Profile Helpers
    getProfilePicture,
    updateProfilePicture,
    removeProfilePicture,
    getUserName,
    
    // Random Helpers
    randomInt,
    randomElement,
    shuffleArray,
    capitalize,
    truncate
};