// ==================== PUSH CONTACT COMMANDS ====================
// Weka hii file katika folder ya silatech/pushcontact.js

const { generateWAMessageFromContent } = require('baileys');

// Helper for sleep/delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== PUSH CONTACT 2 COMMAND ====================
// Send message to all members in a selected group (without saving)
const pushContact2Command = {
    silacmd: "pushcontact2",
    alias: ["push2", "send2", "blast2", "broadcast2"],
    category: "owner",
    description: "Send message to all group members (no save)",
    usage: ".pushcontact2 <message>",
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
                text: `> ♱ 👻 *ᴘᴜsʜ ᴄᴏɴᴛᴀᴄᴛ 2* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}pushcontact2 <ʏᴏᴜʀ ᴍᴇssᴀɢᴇ>\n\n` +
                      `> *ᴡʜᴀᴛ ɪᴛ ᴅᴏᴇs:*\n` +
                      `> sᴇɴᴅs ʏᴏᴜʀ ᴍᴇssᴀɢᴇ ᴛᴏ ᴀʟʟ ᴍᴇᴍʙᴇʀs ɪɴ ᴀ ɢʀᴏᴜᴘ\n` +
                      `> (ᴡɪᴛʜᴏᴜᴛ sᴀᴠɪɴɢ ᴄᴏɴᴛᴀᴄᴛs)\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}pushcontact2 ʜᴇʟʟᴏ ᴇᴠᴇʀʏᴏɴᴇ!`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Save message for later use
            global.textPushContact2 = text;

            // Get all groups
            const groups = await conn.groupFetchAllParticipating();
            if (!groups || Object.keys(groups).length === 0) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 *ɴᴏ ɢʀᴏᴜᴘs!* ♱\n> ʙᴏᴛ ɪs ɴᴏᴛ ɪɴ ᴀɴʏ ɢʀᴏᴜᴘ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            global.dataAllGroups = groups;

            // Create group list for selection
            const rows = Object.values(groups).map(g => ({
                title: g.subject || "No Name",
                description: `${g.participants.length} members`,
                id: `.pushcontact2go ${g.id}`
            }));

            // Send group selection menu
            const buttons = [{
                buttonId: "select_group",
                buttonText: { displayText: "> ♱ 👻 sᴇʟᴇᴄᴛ ɢʀᴏᴜᴘ" },
                type: 4,
                nativeFlowInfo: {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "📋 ɢʀᴏᴜᴘ ʟɪsᴛ",
                        sections: [{ rows }]
                    })
                }
            }];

            await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴄʜᴏᴏsᴇ ᴛᴀʀɢᴇᴛ ɢʀᴏᴜᴘ* ♱\n\n` +
                      `> 📝 *ᴍᴇssᴀɢᴇ:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n` +
                      `> 📊 *ᴛᴏᴛᴀʟ ɢʀᴏᴜᴘs:* ${rows.length}\n\n` +
                      `> ᴄʟɪᴄᴋ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ ᴛᴏ sᴇʟᴇᴄᴛ:`,
                buttons: buttons,
                headerType: 1,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

        } catch (err) {
            console.error("PushContact2 Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ${err.message || 'ғᴀɪʟᴇᴅ ᴛᴏ sᴛᴀʀᴛ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// ==================== PUSH CONTACT 2 GO COMMAND ====================
// Execute the push after group selection
const pushContact2GoCommand = {
    silacmd: "pushcontact2go",
    alias: ["push2go", "send2go", "blast2go"],
    category: "owner",
    description: "Execute push contact 2 to selected group",
    usage: ".pushcontact2go <groupid> (auto from button)",
    premium: false,
    sudo: false,
    owner: true,
    hide: true, // Hidden from help menu
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            args, 
            isOwner,
            silaConfig 
        } = params;

        const groupId = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) return;

        // Check if data exists
        if (!global.textPushContact2 || !global.dataAllGroups) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴅᴀᴛᴀ ᴇxᴘɪʀᴇᴅ!* ♱\n> ᴘʟᴇᴀsᴇ ʀᴇsᴛᴀʀᴛ ᴡɪᴛʜ *.pushcontact2*`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        const groupData = global.dataAllGroups[groupId];
        if (!groupData) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ɢʀᴏᴜᴘ ɴᴏᴛ ғᴏᴜɴᴅ!* ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        const messageText = global.textPushContact2;
        const members = groupData.participants
            .map(v => v.id)
            .filter(jid => jid && !jid.includes(conn.user.id.split(':')[0]));

        // Start status
        global.statusPushContact = true;

        // Send start message
        await conn.sendMessage(from, {
            text: `> ♱ 👻 *sᴛᴀʀᴛɪɴɢ ᴘᴜsʜ...* ♱\n\n` +
                  `> 📱 *ɢʀᴏᴜᴘ:* ${groupData.subject}\n` +
                  `> 👥 *ᴛᴏᴛᴀʟ:* ${members.length} ᴍᴇᴍʙᴇʀs\n` +
                  `> ⏳ *ᴇsᴛɪᴍᴀᴛᴇᴅ:* ${members.length * 2}s`,
            contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
        }, { quoted: ms });

        let successCount = 0;
        let failCount = 0;

        // Send to all members
        for (const jid of members) {
            if (!global.statusPushContact) break;

            try {
                await conn.sendMessage(jid, {
                    text: `> ♱ 👻 *${botIdentity.botName}* ♱\n\n${messageText}`
                });
                successCount++;
                await sleep(2000); // 2 second delay
            } catch (e) {
                failCount++;
                console.log("Failed to send to:", jid);
            }
        }

        // Cleanup
        delete global.textPushContact2;
        delete global.dataAllGroups;

        // Result with buttons
        const resultText = `> ♱ 👻 *ᴘᴜsʜ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!* ♱\n\n` +
                          `> ✅ *sᴇɴᴛ:* ${successCount}\n` +
                          `> ❌ *ғᴀɪʟᴇᴅ:* ${failCount}\n` +
                          `> 📊 *ᴛᴏᴛᴀʟ:* ${members.length}`;

        const buttons = [
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: '📋 ᴄᴏᴘʏ ʀᴇsᴜʟᴛ',
                    copy_code: `Sent: ${successCount}, Failed: ${failCount}`
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
    }
};

