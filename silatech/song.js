// ==================== PLAY COMMAND ====================
// Weka hii file katika folder ya silatech/play.js

const yts = require('yt-search');
const fetch = require('node-fetch');

const playCommand = {
    silacmd: "play",
    alias: ["playyt", "ytplay", "song", "audio"],
    category: "download",
    description: "Download and play YouTube audio",
    usage: ".play <song name or YouTube URL>",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            repondre, 
            args, 
            prefixe,
            senderNumber,
            silaConfig 
        } = params;
        
        const text = args.join(" ");
        
        if (!text) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 **ᴘʟᴀʏ ᴄᴏᴍᴍᴀɴᴅ** ♱\n\n` +
                      `> **ᴜsᴀɢᴇ:**\n` +
                      `> ${prefixe}play <sᴏɴɢ ɴᴀᴍᴇ>\n` +
                      `> ${prefixe}play <ʏᴏᴜᴛᴜʙᴇ ᴜʀʟ>\n\n` +
                      `> **ᴇxᴀᴍᴘʟᴇ:**\n` +
                      `> ${prefixe}play audio meme 30 seconds\n` +
                      `> ${prefixe}play https://youtube.com/watch?v=xxxxx`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }

        try {
            // Search for the song
            const ress = await yts(text);
            if (!ress || !ress.all || ress.all.length < 1) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 **ғᴀɪʟᴇᴅ!** ♱\n> ᴀᴜᴅɪᴏ/ᴠɪᴅᴇᴏ ɴᴏᴛ ғᴏᴜɴᴅ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
                }, { quoted: ms });
            }

            // Send processing message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 **ᴘʀᴏᴄᴇssɪɴɢ ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅ...** ♱\n> ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });

            const {
                title,
                url,
                thumbnail,
                timestamp,
                author
            } = ress.all[0];

            // Download audio using API
            const apiUrl = `https://api.skyzopedia.web.id/download/ytdl-mp3?apikey=skyy&url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data.result || !data.result.download) {
                return await conn.sendMessage(from, {
                    text: `> ♱ 👻 **ᴇʀʀᴏʀ!** ♱\n> ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ғᴇᴛᴄʜɪɴɢ ᴛʜᴇ ᴀᴜᴅɪᴏ.`,
                    contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
                }, { quoted: ms });
            }

            // Get bot identity for contextInfo
            const botIdentity = silaConfig.getBotConfig();

            // Send audio with externalAdReply
            await conn.sendMessage(
                from, 
                {
                    audio: {
                        url: data.result.download
                    },
                    mimetype: "audio/mpeg",
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: `♱ 👻 ${title}`,
                            body: `ᴅᴜʀᴀᴛɪᴏɴ: ${timestamp} || ᴄʀᴇᴀᴛᴏʀ: ${author?.name || 'Unknown'}`,
                            thumbnailUrl: thumbnail,
                            renderLargerThumbnail: true,
                            mediaType: 1,
                            sourceUrl: url,
                            showAdAttribution: true
                        },
                        ...silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
                    }
                }, 
                {
                    quoted: ms
                }
            );

        } catch (err) {
            console.error('Play command error:', err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 **ᴇʀʀᴏʀ!** ♱\n> ᴀɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴏɴ ᴛʜᴇ sᴇʀᴠᴇʀ.`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, silaConfig.getBotConfig())
            }, { quoted: ms });
        }
    }
};

module.exports = playCommand;
