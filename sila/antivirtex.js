// sila/antivirtex.js
// Anti Virtex - Delete message with warning, only kick on action

const virtexPatterns = [
    /(\n\s*){20,}/g,
    /(.)\1{100,}/g,
    /[\u0300-\u036f]{50,}/g,
    /[^\x00-\x7F]{200,}/g,
    /<[^>]*>[^<]*<[^>]*>/g
];

async function handleAntiVirtex(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 "";
    
    let isVirtex = false;
    let reason = "";
    
    if (/(.)\1{50,}/.test(body)) {
        isVirtex = true;
        reason = "Repeating characters";
    } else if ((body.match(/\n/g) || []).length > 50) {
        isVirtex = true;
        reason = "Excessive newlines";
    } else if ((body.match(/[\u0300-\u036f]/g) || []).length > 50) {
        isVirtex = true;
        reason = "Excessive diacritics";
    } else {
        for (const pattern of virtexPatterns) {
            if (pattern.test(body)) {
                isVirtex = true;
                reason = "Suspicious pattern detected";
                break;
            }
        }
    }
    
    if (isVirtex) {
        console.log(`🦠 AntiVirtex: Virtex detected from ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antivirtex_action') : null;
            const action = groupAction || conf.antivirtex_action || 'kick';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪᴠɪʀᴛᴇx* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ᴠɪʀᴛᴇx ᴅᴇᴛᴇᴄᴛᴇᴅ!\n`;
            responseText += `🔬 ʀᴇᴀsᴏɴ: ${reason}\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ sᴇɴᴅɪɴɢ ᴠɪʀᴛᴇx!`;
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
            console.error('AntiVirtex error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiVirtex, virtexPatterns };