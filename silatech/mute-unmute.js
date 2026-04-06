// silatech/mutecmd.js
module.exports = [
    // ========== MUTE COMMANDS (3) ==========
    {
        silacmd: "mute",
        alias: ["silence", "lockchat"],
        category: "group",
        description: "Mute group (only admins can send messages)",
        usage: "mute",
        group: true,
        admin: true,
        botAdmin: true,
        
        async function(from, conn, { repondre, args, prefixe, isGroup, participant, pushName }) {
            if (from.endsWith('@g.us')) {
                try {
                    const silaConfig = require('../silamd/sila.js');
                    const botIdentity = silaConfig.getBotConfig();
                    const config = require('../config.js');
                    
                    await conn.groupSettingUpdate(from, {
                        restrict: true,
                        announce: true
                    });
                    
                    const response = `┌───『 ${botIdentity.mainSymbol} ᴍᴜᴛᴇ ᴄᴏᴍᴍᴀɴᴅ ${botIdentity.mainSymbol} 』───┐
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} 🔇 ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴍᴜᴛᴇᴅ
${botIdentity.mainSymbol} 👑 ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ: ${pushName || participant.split('@')[0]}
${botIdentity.mainSymbol} 📌 ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botIdentity.mainSymbol}
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;
                    
                    return await repondre(response);
                    
                } catch (error) {
                    console.error('Mute error:', error);
                    return await repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴍᴜᴛᴇ ɢʀᴏᴜᴘ\n> ${error.message}`);
                }
            } else {
                return await repondre(`> 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs`);
            }
        }
    },
    {
        silacmd: "close",
        alias: ["lock", "shut"],
        category: "group",
        description: "Close group (only admins can send messages)",
        usage: "close",
        group: true,
        admin: true,
        botAdmin: true,
        
        async function(from, conn, { repondre, args, prefixe, isGroup, participant, pushName }) {
            if (from.endsWith('@g.us')) {
                try {
                    const silaConfig = require('../silamd/sila.js');
                    const botIdentity = silaConfig.getBotConfig();
                    const config = require('../config.js');
                    
                    await conn.groupSettingUpdate(from, {
                        restrict: true,
                        announce: true
                    });
                    
                    const response = `┌───『 ${botIdentity.mainSymbol} ᴄʟᴏsᴇ ᴄᴏᴍᴍᴀɴᴅ ${botIdentity.mainSymbol} 』───┐
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} 🔒 ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴄʟᴏsᴇᴅ
${botIdentity.mainSymbol} 👑 ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ: ${pushName || participant.split('@')[0]}
${botIdentity.mainSymbol} 📌 ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botIdentity.mainSymbol}
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;
                    
                    return await repondre(response);
                    
                } catch (error) {
                    console.error('Close error:', error);
                    return await repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ\n> ${error.message}`);
                }
            } else {
                return await repondre(`> 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs`);
            }
        }
    },
    {
        silacmd: "lockgroup",
        alias: ["lockchat", "restrict"],
        category: "group",
        description: "Lock group (only admins can send messages)",
        usage: "lockgroup",
        group: true,
        admin: true,
        botAdmin: true,
        
        async function(from, conn, { repondre, args, prefixe, isGroup, participant, pushName }) {
            if (from.endsWith('@g.us')) {
                try {
                    const silaConfig = require('../silamd/sila.js');
                    const botIdentity = silaConfig.getBotConfig();
                    const config = require('../config.js');
                    
                    await conn.groupSettingUpdate(from, {
                        restrict: true,
                        announce: true
                    });
                    
                    const response = `┌───『 ${botIdentity.mainSymbol} ʟᴏᴄᴋ ᴄᴏᴍᴍᴀɴᴅ ${botIdentity.mainSymbol} 』───┐
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} 🔐 ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ʟᴏᴄᴋᴇᴅ
${botIdentity.mainSymbol} 👑 ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ: ${pushName || participant.split('@')[0]}
${botIdentity.mainSymbol} 📌 ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botIdentity.mainSymbol}
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;
                    
                    return await repondre(response);
                    
                } catch (error) {
                    console.error('Lock error:', error);
                    return await repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ʟᴏᴄᴋ ɢʀᴏᴜᴘ\n> ${error.message}`);
                }
            } else {
                return await repondre(`> 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs`);
            }
        }
    },
    
    // ========== UNMUTE COMMANDS (3) ==========
    {
        silacmd: "unmute",
        alias: ["unsilence", "openchat"],
        category: "group",
        description: "Unmute group (all members can send messages)",
        usage: "unmute",
        group: true,
        admin: true,
        botAdmin: true,
        
        async function(from, conn, { repondre, args, prefixe, isGroup, participant, pushName }) {
            if (from.endsWith('@g.us')) {
                try {
                    const silaConfig = require('../silamd/sila.js');
                    const botIdentity = silaConfig.getBotConfig();
                    const config = require('../config.js');
                    
                    await conn.groupSettingUpdate(from, {
                        restrict: false,
                        announce: false
                    });
                    
                    const response = `┌───『 ${botIdentity.mainSymbol} ᴜɴᴍᴜᴛᴇ ᴄᴏᴍᴍᴀɴᴅ ${botIdentity.mainSymbol} 』───┐
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} 🔊 ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴜɴᴍᴜᴛᴇᴅ
${botIdentity.mainSymbol} 👑 ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ: ${pushName || participant.split('@')[0]}
${botIdentity.mainSymbol} 📌 ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botIdentity.mainSymbol}
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;
                    
                    return await repondre(response);
                    
                } catch (error) {
                    console.error('Unmute error:', error);
                    return await repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜɴᴍᴜᴛᴇ ɢʀᴏᴜᴘ\n> ${error.message}`);
                }
            } else {
                return await repondre(`> 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs`);
            }
        }
    },
    {
        silacmd: "open",
        alias: ["unlock", "openchat"],
        category: "group",
        description: "Open group (all members can send messages)",
        usage: "open",
        group: true,
        admin: true,
        botAdmin: true,
        
        async function(from, conn, { repondre, args, prefixe, isGroup, participant, pushName }) {
            if (from.endsWith('@g.us')) {
                try {
                    const silaConfig = require('../silamd/sila.js');
                    const botIdentity = silaConfig.getBotConfig();
                    const config = require('../config.js');
                    
                    await conn.groupSettingUpdate(from, {
                        restrict: false,
                        announce: false
                    });
                    
                    const response = `┌───『 ${botIdentity.mainSymbol} ᴏᴘᴇɴ ᴄᴏᴍᴍᴀɴᴅ ${botIdentity.mainSymbol} 』───┐
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} 🔓 ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴏᴘᴇɴᴇᴅ
${botIdentity.mainSymbol} 👑 ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ: ${pushName || participant.split('@')[0]}
${botIdentity.mainSymbol} 📌 ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botIdentity.mainSymbol}
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;
                    
                    return await repondre(response);
                    
                } catch (error) {
                    console.error('Open error:', error);
                    return await repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴏᴘᴇɴ ɢʀᴏᴜᴘ\n> ${error.message}`);
                }
            } else {
                return await repondre(`> 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs`);
            }
        }
    },
    {
        silacmd: "unlockgroup",
        alias: ["unlockchat", "unrestrict"],
        category: "group",
        description: "Unlock group (all members can send messages)",
        usage: "unlockgroup",
        group: true,
        admin: true,
        botAdmin: true,
        
        async function(from, conn, { repondre, args, prefixe, isGroup, participant, pushName }) {
            if (from.endsWith('@g.us')) {
                try {
                    const silaConfig = require('../silamd/sila.js');
                    const botIdentity = silaConfig.getBotConfig();
                    const config = require('../config.js');
                    
                    await conn.groupSettingUpdate(from, {
                        restrict: false,
                        announce: false
                    });
                    
                    const response = `┌───『 ${botIdentity.mainSymbol} ᴜɴʟᴏᴄᴋ ᴄᴏᴍᴍᴀɴᴅ ${botIdentity.mainSymbol} 』───┐
${botIdentity.mainSymbol}
${botIdentity.mainSymbol} 🔓 ɢʀᴏᴜᴘ ʜᴀs ʙᴇᴇɴ ᴜɴʟᴏᴄᴋᴇᴅ
${botIdentity.mainSymbol} 👑 ʀᴇǫᴜᴇsᴛᴇᴅ ʙʏ: ${pushName || participant.split('@')[0]}
${botIdentity.mainSymbol} 📌 ᴀʟʟ ᴍᴇᴍʙᴇʀs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs
${botIdentity.mainSymbol}
└───────────────${botIdentity.mainSymbol}
> ${config.DESCRIPTION || botIdentity.footer}`;
                    
                    return await repondre(response);
                    
                } catch (error) {
                    console.error('Unlock error:', error);
                    return await repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜɴʟᴏᴄᴋ ɢʀᴏᴜᴘ\n> ${error.message}`);
                }
            } else {
                return await repondre(`> 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs`);
            }
        }
    }
];