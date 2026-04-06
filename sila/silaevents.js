// sila/silaevents.js
// Group Events Handler - Per Group Settings (Welcome, Goodbye, Promote, Demote, etc.)

const fs = require('fs');
const path = require('path');

// Paths for event settings
const eventsSettingsPath = './silatz/events-settings.json';

// Load event settings for group
function loadEventSettings() {
    if (!fs.existsSync(eventsSettingsPath)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(eventsSettingsPath));
    } catch (e) {
        return {};
    }
}

function saveEventSettings(settings) {
    const dir = path.dirname(eventsSettingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(eventsSettingsPath, JSON.stringify(settings, null, 2));
}

function getGroupEventSetting(groupId, feature) {
    const settings = loadEventSettings();
    if (!settings[groupId]) return null;
    return settings[groupId][feature];
}

function setGroupEventSetting(groupId, feature, value) {
    const settings = loadEventSettings();
    if (!settings[groupId]) settings[groupId] = {};
    settings[groupId][feature] = value;
    saveEventSettings(settings);
    return true;
}

// Default messages with variables
const DEFAULT_MESSAGES = {
    welcome: `♱ {botSymbol} *ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ!* {botSymbol}

👤 @{user} ʜᴀs ᴊᴏɪɴᴇᴅ ᴛʜᴇ ɢʀᴏᴜᴘ
📊 ᴍᴇᴍʙᴇʀs: {count}
🏷️ ᴜsᴇʀɴᴀᴍᴇ: {username}

♱ ᴘʟᴇᴀsᴇ ʀᴇᴀᴅ ᴛʜᴇ ɢʀᴏᴜᴘ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ ᴀɴᴅ ғᴏʟʟᴏᴡ ᴛʜᴇ ʀᴜʟᴇs ♱`,

    goodbye: `♱ {botSymbol} *ɢᴏᴏᴅʙʏᴇ!* {botSymbol}

💔 @{user} ʜᴀs ʟᴇғᴛ ᴛʜᴇ ɢʀᴏᴜᴘ
📊 ᴍᴇᴍʙᴇʀs: {count}

♱ ᴡᴇ ʜᴏᴘᴇ ᴛᴏ sᴇᴇ ʏᴏᴜ ᴀɢᴀɪɴ sᴏᴏɴ ♱`,

    promote: `♱ {botSymbol} *ᴘʀᴏᴍᴏᴛɪᴏɴ* {botSymbol}

👑 ᴄᴏɴɢʀᴀᴛᴜʟᴀᴛɪᴏɴs @{user}
✨ ʏᴏᴜ ʜᴀᴠᴇ ʙᴇᴇɴ ᴘʀᴏᴍᴏᴛᴇᴅ ᴛᴏ ᴀᴅᴍɪɴ!

♱ ᴘʟᴇᴀsᴇ ᴜsᴇ ʏᴏᴜʀ ᴘᴏᴡᴇʀ ᴡɪsᴇʟʏ ♱`,

    demote: `♱ {botSymbol} *ᴅᴇᴍᴏᴛɪᴏɴ* {botSymbol}

📛 @{user} ʜᴀs ʙᴇᴇɴ ᴅᴇᴍᴏᴛᴇᴅ ғʀᴏᴍ ᴀᴅᴍɪɴ

♱ ʀᴇsᴘᴇᴄᴛ ᴛʜᴇ ɴᴇᴡ ᴀᴅᴍɪɴs ♱`,

    group_update: `♱ {botSymbol} *ɢʀᴏᴜᴘ ᴜᴘᴅᴀᴛᴇ* {botSymbol}

📝 @{by} ʜᴀs ᴜᴘᴅᴀᴛᴇᴅ ᴛʜᴇ ɢʀᴏᴜᴘ:
• {change}

♱ ᴘʟᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ ɴᴇᴡ sᴇᴛᴛɪɴɢs ♱`
};

// Get message with variables replaced
function getEventMessage(type, variables, botConfig) {
    const settings = loadEventSettings();
    let message = DEFAULT_MESSAGES[type];
    
    // Check if group has custom message
    if (variables.groupId && settings[variables.groupId] && settings[variables.groupId][`${type}_message`]) {
        message = settings[variables.groupId][`${type}_message`];
    }
    
    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
        if (value !== undefined && value !== null) {
            message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
        }
    }
    
    return message;
}

