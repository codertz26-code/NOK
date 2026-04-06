// silatech/admintools.js
// Promote and Demote commands - Fixed styling

const config = require('../config');

// Helper function to extract JID from various formats
function extractJid(msg) {
    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        if (quoted.key?.participant) return quoted.key.participant;
        if (quoted.key?.remoteJid && !quoted.key.remoteJid.includes('@g.us')) return quoted.key.remoteJid;
        if (msg.message.extendedTextMessage.contextInfo.participant) return msg.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        return msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    
    return null;
}

// Helper function to clean number to JID
function toJid(number) {
    let clean = number.replace(/[^0-9]/g, '');
    if (!clean.endsWith('@s.whatsapp.net')) {
        clean = clean + '@s.whatsapp.net';
    }
    return clean;
}

module.exports = [
    {
        silacmd: "promote",
        alias: ["makeadmin", "setadmin"],
        category: "group",
        description: "Promote a user to admin in group",
        usage: "promote @user or reply to message",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, isAdmin, isOwner, isSudo, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            let target = null;
            
            if (ms.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = ms.message.extendedTextMessage.contextInfo.quotedMessage;
                if (quoted.key?.participant) {
                    target = quoted.key.participant;
                } else if (quoted.key?.remoteJid && !quoted.key.remoteJid.includes('@g.us')) {
                    target = quoted.key.remoteJid;
                } else if (ms.message.extendedTextMessage.contextInfo.participant) {
                    target = ms.message.extendedTextMessage.contextInfo.participant;
                }
            }
            
            if (!target && ms.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                target = ms.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            
            if (!target && args[0]) {
                target = toJid(args[0]);
            }
            
            if (!target && args[0] && args[0].startsWith('@')) {
                let number = args[0].replace('@', '');
                target = toJid(number);
            }
            
            if (!target) {
                return repondre(`┌───『 *ᴘʀᴏᴍᴏᴛᴇ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👑 ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .promote @ᴜsᴇʀ
${botConfig.mainSymbol} • ʀᴇᴘʟʏ ᴛᴏ ᴜsᴇʀ's ᴍᴇssᴀɢᴇ ᴡɪᴛʜ .promote
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .promote @255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === target || p.id.split('@')[0] === target.split('@')[0]);
                
                if (!participant) {
                    return repondre(`👻 ᴜsᴇʀ @${target.split('@')[0]} ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ`);
                }
                
                if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                    return repondre(`👻 @${participant.id.split('@')[0]} ɪs ᴀʟʀᴇᴀᴅʏ ᴀɴ ᴀᴅᴍɪɴ`);
                }
                
                await conn.groupParticipantsUpdate(from, [participant.id], 'promote');
                
                return repondre(`┌───『 *ᴘʀᴏᴍᴏᴛɪᴏɴ sᴜᴄᴄᴇss* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👑 @${participant.id.split('@')[0]}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ᴘʀᴏᴍᴏᴛᴇᴅ ᴛᴏ ᴀᴅᴍɪɴ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴜsᴇ ʏᴏᴜʀ ᴘᴏᴡᴇʀ ᴡɪsᴇʟʏ ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Promote error:', error);
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ ᴜsᴇʀ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    },
    {
        silacmd: "makeadmin",
        alias: ["promote2", "setadmin2"],
        category: "group",
        description: "Promote a user to admin (alternative command)",
        usage: "makeadmin @user or reply to message",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, isAdmin, isOwner, isSudo, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            let target = null;
            
            if (ms.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = ms.message.extendedTextMessage.contextInfo.quotedMessage;
                if (quoted.key?.participant) {
                    target = quoted.key.participant;
                } else if (quoted.key?.remoteJid && !quoted.key.remoteJid.includes('@g.us')) {
                    target = quoted.key.remoteJid;
                } else if (ms.message.extendedTextMessage.contextInfo.participant) {
                    target = ms.message.extendedTextMessage.contextInfo.participant;
                }
            }
            
            if (!target && ms.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                target = ms.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            
            if (!target && args[0]) {
                target = toJid(args[0]);
            }
            
            if (!target && args[0] && args[0].startsWith('@')) {
                let number = args[0].replace('@', '');
                target = toJid(number);
            }
            
            if (!target) {
                return repondre(`┌───『 *ᴍᴀᴋᴇᴀᴅᴍɪɴ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👑 ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .makeadmin @ᴜsᴇʀ
${botConfig.mainSymbol} • ʀᴇᴘʟʏ ᴛᴏ ᴜsᴇʀ's ᴍᴇssᴀɢᴇ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .makeadmin @255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === target || p.id.split('@')[0] === target.split('@')[0]);
                
                if (!participant) {
                    return repondre(`👻 ᴜsᴇʀ @${target.split('@')[0]} ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ`);
                }
                
                if (participant.admin === 'admin' || participant.admin === 'superadmin') {
                    return repondre(`👻 @${participant.id.split('@')[0]} ɪs ᴀʟʀᴇᴀᴅʏ ᴀɴ ᴀᴅᴍɪɴ`);
                }
                
                await conn.groupParticipantsUpdate(from, [participant.id], 'promote');
                
                return repondre(`┌───『 *ᴘʀᴏᴍᴏᴛɪᴏɴ sᴜᴄᴄᴇss* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👑 @${participant.id.split('@')[0]}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ᴘʀᴏᴍᴏᴛᴇᴅ ᴛᴏ ᴀᴅᴍɪɴ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴜsᴇ ʏᴏᴜʀ ᴘᴏᴡᴇʀ ᴡɪsᴇʟʏ ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Makeadmin error:', error);
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ ᴜsᴇʀ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    },
    {
        silacmd: "demote",
        alias: ["removeadmin", "unadmin"],
        category: "group",
        description: "Demote a user from admin in group",
        usage: "demote @user or reply to message",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, isAdmin, isOwner, isSudo, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            let target = null;
            
            if (ms.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = ms.message.extendedTextMessage.contextInfo.quotedMessage;
                if (quoted.key?.participant) {
                    target = quoted.key.participant;
                } else if (quoted.key?.remoteJid && !quoted.key.remoteJid.includes('@g.us')) {
                    target = quoted.key.remoteJid;
                } else if (ms.message.extendedTextMessage.contextInfo.participant) {
                    target = ms.message.extendedTextMessage.contextInfo.participant;
                }
            }
            
            if (!target && ms.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                target = ms.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            
            if (!target && args[0]) {
                target = toJid(args[0]);
            }
            
            if (!target && args[0] && args[0].startsWith('@')) {
                let number = args[0].replace('@', '');
                target = toJid(number);
            }
            
            if (!target) {
                return repondre(`┌───『 *ᴅᴇᴍᴏᴛᴇ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👑 ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .demote @ᴜsᴇʀ
${botConfig.mainSymbol} • ʀᴇᴘʟʏ ᴛᴏ ᴜsᴇʀ's ᴍᴇssᴀɢᴇ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .demote @255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === target || p.id.split('@')[0] === target.split('@')[0]);
                
                if (!participant) {
                    return repondre(`👻 ᴜsᴇʀ @${target.split('@')[0]} ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ`);
                }
                
                if (participant.admin !== 'admin' && participant.admin !== 'superadmin') {
                    return repondre(`👻 @${participant.id.split('@')[0]} ɪs ɴᴏᴛ ᴀɴ ᴀᴅᴍɪɴ`);
                }
                
                const isTargetOwner = participant.id === `${config.OWNER_NUMBER}@s.whatsapp.net` || participant.id === `${config.DEV}@s.whatsapp.net`;
                if (isTargetOwner) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ᴅᴇᴍᴏᴛᴇ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ`);
                }
                
                const botNumber = conn.user.id.split(':')[0];
                if (participant.id === `${botNumber}@s.whatsapp.net`) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ᴅᴇᴍᴏᴛᴇ ᴛʜᴇ ʙᴏᴛ ɪᴛsᴇʟғ`);
                }
                
                await conn.groupParticipantsUpdate(from, [participant.id], 'demote');
                
                return repondre(`┌───『 *ᴅᴇᴍᴏᴛɪᴏɴ sᴜᴄᴄᴇss* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 📛 @${participant.id.split('@')[0]}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ᴅᴇᴍᴏᴛᴇᴅ ғʀᴏᴍ ᴀᴅᴍɪɴ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ʀᴇsᴘᴇᴄᴛ ᴛʜᴇ ɴᴇᴡ ᴀᴅᴍɪɴs ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Demote error:', error);
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴇᴍᴏᴛᴇ ᴜsᴇʀ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    },
    {
        silacmd: "removeadmin",
        alias: ["demote2", "unadmin2"],
        category: "group",
        description: "Demote a user from admin (alternative command)",
        usage: "removeadmin @user or reply to message",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, isAdmin, isOwner, isSudo, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            let target = null;
            
            if (ms.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quoted = ms.message.extendedTextMessage.contextInfo.quotedMessage;
                if (quoted.key?.participant) {
                    target = quoted.key.participant;
                } else if (quoted.key?.remoteJid && !quoted.key.remoteJid.includes('@g.us')) {
                    target = quoted.key.remoteJid;
                } else if (ms.message.extendedTextMessage.contextInfo.participant) {
                    target = ms.message.extendedTextMessage.contextInfo.participant;
                }
            }
            
            if (!target && ms.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                target = ms.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            
            if (!target && args[0]) {
                target = toJid(args[0]);
            }
            
            if (!target && args[0] && args[0].startsWith('@')) {
                let number = args[0].replace('@', '');
                target = toJid(number);
            }
            
            if (!target) {
                return repondre(`┌───『 *ʀᴇᴍᴏᴠᴇᴀᴅᴍɪɴ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👑 ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .removeadmin @ᴜsᴇʀ
${botConfig.mainSymbol} • ʀᴇᴘʟʏ ᴛᴏ ᴜsᴇʀ's ᴍᴇssᴀɢᴇ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .removeadmin @255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === target || p.id.split('@')[0] === target.split('@')[0]);
                
                if (!participant) {
                    return repondre(`👻 ᴜsᴇʀ @${target.split('@')[0]} ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ`);
                }
                
                if (participant.admin !== 'admin' && participant.admin !== 'superadmin') {
                    return repondre(`👻 @${participant.id.split('@')[0]} ɪs ɴᴏᴛ ᴀɴ ᴀᴅᴍɪɴ`);
                }
                
                const isTargetOwner = participant.id === `${config.OWNER_NUMBER}@s.whatsapp.net` || participant.id === `${config.DEV}@s.whatsapp.net`;
                if (isTargetOwner) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ᴅᴇᴍᴏᴛᴇ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ`);
                }
                
                const botNumber = conn.user.id.split(':')[0];
                if (participant.id === `${botNumber}@s.whatsapp.net`) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ᴅᴇᴍᴏᴛᴇ ᴛʜᴇ ʙᴏᴛ ɪᴛsᴇʟғ`);
                }
                
                await conn.groupParticipantsUpdate(from, [participant.id], 'demote');
                
                return repondre(`┌───『 *ᴅᴇᴍᴏᴛɪᴏɴ sᴜᴄᴄᴇss* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 📛 @${participant.id.split('@')[0]}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ᴅᴇᴍᴏᴛᴇᴅ ғʀᴏᴍ ᴀᴅᴍɪɴ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ʀᴇsᴘᴇᴄᴛ ᴛʜᴇ ɴᴇᴡ ᴀᴅᴍɪɴs ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Removeadmin error:', error);
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴇᴍᴏᴛᴇ ᴜsᴇʀ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    }
];