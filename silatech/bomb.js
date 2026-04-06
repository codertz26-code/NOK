// ==================== BOMB COMMAND ====================
// Weka hii file katika folder ya silatech/bomb.js

const { delay } = require('baileys');

const bombCommand = {
    silacmd: "bomb",
    alias: ["spam", "flood", "blast"],
    category: "fun",
    description: "Send message multiple times to a target number",
    usage: ".bomb <target_number> <count> <message>",
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
            isOwner,
            isSudo,
            isSila,
            silaConfig 
        } = params;
        
        // Check permissions - only owner, sudo, or sila can use
        if (!isOwner && !isSudo && !isSila) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴏᴡɴᴇʀ, sᴜᴅᴏ ᴏʀ sɪʟᴀ! ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
        
        // Get quoted message
        const quoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        let targetNumber = "";
        let count = 0;
        let message = "";
        
        // Parse arguments
        if (args.length < 2) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 **ʙᴏᴍʙ ᴄᴏᴍᴍᴀɴᴅ** ♱\n\n` +
                      `> **ᴜsᴀɢᴇ:**\n` +
                      `> ${prefixe}bomb <ᴛᴀʀɢᴇᴛ_ɴᴜᴍʙᴇʀ> <ᴄᴏᴜɴᴛ> <ᴍᴇssᴀɢᴇ>\n` +
                      `> ${prefixe}bomb <ᴛᴀʀɢᴇᴛ_ɴᴜᴍʙᴇʀ> <ᴄᴏᴜɴᴛ> (ʀᴇᴘʟʏ ᴛᴏ ᴍᴇssᴀɢᴇ)\n\n` +
                      `> **ᴇxᴀᴍᴘʟᴇ:**\n` +
                      `> ${prefixe}bomb 255712345678 5 ʜᴇʟʟᴏ ᴡᴏʀʟᴅ\n` +
                      `> ${prefixe}bomb 255712345678 10 (ʀᴇᴘʟʏ ᴛᴏ ᴍᴇssᴀɢᴇ)\n\n` +
                      `> ⚠️ **ɴᴏᴛᴇ:** ᴅᴏ ɴᴏᴛ ᴜsᴇ + ɪɴ ɴᴜᴍʙᴇʀ`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
        
        // First argument: target number
        targetNumber = args[0].replace(/[^0-9]/g, ''); // Remove non-numeric characters
        
        if (!targetNumber || targetNumber.length < 10) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴛᴀʀɢᴇᴛ ɴᴜᴍʙᴇʀ! ♱\n` +
                      `> ᴇxᴀᴍᴘʟᴇ: 255712345678 ᴏʀ 2557123456789`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
        
        // Second argument: count
        count = parseInt(args[1]);
        
        if (isNaN(count) || count < 1) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴄᴏᴜɴᴛ! ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
        
        // Limit max bombs to prevent abuse
        const maxBombs = 50;
        if (count > maxBombs) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 ᴍᴀxɪᴍᴜᴍ ʙᴏᴍʙs ɪs ${maxBombs}! ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
        
        // Build target JID
        const targetJid = `${targetNumber}@s.whatsapp.net`;
        
        // Get message content
        if (quoted) {
            // If replying to a message, use that message content
            const quotedText = quoted.conversation || 
                              quoted.extendedTextMessage?.text || 
                              quoted.imageMessage?.caption || 
                              quoted.videoMessage?.caption || 
                              "[ᴍᴇᴅɪᴀ ᴍᴇssᴀɢᴇ]";
            message = quotedText;
        } else {
            // Use remaining args as message (skip first 2: number and count)
            message = args.slice(2).join(" ");
        }
        
        if (!message || message.trim() === "") {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴍᴇssᴀɢᴇ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴏɴᴇ! ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
        
        // Get bot identity
        const botIdentity = silaConfig.getBotConfig();
        
        // Send initial confirmation to sender
        await conn.sendMessage(from, {
            text: `> ♱ 👻 **ʙᴏᴍʙ ʟᴀᴜɴᴄʜɪɴɢ...** ♱\n` +
                  `> 🎯 ᴛᴀʀɢᴇᴛ: ${targetNumber}\n` +
                  `> 💣 ᴄᴏᴜɴᴛ: ${count}\n` +
                  `> 📨 ᴍᴇssᴀɢᴇ: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
        }, { quoted: ms });
        
        // Bomb loop - send to target
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 1; i <= count; i++) {
            try {
                // Add bomb number to message
                const numberedMessage = `> ♱ 👻 **ʙᴏᴍʙ ${i}/${count}** ♱\n\n> ${message}`;
                
                await conn.sendMessage(targetJid, {
                    text: numberedMessage,
                    contextInfo: silaConfig.getContextInfo(targetJid, botIdentity)
                });
                
                successCount++;
                
                // Small delay to prevent rate limiting (100ms)
                await delay(100);
                
            } catch (error) {
                failCount++;
                console.error(`Bomb ${i} failed:`, error);
            }
        }
        
        // Send completion message to sender
        const resultMessage = `> ♱ 👻 **ʙᴏᴍʙ ᴍɪssɪᴏɴ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!** ♱\n` +
                             `> 🎯 ᴛᴀʀɢᴇᴛ: ${targetNumber}\n` +
                             `> ✅ sᴜᴄᴄᴇss: ${successCount}\n` +
                             `> ❌ ғᴀɪʟᴇᴅ: ${failCount}\n` +
                             `> 💥 ᴛᴏᴛᴀʟ: ${count}`;
        
        await conn.sendMessage(from, {
            text: resultMessage,
            contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
        });
    }
};

module.exports = bombCommand;
