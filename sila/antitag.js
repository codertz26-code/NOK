// sila/antitag.js
// Anti Tag - Delete message with mention, only kick on action

async function handleAntiTag(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const maxMentions = 10;
    
    if (mentions.length > maxMentions) {
        console.log(`🏷️ AntiTag: Mass tag detected from ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antitag_action') : null;
            const action = groupAction || conf.antitag_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪᴛᴀɢ* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ᴍᴀss ᴛᴀɢɢɪɴɢ ɪs ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!\n`;
            responseText += `📊 ᴛᴀɢɢᴇᴅ: ${mentions.length} ᴘᴇᴏᴘʟᴇ\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ᴍᴀss ᴛᴀɢɢɪɴɢ!`;
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
            console.error('AntiTag error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiTag };