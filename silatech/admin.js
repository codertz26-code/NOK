// ==================== ADMIN COMMANDS ====================
// Weka hii file katika folder ya silatech/admin.js

const axios = require('axios');
const { generateWAMessageFromContent, prepareWAMessageMedia } = require('baileys');

// Helper for sleep/delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to format numbers
const toRupiah = (number) => {
    return new Intl.NumberFormat('id-ID').format(number);
};

// ==================== JASHER/JPM COMMAND ====================
const jpmCommand = {
    silacmd: "jasher",
    alias: ["jpm", "jaser", "broadcast", "bc"],
    category: "owner",
    description: "Broadcast message to all groups",
    usage: ".jasher <message> (can include photo)",
    premium: false,
    sudo: false,
    owner: true,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            args, 
            prefixe,
            isOwner,
            silaConfig 
        } = params;

        const text = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱\n> ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        if (!text) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴊᴀsʜᴇʀ ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}jasher <ᴍᴇssᴀɢᴇ>\n` +
                      `> ${prefixe}jasher <ᴍᴇssᴀɢᴇ> (ᴡɪᴛʜ ʀᴇᴘʟʏ ᴛᴏ ᴘʜᴏᴛᴏ)\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}jasher ʜᴇʟʟᴏ ᴀʟʟ ɢʀᴏᴜᴘs!\n` +
                      `> ${prefixe}jpm ʙʀᴏᴀᴅᴄᴀsᴛ ᴡɪᴛʜ ɪᴍᴀɢᴇ (ʀᴇᴘʟʏ ᴛᴏ ᴘʜᴏᴛᴏ)`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Check for quoted image
            const isQuoted = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedType = isQuoted ? Object.keys(isQuoted)[0] : null;
            const hasQuotedImage = quotedType === 'imageMessage';
            
            let mediaBuffer = null;
            
            // Download image if quoted
            if (hasQuotedImage && isQuoted) {
                try {
                    if (ms.quoted && ms.quoted.download) {
                        mediaBuffer = await ms.quoted.download();
                    } else if (conn.downloadMediaMessage) {
                        mediaBuffer = await conn.downloadMediaMessage(ms.message.extendedTextMessage.contextInfo);
                    }
                } catch (e) {
                    console.error("Image download error:", e);
                }
            }

            // Get all groups
            const allGroups = await conn.groupFetchAllParticipating();
            const groupIds = Object.keys(allGroups);
            
            let successCount = 0;
            let failCount = 0;
            let blacklistCount = 0;

            // Send processing message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴊᴀsʜᴇʀ sᴛᴀʀᴛɪɴɢ...* ♱\n\n` +
                      `> 📊 *ᴛᴏᴛᴀʟ ɢʀᴏᴜᴘs:* ${groupIds.length}\n` +
                      `> 🖼️ *ᴍᴏᴅᴇ:* ${mediaBuffer ? "ᴛᴇxᴛ & ᴘʜᴏᴛᴏ" : "ᴛᴇxᴛ ᴏɴʟʏ"}\n` +
                      `> ⏳ *ᴇsᴛɪᴍᴀᴛᴇᴅ:* ${groupIds.length * 4}s`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            // Send to all groups
            for (const groupId of groupIds) {
                // Check blacklist (skip if in blacklist)
                // Note: Add your blacklist logic here if needed
                
                try {
                    if (mediaBuffer) {
                        await conn.sendMessage(groupId, {
                            image: mediaBuffer,
                            caption: `> ♱ 👻 *${botIdentity.botName}* ♱\n\n${text}`
                        });
                    } else {
                        await conn.sendMessage(groupId, {
                            text: `> ♱ 👻 *${botIdentity.botName}* ♱\n\n${text}`
                        });
                    }
                    successCount++;
                } catch (e) {
                    failCount++;
                    console.error(`Failed to send to group ${groupId}:`, e);
                }
                
                // Delay to prevent rate limit
                await sleep(4000);
            }

            // Send result with buttons
            const resultText = `> ♱ 👻 *ᴊᴀsʜᴇʀ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!* ♱\n\n` +
                              `> ✅ *sᴜᴄᴄᴇss:* ${successCount}\n` +
                              `> ❌ *ғᴀɪʟᴇᴅ:* ${failCount}\n` +
                              `> 🚫 *ʙʟᴀᴄᴋʟɪsᴛ:* ${blacklistCount}\n` +
                              `> 📊 *ᴛᴏᴛᴀʟ:* ${groupIds.length}`;

            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ʀᴇsᴜʟᴛ',
                        copy_code: `Success: ${successCount}, Failed: ${failCount}, Total: ${groupIds.length}`
                    })
                }
            ];

            const msg = await generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: resultText },
                            footer: { text: `> ♱ 👻 ${botIdentity.botName} ♱` },
                            nativeFlowMessage: { buttons: buttons }
                        }
                    }
                }
            }, {
                userJid: ms.key.participant || ms.key.remoteJid,
                quoted: ms
            });

            await conn.relayMessage(from, msg.message, {
                messageId: msg.key.id
            });

        } catch (err) {
            console.error("Jasher Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ${err.message || 'ғᴀɪʟᴇᴅ ᴛᴏ ʙʀᴏᴀᴅᴄᴀsᴛ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// ==================== STALKCH COMMAND ====================
const stalkchCommand = {
    silacmd: "stalkch",
    alias: ["sch", "idch", "cekidch", "channelinfo"],
    category: "tools",
    description: "Get WhatsApp channel information",
    usage: ".stalkch <channel link or id>",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            args, 
            prefixe,
            silaConfig 
        } = params;

        const text = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!text) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *sᴛᴀʟᴋᴄʜ ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}stalkch <ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ ᴏʀ ɪᴅ>\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}stalkch https://whatsapp.com/channel/xxxxx\n` +
                      `> ${prefixe}sch 123456789@newsletter`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        // Validate input
        if (!text.includes("https://whatsapp.com/channel/") && !text.includes("@newsletter")) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ɪɴᴠᴀʟɪᴅ ɪɴᴘᴜᴛ!* ♱\n\n` +
                      `> ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ ᴏʀ ɪᴅ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            let result = text.trim();
            let opsi = "jid";
            
            if (text.includes("https://whatsapp.com/channel/")) {
                result = text.split("https://whatsapp.com/channel/")[1];
                opsi = "invite";
            }

            // Fetch channel metadata
            const res = await conn.newsletterMetadata(opsi, result);
            
            // Try to get channel photo
            let photoUrl = null;
            const channelUrl = `https://whatsapp.com/channel/${res.invite}`;
            
            try {
                const { data } = await axios.get(channelUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                const match = data.match(/property="og:image" content="(.*?)"/);
                if (match && match[1]) {
                    photoUrl = match[1].replace(/&amp;/g, '&');
                }
            } catch (e) {
                // Ignore photo fetch error
            }

            // Build info text
            const infoText = `> ♱ 👻 *ᴄʜᴀɴɴᴇʟ ɪɴғᴏʀᴍᴀᴛɪᴏɴ* ♱\n\n` +
                            `> 📛 *ɴᴀᴍᴇ:* ${res.name}\n` +
                            `> 🆔 *ɪᴅ:* ${res.id}\n` +
                            `> 👥 *ғᴏʟʟᴏᴡᴇʀs:* ${toRupiah(res.subscribers)}\n` +
                            `> 📊 *sᴛᴀᴛᴜs:* ${res.state}\n` +
                            `> ✅ *ᴠᴇʀɪғɪᴄᴀᴛɪᴏɴ:* ${res.verification || "ɴᴏɴᴇ"}\n` +
                            `> 📅 *ᴄʀᴇᴀᴛᴇᴅ:* ${new Date(res.creation_time * 1000).toLocaleString("id-ID")}\n` +
                            `> 😀 *ʀᴇᴀᴄᴛɪᴏɴ:* ${res.reaction_codes || "ɴᴏɴᴇ"}\n` +
                            `> 🔗 *ʟɪɴᴋ:* https://whatsapp.com/channel/${res.invite}`;

            // Build buttons
            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ᴄʜᴀɴɴᴇʟ ɪᴅ',
                        copy_code: res.id
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 ᴏᴘᴇɴ ᴄʜᴀɴɴᴇʟ',
                        url: `https://whatsapp.com/channel/${res.invite}`
                    })
                }
            ];

            // Prepare message
            let msgBody = {
                body: { text: infoText },
                footer: { text: `> ♱ 👻 ${botIdentity.botName} ♱` },
                nativeFlowMessage: { buttons: buttons }
            };

            // Add image if available
            if (photoUrl) {
                try {
                    const mediaData = await prepareWAMessageMedia(
                        { image: { url: photoUrl } }, 
                        { upload: conn.waUploadToServer }
                    );
                    msgBody.header = {
                        hasMediaAttachment: true,
                        imageMessage: mediaData.imageMessage
                    };
                } catch (e) {
                    console.error("Photo prepare error:", e);
                }
            }

            const resultMsg = await generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: msgBody
                    }
                }
            }, {
                userJid: ms.key.participant || ms.key.remoteJid,
                quoted: ms
            });

            await conn.relayMessage(from, resultMsg.message, {
                messageId: resultMsg.key.id
            });

        } catch (err) {
            console.error("Stalkch Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇᴛ ᴄʜᴀɴɴᴇʟ ᴍᴇᴛᴀᴅᴀᴛᴀ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// ==================== LISTCH COMMAND ====================
const listchCommand = {
    silacmd: "listch",
    alias: ["listchannel", "channels", "mychannels"],
    category: "owner",
    description: "List all your WhatsApp channels",
    usage: ".listch",
    premium: false,
    sudo: false,
    owner: true,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            isOwner,
            silaConfig 
        } = params;

        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱\n> ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            const allChannels = await conn.newsletterFetchAllParticipating();
            const channels = Object.values(allChannels);
            
            if (channels.length === 0) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 *ɴᴏ ᴄʜᴀɴɴᴇʟs ғᴏᴜɴᴅ!* ♱\n> ʏᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴘᴀʀᴛɪᴄɪᴘᴀᴛɪɴɢ ɪɴ ᴀɴʏ ᴄʜᴀɴɴᴇʟs.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            let channelList = `> ♱ 👻 *ʏᴏᴜʀ ᴄʜᴀɴɴᴇʟs* ♱\n` +
                             `> 📊 *ᴛᴏᴛᴀʟ:* ${channels.length}\n\n`;

            for (let i = 0; i < channels.length; i++) {
                const ch = channels[i];
                channelList += `> ${i + 1}. *${ch.name}*\n` +
                              `>    🆔 ${ch.id}\n` +
                              `>    👥 ${toRupiah(ch.subscribers)} ғᴏʟʟᴏᴡᴇʀs\n` +
                              `>    🔗 https://whatsapp.com/channel/${ch.invite}\n\n`;
            }

            // Build buttons
            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ᴀʟʟ ɪᴅs',
                        copy_code: channels.map(ch => ch.id).join('\n')
                    })
                }
            ];

            const msg = await generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: channelList },
                            footer: { text: `> ♱ 👻 ${botIdentity.botName} ♱` },
                            nativeFlowMessage: { buttons: buttons }
                        }
                    }
                }
            }, {
                userJid: ms.key.participant || ms.key.remoteJid,
                quoted: ms
            });

            await conn.relayMessage(from, msg.message, {
                messageId: msg.key.id
            });

        } catch (err) {
            console.error("Listch Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴄʜᴀɴɴᴇʟs.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// ==================== SAVE COMMAND ====================
const saveCommand = {
    silacmd: "save",
    alias: ["savecontact", "addcontact"],
    category: "owner",
    description: "Save contact to address book",
    usage: ".save <contact name>",
    premium: false,
    sudo: false,
    owner: true,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            args, 
            prefixe,
            isOwner,
            isGroup,
            silaConfig 
        } = params;

        const text = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱\n> ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        if (isGroup) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛ ᴏɴʟʏ!* ♱\n> ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        if (!text) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *sᴀᴠᴇ ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}save <ᴄᴏɴᴛᴀᴄᴛ ɴᴀᴍᴇ>\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}save ᴊᴏʜɴ ᴅᴏᴇ`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            const contactName = text;
            const contactNumber = from.split("@")[0];

            await conn.chatModify({
                contact: {
                    fullName: contactName,
                    lidJid: from,
                    saveOnPrimaryAddressbook: true
                }
            }, from);

            const successText = `> ♱ 👻 *ᴄᴏɴᴛᴀᴄᴛ sᴀᴠᴇᴅ!* ♱\n\n` +
                               `> 👤 *ɴᴀᴍᴇ:* ${contactName}\n` +
                               `> 📱 *ɴᴜᴍʙᴇʀ:* ${contactNumber}\n` +
                               `> ✅ *sᴛᴀᴛᴜs:* sᴀᴠᴇᴅ ᴛᴏ ᴀᴅᴅʀᴇss ʙᴏᴏᴋ`;

            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ɴᴜᴍʙᴇʀ',
                        copy_code: contactNumber
                    })
                }
            ];

            const msg = await generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: successText },
                            footer: { text: `> ♱ 👻 ${botIdentity.botName} ♱` },
                            nativeFlowMessage: { buttons: buttons }
                        }
                    }
                }
            }, {
                userJid: ms.key.participant || ms.key.remoteJid,
                quoted: ms
            });

            await conn.relayMessage(from, msg.message, {
                messageId: msg.key.id
            });

        } catch (err) {
            console.error("Save Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ғᴀɪʟᴇᴅ ᴛᴏ sᴀᴠᴇ ᴄᴏɴᴛᴀᴄᴛ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// ==================== BUATCH COMMAND ====================
const buatchCommand = {
    silacmd: "buatch",
    alias: ["createch", "newch", "createchannel"],
    category: "owner",
    description: "Create new WhatsApp channel",
    usage: ".buatch <channel name>",
    premium: false,
    sudo: false,
    owner: true,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            args, 
            prefixe,
            isOwner,
            silaConfig 
        } = params;

        const text = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱\n> ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        if (!text) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ʙᴜᴀᴛᴄʜ ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}buatch <ᴄʜᴀɴɴᴇʟ ɴᴀᴍᴇ>\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}buatch ᴍʏ ᴄʜᴀɴɴᴇʟ\n` +
                      `> ${prefixe}createch sᴋʏᴢᴏᴘᴇᴅɪᴀ`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            const { id, invite, name } = await conn.newsletterCreate(text, {
                type: "NEWSLETTER",
                reaction_codes_setting: "ALL"
            });

            const resultText = `> ♱ 👻 *ᴄʜᴀɴɴᴇʟ ᴄʀᴇᴀᴛᴇᴅ!* ♱\n\n` +
                              `> 📛 *ɴᴀᴍᴇ:* ${name}\n` +
                              `> 🆔 *ɪᴅ:* ${id}\n` +
                              `> 🔗 *ʟɪɴᴋ:* https://whatsapp.com/channel/${invite}\n` +
                              `> ✅ *sᴛᴀᴛᴜs:* ᴀᴄᴛɪᴠᴇ`;

            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ᴄʜᴀɴɴᴇʟ ɪᴅ',
                        copy_code: id
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ʟɪɴᴋ',
                        copy_code: `https://whatsapp.com/channel/${invite}`
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 ᴏᴘᴇɴ ᴄʜᴀɴɴᴇʟ',
                        url: `https://whatsapp.com/channel/${invite}`
                    })
                }
            ];

            const msg = await generateWAMessageFromContent(from, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: resultText },
                            footer: { text: `> ♱ 👻 ${botIdentity.botName} ♱` },
                            nativeFlowMessage: { buttons: buttons }
                        }
                    }
                }
            }, {
                userJid: ms.key.participant || ms.key.remoteJid,
                quoted: ms
            });

            await conn.relayMessage(from, msg.message, {
                messageId: msg.key.id
            });

        } catch (err) {
            console.error("Buatch Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ғᴀɪʟᴇᴅ ᴛᴏ ᴄʀᴇᴀᴛᴇ ᴄʜᴀɴɴᴇʟ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// Export all commands as array
module.exports = [
    jpmCommand, 
    stalkchCommand, 
    listchCommand, 
    saveCommand, 
    buatchCommand
];
