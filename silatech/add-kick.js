// silatech/grouptools.js
// Group Management Commands - Add and Kick

const config = require('../config');

// Helper function to clean number to JID
function toJid(number) {
    let clean = number.replace(/[^0-9]/g, '');
    if (!clean.endsWith('@s.whatsapp.net')) {
        clean = clean + '@s.whatsapp.net';
    }
    return clean;
}

// Helper function to extract number from JID
function getNumber(jid) {
    return jid.split('@')[0];
}

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

module.exports = [
    // ==================== ADD COMMANDS ====================
    {
        silacmd: "add",
        alias: ["invite", "adduser"],
        category: "group",
        description: "Add a user to the group",
        usage: "add <number>",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            if (!args[0]) {
                return repondre(`┌───『 *ᴀᴅᴅ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ➕ ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .add 255712345678
${botConfig.mainSymbol} • .add @ᴜsᴇʀ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .add 255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.startsWith('0')) {
                number = '255' + number.slice(1);
            }
            if (!number.startsWith('255')) {
                number = '255' + number;
            }
            
            const jid = number + '@s.whatsapp.net';
            
            try {
                await conn.groupParticipantsUpdate(from, [jid], 'add');
                return repondre(`┌───『 *ᴀᴅᴅᴇᴅ sᴜᴄᴄᴇssғᴜʟ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ➕ @${number}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ᴀᴅᴅᴇᴅ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            } catch (error) {
                console.error('Add error:', error);
                let errorMsg = error.message || 'Unknown error';
                if (errorMsg.includes('405')) {
                    errorMsg = 'ᴄᴀɴɴᴏᴛ ᴀᴅᴅ ᴛʜɪs ᴜsᴇʀ. ᴛʜᴇʏ ᴍᴀʏ ʜᴀᴠᴇ ᴘʀɪᴠᴀᴄʏ sᴇᴛᴛɪɴɢs ᴇɴᴀʙʟᴇᴅ';
                } else if (errorMsg.includes('403')) {
                    errorMsg = 'ʙᴏᴛ ɪs ɴᴏᴛ ᴀᴅᴍɪɴ ᴏʀ ʟᴀᴄᴋs ᴘᴇʀᴍɪssɪᴏɴs';
                }
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴀᴅᴅ ᴜsᴇʀ: ${errorMsg}`);
            }
        }
    },
    {
        silacmd: "invite",
        alias: ["add2", "adduser2"],
        category: "group",
        description: "Add a user to the group (alternative command)",
        usage: "invite <number>",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            if (!args[0]) {
                return repondre(`┌───『 *ɪɴᴠɪᴛᴇ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ➕ ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .invite 255712345678
${botConfig.mainSymbol} • .invite @ᴜsᴇʀ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .invite 255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.startsWith('0')) {
                number = '255' + number.slice(1);
            }
            if (!number.startsWith('255')) {
                number = '255' + number;
            }
            
            const jid = number + '@s.whatsapp.net';
            
            try {
                await conn.groupParticipantsUpdate(from, [jid], 'add');
                return repondre(`┌───『 *ɪɴᴠɪᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} ➕ @${number}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ɪɴᴠɪᴛᴇᴅ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            } catch (error) {
                console.error('Invite error:', error);
                let errorMsg = error.message || 'Unknown error';
                if (errorMsg.includes('405')) {
                    errorMsg = 'ᴄᴀɴɴᴏᴛ ᴀᴅᴅ ᴛʜɪs ᴜsᴇʀ. ᴛʜᴇʏ ᴍᴀʏ ʜᴀᴠᴇ ᴘʀɪᴠᴀᴄʏ sᴇᴛᴛɪɴɢs ᴇɴᴀʙʟᴇᴅ';
                } else if (errorMsg.includes('403')) {
                    errorMsg = 'ʙᴏᴛ ɪs ɴᴏᴛ ᴀᴅᴍɪɴ ᴏʀ ʟᴀᴄᴋs ᴘᴇʀᴍɪssɪᴏɴs';
                }
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ɪɴᴠɪᴛᴇ ᴜsᴇʀ: ${errorMsg}`);
            }
        }
    },
    
    // ==================== KICK COMMANDS ====================
    {
        silacmd: "kick",
        alias: ["remove", "removeuser"],
        category: "group",
        description: "Kick a user from the group",
        usage: "kick @user or reply to message",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
            const botConfig = silaConfig.getBotConfig();
            
            let target = null;
            
            // Method 1: Reply to message
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
            
            // Method 2: Mention
            if (!target && ms.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                target = ms.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            
            // Method 3: Number in args
            if (!target && args[0]) {
                target = toJid(args[0]);
            }
            
            // Method 4: @mention format
            if (!target && args[0] && args[0].startsWith('@')) {
                let number = args[0].replace('@', '');
                target = toJid(number);
            }
            
            if (!target) {
                return repondre(`┌───『 *ᴋɪᴄᴋ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👢 ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .kick @ᴜsᴇʀ
${botConfig.mainSymbol} • ʀᴇᴘʟʏ ᴛᴏ ᴜsᴇʀ's ᴍᴇssᴀɢᴇ ᴡɪᴛʜ .kick
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .kick @255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === target || p.id.split('@')[0] === target.split('@')[0]);
                
                if (!participant) {
                    return repondre(`👻 ᴜsᴇʀ @${getNumber(target)} ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ`);
                }
                
                // Check if trying to kick bot owner
                const isTargetOwner = participant.id === `${config.OWNER_NUMBER}@s.whatsapp.net` || participant.id === `${config.DEV}@s.whatsapp.net`;
                if (isTargetOwner) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ`);
                }
                
                // Check if trying to kick bot itself
                const botNumber = conn.user.id.split(':')[0];
                if (participant.id === `${botNumber}@s.whatsapp.net`) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴛʜᴇ ʙᴏᴛ ɪᴛsᴇʟғ`);
                }
                
                await conn.groupParticipantsUpdate(from, [participant.id], 'remove');
                
                return repondre(`┌───『 *ᴋɪᴄᴋᴇᴅ sᴜᴄᴄᴇssғᴜʟ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👢 @${getNumber(participant.id)}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ɢᴏᴏᴅʙʏᴇ ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Kick error:', error);
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴋɪᴄᴋ ᴜsᴇʀ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    },
    {
        silacmd: "remove",
        alias: ["kick2", "removeuser2"],
        category: "group",
        description: "Kick a user from the group (alternative command)",
        usage: "remove @user or reply to message",
        admin: true,
        groupOnly: true,
        
        async function(from, conn, { repondre, args, ms, silaConfig }) {
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
                return repondre(`┌───『 *ʀᴇᴍᴏᴠᴇ ᴄᴏᴍᴍᴀɴᴅ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👢 ᴜsᴀɢᴇ:
${botConfig.mainSymbol} • .remove @ᴜsᴇʀ
${botConfig.mainSymbol} • ʀᴇᴘʟʏ ᴛᴏ ᴜsᴇʀ's ᴍᴇssᴀɢᴇ ᴡɪᴛʜ .remove
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ᴇxᴀᴍᴘʟᴇ: .remove @255712345678
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
            }
            
            try {
                const groupMetadata = await conn.groupMetadata(from);
                const participant = groupMetadata.participants.find(p => p.id === target || p.id.split('@')[0] === target.split('@')[0]);
                
                if (!participant) {
                    return repondre(`👻 ᴜsᴇʀ @${getNumber(target)} ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ`);
                }
                
                const isTargetOwner = participant.id === `${config.OWNER_NUMBER}@s.whatsapp.net` || participant.id === `${config.DEV}@s.whatsapp.net`;
                if (isTargetOwner) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ʀᴇᴍᴏᴠᴇ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ`);
                }
                
                const botNumber = conn.user.id.split(':')[0];
                if (participant.id === `${botNumber}@s.whatsapp.net`) {
                    return repondre(`👻 ᴄᴀɴɴᴏᴛ ʀᴇᴍᴏᴠᴇ ᴛʜᴇ ʙᴏᴛ ɪᴛsᴇʟғ`);
                }
                
                await conn.groupParticipantsUpdate(from, [participant.id], 'remove');
                
                return repondre(`┌───『 *ʀᴇᴍᴏᴠᴇᴅ sᴜᴄᴄᴇssғᴜʟ* 』───${botConfig.mainSymbol}
${botConfig.mainSymbol} 
${botConfig.mainSymbol} 👢 @${getNumber(participant.id)}
${botConfig.mainSymbol} ✨ ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ғʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ
${botConfig.mainSymbol}
${botConfig.mainSymbol} ♱ ɢᴏᴏᴅʙʏᴇ ♱
└───────────────${botConfig.mainSymbol}
> ${config.DESCRIPTION || botConfig.footer}`);
                
            } catch (error) {
                console.error('Remove error:', error);
                return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴜsᴇʀ: ${error.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ'}`);
            }
        }
    }
];