// ==================== PUSH CONTACT COMMAND ====================
// Save contact then send message (with custom name)
const pushContactCommand = {
    silacmd: "pushcontact",
    alias: ["push", "send", "blast", "broadcast"],
    category: "owner",
    description: "Save contacts and send message to all members",
    usage: ".pushcontact <contact name> (reply to message)",
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

        const contactName = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱\n> ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ʙᴏᴛ ᴏᴡɴᴇʀ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        // Get quoted message
        const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const messageText = quotedMsg ? 
            (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) : 
            null;

        if (!contactName || !messageText) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴘᴜsʜ ᴄᴏɴᴛᴀᴄᴛ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> 1. ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ\n` +
                      `> 2. ᴛʏᴘᴇ: ${prefixe}pushcontact <ɴᴀᴍᴇ>\n\n` +
                      `> *ᴡʜᴀᴛ ɪᴛ ᴅᴏᴇs:*\n` +
                      `> sᴀᴠᴇs ᴄᴏɴᴛᴀᴄᴛs ᴡɪᴛʜ ʏᴏᴜʀ ɴᴀᴍᴇ\n` +
                      `> ᴛʜᴇɴ sᴇɴᴅs ᴛʜᴇ ʀᴇᴘʟɪᴇᴅ ᴍᴇssᴀɢᴇ\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> [ʀᴇᴘʟʏ ᴛᴏ ᴍsɢ] ${prefixe}pushcontact ᴍʏʙᴜsɪɴᴇss`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Save data globally
            global.namePushContact = contactName;
            global.textPushContact = messageText;

            // Get all groups
            const groups = await conn.groupFetchAllParticipating();
            if (!groups || Object.keys(groups).length === 0) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 *ɴᴏ ɢʀᴏᴜᴘs!* ♱\n> ʙᴏᴛ ɪs ɴᴏᴛ ɪɴ ᴀɴʏ ɢʀᴏᴜᴘ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            global.dataAllGroups = groups;

            // Create group list
            const rows = Object.values(groups).map(g => ({
                title: g.subject || "No Name",
                description: `${g.participants.length} members`,
                id: `.pushcontactgo ${g.id}`
            }));

            // Send selection menu
            const buttons = [{
                buttonId: "select_group",
                buttonText: { displayText: "> ♱ 👻 sᴇʟᴇᴄᴛ ɢʀᴏᴜᴘ" },
                type: 4,
                nativeFlowInfo: {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "📋 ɢʀᴏᴜᴘ ʟɪsᴛ",
                        sections: [{ rows }]
                    })
                }
            }];

            await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴄʜᴏᴏsᴇ ᴛᴀʀɢᴇᴛ ɢʀᴏᴜᴘ* ♱\n\n` +
                      `> 👤 *ᴄᴏɴᴛᴀᴄᴛ ɴᴀᴍᴇ:* ${contactName}\n` +
                      `> 📝 *ᴍᴇssᴀɢᴇ:* ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}\n` +
                      `> 📊 *ᴛᴏᴛᴀʟ ɢʀᴏᴜᴘs:* ${rows.length}\n\n` +
                      `> ᴄʟɪᴄᴋ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ:`,
                buttons: buttons,
                headerType: 1,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

        } catch (err) {
            console.error("PushContact Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ${err.message || 'ғᴀɪʟᴇᴅ ᴛᴏ sᴛᴀʀᴛ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// ==================== PUSH CONTACT GO COMMAND ====================
// Execute push contact with save
const pushContactGoCommand = {
    silacmd: "pushcontactgo",
    alias: ["pushgo", "sendgo", "blastgo"],
    category: "owner",
    description: "Execute push contact to selected group",
    usage: ".pushcontactgo <groupid> (auto from button)",
    premium: false,
    sudo: false,
    owner: true,
    hide: true,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            args, 
            isOwner,
            silaConfig 
        } = params;

        const groupId = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) return;

        // Check data
        if (!global.textPushContact || !global.dataAllGroups || !global.namePushContact) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴅᴀᴛᴀ ᴇxᴘɪʀᴇᴅ!* ♱\n> ᴘʟᴇᴀsᴇ ʀᴇsᴛᴀʀᴛ ᴡɪᴛʜ *.pushcontact*`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        const groupData = global.dataAllGroups[groupId];
        if (!groupData) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ɢʀᴏᴜᴘ ɴᴏᴛ ғᴏᴜɴᴅ!* ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        const members = groupData.participants
            .map(v => v.id || v.jid)
            .filter(jid => jid && !jid.includes(conn.user.id.split(':')[0]));

        global.statusPushContact = true;

        // Start message
        await conn.sendMessage(from, {
            text: `> ♱ 👻 *sᴀᴠɪɴɢ & sᴇɴᴅɪɴɢ...* ♱\n\n` +
                  `> 📱 *ɢʀᴏᴜᴘ:* ${groupData.subject}\n` +
                  `> 👥 *ᴛᴏᴛᴀʟ:* ${members.length} ᴍᴇᴍʙᴇʀs\n` +
                  `> 👤 *sᴀᴠᴇ ᴀs:* ${global.namePushContact}\n` +
                  `> ⏳ *ᴇsᴛɪᴍᴀᴛᴇᴅ:* ${members.length * 5}s`,
            contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
        }, { quoted: ms });

        let successCount = 0;

        for (const jid of members) {
            if (!global.statusPushContact) break;

            try {
                const fullName = `${global.namePushContact} #${jid.split("@")[0]}`;
                
                // Save contact first
                await conn.chatModify({
                    contact: {
                        fullName: fullName,
                        lidJid: jid,
                        saveOnPrimaryAddressbook: true
                    }
                }, jid);

                await sleep(3000); // Wait after save

                // Send message
                await conn.sendMessage(jid, {
                    text: global.textPushContact
                });

                successCount++;
                await sleep(2000); // Delay between sends

            } catch (e) {
                console.log("Failed for:", jid);
            }
        }

        // Cleanup
        delete global.textPushContact;
        delete global.dataAllGroups;
        delete global.namePushContact;

        // Result
        const resultText = `> ♱ 👻 *ᴘᴜsʜ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!* ♱\n\n` +
                          `> ✅ *sᴜᴄᴄᴇss:* ${successCount}\n` +
                          `> 📊 *ᴛᴏᴛᴀʟ:* ${members.length}\n` +
                          `> 👤 *sᴀᴠᴇᴅ ᴀs:* ${global.namePushContact || 'N/A'}`;

        const buttons = [
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: '📋 ᴄᴏᴘʏ ʀᴇsᴜʟᴛ',
                    copy_code: `Success: ${successCount}/${members.length}`
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
    }
};

