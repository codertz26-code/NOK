// silatech/botconfig.js
module.exports = [
    {
        silacmd: "setfooter",
        alias: ["botfooter", "changefooter"],
        category: "owner",
        description: "Change bot footer message",
        usage: "setfooter <new footer>",
        owner: true,
        
        async function(from, conn, { repondre, args, silaConfig, prefixe }) {
            if (!args.length) {
                const current = silaConfig.getBotConfig();
                return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ ғᴏᴏᴛᴇʀ: ${current.footer}\n\n> ♱ ᴜsᴀɢᴇ: ${prefixe}setfooter ♱ 𝐏𝐨𝐰𝐞𝐝 𝐛𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡 ♱`);
            }
            
            const newFooter = args.join(" ");
            const success = silaConfig.updateFooter(newFooter);
            
            if (success) {
                return repondre(`> ♱ ғᴏᴏᴛᴇʀ ᴜᴘᴅᴀᴛᴇᴅ!
> ✨ ${newFooter}
> 🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ`);
            } else {
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ғᴏᴏᴛᴇʀ`);
            }
        }
    },
    {
        silacmd: "setbotdescr",
        alias: ["setdescription", "setbotdesc", "changedesc"],
        category: "owner",
        description: "Change bot description (from config.js)",
        usage: "setbotdescr <new description>",
        owner: true,
        
        async function(from, conn, { repondre, args, silaConfig, prefixe }) {
            const fs = require('fs');
            
            if (!args.length) {
                const config = require('../config.js');
                return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: ${config.DESCRIPTION || "Not set"}\n\n> ♱ ᴜsᴀɢᴇ: ${prefixe}setbotdescr *> ♱ 𝐏𝐨𝐰𝐞𝐝 𝐛𝐲 𝐒𝐢𝐥𝐚 𝐓𝐞𝐜𝐡 ♱*`);
            }
            
            const newDescription = args.join(" ");
            const configPath = './config.js';
            
            try {
                let configContent = fs.readFileSync(configPath, 'utf8');
                
                // Update DESCRIPTION line
                const descRegex = /(DESCRIPTION:\s*process\.env\.DESCRIPTION\s*\|\|\s*)"[^"]*"/;
                const newDescLine = `$1"${newDescription.replace(/"/g, '\\"')}"`;
                
                if (descRegex.test(configContent)) {
                    configContent = configContent.replace(descRegex, newDescLine);
                } else {
                    // Try alternative pattern
                    const altRegex = /(DESCRIPTION:\s*)"[^"]*"/;
                    configContent = configContent.replace(altRegex, `$1"${newDescription.replace(/"/g, '\\"')}"`);
                }
                
                fs.writeFileSync(configPath, configContent, 'utf8');
                
                return repondre(`> ♱ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ ᴜᴘᴅᴀᴛᴇᴅ!
> ✨ ${newDescription}
> 🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ ғᴏʀ ᴄʜᴀɴɢᴇs`);
                
            } catch (error) {
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: ${error.message}`);
            }
        }
    }
];