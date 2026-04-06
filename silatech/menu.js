// silatech/menu.js
// Auto-generating menu with ♱ ɴ o c т u r n a l ♱ style
// With carousel images support

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

// Different menu styles (5 variations)
let menuStyleCounter = 0;

module.exports = {
    silacmd: "menu2",
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
        
        // Organize by category
        for (const [cmdName, cmd] of mainCommands) {
            const category = cmd.category || "uncategorized";
            if (!categories[category]) {
                categories[category] = [];
            }
            
            // Check if user can see this command
            let canSee = true;
            let badge = "";
            
            if (cmd.owner && !isOwner && !isSudo && senderNumber !== config.creatorNumber) {
                canSee = false;
            } else if (cmd.owner) {
                badge = "👑 ";
            } else if (cmd.sudo && !isSudo && !isOwner && senderNumber !== config.creatorNumber) {
                canSee = false;
            } else if (cmd.sudo) {
                badge = "⚡ ";
            } else if (cmd.premium && !isPremium && !isSudo && !isOwner && senderNumber !== config.creatorNumber) {
                canSee = false;
            } else if (cmd.premium) {
                badge = "💎 ";
            }
            
            if (canSee) {
                categories[category].push({
                    name: cmdName,
                    desc: cmd.description || "No description",
                    usage: cmd.usage || cmdName,
                    badge: badge,
                    alias: cmd.alias || []
                });
            }
        }
        
        // Category configuration with order
        const categoryConfig = {
            "general": { name: "MAIN MENU", order: 1 },
            "download": { name: "DOWNLOADER", order: 2 },
            "group": { name: "GROUP COMMANDS", order: 3 },
            "tools": { name: "TOOLS", order: 4 },
            "fun": { name: "FUN", order: 5 },
            "settings": { name: "SETTINGS", order: 6 },
            "media": { name: "MEDIA", order: 7 },
            "owner": { name: "OWNER", order: 8 },
            "sudo": { name: "SUDO", order: 9 },
            "premium": { name: "PREMIUM", order: 10 },
            "anti": { name: "ANTI FEATURES", order: 11 },
            "uncategorized": { name: "OTHER", order: 99 }
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
        
        // Rotate menu style (0-4) for each user
        const menuStyle = menuStyleCounter % 5;
        menuStyleCounter++;
        
        // Define 5 different styles with unique borders, headers, and command fonts
        const styles = [
            {
                // Style 0: Nocturnal Gothic
                header: '♱ *NOCTURNAL SYSTEM* ♱',
                border: '♱',
                suffix: 'ɴ o c т u r n a l',
                cmdFont: (cmd) => `ᴄᴍᴅ: ${cmd}`,
                categoryFont: (name) => `『 ${name} 』`,
                infoFont: (text) => `📜 ${text}`
            },
            {
                // Style 1: Cyber Neon
                header: '⚡ *SILA COMMANDS* ⚡',
                border: '⚡',
                suffix: 's i l a   m d',
                cmdFont: (cmd) => `⌨️ ${cmd}`,
                categoryFont: (name) => `▸ ${name} ◂`,
                infoFont: (text) => `💠 ${text}`
            },
            {
                // Style 2: Dark Moon
                header: '🌙 *DARK MENU* 🌙',
                border: '🌙',
                suffix: 'd a r k   s y s t e m',
                cmdFont: (cmd) => `🌑 ${cmd}`,
                categoryFont: (name) => `◆ ${name} ◆`,
                infoFont: (text) => `🌌 ${text}`
            },
            {
                // Style 3: Mystic Magic
                header: '🔮 *MYSTIC COMMANDS* 🔮',
                border: '🔮',
                suffix: 'm y s t i c',
                cmdFont: (cmd) => `🔮 ${cmd}`,
                categoryFont: (name) => `✧ ${name} ✧`,
                infoFont: (text) => `✨ ${text}`
            },
            {
                // Style 4: Royal Void
                header: '✨ *SILA MD* ✨',
                border: '✨',
                suffix: 's i l a   v o i d',
                cmdFont: (cmd) => `⭐ ${cmd}`,
                categoryFont: (name) => `❖ ${name} ❖`,
                infoFont: (text) => `💫 ${text}`
            }
        ];
        
        const currentStyle = styles[menuStyle];
        const borderChar = currentStyle.border;
        
        // Build menu text with dynamic style
        let menuText = `${currentStyle.header}\n\n`;
        
        // Bot Info with dynamic font
        menuText += `┌───『 *BOT INFO* 』───\n`;
        menuText += `${borderChar} ${currentStyle.infoFont('ɴᴀᴍᴇ')}: ${config.botName || 'Unknown'}\n`;
        menuText += `${borderChar} ${currentStyle.infoFont('ᴠᴇʀsɪᴏɴ')}: ${config.version || '1.0.0'}\n`;
        menuText += `${borderChar} ${currentStyle.infoFont('ᴄʀᴇᴀᴛᴏʀ')}: ${config.creatorName || 'Unknown'}\n`;
        menuText += `${borderChar} ${currentStyle.infoFont('ᴘʀᴇғɪx')}: ${prefixe || '!'}\n`;
        menuText += `${borderChar} ${currentStyle.infoFont('ᴄᴏᴍᴍᴀɴᴅs')}: ${totalCommands || 0}\n`;
        menuText += `${borderChar} ${currentStyle.infoFont('ʀᴀᴍ')}: ${memoryUsage} MB\n`;
        menuText += `${borderChar} ${currentStyle.infoFont('ᴜᴘᴛɪᴍᴇ')}: ${days}d ${hours}h ${minutes}m ${seconds}s\n`;
        menuText += `└───────────────${borderChar}\n\n`;
        
        // Add commands by category with dynamic fonts
        for (const category of sortedCategories) {
            const commands = categories[category];
            if (!commands || !commands.length) continue;
            
            const catInfo = categoryConfig[category] || { name: category.toUpperCase() };
            
            menuText += `┌───${currentStyle.categoryFont(catInfo.name)}───\n`;
            
            for (const cmd of commands) {
                // Command name with dynamic font and badge
                const formattedCmd = currentStyle.cmdFont(`${cmd.badge || ''}${prefixe || '!'}${cmd.name || 'cmd'}`);
                menuText += `${borderChar} ${formattedCmd}\n`;
            }
            
            menuText += `└───────────────${borderChar}\n\n`;
        }
        
        // Footer with dynamic suffix
        const footer = config.footer || 'ꜱɪʟᴀ Automated System';
        menuText += `_${footer}_\n`;
        menuText += `${borderChar} ${currentStyle.suffix} ${borderChar}`;
        
        // Get current image and rotate
        const currentImage = MENU_IMAGES[currentImageIndex];
        currentImageIndex = (currentImageIndex + 1) % MENU_IMAGES.length;
        
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