// sila/antimentionstatus.js
// Anti Mention Status - Deletes messages that mention status updates

async function handleAntiMentionStatus(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 "";
    
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    // Check if message contains status mention in text
    let hasStatusMention = false;
    const statusPatterns = [
        /status@broadcast/gi,
        /@status/gi,
        /status broadcast/gi,
        /status update/gi
    ];
    
    for (const pattern of statusPatterns) {
        if (pattern.test(body)) {
            hasStatusMention = true;
            break;
        }
    }
    
    // Check if any mentioned JID is a status broadcast
    for (const jid of mentionedJid) {
        if (jid.includes('status@broadcast') || jid === 'status@broadcast') {
            hasStatusMention = true;
            break;
        }
    }
    
    if (hasStatusMention) {
        console.log(`📢 AntiMentionStatus: Status mention detected from ${senderNumber} in ${from}`);
        
        try {
            // Delete the message
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            // Get action from group settings or global
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antimentionstatus_action') : null;
            const action = groupAction || conf.antimentionstatus_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪᴍᴇɴᴛɪᴏɴsᴛᴀᴛᴜs* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ᴍᴇɴᴛɪᴏɴɪɴɢ sᴛᴀᴛᴜs ᴜᴘᴅᴀᴛᴇs ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ!`;
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
            console.error('AntiMentionStatus error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiMentionStatus };