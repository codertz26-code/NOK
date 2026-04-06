// ==================== TOURL COMMAND ====================
// Weka hii file katika folder ya silatech/tourl.js

const { uploadWithFallback } = require('../sila/upload');

const tourlCommand = {
    silacmd: "tourl",
    alias: ["upload", "imgurl", "geturl", "link"],
    category: "tools",
    description: "Upload image/media to get direct URL",
    usage: ".tourl (reply to image/media) or .tourl (send with image)",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            repondre, 
            args, 
            prefixe,
            senderNumber,
            silaConfig
        } = params;

        // Get bot identity
        const botIdentity = silaConfig.getBotConfig();

        // Check if message has media or is replying to media
        const messageType = getContentType(ms.message);
        
        // Check for quoted message properly
        let isQuoted = null;
        let quotedType = null;
        
        if (ms.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            isQuoted = ms.message.extendedTextMessage.contextInfo.quotedMessage;
            quotedType = getContentType(isQuoted);
        }
        
        const validMediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
        
        const hasMedia = validMediaTypes.includes(messageType);
        const hasQuotedMedia = isQuoted && quotedType && validMediaTypes.includes(quotedType);

        if (!hasMedia && !hasQuotedMedia) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 **ᴛᴏᴜʀʟ ᴄᴏᴍᴍᴀɴᴅ** ♱\n\n` +
                      `> **ᴜsᴀɢᴇ:**\n` +
                      `> ${prefixe}tourl (ʀᴇᴘʟʏ ᴛᴏ ɪᴍᴀɢᴇ/ᴍᴇᴅɪᴀ)\n` +
                      `> ${prefixe}tourl (sᴇɴᴅ ᴡɪᴛʜ ɪᴍᴀɢᴇ/ᴍᴇᴅɪᴀ)\n\n` +
                      `> **sᴜᴘᴘᴏʀᴛᴇᴅ:**\n` +
                      `> • ɪᴍᴀɢᴇs\n` +
                      `> • ᴠɪᴅᴇᴏs\n` +
                      `> • ᴀᴜᴅɪᴏ\n` +
                      `> • ᴅᴏᴄᴜᴍᴇɴᴛs\n` +
                      `> • sᴛɪᴄᴋᴇʀs`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Send processing message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 **ᴜᴘʟᴏᴀᴅɪɴɢ ᴍᴇᴅɪᴀ...** ♱\n> ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            let buffer;
            let fileName = "upload";
            let mimeType = "image/png";

            // Download media
            try {
                if (hasQuotedMedia && isQuoted) {
                    // Download quoted message
                    const quotedMsg = isQuoted[quotedType];
                    
                    // Try using ms.quoted.download() first
                    if (ms.quoted && typeof ms.quoted.download === 'function') {
                        buffer = await ms.quoted.download();
                    } 
                    // Try conn.downloadMediaMessage
                    else if (conn.downloadMediaMessage) {
                        const quotedContext = {
                            key: {
                                remoteJid: from,
                                id: ms.message.extendedTextMessage.contextInfo.stanzaId,
                                participant: ms.message.extendedTextMessage.contextInfo.participant
                            },
                            message: isQuoted
                        };
                        buffer = await conn.downloadMediaMessage(quotedContext);
                    } 
                    // Fallback
                    else {
                        buffer = await downloadQuotedMedia(ms, conn);
                    }
                    
                    fileName = quotedMsg.fileName || `quoted_${Date.now()}`;
                    mimeType = quotedMsg.mimetype || "image/png";
                    
                } else if (hasMedia) {
                    // Download current message media
                    const mediaMsg = ms.message[messageType];
                    
                    // Try ms.download() first
                    if (typeof ms.download === 'function') {
                        buffer = await ms.download();
                    } 
                    // Try conn.downloadMediaMessage
                    else if (conn.downloadMediaMessage) {
                        buffer = await conn.downloadMediaMessage(ms);
                    } 
                    // Fallback
                    else {
                        buffer = await downloadCurrentMedia(ms, conn, messageType);
                    }
                    
                    fileName = mediaMsg.fileName || `media_${Date.now()}`;
                    mimeType = mediaMsg.mimetype || "image/png";
                }
            } catch (downloadErr) {
                console.error("Download error:", downloadErr);
                throw new Error(`Failed to download media: ${downloadErr.message}`);
            }

            if (!buffer || buffer.length === 0) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 **ғᴀɪʟᴇᴅ!** ♱\n> ᴄᴏᴜʟᴅ ɴᴏᴛ ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇᴅɪᴀ ʙᴜғғᴇʀ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            // Upload with fallback
            const { url, service } = await uploadWithFallback(buffer, fileName);
            
            // Get file size
            const fileSize = (buffer.length / 1024 / 1024).toFixed(2);

            // Success message
            const successText = `> ♱ 👻 **ᴜᴘʟᴏᴀᴅ sᴜᴄᴄᴇssғᴜʟ!** ♱\n\n` +
                               `> 📁 **ғɪʟᴇ ɪɴғᴏ:**\n` +
                               `> • ɴᴀᴍᴇ: ${fileName}\n` +
                               `> • sɪᴢᴇ: ${fileSize} ᴍʙ\n` +
                               `> • ᴛʏᴘᴇ: ${mimeType}\n` +
                               `> • sᴇʀᴠɪᴄᴇ: ${service}\n\n` +
                               `> 🔗 **ᴜʀʟ:**\n` +
                               `> ${url}`;

            // Send message with externalAdReply
            await conn.sendMessage(from, {
                text: successText,
                contextInfo: {
                    externalAdReply: {
                        title: `♱ 👻 ᴜᴘʟᴏᴀᴅᴇᴅ ᴛᴏ ${service}`,
                        body: `ᴄʟɪᴄᴋ ᴛᴏ ᴏᴘᴇɴ ᴜʀʟ`,
                        thumbnailUrl: url,
                        renderLargerThumbnail: true,
                        mediaType: 1,
                        sourceUrl: url,
                        showAdAttribution: true
                    },
                    ...silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }
            }, { quoted: ms });

        } catch (err) {
            console.error("Tourl Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 **ᴇʀʀᴏʀ!** ♱\n> ${err.message || 'ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴜᴘʟᴏᴀᴅɪɴɢ ᴍᴇᴅɪᴀ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
    }
};

// Helper function to get content type
function getContentType(message) {
    if (!message) return null;
    const types = [
        'conversation', 'imageMessage', 'videoMessage', 'audioMessage',
        'documentMessage', 'stickerMessage', 'extendedTextMessage', 
        'contactMessage', 'locationMessage', 'liveLocationMessage'
    ];
    for (const type of types) {
        if (message[type]) return type;
    }
    return null;
}

// Helper to download quoted media using conn methods
async function downloadQuotedMedia(ms, conn) {
    try {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        // Try downloadAndSaveMediaMessage if available
        if (conn.downloadAndSaveMediaMessage) {
            const tmpPath = path.join(os.tmpdir(), `quoted_${Date.now()}`);
            const savedPath = await conn.downloadAndSaveMediaMessage(ms.message.extendedTextMessage.contextInfo, tmpPath);
            const buffer = fs.readFileSync(savedPath);
            fs.unlinkSync(savedPath);
            return buffer;
        }
        
        throw new Error('No download method available for quoted media');
    } catch (err) {
        throw new Error(`Quoted download failed: ${err.message}`);
    }
}

// Helper to download current media
async function downloadCurrentMedia(ms, conn, messageType) {
    try {
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        // Try downloadAndSaveMediaMessage if available
        if (conn.downloadAndSaveMediaMessage) {
            const tmpPath = path.join(os.tmpdir(), `media_${Date.now()}`);
            const savedPath = await conn.downloadAndSaveMediaMessage(ms, tmpPath);
            const buffer = fs.readFileSync(savedPath);
            fs.unlinkSync(savedPath);
            return buffer;
        }
        
        throw new Error('No download method available');
    } catch (err) {
        throw new Error(`Media download failed: ${err.message}`);
    }
}

module.exports = tourlCommand;