// ==================== SAVE CONTACTS COMMAND ====================
// Save all contacts from a group (no message)
const saveContactsCommand = {
    silacmd: "savecontacts",
    alias: ["saveall", "savegroup", "savegc"],
    category: "owner",
    description: "Save all contacts from a group",
    usage: ".savecontacts <contact name>",
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

        const contactName = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        if (!contactName) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *sᴀᴠᴇ ᴄᴏɴᴛᴀᴄᴛs* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}savecontacts <ʏᴏᴜʀ ɴᴀᴍᴇ>\n\n` +
                      `> *ᴡʜᴀᴛ ɪᴛ ᴏᴇs:*\n` +
                      `> sᴀᴠᴇs ᴀʟʟ ɢʀᴏᴜᴘ ᴍᴇᴍʙᴇʀs ᴀs ᴄᴏɴᴛᴀᴄᴛs\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}savecontacts ᴍʏᴄʟɪᴇɴᴛs`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            global.nameSaveContacts = contactName;

            const groups = await conn.groupFetchAllParticipating();
            if (!groups || Object.keys(groups).length === 0) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 *ɴᴏ ɢʀᴏᴜᴘs!* ♱`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            global.dataAllGroups = groups;

            const rows = Object.values(groups).map(g => ({
                title: g.subject || "No Name",
                description: `${g.participants.length} members`,
                id: `.savecontactsgo ${g.id}`
            }));

            const buttons = [{
                buttonId: "select_group",
                buttonText: { displayText: "> ♱ 👻 sᴇʟᴇᴄᴛ ɢʀᴏᴜᴘ" },
                type: 4,
                nativeFlowInfo: {
                    name: "single_select",
                    paramsJson: JSON.stringify({
                        title: "📋 ɢʀᴏᴜᴘ ʟɪsᴛ",
                        sections: [{ rows }]
                    })
                }
            }];

            await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴄʜᴏᴏsᴇ ɢʀᴏᴜᴘ* ♱\n\n` +
                      `> 👤 *sᴀᴠᴇ ᴀs:* ${contactName}\n` +
                      `> 📊 *ᴛᴏᴛᴀʟ ɢʀᴏᴜᴘs:* ${rows.length}`,
                buttons: buttons,
                headerType: 1,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

        } catch (err) {
            console.error("SaveContacts Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// ==================== SAVE CONTACTS GO COMMAND ====================
const saveContactsGoCommand = {
    silacmd: "savecontactsgo",
    alias: ["savego", "saveallgo"],
    category: "owner",
    description: "Execute save contacts to selected group",
    usage: ".savecontactsgo <groupid> (auto from button)",
    premium: false,
    sudo: false,
    owner: true,
    hide: true,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            args, 
            isOwner,
            silaConfig 
        } = params;

        const groupId = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!isOwner) return;

        if (!global.nameSaveContacts || !global.dataAllGroups) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴅᴀᴛᴀ ᴇxᴘɪʀᴇᴅ!* ♱\n> ᴜsᴇ *.savecontacts* ғɪʀsᴛ`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        const groupData = global.dataAllGroups[groupId];
        if (!groupData) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ɢʀᴏᴜᴘ ɴᴏᴛ ғᴏᴜɴᴅ!* ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        const members = groupData.participants
            .map(v => v.id || v.jid)
            .filter(jid => jid && !jid.includes(conn.user.id.split(':')[0]));

        global.statusSaveContacts = true;

        await conn.sendMessage(from, {
            text: `> ♱ 👻 *sᴀᴠɪɴɢ ᴄᴏɴᴛᴀᴄᴛs...* ♱\n\n` +
                  `> 📱 *ɢʀᴏᴜᴘ:* ${groupData.subject}\n` +
                  `> 👥 *ᴛᴏᴛᴀʟ:* ${members.length} ᴍᴇᴍʙᴇʀs\n` +
                  `> ⏳ *ᴇsᴛɪᴍᴀᴛᴇᴅ:* ${members.length * 3}s`,
            contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
        }, { quoted: ms });

        let successCount = 0;
        const savedList = [];

        for (const jid of members) {
            if (!global.statusSaveContacts) {
                await conn.sendMessage(from, {
                    text: `> ♱ 👻 *sᴛᴏᴘᴘᴇᴅ!* ♱`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                });
                break;
            }

            try {
                const fullName = `${global.nameSaveContacts} #${jid.split("@")[0]}`;
                
                await conn.chatModify({
                    contact: {
                        fullName: fullName,
                        lidJid: jid,
                        saveOnPrimaryAddressbook: true
                    }
                }, jid);

                savedList.push(fullName);
                successCount++;
                await sleep(3000);

            } catch (e) {
                console.log("Failed to save:", jid);
            }
        }

        delete global.nameSaveContacts;
        delete global.dataAllGroups;
        delete global.statusSaveContacts;

        let resultText = `> ♱ 👻 *sᴀᴠᴇ ᴄᴏᴍᴘʟᴇᴛᴇᴅ!* ♱\n\n` +
                        `> ✅ *sᴀᴠᴇᴅ:* ${successCount}\n` +
                        `> 📊 *ᴛᴏᴛᴀʟ:* ${members.length}\n\n`;

        if (savedList.length > 0) {
            resultText += `> 📋 *sᴀᴠᴇᴅ ᴄᴏɴᴛᴀᴄᴛs:*\n`;
            resultText += savedList.slice(0, 10).map((name, i) => `> ${i + 1}. ${name}`).join('\n');
            if (savedList.length > 10) resultText += `\n> ...and ${savedList.length - 10} more`;
        }

        const buttons = [
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: '📋 ᴄᴏᴘʏ ᴄᴏᴜɴᴛ',
                    copy_code: `${successCount} contacts saved`
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
    }
};

