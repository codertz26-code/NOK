// sila/antiedit.js
// Anti Edit - Detects and shows edited messages

const { loadMessage, saveMessage } = require('../data-json');

// Store original messages to compare
const messageStore = new Map();

async function handleAntiEdit(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    try {
        // Check if this is an edited message
        // Protocol message type 14 = EDITED_MESSAGE
        // Protocol message type 15 = REVOKE_EDITED_MESSAGE
        if (msg.message?.protocolMessage && 
            (msg.message.protocolMessage.type === 14 || 
             msg.message.protocolMessage.type === 15)) {
            
            const protocolMsg = msg.message.protocolMessage;
            const originalKey = protocolMsg.key;
            const editedMessage = protocolMsg.editedMessage || protocolMsg.message;
            
            if (!originalKey || !editedMessage) return false;
            
            console.log(`🔍 Checking edit for message ID: ${originalKey.id}`);
            
            // Try to get original message from database
            let originalMsg = null;
            let originalText = "";
            let editedText = "";
            
            try {
                originalMsg = await loadMessage(originalKey.id);
            } catch (e) {
                console.error('Error loading original message from database:', e);
            }
            
            // If not in database, check memory store
            if (!originalMsg && messageStore.has(originalKey.id)) {
                originalMsg = messageStore.get(originalKey.id);
                console.log(`📝 Found original message in memory store`);
            }
            
            // Extract original text
            if (originalMsg && originalMsg.message) {
                originalText = originalMsg.message.conversation || 
                              originalMsg.message.extendedTextMessage?.text || 
                              originalMsg.message.imageMessage?.caption || 
                              originalMsg.message.videoMessage?.caption || 
                              "";
            }
            
            // Extract edited text
            editedText = editedMessage.conversation || 
                        editedMessage.extendedTextMessage?.text || 
                        "";
            
            console.log(`📝 Original: "${originalText.substring(0, 50)}..."`);
            console.log(`✏️ Edited: "${editedText.substring(0, 50)}..."`);
            
            // If we have both texts and they are different, it's an edit
            if (originalText && editedText && originalText !== editedText) {
                console.log(`✏️ AntiEdit: Edit detected from ${senderNumber} in ${from}`);
                
                const config = silaConfig.getBotConfig();
                
                // Get action from group settings or global
                const groupAction = silaConfig.getGroupSetting ? 
                    silaConfig.getGroupSetting(from, 'antiedit_action') : null;
                const action = groupAction || conf.antiedit_action || 'delete';
                
                let responseText = `${config.mainSymbol} ✏️ *ᴀɴᴛɪᴇᴅɪᴛ* ${config.mainSymbol}\n\n`;
                responseText += `⚠️ @${senderNumber} ᴇᴅɪᴛᴇᴅ ᴀ ᴍᴇssᴀɢᴇ!\n\n`;
                responseText += `📝 *ᴏʀɪɢɪɴᴀʟ:*\n${originalText.substring(0, 300)}\n\n`;
                responseText += `✏️ *ᴇᴅɪᴛᴇᴅ:*\n${editedText.substring(0, 300)}\n\n`;
                responseText += `📝 ᴇᴅɪᴛɪɴɢ ᴍᴇssᴀɢᴇs ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!`;
                
                if (action === 'delete') {
                    responseText += `\n\n⚠️ ᴍᴇssᴀɢᴇ ᴡᴀs ᴅᴇʟᴇᴛᴇᴅ!`;
                    await conn.sendMessage(from, { delete: msg.key });
                } else if (action === 'kick') {
                    await conn.groupParticipantsUpdate(from, [sender], 'remove');
                    responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ᴇᴅɪᴛɪɴɢ ᴍᴇssᴀɢᴇs!`;
                }
                
                await conn.sendMessage(from, {
                    text: responseText,
                    contextInfo: {
                        mentionedJid: [sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: config.newsletterJid,
                            newsletterName: config.newsletterName,
                            serverMessageId: 143
                        }
                    }
                });
                
                return true;
            }
        }
        
        // Also store original messages for future comparison
        // This helps capture messages before they are edited
        if (msg.key && msg.message && !msg.message.protocolMessage) {
            const messageId = msg.key.id;
            if (!messageStore.has(messageId)) {
                messageStore.set(messageId, {
                    message: msg.message,
                    jid: msg.key.remoteJid,
                    sender: msg.key.participant || msg.key.remoteJid,
                    timestamp: Date.now()
                });
                
                // Clean old messages from store (older than 10 minutes)
                setTimeout(() => {
                    if (messageStore.has(messageId)) {
                        messageStore.delete(messageId);
                    }
                }, 10 * 60 * 1000);
            }
        }
        
    } catch (e) {
        console.error('AntiEdit error:', e);
    }
    
    return false;
}

// Clean up old messages periodically
setInterval(() => {
    const now = Date.now();
    for (const [id, data] of messageStore.entries()) {
        if (now - data.timestamp > 10 * 60 * 1000) {
            messageStore.delete(id);
        }
    }
}, 5 * 60 * 1000);

module.exports = { handleAntiEdit };