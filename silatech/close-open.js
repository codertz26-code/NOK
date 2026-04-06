// silatech/groupopenclose.js
// Group Open/Close Commands - Lock and Unlock Group

const config = require('../config');

module.exports = [
    // ==================== GROUP OPEN COMMANDS ====================
    {
        silacmd: "groupopen",
        alias: ["open", "unlock", "unlockgroup"],
        category: "group",
        description: "Open group settings (allow anyone to send messages)",
        usage: "groupopen",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                
                if (!groupMetadata.announce) {
                    return repondre(`┌───『 *ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ɪs ᴀʟʀᴇᴀᴅʏ ᴏᴘᴇɴ
${botConfig.mainSymbol} ᴇᴠᴇʀʏᴏɴᴇ ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                }
                
                await conn.groupSettingUpdate(from, 'not_announcement');
                
                return repondre(`┌───『 *ɢʀᴏᴜᴘ ᴏᴘᴇɴᴇᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴏᴘᴇɴᴇᴅ
${botConfig.mainSymbol} ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴄᴀɴ ɴᴏᴡ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Group open error:', error);
                return repondre(`> 👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴏᴘᴇɴ ɢʀᴏᴜᴘ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    },
    {
        silacmd: "unlock",
        alias: ["open2", "unlockgroup2"],
        category: "group",
        description: "Open group settings (alternative command)",
        usage: "unlock",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                
                if (!groupMetadata.announce) {
                    return repondre(`┌───『 *ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ɪs ᴀʟʀᴇᴀᴅʏ ᴏᴘᴇɴ
${botConfig.mainSymbol} ᴇᴠᴇʀʏᴏɴᴇ ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                }
                
                await conn.groupSettingUpdate(from, 'not_announcement');
                
                return repondre(`┌───『 *ɢʀᴏᴜᴘ ᴜɴʟᴏᴄᴋᴇᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴜɴʟᴏᴄᴋᴇᴅ
${botConfig.mainSymbol} ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴄᴀɴ ɴᴏᴡ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Unlock error:', error);
                return repondre(`> 👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜɴʟᴏᴄᴋ ɢʀᴏᴜᴘ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    },
    
    // ==================== GROUP CLOSE COMMANDS ====================
    {
        silacmd: "groupclose",
        alias: ["close", "lock", "lockgroup"],
        category: "group",
        description: "Close group settings (only admins can send messages)",
        usage: "groupclose",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                
                if (groupMetadata.announce) {
                    return repondre(`┌───『 *ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ɪs ᴀʟʀᴇᴀᴅʏ ᴄʟᴏsᴇᴅ
${botConfig.mainSymbol} ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                }
                
                await conn.groupSettingUpdate(from, 'announcement');
                
                return repondre(`┌───『 *ɢʀᴏᴜᴘ ᴄʟᴏsᴇᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴄʟᴏsᴇᴅ
${botConfig.mainSymbol} ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ɴᴏᴡ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Group close error:', error);
                return repondre(`> 👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    },
    {
        silacmd: "lock",
        alias: ["close2", "lockgroup2"],
        category: "group",
        description: "Close group settings (alternative command)",
        usage: "lock",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                
                if (groupMetadata.announce) {
                    return repondre(`┌───『 *ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ɪs ᴀʟʀᴇᴀᴅʏ ʟᴏᴄᴋᴇᴅ
${botConfig.mainSymbol} ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                }
                
                await conn.groupSettingUpdate(from, 'announcement');
                
                return repondre(`┌───『 *ɢʀᴏᴜᴘ ʟᴏᴄᴋᴇᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ʟᴏᴄᴋᴇᴅ
${botConfig.mainSymbol} ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ɴᴏᴡ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botConfig.mainSymbol}
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Lock error:', error);
                return repondre(`> 👻 ғᴀɪʟᴇᴅ ᴛᴏ ʟᴏᴄᴋ ɢʀᴏᴜᴘ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    }
];