// Get group participant name
async function getParticipantName(conn, jid) {
    try {
        const contact = await conn.getName(jid);
        return contact || jid.split('@')[0];
    } catch (e) {
        return jid.split('@')[0];
    }
}

// Check if event is enabled for group (default: true if not set)
function isEventEnabled(groupId, eventType) {
    const setting = getGroupEventSetting(groupId, eventType);
    // If setting is null (not set), default to true (enabled)
    return setting === null ? true : setting;
}

// Handle group welcome event
async function handleGroupWelcome(conn, update, botConfig, silaConfig) {
    const groupId = update.id;
    const participants = update.participants || [];
    const action = update.action;
    
    // Check if welcome is enabled for this group (per group)
    if (!isEventEnabled(groupId, 'welcome')) return;
    
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const memberCount = groupMetadata.participants.length;
        
        for (const participant of participants) {
            // Handle participant as string or object
            const participantJid = typeof participant === 'string' ? participant : participant.id || participant;
            if (!participantJid) continue;
            
            if (action === 'add') {
                const userName = participantJid.split('@')[0];
                const username = await getParticipantName(conn, participantJid);
                
                const message = getEventMessage('welcome', {
                    botSymbol: botConfig.mainSymbol,
                    user: participantJid,
                    username: username || userName,
                    count: memberCount,
                    groupName: groupMetadata.subject,
                    groupId: groupId
                }, botConfig);
                
                await conn.sendMessage(groupId, {
                    text: message,
                    contextInfo: {
                        mentionedJid: [participantJid],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: botConfig.newsletterJid,
                            newsletterName: botConfig.newsletterName,
                            serverMessageId: 143
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.error('Welcome event error:', e);
    }
}

// Handle group goodbye event
async function handleGroupGoodbye(conn, update, botConfig, silaConfig) {
    const groupId = update.id;
    const participants = update.participants || [];
    const action = update.action;
    
    // Check if goodbye is enabled for this group (per group)
    if (!isEventEnabled(groupId, 'goodbye')) return;
    
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const memberCount = groupMetadata.participants.length;
        
        for (const participant of participants) {
            // Handle participant as string or object
            const participantJid = typeof participant === 'string' ? participant : participant.id || participant;
            if (!participantJid) continue;
            
            if (action === 'remove') {
                const userName = participantJid.split('@')[0];
                
                const message = getEventMessage('goodbye', {
                    botSymbol: botConfig.mainSymbol,
                    user: participantJid,
                    username: userName,
                    count: memberCount,
                    groupName: groupMetadata.subject
                }, botConfig);
                
                await conn.sendMessage(groupId, {
                    text: message,
                    contextInfo: {
                        mentionedJid: [participantJid],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: botConfig.newsletterJid,
                            newsletterName: botConfig.newsletterName,
                            serverMessageId: 143
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.error('Goodbye event error:', e);
    }
}

// Handle group promote/demote events
async function handleGroupAdminEvents(conn, update, botConfig, silaConfig) {
    const groupId = update.id;
    const participants = update.participants || [];
    const action = update.action;
    
    // Check if admin events are enabled for this group (per group)
    if (!isEventEnabled(groupId, 'admin_events')) return;
    
    try {
        const groupMetadata = await conn.groupMetadata(groupId);
        
        for (const participant of participants) {
            // Handle participant as string or object
            const participantJid = typeof participant === 'string' ? participant : participant.id || participant;
            if (!participantJid) continue;
            
            if (action === 'promote') {
                const message = getEventMessage('promote', {
                    botSymbol: botConfig.mainSymbol,
                    user: participantJid,
                    groupName: groupMetadata.subject
                }, botConfig);
                
                await conn.sendMessage(groupId, {
                    text: message,
                    contextInfo: {
                        mentionedJid: [participantJid],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: botConfig.newsletterJid,
                            newsletterName: botConfig.newsletterName,
                            serverMessageId: 143
                        }
                    }
                });
            } else if (action === 'demote') {
                const message = getEventMessage('demote', {
                    botSymbol: botConfig.mainSymbol,
                    user: participantJid,
                    groupName: groupMetadata.subject
                }, botConfig);
                
                await conn.sendMessage(groupId, {
                    text: message,
                    contextInfo: {
                        mentionedJid: [participantJid],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: botConfig.newsletterJid,
                            newsletterName: botConfig.newsletterName,
                            serverMessageId: 143
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.error('Admin events error:', e);
    }
}

// Handle group setting updates
async function handleGroupUpdate(conn, update, botConfig, silaConfig) {
    const groupId = update.id;
    const metadata = update.metadata || {};
    
    // Check if group updates are enabled for this group (per group)
    if (!isEventEnabled(groupId, 'group_updates')) return;
    
    try {
        let change = "";
        let by = update.author || "unknown";
        
        // Convert by to JID string if it's an object
        const byJid = typeof by === 'string' ? by : (by.id || by);
        
        if (metadata.subject !== undefined) {
            change = `ɢʀᴏᴜᴘ ɴᴀᴍᴇ ᴄʜᴀɴɢᴇᴅ ᴛᴏ: "${metadata.subject}"`;
        } else if (metadata.desc !== undefined) {
            change = `ɢʀᴏᴜᴘ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ ᴜᴘᴅᴀᴛᴇᴅ`;
        } else if (metadata.restrict !== undefined) {
            change = `ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs ᴄʜᴀɴɢᴇᴅ: ${metadata.restrict ? 'ʀᴇsᴛʀɪᴄᴛᴇᴅ' : 'ᴏᴘᴇɴ'}`;
        } else if (metadata.announce !== undefined) {
            change = `ɢʀᴏᴜᴘ ᴛʏᴘᴇ ᴄʜᴀɴɢᴇᴅ ᴛᴏ: ${metadata.announce ? 'ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ' : 'ɢᴇɴᴇʀᴀʟ'}`;
        } else {
            return;
        }
        
        const message = getEventMessage('group_update', {
            botSymbol: botConfig.mainSymbol,
            by: byJid,
            change: change,
            groupId: groupId
        }, botConfig);
        
        await conn.sendMessage(groupId, {
            text: message,
            contextInfo: {
                mentionedJid: byJid ? [byJid] : [],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: botConfig.newsletterJid,
                    newsletterName: botConfig.newsletterName,
                    serverMessageId: 143
                }
            }
        });
    } catch (e) {
        console.error('Group update error:', e);
    }
}

// Main group events handler
async function handleGroupEvents(conn, update, botConfig, silaConfig) {
    const action = update.action;
    
    if (action === 'add') {
        await handleGroupWelcome(conn, update, botConfig, silaConfig);
    } else if (action === 'remove') {
        await handleGroupGoodbye(conn, update, botConfig, silaConfig);
    } else if (action === 'promote' || action === 'demote') {
        await handleGroupAdminEvents(conn, update, botConfig, silaConfig);
    } else if (update.metadata) {
        // This is a group update event
        await handleGroupUpdate(conn, update, botConfig, silaConfig);
    }
}

// Get event settings for group
function getEventSettings(groupId) {
    return {
        welcome: isEventEnabled(groupId, 'welcome'),
        goodbye: isEventEnabled(groupId, 'goodbye'),
        admin_events: isEventEnabled(groupId, 'admin_events'),
        group_updates: isEventEnabled(groupId, 'group_updates')
    };
}

// Set event settings for group
function setEventSettings(groupId, feature, value) {
    return setGroupEventSetting(groupId, feature, value);
}

// Set custom message for event
function setEventMessage(groupId, eventType, message) {
    const settings = loadEventSettings();
    if (!settings[groupId]) settings[groupId] = {};
    settings[groupId][`${eventType}_message`] = message;
    saveEventSettings(settings);
    return true;
}

// Get custom message for event
function getEventMessageCustom(groupId, eventType) {
    const settings = loadEventSettings();
    if (settings[groupId] && settings[groupId][`${eventType}_message`]) {
        return settings[groupId][`${eventType}_message`];
    }
    return DEFAULT_MESSAGES[eventType] || null;
}

// Reset all events for a group to default
function resetGroupEvents(groupId) {
    const settings = loadEventSettings();
    if (settings[groupId]) {
        // Remove all event settings for this group
        delete settings[groupId];
        saveEventSettings(settings);
    }
    return true;
}

module.exports = {
    handleGroupEvents,
    getEventSettings,
    setEventSettings,
    setEventMessage,
    getEventMessageCustom,
    resetGroupEvents,
    DEFAULT_MESSAGES
};