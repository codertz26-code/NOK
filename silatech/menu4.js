// silatech/menu.js - Automatic Menu Generator
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    silacmd: "menu4",
    alias: ["allmenu", "help", "list"],
    category: "general",
    description: "Show all available commands organized by category",
    usage: "menu",
    function: async (from, sila, { repondre, args, prefixe, botName, sender }) => {
        
        // === CONFIGURATION ===
        const BOT_INFO = {
            name: "♱ ɴ o c т u r n a l ♱",
            version: "1.0.0",
            creator: "SILA",
            prefix: prefixe || "."
        };
        
        // === LOAD ALL COMMANDS ===
        const commandsDir = path.join(__dirname); // silatech folder
        const categories = {};
        let totalCommands = 0;
        
        // Read all .js files in commands directory
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            try {
                const cmdPath = path.join(commandsDir, file);
                delete require.cache[require.resolve(cmdPath)];
                const cmd = require(cmdPath);
                
                if (cmd.silacmd && cmd.category) {
                    const cat = cmd.category.toLowerCase();
                    if (!categories[cat]) categories[cat] = [];
                    
                    categories[cat].push({
                        name: cmd.silacmd,
                        alias: cmd.alias || [],
                        desc: cmd.description || "",
                        ownerOnly: cat === 'owner' || (cmd.function && cmd.function.toString().includes('isOwner')),
                        sudoOnly: cmd.function && cmd.function.toString().includes('isSudo'),
                        premiumOnly: cat === 'premium' || (cmd.function && cmd.function.toString().includes('isPremium'))
                    });
                    totalCommands++;
                }
            } catch (err) {
                console.error(`Error loading ${file}:`, err.message);
            }
        }
        
        // === CATEGORY DISPLAY NAMES ===
        const catNames = {
            owner: "ᴏᴡɴᴇʀ",
            general: "ᴍᴀɪɴ ᴍᴇɴᴜ",
            download: "ᴅᴏᴡɴʟᴏᴀᴅᴇʀ",
            group: "ɢʀᴏᴜᴘ ᴄᴏᴍᴍᴀɴᴅs",
            tools: "ᴛᴏᴏʟs",
            fun: "ғᴜɴ",
            premium: "ᴘʀᴇᴍɪᴜᴍ",
            security: "sᴇᴄᴜʀɪᴛʏ",
            subbot: "sᴜʙʙᴏᴛ",
            nsfw: "ɴsғᴡ",
            search: "sᴇᴀʀᴄʜ",
            info: "ɪɴғᴏ",
            other: "ᴏᴛʜᴇʀ"
        };
        
        // === SYSTEM INFO ===
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const uptime = formatUptime(process.uptime());
        
        // === BUILD MENU ===
        let menuText = `♱ 👻 *${BOT_INFO.name} ᴠ${BOT_INFO.version}* 👻 ♱\n\n`;
        
        // Bot Info Section
        menuText += `┌───『 *ʙᴏᴛ ɪɴғᴏ* 』───\n`;
        menuText += `♱ ɴᴀᴍᴇ: ${BOT_INFO.name}\n`;
        menuText += `♱ ᴠᴇʀsɪᴏɴ: ${BOT_INFO.version}\n`;
        menuText += `♱ ᴄʀᴇᴀᴛᴏʀ: ${BOT_INFO.creator}\n`;
        menuText += `♱ ᴘʀᴇғɪx: ${BOT_INFO.prefix}\n`;
        menuText += `♱ ᴄᴏᴍᴍᴀɴᴅs: ${totalCommands}\n`;
        menuText += `♱ ʀᴀᴍ: ${ramUsed} ᴍʙ\n`;
        menuText += `♱ ᴜᴘᴛɪᴍᴇ: ${uptime}\n`;
        menuText += `└───────────────♱\n\n`;
        
        // Category Order (customize as needed)
        const categoryOrder = [
            'general', 'download', 'group', 'tools', 'fun', 
            'security', 'premium', 'owner', 'subbot', 'search', 
            'nsfw', 'info', 'other'
        ];
        
        // Generate each category
        for (const catKey of categoryOrder) {
            if (categories[catKey] && categories[catKey].length > 0) {
                const displayName = catNames[catKey] || catKey.toUpperCase();
                menuText += `┌───『 *${displayName}* 』───\n`;
                
                // Sort commands alphabetically
                categories[catKey].sort((a, b) => a.name.localeCompare(b.name));
                
                for (const cmd of categories[catKey]) {
                    let icon = "♱";
                    if (cmd.ownerOnly) icon = "👑";
                    else if (cmd.sudoOnly) icon = "⚡";
                    else if (cmd.premiumOnly) icon = "💎";
                    
                    menuText += `${icon} ${BOT_INFO.prefix}${cmd.name}\n`;
                }
                
                menuText += `└───────────────♱\n\n`;
            }
        }
        
        menuText += `_♱ ɴ o c т u r n a l ♱_`;
        
        await repondre(menuText);
    }
};

// Helper: Format uptime
function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    let result = "";
    if (d > 0) result += `${d}ᴅ `;
    if (h > 0) result += `${h}ʜ `;
    if (m > 0) result += `${m}ᴍ `;
    if (s > 0 || result === "") result += `${s}s`;
    
    return result.trim();
}
