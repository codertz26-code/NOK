const { isJidGroup } = require('baileys');

// ==================== GET OWNER JID ====================
const getOwnerJid = (config) => {
    const ownerNumber = config.OWNER_NUMBER || config.DEV || "255650034217";
    const cleanNumber = ownerNumber.replace(/@s\.whatsapp\.net$/, '').replace(/@c\.us$/, '');
    return `${cleanNumber}@s.whatsapp.net`;
};

// ==================== GET MESSAGE TYPE ====================
const getMessageType = (message) => {
    if (!message) return 'Unknown';
    const type = Object.keys(message)[0];
    const typeMap = {
        conversation: 'ᴛᴇxᴛ',
        imageMessage: 'ɪᴍᴀɢᴇ',
        videoMessage: 'ᴠɪᴅᴇᴏ',
        audioMessage: 'ᴀᴜᴅɪᴏ',
        documentMessage: 'ᴅᴏᴄᴜᴍᴇɴᴛ',
        stickerMessage: 'sᴛɪᴄᴋᴇʀ',
        extendedTextMessage: 'ᴛᴇxᴛ ᴡɪᴛʜ ʟɪɴᴋ',
        contactMessage: 'ᴄᴏɴᴛᴀᴄᴛ',
        locationMessage: 'ʟᴏᴄᴀᴛɪᴏɴ',
        liveLocationMessage: 'ʟɪᴠᴇ ʟᴏᴄᴀᴛɪᴏɴ',
        pollCreationMessage: 'ᴘᴏʟʟ',
        pollUpdateMessage: 'ᴘᴏʟʟ ᴜᴘᴅᴀᴛᴇ'
    };
    return typeMap[type] || type.replace('Message', '') || 'Unknown';
};

// ==================== DELETED TEXT HANDLER ====================
const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update, smallFont) => {
    try {
        const messageContent = mek.message?.conversation 
            || mek.message?.extendedTextMessage?.text
            || mek.message?.imageMessage?.caption
            || mek.message?.videoMessage?.caption
            || mek.message?.documentMessage?.caption
            || 'ᴄᴏɴᴛᴇɴᴛ ᴜɴᴀᴠᴀɪʟᴀʙʟᴇ';

        const fullMessage = `♱ ɴ ᴏ ᴄ ᴛ ᴜ ʀ ɴ ᴀ ʟ ♱
🌑 ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ 🌑

${deleteInfo}

📝 ᴄᴏɴᴛᴇɴᴛ:
${messageContent}

⚰️ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴᴏᴄᴛᴜʀɴᴀʟ-ᴍᴅ`;

        const mentionedJids = isGroup 
            ? [update.key.participant, mek.key.participant].filter(Boolean) 
            : [update.key.remoteJid].filter(Boolean);

        await conn.sendMessage(jid, { 
            text: smallFont(fullMessage),
            mentions: mentionedJids
        }, { quoted: mek });
    } catch (error) {
        console.error('❌ Error in DeletedText:', error);
    }
};

// ==================== DELETED MEDIA HANDLER ====================
const DeletedMedia = async (conn, mek, jid, deleteInfo, smallFont) => {
    try {
        const antideletedmek = structuredClone(mek.message);
        const messageType = Object.keys(antideletedmek)[0];

        const mediaTypes = {
            imageMessage: { type: 'image', key: 'imageMessage' },
            videoMessage: { type: 'video', key: 'videoMessage' },
            audioMessage: { type: 'audio', key: 'audioMessage' },
            documentMessage: { type: 'document', key: 'documentMessage' },
            stickerMessage: { type: 'sticker', key: 'stickerMessage' }
        };

        const currentType = mediaTypes[messageType];

        if (currentType) {
            const caption = `
╭╴╴╴╴╴╴╴╴╴╴╴╴╴╴╮
│ 🗑️ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ 🛡️
╰╴╴╴╴╴╴╴╴╴╴╴╴╴╴╯
${deleteInfo}
┃└─────────────┈⊷
╰──────────────────┈⊷
⚰️ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴᴏᴄᴛᴜʀɴᴀʟ-ᴍᴅ`;

            if (['image', 'video'].includes(currentType.type)) {
                const mediaUrl = antideletedmek[currentType.key]?.url;
                if (mediaUrl) {
                    await conn.sendMessage(jid, { 
                        [currentType.type]: { url: mediaUrl },
                        caption: smallFont(caption)
                    }, { quoted: mek });
                } else {
                    await conn.sendMessage(jid, { 
                        text: smallFont(caption)
                    }, { quoted: mek });
                }
            } else {
                await conn.sendMessage(jid, { 
                    text: smallFont(caption)
                }, { quoted: mek });

                if (antideletedmek[currentType.key]?.url) {
                    await conn.sendMessage(jid, {
                        [currentType.type]: { url: antideletedmek[currentType.key].url }
                    }, { quoted: mek });
                }
            }
        } else {
            antideletedmek[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.sender,
                quotedMessage: mek.message,
            };
            await conn.relayMessage(jid, antideletedmek, {});
        }
    } catch (error) {
        console.error('❌ Error in DeletedMedia:', error);
    }
};

