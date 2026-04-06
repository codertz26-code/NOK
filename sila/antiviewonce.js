// sila/antiviewonce.js
// Anti ViewOnce - Saves view once messages and forwards to owner

const { downloadContentFromMessage } = require('baileys');

async function handleAntiViewOnce(conn, msg, sender, senderNumber, conf, silaConfig) {
    const viewOnceMsg = msg.message?.viewOnceMessageV2 || 
                         msg.message?.viewOnceMessage || 
                         msg.message?.ephemeralMessage?.message?.viewOnceMessageV2;
    
    if (viewOnceMsg) {
        console.log(`👁️ AntiViewOnce: ViewOnce detected from ${senderNumber}`);
        
        try {
            const messageContent = viewOnceMsg.message || viewOnceMsg;
            let mediaType = null;
            let mediaBuffer = null;
            let caption = "";
            
            // Get media type and download
            if (messageContent.imageMessage) {
                mediaType = 'image';
                const stream = await downloadContentFromMessage(messageContent.imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                mediaBuffer = buffer;
                caption = messageContent.imageMessage.caption || "";
            } else if (messageContent.videoMessage) {
                mediaType = 'video';
                const stream = await downloadContentFromMessage(messageContent.videoMessage, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                mediaBuffer = buffer;
                caption = messageContent.videoMessage.caption || "";
            }
            
            if (mediaBuffer && mediaType) {
                const config = silaConfig.getBotConfig();
                
                // Send to owner
                const ownerJid = `${conf.OWNER_NUMBER}@s.whatsapp.net`;
                const viewOnceText = `👁️ *ᴠɪᴇᴡᴏɴᴄᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n📱 ғʀᴏᴍ: @${senderNumber}\n📝 ᴄᴀᴘᴛɪᴏɴ: ${caption || 'ɴᴏ ᴄᴀᴘᴛɪᴏɴ'}\n⏰ ᴛɪᴍᴇ: ${new Date().toLocaleString()}`;
                
                if (mediaType === 'image') {
                    await conn.sendMessage(ownerJid, {
                        image: mediaBuffer,
                        caption: viewOnceText,
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
                } else if (mediaType === 'video') {
                    await conn.sendMessage(ownerJid, {
                        video: mediaBuffer,
                        caption: viewOnceText,
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
                }
                
                console.log(`✅ ViewOnce saved from ${senderNumber}`);
                return true;
            }
        } catch (e) {
            console.error('AntiViewOnce error:', e);
        }
    }
    return false;
}

module.exports = { handleAntiViewOnce };