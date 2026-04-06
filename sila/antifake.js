// sila/antifake.js
// Anti Fake Number - Delete message, only kick on action

async function handleAntiFake(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const allowedCountries = ['255']; // Tanzania
    const isAllowed = allowedCountries.some(code => senderNumber.startsWith(code));
    
    if (!isAllowed && from.includes('g.us')) {
        console.log(`📱 AntiFake: Fake number detected ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antifake_action') : null;
            const action = groupAction || conf.antifake_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪғᴀᴋᴇ* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ɪs ɴᴏᴛ ᴀ ᴛᴀɴᴢᴀɴɪᴀɴ ɴᴜᴍʙᴇʀ!\n`;
            responseText += `📱 ᴏɴʟʏ ᴛᴀɴᴢᴀɴɪᴀɴ ɴᴜᴍʙᴇʀs (255) ᴀʀᴇ ᴀʟʟᴏᴡᴇᴅ.\n`;
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
            console.error('AntiFake error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiFake };