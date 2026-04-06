// sila/antigrouplink.js
// Anti Group Link Outside - Delete message with warning, only kick on action

async function handleAntiGroupLink(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 "";
    
    const groupLinkPatterns = [
        /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/g,
        /https:\/\/wa\.me\/[0-9]+/g,
        /https:\/\/api\.whatsapp\.com\/send\?phone=[0-9]+/g
    ];
    
    let foundLink = false;
    let linkFound = "";
    
    for (const pattern of groupLinkPatterns) {
        const match = body.match(pattern);
        if (match) {
            foundLink = true;
            linkFound = match[0];
            break;
        }
    }
    
    if (foundLink) {
        console.log(`🔗 AntiGroupLink: Group link detected from ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antigrouplink_action') : null;
            const action = groupAction || conf.antigrouplink_action || 'delete';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪɢʀᴏᴜᴘʟɪɴᴋ* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ɢʀᴏᴜᴘ ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ sʜᴀʀɪɴɢ ɢʀᴏᴜᴘ ʟɪɴᴋs!`;
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
            console.error('AntiGroupLink error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiGroupLink };