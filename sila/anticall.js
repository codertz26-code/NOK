// sila/anticall.js
// Anti Call - Reject calls and notify caller

async function handleAntiCall(conn, call, conf) {
    for (let c of call) {
        if (!c.isGroup) {
            console.log(`📞 AntiCall: Rejecting call from ${c.from}`);
            try {
                await conn.rejectCall(c.id, c.from);
                
                // Send notification to caller
                const callerJid = c.from;
                const config = require('../silamd/sila.js').getBotConfig();
                
                await conn.sendMessage(callerJid, {
                    text: `♱ ${config.mainSymbol} *ᴀɴᴛɪᴄᴀʟʟ* ${config.mainSymbol} ♱\n\n⚠️ ᴄᴀʟʟs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ !\n\n📞 ʏᴏᴜʀ ᴄᴀʟʟ ʜᴀs ʙᴇᴇɴ ʀᴇᴊᴇᴄᴛᴇᴅ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ.\n\n♱ ᴛʜɪs ɪs ᴛᴏ ᴘʀᴏᴛᴇᴄᴛ ᴛʜᴇ ʙᴏᴛ ғʀᴏᴍ ᴅɪsʀᴜᴘᴛɪᴏɴs ♱`,
                    contextInfo: {
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
                console.error('AntiCall error:', e);
            }
        }
    }
    return false;
}

module.exports = { handleAntiCall };