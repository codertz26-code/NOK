// sila/permissions.js
// Combined permission system for premium, sudo, and owner

const premiumHandler = require('./premium');
const sudoHandler = require('./sudo');
const ownerHandler = require('./owner');

// Main permission check function
async function checkPermissions(cmd, from, sender, senderNumber, isAdmin = false) {
    const isUserOwner = ownerHandler.isOwner(senderNumber);
    const isUserSudo = sudoHandler.isSudo(senderNumber);
    const isUserPremium = premiumHandler.isPremium(senderNumber);
    
    // Check owner only commands
    if (cmd.owner && !isUserOwner) {
        return {
            allowed: false,
            message: `> ♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ꜰᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ! ♱`
        };
    }
    
    // Check sudo commands (sudo can use owner commands)
    if (cmd.sudo && !isUserSudo && !isUserOwner) {
        return {
            allowed: false,
            message: `> ♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ꜰᴏʀ sᴜᴅᴏ ᴜsᴇʀs! ♱`
        };
    }
    
    // Check premium commands
    if (cmd.premium && !isUserPremium && !isUserSudo && !isUserOwner) {
        return {
            allowed: false,
            message: `> ♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ꜰᴏʀ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs ᴏɴʟʏ! ♱\n\n> ✨ ᴛᴏ ɢᴇᴛ ᴘʀᴇᴍɪᴜᴍ, ᴄᴏɴᴛᴀᴄᴛ: ${ownerHandler.OWNER_NUMBER}`
        };
    }
    
    // Check group admin commands
    if (cmd.admin && !isAdmin && !isUserOwner && !isUserSudo) {
        return {
            allowed: false,
            message: `> ♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ꜰᴏʀ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs! ♱`
        };
    }
    
    // Check group only commands
    if (cmd.groupOnly && !from.includes('g.us')) {
        return {
            allowed: false,
            message: `> ♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs! ♱`
        };
    }
    
    // Check private only commands
    if (cmd.privateOnly && from.includes('g.us')) {
        return {
            allowed: false,
            message: `> ♱ 👻 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛ! ♱`
        };
    }
    
    return { allowed: true };
}

// Get user level
function getUserLevel(senderNumber) {
    if (ownerHandler.isOwner(senderNumber)) return 'owner';
    if (sudoHandler.isSudo(senderNumber)) return 'sudo';
    if (premiumHandler.isPremium(senderNumber)) return 'premium';
    return 'user';
}

// Get user level emoji
function getUserLevelEmoji(senderNumber) {
    const level = getUserLevel(senderNumber);
    switch(level) {
        case 'owner': return '👑';
        case 'sudo': return '⚡';
        case 'premium': return '💎';
        default: return '👤';
    }
}

module.exports = {
    checkPermissions,
    getUserLevel,
    getUserLevelEmoji,
    premiumHandler,
    sudoHandler,
    ownerHandler
};