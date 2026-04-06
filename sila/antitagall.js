// sila/antitagall.js
// Anti Tag All - Delete message with warning, only kick on action

async function handleAntiTagAll(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 "";
    
    const tagAllPatterns = [
        /@everyone/gi,
        /@all/gi,
        /@全体成员/gi,
        /@所有人/gi
    ];
    
    let foundTagAll = false;
    
    for (const pattern of tagAllPatterns) {
        if (pattern.test(body)) {
            foundTagAll = true;
            break;
        }
    }
    
    if (foundTagAll) {
        console.log(`🔔 AntiTagAll: TagAll detected from ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antitagall_action') : null;
            const action = groupAction || conf.antitagall_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪᴛᴀɢᴀʟʟ* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} @ᴇᴠᴇʀʏᴏɴᴇ/ @ᴀʟʟ ᴛᴀɢs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ᴛᴀɢɢɪɴɢ ᴇᴠᴇʀʏᴏɴᴇ!`;
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
            console.error('AntiTagAll error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiTagAll };