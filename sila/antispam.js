// sila/antispam.js
// Anti Spam - Delete message and warn, only kick on action

const userMessageCount = new Map();

async function handleAntiSpam(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const userId = sender;
    const now = Date.now();
    const timeWindow = 5000; // 5 seconds
    const maxMessages = 3; // Max 3 messages in 5 seconds
    
    // Get user message count
    if (!userMessageCount.has(userId)) {
        userMessageCount.set(userId, []);
    }
    
    const timestamps = userMessageCount.get(userId);
    const validTimestamps = timestamps.filter(t => now - t < timeWindow);
    validTimestamps.push(now);
    userMessageCount.set(userId, validTimestamps);
    
    if (validTimestamps.length > maxMessages) {
        console.log(`🔄 AntiSpam: Spam detected from ${senderNumber} in ${from}`);
        
        try {
            // Delete spam message
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            // Get action from group settings or global
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antispam_action') : null;
            const action = groupAction || conf.antispam_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪsᴘᴀᴍ* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ᴅᴏɴ'ᴛ sᴘᴀᴍ!\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ sᴘᴀᴍᴍɪɴɢ!`;
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
        } catch (e) {
            console.error('AntiSpam error:', e);
        }
    }
    return false;
}

function resetUserSpam(userId) {
    userMessageCount.delete(userId);
}

module.exports = { handleAntiSpam, resetUserSpam };