// ==================== YOUTUBE COMMANDS ====================
// Weka hii file katika folder ya silatech/youtube.js

const yts = require('yt-search');
const fetch = require('node-fetch');
const { sendButtons } = require('gifted-btns');

// Helper to fetch JSON
async function fetchJson(url) {
    const response = await fetch(url);
    return await response.json();
}

// YTS Command - YouTube Search
const ytsCommand = {
    silacmd: "yts",
    alias: ["ytsearch", "ytsrc", "youtubesearch"],
    category: "search",
    description: "Search YouTube videos",
    usage: ".yts <search query>",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            repondre, 
            args, 
            prefixe,
            silaConfig 
        } = params;

        const text = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!text) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ʏᴛsᴇᴀʀᴄʜ ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}yts <sᴇᴀʀᴄʜ ǫᴜᴇʀʏ>\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}yts music phonk tiktok viral\n` +
                      `> ${prefixe}ytsearch never gonna give you up`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Send searching message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *sᴇᴀʀᴄʜɪɴɢ ғᴏʀ:* ${text} ♱\n> ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            const data = await yts(text);
            
            if (!data || !data.all || data.all.length < 1) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 *ɴᴏ ʀᴇsᴜʟᴛs ғᴏᴜɴᴅ!* ♱\n> ᴛʀʏ ᴀɴᴏᴛʜᴇʀ ᴋᴇʏᴡᴏʀᴅ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            // Build search results
            let resultText = `> ♱ 👻 *ʏᴏᴜᴛᴜʙᴇ sᴇᴀʀᴄʜ ʀᴇsᴜʟᴛs* ♱\n` +
                            `> 🔍 *ǫᴜᴇʀʏ:* ${text}\n` +
                            `> 📊 *ғᴏᴜɴᴅ:* ${data.all.length} ʀᴇsᴜʟᴛs\n\n`;

            // Limit to 3 results for buttons
            const results = data.all.slice(0, 3);
            
            // Build buttons array
            const buttons = [];
            
            for (let i = 0; i < results.length; i++) {
                const item = results[i];
                const { title, url, timestamp, author } = item;
                
                resultText += `> ${i + 1}. *${title}*\n` +
                             `>    👤 *ᴄʜᴀɴɴᴇʟ:* ${author?.name || 'Unknown'}\n` +
                             `>    ⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${timestamp}\n` +
                             `>    🔗 ${url}\n\n`;
                
                // Add copy button for each URL
                buttons.push({
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: `📋 ᴄᴏᴘʏ ʟɪɴᴋ ${i + 1}`,
                        copy_code: url
                    })
                });
            }

            // Add extra button
            buttons.push({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '📢 ʏᴏᴜᴛᴜʙᴇ ᴄʜᴀɴɴᴇʟ',
                    url: 'https://youtube.com'
                })
            });

            // Send using gifted-btns
            await sendButtons(conn, from, {
                text: resultText,
                footer: `> ♱ 👻 ${botIdentity.botName} ♱`,
                buttons: buttons
            }, { quoted: ms });

        } catch (err) {
            console.error("YTS Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ${err.message || 'ᴇʀʀᴏʀ ғᴇᴛᴄʜɪɴɢ ʏᴏᴜᴛᴜʙᴇ ᴅᴀᴛᴀ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// YTMP4 Command - YouTube Video Downloader
const ytmp4Command = {
    silacmd: "ytmp4",
    alias: ["ytvideo", "ytv", "video"],
    category: "download",
    description: "Download YouTube video",
    usage: ".ytmp4 <YouTube URL>",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            repondre, 
            args, 
            prefixe,
            silaConfig 
        } = params;

        const text = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!text || !text.includes("http")) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ʏᴛᴍᴘ4 ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}ytmp4 <ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ>\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}ytmp4 https://youtu.be/xxxxx\n` +
                      `> ${prefixe}ytmp4 https://youtube.com/watch?v=xxxxx`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Send processing message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴘʀᴏᴄᴇssɪɴɢ ᴠɪᴅᴇᴏ...* ♱\n> ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            const url = text.trim();
            const data = await fetchJson(`https://api.skyzopedia.web.id/download/ytdl-mp4?apikey=skyy&url=${encodeURIComponent(url)}`);

            if (!data || !data.result || !data.result.download) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ᴠɪᴅᴇᴏ ᴅᴀᴛᴀ ɴᴏᴛ ғᴏᴜɴᴅ ᴏʀ ɪɴᴠᴀʟɪᴅ ᴜʀʟ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            const { title, thumbnail, duration, quality } = data.result;

            // Build caption text
            const captionText = `> ♱ 👻 *ʏᴛᴍᴘ4 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* ♱\n\n` +
                               `> 🎬 *ᴛɪᴛʟᴇ:* ${title || 'Unknown'}\n` +
                               `> ⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${duration || 'Unknown'}\n` +
                               `> 🎥 *ǫᴜᴀʟɪᴛʏ:* ${quality || 'Unknown'}\n` +
                               `> 📦 *sɪᴢᴇ:* ${data.result.size || 'Unknown'}\n\n` +
                               `> 🔗 *ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ:*\n> ${data.result.download}`;

            // Build buttons
            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ᴠɪᴅᴇᴏ ʟɪɴᴋ',
                        copy_code: data.result.download
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ʏᴛ ʟɪɴᴋ',
                        copy_code: url
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎬 ᴏᴘᴇɴ ɪɴ ʏᴏᴜᴛᴜʙᴇ',
                        url: url
                    })
                }
            ];

            // IMPORTANT: For video/audio, gifted-btns needs 'text' not 'caption'
            // Send video separately first
            await conn.sendMessage(from, {
                video: {
                    url: data.result.download
                },
                mimetype: "video/mp4",
                contextInfo: {
                    externalAdReply: {
                        title: `♱ 👻 ${title || 'YouTube Video'}`,
                        body: `ᴄʟɪᴄᴋ ᴛᴏ ᴏᴘᴇɴ ᴏʀɪɢɪɴᴀʟ`,
                        thumbnailUrl: thumbnail || '',
                        renderLargerThumbnail: true,
                        mediaType: 1,
                        sourceUrl: url,
                        showAdAttribution: true
                    },
                    ...silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }
            }, { quoted: ms });

            // Then send buttons with text (not caption)
            await sendButtons(conn, from, {
                text: captionText,
                footer: `> ♱ 👻 ${botIdentity.botName} ♱`,
                buttons: buttons
            }, { quoted: ms });

        } catch (err) {
            console.error("YTMP4 Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ${err.message || 'ᴇʀʀᴏʀ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴠɪᴅᴇᴏ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// YTMP3 Command - YouTube Audio Downloader
const ytmp3Command = {
    silacmd: "ytmp3",
    alias: ["ytaudio", "yta", "audio"],
    category: "download",
    description: "Download YouTube audio",
    usage: ".ytmp3 <YouTube URL>",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            repondre, 
            args, 
            prefixe,
            silaConfig 
        } = params;

        const text = args.join(" ");
        const botIdentity = silaConfig.getBotConfig();

        if (!text || !text.includes("http")) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ʏᴛᴍᴘ3 ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}ytmp3 <ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ>\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}ytmp3 https://youtu.be/xxxxx\n` +
                      `> ${prefixe}ytmp3 https://youtube.com/watch?v=xxxxx`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Send processing message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴘʀᴏᴄᴇssɪɴɢ ᴀᴜᴅɪᴏ...* ♱\n> ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            const url = text.trim();
            const data = await fetchJson(`https://api.skyzopedia.web.id/download/ytdl-mp3?apikey=skyy&url=${encodeURIComponent(url)}`);

            if (!data || !data.result || !data.result.download) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ᴀᴜᴅɪᴏ ᴅᴀᴛᴀ ɴᴏᴛ ғᴏᴜɴᴅ ᴏʀ ɪɴᴠᴀʟɪᴅ ᴜʀʟ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }, { quoted: ms });
            }

            const { title, thumbnail, duration, quality } = data.result;

            // Build text for buttons
            const infoText = `> ♱ 👻 *ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ!* ♱\n\n` +
                            `> 🎵 *ᴛɪᴛʟᴇ:* ${title || 'Unknown'}\n` +
                            `> ⏱️ *ᴅᴜʀᴀᴛɪᴏɴ:* ${duration || 'Unknown'}\n` +
                            `> 🔊 *ǫᴜᴀʟɪᴛʏ:* ${quality || 'Unknown'}\n` +
                            `> 📦 *sɪᴢᴇ:* ${data.result.size || 'Unknown'}\n\n` +
                            `> 🔗 *ᴅᴏᴡɴʟᴏᴀᴅ ʟɪɴᴋ:*\n> ${data.result.download}`;

            // Build buttons
            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ᴀᴜᴅɪᴏ ʟɪɴᴋ',
                        copy_code: data.result.download
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ʏᴛ ʟɪɴᴋ',
                        copy_code: url
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎵 ᴏᴘᴇɴ ɪɴ ʏᴏᴜᴛᴜʙᴇ',
                        url: url
                    })
                }
            ];

            // Send audio with externalAdReply
            await conn.sendMessage(from, {
                audio: {
                    url: data.result.download
                },
                mimetype: "audio/mpeg",
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: `♱ 👻 ${title || 'YouTube Audio'}`,
                        body: `ᴅᴜʀᴀᴛɪᴏɴ: ${duration || 'Unknown'} | ǫᴜᴀʟɪᴛʏ: ${quality || 'Unknown'}`,
                        thumbnailUrl: thumbnail || '',
                        renderLargerThumbnail: true,
                        mediaType: 1,
                        sourceUrl: url,
                        showAdAttribution: true
                    },
                    ...silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                }
            }, { quoted: ms });

            // Then send buttons with text (not caption)
            await sendButtons(conn, from, {
                text: infoText,
                footer: `> ♱ 👻 ${botIdentity.botName} ♱`,
                buttons: buttons
            }, { quoted: ms });

        } catch (err) {
            console.error("YTMP3 Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ${err.message || 'ᴇʀʀᴏʀ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴀᴜᴅɪᴏ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

// Export all commands as array
module.exports = [ytsCommand, ytmp4Command, ytmp3Command];
