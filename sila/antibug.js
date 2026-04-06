// sila/antibug.js
// Anti Bug - Delete buggy messages, only kick on action

const bugPatterns = [
    /@.*@.*@/g,
    /.{2000,}/g,
    /[^\x00-\x7F]{100,}/g,
    /<[^>]*script[^>]*>/gi,
    /javascript:/gi,
    /data:text\/html/gi
];

async function handleAntiBug(conn, from, msg, sender, senderNumber, conf, silaConfig) {
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || 
                 msg.message?.videoMessage?.caption || 
                 "";
    
    let isBug = false;
    let reason = "";
    
    if (body.length > 2000) {
        isBug = true;
        reason = "Long message (>2000 chars)";
    } else {
        for (const pattern of bugPatterns) {
            if (pattern.test(body)) {
                isBug = true;
                reason = "Suspicious pattern detected";
                break;
            }
        }
    }
    
    const mentionCount = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length || 0;
    if (mentionCount > 50) {
        isBug = true;
        reason = `Excessive mentions (${mentionCount})`;
    }
    
    if (isBug) {
        console.log(`🐛 AntiBug: Bug message detected from ${senderNumber} in ${from}`);
        
        try {
            await conn.sendMessage(from, { delete: msg.key });
            
            const config = silaConfig.getBotConfig();
            
            const groupAction = silaConfig.getGroupSetting ? silaConfig.getGroupSetting(from, 'antibug_action') : null;
            const action = groupAction || conf.antibug_action || 'kick';
            
            let responseText = `${config.mainSymbol} 👻 *ᴀɴᴛɪʙᴜɢ* ${config.mainSymbol}\n\n`;
            responseText += `⚠️ @${senderNumber} ʙᴜɢ ᴅᴇᴛᴇᴄᴛᴇᴅ!\n`;
            responseText += `🔬 ʀᴇᴀsᴏɴ: ${reason}\n`;
            responseText += `📝 ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ!`;
            
            if (action === 'kick') {
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                responseText += `\n\n🚫 @${senderNumber} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғᴏʀ ᴛʀʏɪɴɢ ᴛᴏ ʙᴜɢ ᴛʜᴇ ʙᴏᴛ!`;
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
            
            // Notify owner
            const ownerJid = `${conf.OWNER_NUMBER}@s.whatsapp.net`;
            await conn.sendMessage(ownerJid, {
                text: `🐛 *ᴀɴᴛɪʙᴜɢ ᴀʟᴇʀᴛ*\n\nɢʀᴏᴜᴘ: ${from}\nsᴇɴᴅᴇʀ: @${senderNumber}\nʀᴇᴀsᴏɴ: ${reason}\nᴀᴄᴛɪᴏɴ: ${action.toUpperCase()}`,
                contextInfo: { mentionedJid: [sender] }
            });
            
            return true;
        } catch (e) {
            console.error('AntiBug error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiBug, bugPatterns };