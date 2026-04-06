// ==================== DEFAULT ANTIMEDIA TYPES ====================
const defaultAntiMediaTypes = {
    image: true,
    video: true,
    audio: true,
    voice: true,
    document: true,
    sticker: true,
    text: false,
    gif: true,
    poll: true,
    location: true,
    contact: true,
    viewonce: true
};

// ==================== DETECT MEDIA TYPE ====================
const detectMediaType = (message) => {
    if (!message) return 'unknown';
    
    const type = Object.keys(message)[0];
    
    // Handle viewOnce messages
    if (type === 'viewOnceMessage' || type === 'viewOnceMessageV2' || type === 'viewOnceMessageV2Extension') {
        const innerMsg = message[type]?.message;
        if (innerMsg) {
            const innerType = Object.keys(innerMsg)[0];
            if (innerType === 'imageMessage') return 'viewonce';
            if (innerType === 'videoMessage') return 'viewonce';
        }
        return 'viewonce';
    }
    
    // Handle ephemeral messages
    if (type === 'ephemeralMessage') {
        const innerMsg = message.ephemeralMessage?.message;
        if (innerMsg) return detectMediaType({ message: innerMsg });
    }
    
    const mediaMap = {
        'conversation': 'text',
        'extendedTextMessage': 'text',
        'imageMessage': 'image',
        'videoMessage': 'video',
        'audioMessage': 'audio',
        'documentMessage': 'document',
        'stickerMessage': 'sticker',
        'contactMessage': 'contact',
        'contactsArrayMessage': 'contact',
        'locationMessage': 'location',
        'liveLocationMessage': 'location',
        'pollCreationMessage': 'poll',
        'pollUpdateMessage': 'poll'
    };
    
    // Check for voice note (ptt)
    if (type === 'audioMessage' && message.audioMessage?.ptt) {
        return 'voice';
    }
    
    // Check for GIF
    if (type === 'videoMessage' && message.videoMessage?.gifPlayback) {
        return 'gif';
    }
    
    return mediaMap[type] || 'unknown';
};

// ==================== CHECK IF SHOULD DELETE ====================
const shouldDeleteMedia = (message, antimediaConfig) => {
    // Ensure config is valid
    if (!antimediaConfig || typeof antimediaConfig !== 'object') {
        return { shouldDelete: false, type: 'unknown' };
    }
    
    // If antimedia is off, don't delete
    if (!antimediaConfig.enabled) return { shouldDelete: false, type: 'unknown' };
    
    // Ensure types exists
    if (!antimediaConfig.types || typeof antimediaConfig.types !== 'object') {
        antimediaConfig.types = { ...defaultAntiMediaTypes };
    }
    
    const mediaType = detectMediaType(message);
    
    // Check if this specific type should be deleted
    const shouldDelete = antimediaConfig.types[mediaType] === true;
    
    return { shouldDelete, type: mediaType };
};

// ==================== MAIN ANTIMEDIA FUNCTION ====================
const AntiMedia = async (conn, msg, groupId, config, smallFont, groupSettings) => {
    try {
        const { getGroupSetting } = groupSettings;
        
        // Get group-specific antimedia config
        const groupAntimedia = getGroupSetting(groupId, 'antimedia');
        const groupAntimediaTypes = getGroupSetting(groupId, 'antimediaTypes');
        
        // Determine if antimedia is enabled for this group
        let antimediaEnabled = false;
        let antimediaTypes = null;
        
        if (groupAntimedia !== null) {
            // Group has specific setting
            antimediaEnabled = groupAntimedia;
            antimediaTypes = groupAntimediaTypes || config.antimediaTypes || defaultAntiMediaTypes;
        } else if (config.antimedia) {
            // Use global setting
            antimediaEnabled = true;
            antimediaTypes = config.antimediaTypes || defaultAntiMediaTypes;
        }
        
        if (!antimediaEnabled || !antimediaTypes) {
            return { deleted: false };
        }
        
        const { shouldDelete, type } = shouldDeleteMedia(msg.message, {
            enabled: true,
            types: antimediaTypes
        });
        
        if (shouldDelete) {
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderNumber = sender.split('@')[0];
            
            console.log(`🗑️ Antimedia: Deleting ${type} from ${senderNumber} in ${groupId}`);
            
            // Delete immediately without warning
            await conn.sendMessage(groupId, { delete: msg.key });
            
            // Notify owner
            if (config.OWNER_NUMBER) {
                try {
                    const ownerJid = `${config.OWNER_NUMBER.replace(/@s\.whatsapp\.net$/, '').replace(/@c\.us$/, '')}@s.whatsapp.net`;
                    await conn.sendMessage(ownerJid, {
                        text: smallFont(`🗑️ ᴀɴᴛɪᴍᴇᴅɪᴀ\n\nɢʀᴏᴜᴘ: ${groupId}\nsᴇɴᴅᴇʀ: @${senderNumber}\nᴛʏᴘᴇ: ${type}\nᴀᴄᴛɪᴏɴ: ᴅᴇʟᴇᴛᴇᴅ`),
                        mentions: [sender]
                    });
                } catch (ownerErr) {
                    console.log('Failed to notify owner:', ownerErr.message);
                }
            }
            
            return { deleted: true, type };
        }
        
        return { deleted: false };
    } catch (error) {
        console.error('❌ Error in AntiMedia:', error);
        return { deleted: false, error: error.message };
    }
};

module.exports = {
    AntiMedia,
    detectMediaType,
    shouldDeleteMedia,
    defaultAntiMediaTypes
};