// ==================== MAIN ANTIDELETE FUNCTION ====================
const AntiDelete = async (conn, updates, config, smallFont, antideleteSettings) => {
    try {
        const { loadMessage } = require('../data-json');
        
        for (const update of updates) {
            if (update.update?.message === null) {
                console.log("🗑️ Delete Detected:", update.key.id);
                
                const store = await loadMessage(update.key.id);
                
                if (store && store.message) {
                    const mek = store.message;
                    const isGroup = isJidGroup(store.jid);

                    const deleteTime = new Date().toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                    const deleteDate = new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });

                    let deleteInfo;
                    
                    if (isGroup) {
                        try {
                            const groupMetadata = await conn.groupMetadata(store.jid);
                            const groupName = groupMetadata.subject;
                            const sender = mek.key.participant?.split('@')[0] || 'Unknown';
                            const deleter = update.key.participant?.split('@')[0] || 'Unknown';

                            deleteInfo = `📅 ᴅᴀᴛᴇ: ${deleteDate}
⏰ ᴛɪᴍᴇ: ${deleteTime}
👤 sᴇɴᴅᴇʀ: @${sender}
👥 ɢʀᴏᴜᴘ: ${groupName}
🗑️ ᴅᴇʟᴇᴛᴇᴅ ʙʏ: @${deleter}
📌 ᴛʏᴘᴇ: ${getMessageType(mek.message)}`;
                        } catch (e) {
                            deleteInfo = `📅 ᴅᴀᴛᴇ: ${deleteDate}
⏰ ᴛɪᴍᴇ: ${deleteTime}
👤 sᴇɴᴅᴇʀ: @${mek.key.participant?.split('@')[0] || 'Unknown'}
👥 ɢʀᴏᴜᴘ: ᴜɴᴋɴᴏᴡɴ ɢʀᴏᴜᴘ
🗑️ ᴅᴇʟᴇᴛᴇᴅ ʙʏ: @${update.key.participant?.split('@')[0] || 'Unknown'}
📌 ᴛʏᴘᴇ: ${getMessageType(mek.message)}`;
                        }
                    } else {
                        const senderNumber = mek.key.remoteJid?.split('@')[0] || 'Unknown';
                        deleteInfo = `📅 ᴅᴀᴛᴇ: ${deleteDate}
⏰ ᴛɪᴍᴇ: ${deleteTime}
📱 sᴇɴᴅᴇʀ: @${senderNumber}
📌 ᴛʏᴘᴇ: ${getMessageType(mek.message)}`;
                    }

                    const destinationJid = config.ANTI_DEL_PATH === "inbox" 
                        ? getOwnerJid(config) 
                        : store.jid;
                    
                    console.log(`📤 Sending deleted message to: ${destinationJid}`);

                    const isText = mek.message?.conversation || 
                                  mek.message?.extendedTextMessage || 
                                  mek.message?.imageMessage?.caption || 
                                  mek.message?.videoMessage?.caption;

                    try {
                        if (isText) {
                            await DeletedText(conn, mek, destinationJid, deleteInfo, isGroup, update, smallFont);
                        } else {
                            await DeletedMedia(conn, mek, destinationJid, deleteInfo, smallFont);
                        }
                        console.log('✅ Deleted message sent successfully');
                    } catch (sendError) {
                        console.error('❌ Failed to send:', sendError.message);
                    }
                } else {
                    console.log('⚠️ Message not found in database:', update.key.id);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in AntiDelete:', error);
    }
};

module.exports = {
    AntiDelete,
    DeletedText,
    DeletedMedia,
    getMessageType,
    getOwnerJid
};