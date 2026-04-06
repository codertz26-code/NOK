// silatech/menu.js
// Auto-generating menu with ♱ ɴ o c т u r n a l ♱ style
// With carousel images support - FREE FOR ALL USERS

const os = require('os');
const fs = require('fs');
const axios = require('axios');

// Image URLs for carousel
const MENU_IMAGES = [
    'https://raw.githubusercontent.com/Sila-Md/Sila-data/refs/heads/main/Sila/nocturnal1.png',
    'https://raw.githubusercontent.com/Sila-Md/Sila-data/refs/heads/main/Sila/nocturnal2.png'
];

// Current image index for rotation
let currentImageIndex = 0;

module.exports = {
    silacmd: "menu5",
    alias: ["help", "commands", "cmdlist", "allcmd"],
    category: "general",
    description: "Show all available commands with categories",
    usage: "menu",
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe, senderNumber, isPremium, isOwner, isSudo }) {
        const config = silaConfig.getBotConfig();
        
        // Load settings for anti features status
        let conf = {};
        try {
            conf = JSON.parse(fs.readFileSync('./settings.json'));
        } catch (e) {
            conf = {};
        }
        
        // Group commands by category
        const categories = {};
        const allCommands = global.silaCommands;
        
        // Collect all commands (main commands only, no duplicates)
        const mainCommands = new Map();
        for (const [cmdName, cmd] of allCommands) {
            if (cmd.silacmd === cmdName) {
                mainCommands.set(cmdName, cmd);
            }
        }
        
        // Organize by category - SHOW ALL COMMANDS TO EVERYONE
        for (const [cmdName, cmd] of mainCommands) {
            const category = cmd.category || "uncategorized";
            if (!categories[category]) {
                categories[category] = [];
            }
            
            // Add badges based on command type but SHOW to everyone
            let badge = "";
            
            if (cmd.owner) {
                badge = "👑 ";
            } else if (cmd.sudo) {
                badge = "⚡ ";
            } else if (cmd.premium) {
                badge = "💎 ";
            }
            
            // Add command to list - NO RESTRICTIONS, everyone can see
            categories[category].push({
                name: cmdName,
                desc: cmd.description || "No description",
                usage: cmd.usage || cmdName,
                badge: badge,
                alias: cmd.alias || []
            });
        }
        
        // Category configuration with order and small caps fonts
        const categoryConfig = {
            "general": { name: "ᴍᴀɪɴ ᴍᴇɴᴜ", order: 1 },
            "download": { name: "ᴅᴏᴡɴʟᴏᴀᴅᴇʀ", order: 2 },
            "group": { name: "ɢʀᴏᴜᴘ ᴄᴏᴍᴍᴀɴᴅs", order: 3 },
            "tools": { name: "ᴛᴏᴏʟs", order: 4 },
            "fun": { name: "ғᴜɴ", order: 5 },
            "settings": { name: "sᴇᴛᴛɪɴɢs", order: 6 },
            "media": { name: "ᴍᴇᴅɪᴀ", order: 7 },
            "owner": { name: "ᴏᴡɴᴇʀ", order: 8 },
            "sudo": { name: "sᴜᴅᴏ", order: 9 },
            "premium": { name: "ᴘʀᴇᴍɪᴜᴍ", order: 10 },
            "anti": { name: "ᴀɴᴛɪ ғᴇᴀᴛᴜʀᴇs", order: 11 },
            "uncategorized": { name: "ᴏᴛʜᴇʀ", order: 99 }
        };
        
        // Sort categories by order
        const sortedCategories = Object.keys(categories).sort((a, b) => {
            const orderA = categoryConfig[a]?.order || 99;
            const orderB = categoryConfig[b]?.order || 99;
            return orderA - orderB;
        });
        
        // Calculate stats
        const totalCommands = mainCommands.size;
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        
        // Get current image and rotate
        const currentImage = MENU_IMAGES[currentImageIndex];
        currentImageIndex = (currentImageIndex + 1) % MENU_IMAGES.length;
        
        // Build menu text with ♱ 👻 small caps style
        let menuText = `♱ 👻 *${config.botName} ᴠ${config.version}* 👻 ♱\n\n`;
        
        // Bot Info with small caps
        menuText += `┌───『 *ʙᴏᴛ ɪɴғᴏ* 』───\n`;
        menuText += `♱ ɴᴀᴍᴇ: ${config.botName || 'Unknown'}\n`;
        menuText += `♱ ᴠᴇʀsɪᴏɴ: ${config.version || '1.0.0'}\n`;
        menuText += `♱ ᴄʀᴇᴀᴛᴏʀ: ${config.creatorName || 'Unknown'}\n`;
        menuText += `♱ ᴘʀᴇғɪx: ${prefixe || '!'}\n`;
        menuText += `♱ ᴄᴏᴍᴍᴀɴᴅs: ${totalCommands || 0}\n`;
        menuText += `♱ ʀᴀᴍ: ${memoryUsage} ᴍʙ\n`;
        menuText += `♱ ᴜᴘᴛɪᴍᴇ: ${days}ᴅ ${hours}ʜ ${minutes}ᴍ ${seconds}s\n`;
        menuText += `└───────────────♱\n\n`;
        
        // Add commands by category
        for (const category of sortedCategories) {
            const commands = categories[category];
            if (!commands || !commands.length) continue;
            
            const catInfo = categoryConfig[category] || { name: category.toUpperCase() };
            
            menuText += `┌───『 *${catInfo.name}* 』───\n`;
            
            for (const cmd of commands) {
                // Command name with badge - convert to small caps style
                const cmdNameSmall = cmd.name.toLowerCase();
                menuText += `♱ ${cmd.badge || ''}${prefixe || '!'}${cmdNameSmall}\n`;
            }
            
            menuText += `└───────────────♱\n\n`;
        }
        
        // Footer with small caps - FREE FOR ALL
        const footer = config.footer || 'ꜱɪʟᴀ ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ꜱʏꜱᴛᴇᴍ';
        menuText += `_${footer}_\n`;
        menuText += `♱ 👻 ᴛʏᴘᴇ ${prefixe || '!'}ʜᴇʟᴘ <ᴄᴏᴍᴍᴀɴᴅ> ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ 👻 ♱`;
        
        // Download image and send with menu
        try {
            // Download the image
            const response = await axios.get(currentImage, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const imageBuffer = Buffer.from(response.data, 'binary');
            
            // Prepare message options - ensure no undefined values
            const messageOptions = {
                image: imageBuffer,
                caption: menuText,
                contextInfo: {}
            };
            
            // Only add contextInfo properties if they exist
            if (ms && ms.sender) {
                messageOptions.contextInfo.mentionedJid = [ms.sender];
            }
            
            // Only add forwarding info if newsletter config exists
            if (config && config.newsletterJid && config.newsletterName) {
                messageOptions.contextInfo.forwardingScore = 999;
                messageOptions.contextInfo.isForwarded = true;
                messageOptions.contextInfo.forwardedNewsletterMessageInfo = {
                    newsletterJid: config.newsletterJid,
                    newsletterName: config.newsletterName,
                    serverMessageId: 143
                };
            }
            
            // Send message with image
            await conn.sendMessage(from, messageOptions, { quoted: ms });
            
        } catch (imgError) {
            console.error('Image download/send error:', imgError.message);
            
            // Fallback: Send as plain text only
            try {
                const textOptions = {
                    text: menuText,
                    contextInfo: {}
                };
                
                if (ms && ms.sender) {
                    textOptions.contextInfo.mentionedJid = [ms.sender];
                }
                
                if (config && config.newsletterJid && config.newsletterName) {
                    textOptions.contextInfo.forwardingScore = 999;
                    textOptions.contextInfo.isForwarded = true;
                    textOptions.contextInfo.forwardedNewsletterMessageInfo = {
                        newsletterJid: config.newsletterJid,
                        newsletterName: config.newsletterName,
                        serverMessageId: 143
                    };
                }
                
                await conn.sendMessage(from, textOptions, { quoted: ms });
            } catch (textError) {
                console.error('Text send error:', textError);
                // Last resort fallback
                await repondre(menuText);
            }
        }
    }
};
