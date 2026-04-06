// sila/antiforward.js
// Anti Forward - Delete forwarded messages, only kick on action

async function handleAntiForward(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const isForwarded = msg.message?.extendedTextMessage?.contextInfo?.isForwarded ||
                        msg.message?.imageMessage?.contextInfo?.isForwarded ||
                        msg.message?.videoMessage?.contextInfo?.isForwarded;
    
    if (isForwarded && senderNumber !== conf.OWNER_NUMBER) {
        console.log(`↪️ AntiForward: Forwarded message detected from ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antiforward_action') : null;
            const action = groupAction || conf.antiforward_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪғᴏʀᴡᴀʀᴅ* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ғᴏʀᴡᴀʀᴅᴇᴅ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ғᴏʀᴡᴀʀᴅɪɴɢ ᴍᴇssᴀɢᴇs!`;
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
            console.error('AntiForward error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiForward };