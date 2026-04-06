// silatech/listmenu.js
// Menu header and button configuration - BUTTONS FIXED VERSION

const fs = require('fs');
const axios = require('axios');

// Helper functions
const runtime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

const tanggal = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const getTime = (format) => {
    const now = new Date();
    if (format === "HH:mm:ss") {
        return now.toLocaleTimeString('id-ID', { hour12: false });
    }
    return now.toLocaleTimeString('id-ID');
};

// Download image to buffer
const getImageBuffer = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return Buffer.from(response.data, 'binary');
    } catch (err) {
        console.error('Failed to download image:', err.message);
        return null;
    }
};

// Header generator
const headerUserWithBot = async (ms, config, prefixe) => {
    const sender = ms?.sender || ms?.key?.remoteJid || "unknown@s.whatsapp.net";
    const senderNumber = sender.split("@")[0];
    const userName = ms?.pushName || ms?.name || config.botName || "Unknown User";
    const isOwner = ms?.isOwner || config.creatorNumber === senderNumber;
    const userType = isOwner ? "Developer" : "Premium User";
    const botRuntime = runtime(process.uptime());
    const botMode = config.selfMode ? "Self" : "Public";
    const currentDate = tanggal(Date.now());
    const currentTime = getTime("HH:mm:ss");

    return `┏━〘 ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 〙 ━┓
┃ ➬ ʙᴏᴛ ɴᴀᴍᴇ : ${config.botName || 'Sila Bot'}
┃ ➬ ᴠᴇʀsɪᴏɴ  : ${config.version || '1.0.0'}
┃ ➫ ᴛʏᴘᴇ    : ᴄᴀsᴇs
┃ ➫ ᴍᴏᴅᴇ    : ${botMode}
┃ ➫ ᴜᴘᴛɪᴍᴇ  : ${botRuntime}
┗━━━━━━』
┏━〘 ᴜsᴇʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 〙 ━┓
┃ ➬ ɴᴀᴍᴇ : ${userName}
┃ ➬ sᴛᴀᴛᴜs    : ${userType}
┃ ➫ ᴜsᴇʀ  : @${senderNumber}
┃ ➫ ᴅᴀᴛᴇ : ${currentDate}
┃ ➫ ᴛɪᴍᴇ   : ${currentTime}
┗━━━━━━』`;
};

// Menu rows configuration - FIXED IDs
const rowsMenu = (prefixe) => [
    { title: "⭐ All Menu", id: `${prefixe}allmenu`, description: "Display all bot menu lists" },
    { title: "📌 Main Menu", id: `${prefixe}mainmenu`, description: "Display main menu list" },
    { title: "🎨 Creator Menu", id: `${prefixe}creatormenu`, description: "Display creator menu list" },
    { title: "⬇️ Download Menu", id: `${prefixe}downloadmenu`, description: "Display download menu list" },
    { title: "🔎 Search Menu", id: `${prefixe}searchmenu`, description: "Display search menu list" },
    { title: "💫 Islamic Menu", id: `${prefixe}islamic`, description: "Display Islamic menu list" },
    { title: "🛠️ Tools Menu", id: `${prefixe}toolsmenu`, description: "Display tools menu list" },
    { title: "🎉 Fun Menu", id: `${prefixe}funmenu`, description: "Display fun menu list" },
    { title: "🛍️ Store Menu", id: `${prefixe}storemenu`, description: "Display store menu list" },
    { title: "👥 Group Menu", id: `${prefixe}grupmenu`, description: "Display group menu list" },
    { title: "🔐 Obfuscator Menu", id: `${prefixe}obfmenu`, description: "Display obfuscator menu list" },
    { title: "📢 Channel Menu", id: `${prefixe}channelmenu`, description: "Display channel menu list" },
    { title: "🖥️ Panel Menu", id: `${prefixe}panelmenu`, description: "Display panel menu list" },
    { title: "⚙️ Setbot Menu", id: `${prefixe}setbotmenu`, description: "Display setbot menu list" },
    { title: "👑 Owner Menu", id: `${prefixe}ownermenu`, description: "Display owner menu list" }
];

