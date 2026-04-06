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

// Counter for menu styles (starts at 0)
let menuStyleCounter = 0;

module.exports = {
    silacmd: "menu3",
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
        
        // Get current menu style (starts from 0)
        const menuStyle = menuStyleCounter;
        menuStyleCounter++;
        
        let menuText = "";
        
        // FIRST 10 MENUS - Use original code style
        if (menuStyle < 10) {
            // Original style
            menuText = `♱ *${config.botName} v${config.version}* ♱\n\n`;
            
            // Bot Info
            menuText += `┌───『 *BOT INFO* 』───\n`;
            menuText += `♱ ɴᴀᴍᴇ: ${config.botName || 'Unknown'}\n`;
            menuText += `♱ ᴠᴇʀsɪᴏɴ: ${config.version || '1.0.0'}\n`;
            menuText += `♱ ᴄʀᴇᴀᴛᴏʀ: ${config.creatorName || 'Unknown'}\n`;
            menuText += `♱ ᴘʀᴇғɪx: ${prefixe || '!'}\n`;
            menuText += `♱ ᴄᴏᴍᴍᴀɴᴅs: ${totalCommands || 0}\n`;
            menuText += `♱ ʀᴀᴍ: ${memoryUsage} MB\n`;
            menuText += `♱ ᴜᴘᴛɪᴍᴇ: ${days}d ${hours}h ${minutes}m ${seconds}s\n`;
            menuText += `└───────────────♱\n\n`;
            
            // Add commands by category
            for (const category of sortedCategories) {
                const commands = categories[category];
                if (!commands || !commands.length) continue;
                
                const catInfo = categoryConfig[category] || { name: category.toUpperCase() };
                
                menuText += `┌───『 *${catInfo.name}* 』───\n`;
                
                for (const cmd of commands) {
                    // Command name with badge
                    menuText += `♱ ${cmd.badge || ''}${prefixe || '!'}${cmd.name || 'cmd'}\n`;
                }
                
                menuText += `└───────────────♱\n\n`;
            }
            
            // Footer
            const footer = config.footer || 'ꜱɪʟᴀ Automated System';
            menuText += `_${footer}_`;
            
        } else {
            // AFTER 10 MENUS - Use different font styles for each menu
            const fontStyles = [
                { // Style 10+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const map = {'A':'𝘈','B':'𝘉','C':'𝘊','D':'𝘋','E':'𝘌','F':'𝘍','G':'𝘎','H':'𝘏','I':'𝘐','J':'𝘑','K':'𝘒','L':'𝘓','M':'𝘔','N':'𝘕','O':'𝘖','P':'𝘗','Q':'𝘘','R':'𝘙','S':'𝘚','T':'𝘛','U':'𝘜','V':'𝘝','W':'𝘞','X':'𝘟','Y':'𝘠','Z':'𝘡'};
                        return map[match] || match;
                    })
                },
                { // Style 11+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const map = {'A':'Ａ','B':'Ｂ','C':'Ｃ','D':'Ｄ','E':'Ｅ','F':'Ｆ','G':'Ｇ','H':'Ｈ','I':'Ｉ','J':'Ｊ','K':'Ｋ','L':'Ｌ','M':'Ｍ','N':'Ｎ','O':'Ｏ','P':'Ｐ','Q':'Ｑ','R':'Ｒ','S':'Ｓ','T':'Ｔ','U':'Ｕ','V':'Ｖ','W':'Ｗ','X':'Ｘ','Y':'Ｙ','Z':'Ｚ'};
                        return map[match] || match;
                    })
                },
                { // Style 12+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const map = {'A':'𝔸','B':'𝔹','C':'ℂ','D':'𝔻','E':'𝔼','F':'𝔽','G':'𝔾','H':'ℍ','I':'𝕀','J':'𝕁','K':'𝕂','L':'𝕃','M':'𝕄','N':'ℕ','O':'𝕆','P':'ℙ','Q':'ℚ','R':'ℝ','S':'𝕊','T':'𝕋','U':'𝕌','V':'𝕍','W':'𝕎','X':'𝕏','Y':'𝕐','Z':'ℤ'};
                        return map[match] || match;
                    })
                },
                { // Style 13+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const map = {'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ғ','G':'ɢ','H':'ʜ','I':'ɪ','J':'ᴊ','K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ','Q':'ǫ','R':'ʀ','S':'s','T':'ᴛ','U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x','Y':'ʏ','Z':'ᴢ'};
                        return map[match] || match;
                    })
                },
                { // Style 14+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const map = {'A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'ᵠ','R':'ᴿ','S':'ˢ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ'};
                        return map[match] || match;
                    })
                },
                { // Style 15+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const map = {'A':'𝗔','B':'𝗕','C':'𝗖','D':'𝗗','E':'𝗘','F':'𝗙','G':'𝗚','H':'𝗛','I':'𝗜','J':'𝗝','K':'𝗞','L':'𝗟','M':'𝗠','N':'𝗡','O':'𝗢','P':'𝗣','Q':'𝗤','R':'𝗥','S':'𝗦','T':'𝗧','U':'𝗨','V':'𝗩','W':'𝗪','X':'𝗫','Y':'𝗬','Z':'𝗭'};
                        return map[match] || match;
                    })
                },
                { // Style 16+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const map = {'A':'𝙰','B':'𝙱','C':'𝙲','D':'𝙳','E':'𝙴','F':'𝙵','G':'𝙶','H':'𝙷','I':'𝙸','J':'𝙹','K':'𝙺','L':'𝙻','M':'𝙼','N':'𝙽','O':'𝙾','P':'𝙿','Q':'𝚀','R':'𝚁','S':'𝚂','T':'𝚃','U':'𝚄','V':'𝚅','W':'𝚆','X':'𝚇','Y':'𝚈','Z':'𝚉'};
                        return map[match] || match;
                    })
                },
                { // Style 17+
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => {
                        let result = '';
                        for(let char of text.toUpperCase()) {
                            if(char >= 'A' && char <= 'D') {
                                const map = {'A':'🅰','B':'🅱','C':'🅲','D':'🅳'};
                                result += map[char] || char;
                            } else if(char >= 'E' && char <= 'Z') {
                                result += char;
                            } else {
                                result += char;
                            }
                        }
                        return result;
                    }
                },
                { // Style 18+ - mix of all
                    header: '♱ *NOCTURNAL SYSTEM* ♱',
                    border: '♱',
                    font: (text) => text.replace(/[A-Z]/g, match => {
                        const fonts = ['𝘈','Ａ','𝔸','ᴀ','ᴬ','𝗔','𝙰','🅰'];
                        const index = Math.floor(Math.random() * fonts.length);
                        const map = {
                            'A': fonts[index], 'B': fonts[index].replace('A','B'), 'C': fonts[index].replace('A','C'), 'D': fonts[index].replace('A','D')
                        };
                        return map[match] || match;
                    })
                }
            ];
            
            // Calculate which font style to use (cycles through the 8 font styles)
            const fontIndex = (menuStyle - 10) % fontStyles.length;
            const currentFont = fontStyles[fontIndex];
            
            // Build menu with font styling
            menuText = `${currentFont.header}\n\n`;
            
            // Bot Info with font
            menuText += `┌───『 *BOT INFO* 』───\n`;
            menuText += `${currentFont.border} ${currentFont.font('NAME')}: ${config.botName || 'Unknown'}\n`;
            menuText += `${currentFont.border} ${currentFont.font('VERSION')}: ${config.version || '1.0.0'}\n`;
            menuText += `${currentFont.border} ${currentFont.font('CREATOR')}: ${config.creatorName || 'Unknown'}\n`;
            menuText += `${currentFont.border} ${currentFont.font('PREFIX')}: ${prefixe || '!'}\n`;
            menuText += `${currentFont.border} ${currentFont.font('COMMANDS')}: ${totalCommands || 0}\n`;
            menuText += `${currentFont.border} ${currentFont.font('RAM')}: ${memoryUsage} MB\n`;
            menuText += `${currentFont.border} ${currentFont.font('UPTIME')}: ${days}d ${hours}h ${minutes}m ${seconds}s\n`;
            menuText += `└───────────────${currentFont.border}\n\n`;
            
            // Add commands by category with font
            for (const category of sortedCategories) {
                const commands = categories[category];
                if (!commands || !commands.length) continue;
                
                const catInfo = categoryConfig[category] || { name: category.toUpperCase() };
                
                menuText += `┌───『 *${currentFont.font(catInfo.name)}* 』───\n`;
                
                for (const cmd of commands) {
                    // Command name with badge and font
                    const cmdText = `${cmd.badge || ''}${prefixe || '!'}${cmd.name || 'cmd'}`;
                    menuText += `${currentFont.border} ${currentFont.font(cmdText.toUpperCase())}\n`;
                }
                
                menuText += `└───────────────${currentFont.border}\n\n`;
            }
            
            // Footer
            const footer = config.footer || 'ꜱɪʟᴀ Automated System';
            menuText += `_${footer}_`;
        }
        
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