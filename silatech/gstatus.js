// silatech/status.js
// Post Status to Group DP - Like WhatsApp Story

module.exports = {
    silacmd: "status",
    alias: ["post", "story"],
    category: "group",
    description: "Post a status to group DP (like WhatsApp story)",
    usage: "status <text> or reply to media",
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe }) {
        const botConfig = silaConfig.getBotConfig();
        const isGroup = from.includes('g.us');
        
        if (!isGroup) {
            return repondre(`♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`);
        }
        
        try {
            // Get group ID for status
            const groupJid = from;
            const groupMetadata = await conn.groupMetadata(groupJid);
            const groupName = groupMetadata.subject;
            
            // Get message content
            const textMsg = ms.message?.conversation || 
                           ms.message?.extendedTextMessage?.text || 
                           ms.message?.imageMessage?.caption || 
                           ms.message?.videoMessage?.caption || "";
            
            const args = textMsg.split(' ');
            const textArgs = args.slice(1).join(' ');
            const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            // ==================== TEXT STATUS ====================
            if (textArgs && !quoted) {
                // Send as status message to group (appears in DP)
                await conn.sendMessage(groupJid, {
                    text: textArgs,
                    contextInfo: {
                        stanzaId: `status_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
                        participant: ms.sender,
                        isStatus: true,
                        expiration: 86400,
                        status: true
                    }
                });
                
                await conn.sendMessage(groupJid, {
                    react: { text: '📢', key: ms.key }
                });
                
                return repondre(`♱ ✅ sᴛᴀᴛᴜs ᴘᴏsᴛᴇᴅ ᴛᴏ ${groupName} ᴅᴘ!\n\n👁️ ᴛᴀᴘ ɢʀᴏᴜᴘ ᴘʀᴏғɪʟᴇ ᴘɪᴄ ᴛᴏ ᴠɪᴇᴡ ♱`);
            }
            
            // ==================== IMAGE STATUS ====================
            if (quoted?.imageMessage) {
                const media = quoted.imageMessage;
                const caption = media.caption || "";
                
                // Get image buffer using direct download
                let imageBuffer;
                try {
                    // Alternative download method
                    const stream = await conn.downloadMediaMessage({
                        key: ms.key,
                        message: quoted
                    }, 'buffer');
                    imageBuffer = stream;
                } catch (err) {
                    // Try another method
                    const stream = await conn.downloadMediaMessage(ms.message.extendedTextMessage.contextInfo.quotedMessage);
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    imageBuffer = Buffer.concat(chunks);
                }
                
                if (!imageBuffer) {
                    return repondre(`♱ 👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ɪᴍᴀɢᴇ! ♱`);
                }
                
                // Send as status message
                await conn.sendMessage(groupJid, {
                    image: imageBuffer,
                    caption: caption,
                    contextInfo: {
                        stanzaId: `status_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
                        participant: ms.sender,
                        isStatus: true,
                        expiration: 86400,
                        status: true
                    }
                });
                
                await conn.sendMessage(groupJid, {
                    react: { text: '📢', key: ms.key }
                });
                
                return repondre(`♱ ✅ sᴛᴀᴛᴜs ᴘᴏsᴛᴇᴅ ᴛᴏ ${groupName} ᴅᴘ!\n\n👁️ ᴛᴀᴘ ɢʀᴏᴜᴘ ᴘʀᴏғɪʟᴇ ᴘɪᴄ ᴛᴏ ᴠɪᴇᴡ ♱`);
            }
            
            // ==================== VIDEO STATUS ====================
            if (quoted?.videoMessage) {
                const media = quoted.videoMessage;
                const caption = media.caption || "";
                
                let videoBuffer;
                try {
                    const stream = await conn.downloadMediaMessage(ms.message.extendedTextMessage.contextInfo.quotedMessage);
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    videoBuffer = Buffer.concat(chunks);
                } catch (err) {
                    console.error('Download error:', err);
                    return repondre(`♱ 👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏ! ♱`);
                }
                
                await conn.sendMessage(groupJid, {
                    video: videoBuffer,
                    caption: caption,
                    contextInfo: {
                        stanzaId: `status_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
                        participant: ms.sender,
                        isStatus: true,
                        expiration: 86400,
                        status: true
                    }
                });
                
                await conn.sendMessage(groupJid, {
                    react: { text: '📢', key: ms.key }
                });
                
                return repondre(`♱ ✅ sᴛᴀᴛᴜs ᴘᴏsᴛᴇᴅ ᴛᴏ ${groupName} ᴅᴘ!\n\n👁️ ᴛᴀᴘ ɢʀᴏᴜᴘ ᴘʀᴏғɪʟᴇ ᴘɪᴄ ᴛᴏ ᴠɪᴇᴡ ♱`);
            }
            
            // ==================== NO INPUT ====================
            return repondre(`♱ *ʜᴏᴡ ᴛᴏ ᴘᴏsᴛ sᴛᴀᴛᴜs* ♱\n\n📝 *ᴛᴇxᴛ sᴛᴀᴛᴜs:*\n${prefixe}status Hello everyone!\n\n🖼️ *ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ sᴛᴀᴛᴜs:*\nReply to an image/video with ${prefixe}status\n\n♱ ᴛʜɪs ᴡɪʟʟ ᴀᴘᴘᴇᴀʀ ᴏɴ ɢʀᴏᴜᴘ ᴘʀᴏғɪʟᴇ ᴘɪᴄ (ʟɪᴋᴇ ᴡʜᴀᴛsᴀᴘᴘ sᴛᴏʀʏ) ♱`);
            
        } catch (error) {
            console.error('Status error:', error);
            await repondre(`♱ 👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴘᴏsᴛ sᴛᴀᴛᴜs!\n\n📝 ${error.message}\n\n♱ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ ♱`);
        }
    }
};