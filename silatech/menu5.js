// silatech/menu5.js
module.exports = {
    silacmd: "menu",
    alias: ["menu", "help5", "cmds5"],
    category: "general",
    description: "Show bot menu with image",
    usage: "menu5",
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe, senderNumber, botName, pushName, sender }) {
        
        const config = require('../config.js');
        const botIdentity = silaConfig.getBotConfig();
        const axios = require('axios');
        
        // Menu image URL (default)
        const MENU_IMAGE = "https://files.catbox.moe/98k75b.jpeg";
        
        // Get saved image from config if exists
        let menuImageUrl = MENU_IMAGE;
        try {
            const savedImage = silaConfig.getImage("menu");
            if (savedImage && savedImage !== silaConfig.DEFAULT_IMAGES.menu) {
                menuImageUrl = savedImage;
            }
        } catch (e) {
            menuImageUrl = MENU_IMAGE;
        }
        
        // Use correct prefix
        const prefix = config.PREFIX || ".";
        
        // Get styled bot name
        let styledBotName = botName || botIdentity.botName;
        if (silaConfig.applyFont) {
            styledBotName = silaConfig.applyFont(styledBotName, "small");
        }
        
        // Get username
        let userName = "User";
        if (pushName) {
            userName = pushName;
        } else if (sender) {
            userName = sender.split('@')[0] || "User";
        }
        
        // Calculate uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        
        let uptimeStr = "";
        if (days > 0) uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        else if (hours > 0) uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
        else if (minutes > 0) uptimeStr = `${minutes}m ${seconds}s`;
        else uptimeStr = `${seconds}s`;
        
        // Build menu text
        const menuText = `┌───『 ${styledBotName} 』───${botIdentity.mainSymbol}
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} *✦ ɢᴇɴᴇʀᴀʟ ᴄᴏᴍᴍᴀɴᴅs*
${botIdentity.mainSymbol}   alive3 - Check bot status
${botIdentity.mainSymbol}   menu5 - Show this menu
${botIdentity.mainSymbol}   owner2 - Show owner info
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} *✦ ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅs*
${botIdentity.mainSymbol}   }setname <name> - Change bot name
${botIdentity.mainSymbol}   setsymbol <m> <s> <a> - Change symbols
${botIdentity.mainSymbol}   }setcreator <name> <num> - Change creator
${botIdentity.mainSymbol}   setfooter <text> - Change footer
${botIdentity.mainSymbol}   setemoji <s> <e> <w> - Change emojis
${botIdentity.mainSymbol}   setstatus <s> <d> - Change status
${botIdentity.mainSymbol}   setimage menu <url> - Change this image
${botIdentity.mainSymbol}   viewbot - View bot config
${botIdentity.mainSymbol}   resetbot confirm - Reset to default
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} *✦ sᴛᴀᴛɪsᴛɪᴄs*
${botIdentity.mainSymbol}   👤 ᴜsᴇʀ: ${userName}
${botIdentity.mainSymbol}   🤖 ʙᴏᴛ: ${styledBotName}
${botIdentity.mainSymbol}   📌 ᴘʀᴇғɪx: .
${botIdentity.mainSymbol}   ⚡ ᴍᴏᴅᴇ: ${config.MODE.toUpperCase()}
${botIdentity.mainSymbol}   ⏰ ᴜᴘᴛɪᴍᴇ: ${uptimeStr}
${botIdentity.mainSymbol}
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;

        // Download and send image with caption (same method as your menu.js)
        try {
            // Download the image
            const response = await axios.get(menuImageUrl, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const imageBuffer = Buffer.from(response.data, 'binary');
            
            // Prepare message options
            const messageOptions = {
                image: imageBuffer,
                caption: menuText,
                contextInfo: {}
            };
            
            // Add mentioned Jid if available
            if (ms && ms.sender) {
                messageOptions.contextInfo.mentionedJid = [ms.sender];
            }
            
            // Add forwarding info if newsletter config exists
            if (botIdentity && botIdentity.newsletterJid && botIdentity.newsletterName) {
                messageOptions.contextInfo.forwardingScore = 999;
                messageOptions.contextInfo.isForwarded = true;
                messageOptions.contextInfo.forwardedNewsletterMessageInfo = {
                    newsletterJid: botIdentity.newsletterJid,
                    newsletterName: botIdentity.newsletterName,
                    serverMessageId: 143
                };
            }
            
            // Send message with image
            await conn.sendMessage(from, messageOptions, { quoted: ms });
            
        } catch (imgError) {
            console.error('Menu5 image error:', imgError.message);
            
            // Fallback: Send as plain text only
            try {
                const textOptions = {
                    text: menuText,
                    contextInfo: {}
                };
                
                if (ms && ms.sender) {
                    textOptions.contextInfo.mentionedJid = [ms.sender];
                }
                
                if (botIdentity && botIdentity.newsletterJid && botIdentity.newsletterName) {
                    textOptions.contextInfo.forwardingScore = 999;
                    textOptions.contextInfo.isForwarded = true;
                    textOptions.contextInfo.forwardedNewsletterMessageInfo = {
                        newsletterJid: botIdentity.newsletterJid,
                        newsletterName: botIdentity.newsletterName,
                        serverMessageId: 143
                    };
                }
                
                await conn.sendMessage(from, textOptions, { quoted: ms });
            } catch (textError) {
                console.error('Menu5 text error:', textError);
                // Last resort
                await repondre(menuText);
            }
        }
    }
};