// Send menu with buttons - FIXED VERSION
const sendMenuWithButton = async (from, conn, ms, teks, config) => {
    const prefixe = config.prefix || '!';
    const sender = ms?.sender || ms?.key?.remoteJid || from;
    const creatorJid = (config.creatorNumber || '0') + "@s.whatsapp.net";
    const imageUrl = config.thumb || config.menuImage || 'https://raw.githubusercontent.com/Sila-Md/Sila-data/refs/heads/main/Sila/nocturnal1.png';
    
    // Get menu list for display
    const menuList = rowsMenu(prefixe);
    
    // Build sections for list menu
    const sections = [
        {
            title: "📋 Menu Categories",
            rows: menuList.map(item => ({
                title: item.title,
                rowId: item.id,
                description: item.description
            }))
        }
    ];

    // Method 1: Send List Message (works best for menu selection)
    try {
        const listMessage = {
            text: teks,
            footer: `${config.botName} • ${config.creatorName || 'Sila Dev'}\n\n_Powered by ♱ ɴ o c т u r n a l ♱_`,
            title: "🔰 Select Menu",
            buttonText: "📋 Click to See Menu List",
            sections: sections,
            contextInfo: {
                mentionedJid: [sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: config.newsletterName || config.botName,
                    newsletterJid: config.newsletterJid || '0@newsletter'
                },
                externalAdReply: {
                    title: config.botName,
                    body: 'Click to open menu',
                    thumbnailUrl: imageUrl,
                    sourceUrl: config.linkChannel,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        };

        await conn.sendMessage(from, listMessage, { quoted: ms });
        return;
    } catch (listErr) {
        console.log('List message failed:', listErr.message);
    }

    // Method 2: Send Template Buttons with Quick Replies
    try {
        const buttons = [
            {
                buttonId: `${prefixe}allmenu`,
                buttonText: { displayText: '⭐ All Menu' },
                type: 1
            },
            {
                buttonId: `${prefixe}mainmenu`,
                buttonText: { displayText: '📌 Main' },
                type: 1
            },
            {
                buttonId: `${prefixe}downloadmenu`,
                buttonText: { displayText: '⬇️ Download' },
                type: 1
            },
            {
                buttonId: `${prefixe}toolsmenu`,
                buttonText: { displayText: '🛠️ Tools' },
                type: 1
            },
            {
                buttonId: `${prefixe}ownermenu`,
                buttonText: { displayText: '👑 Owner' },
                type: 1
            }
        ];

        const buttonMessage = {
            image: { url: imageUrl },
            caption: teks,
            footer: `${config.botName} • ${config.creatorName || 'Sila Dev'}`,
            buttons: buttons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: config.newsletterName || config.botName,
                    newsletterJid: config.newsletterJid || '0@newsletter'
                }
            }
        };

        await conn.sendMessage(from, buttonMessage, { quoted: ms });
        return;
    } catch (btnErr) {
        console.log('Button message failed:', btnErr.message);
    }

    // Method 3: Interactive Native Flow (Latest WhatsApp)
    try {
        const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
        
        const interactiveMessage = {
            body: { text: teks },
            footer: { text: `${config.botName} • ${config.creatorName || 'Sila Dev'}` },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "📋 List Menu",
                            sections: [{
                                title: `© Powered By ${config.botName}`,
                                highlight_label: "Recommended",
                                rows: menuList
                            }]
                        })
                    }
                ]
            },
            contextInfo: {
                mentionedJid: [sender, creatorJid],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: config.newsletterName || config.botName,
                    newsletterJid: config.newsletterJid || '0@newsletter'
                }
            }
        };

        const msg = await generateWAMessageFromContent(
            from,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: interactiveMessage
                    }
                }
            },
            {
                userJid: sender,
                quoted: ms
            }
        );

        await conn.relayMessage(from, msg.message, {
            messageId: msg.key.id
        });
        return;
    } catch (interactiveErr) {
        console.log('Interactive failed:', interactiveErr.message);
    }

    // Final Fallback: Plain Text with Menu List
    const fallbackText = teks + `\n\n📋 *Available Menus:*\n` + 
        menuList.map((r, i) => `${i + 1}. ${r.title} → Type: *${r.id}*`).join('\n') +
        `\n\n_♱ 👻 ᴛʏᴘᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ᴛᴏ ᴏᴘᴇɴ ᴍᴇɴᴜ 👻 ♱_`;
    
    await conn.sendMessage(from, {
        text: fallbackText,
        mentions: [sender]
    }, { quoted: ms });
};

module.exports = {
    headerUserWithBot,
    sendMenuWithButton,
    rowsMenu
};