// ==================== STOP COMMANDS ====================
const stopPushCommand = {
    silacmd: "stoppush",
    alias: ["stopsend", "stopblast"],
    category: "owner",
    description: "Stop ongoing push contact process",
    usage: ".stoppush",
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
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        if (!global.statusPushContact) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ɴᴏ ᴀᴄᴛɪᴠᴇ ᴘᴜsʜ!* ♱\n> ɴᴏ ᴘᴜsʜ ᴄᴏɴᴛᴀᴄᴛ ʀᴜɴɴɪɴɢ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        global.statusPushContact = false;
        
        return await conn.sendMessage(from, {
            text: `> ♱ 👻 *ᴘᴜsʜ sᴛᴏᴘᴘᴇᴅ!* ♱\n> ᴘʀᴏᴄᴇss sᴛᴏᴘᴘᴇᴅ ʙʏ ᴏᴡɴᴇʀ.`,
            contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
        }, { quoted: ms });
    }
};

const stopSaveCommand = {
    silacmd: "stopsave",
    alias: ["stopsaving", "stopsavecontacts"],
    category: "owner",
    description: "Stop ongoing save contacts process",
    usage: ".stopsave",
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
                text: `> ♱ 👻 *ᴏᴡɴᴇʀ ᴏɴʟʏ!* ♱`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        if (!global.statusSaveContacts) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ɴᴏ ᴀᴄᴛɪᴠᴇ sᴀᴠᴇ!* ♱\n> ɴᴏ sᴀᴠᴇ ᴄᴏɴᴛᴀᴄᴛs ʀᴜɴɴɪɴɢ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        global.statusSaveContacts = false;
        
        return await conn.sendMessage(from, {
            text: `> ♱ 👻 *sᴀᴠᴇ sᴛᴏᴘᴘᴇᴅ!* ♱\n> ᴘʀᴏᴄᴇss sᴛᴏᴘᴘᴇᴅ ʙʏ ᴏᴡɴᴇʀ.`,
            contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
        }, { quoted: ms });
    }
};

// Export all commands
module.exports = [
    pushContact2Command,
    pushContact2GoCommand,
    pushContactCommand,
    pushContactGoCommand,
    saveContactsCommand,
    saveContactsGoCommand,
    stopPushCommand,
    stopSaveCommand
];
