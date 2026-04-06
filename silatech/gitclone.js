// ==================== GITCLONE COMMAND ====================
// Weka hii file katika folder ya silatech/gitclone.js

const fetch = require('node-fetch');
const { sendButtons } = require('gifted-btns');

const gitcloneCommand = {
    silacmd: "gitclone",
    alias: ["git", "github", "repo2", "zip"],
    category: "download",
    description: "Download GitHub repository as ZIP",
    usage: ".gitclone <github url>",
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
                text: `> ♱ 👻 *ɢɪᴛᴄʟᴏɴᴇ ᴄᴏᴍᴍᴀɴᴅ* ♱\n\n` +
                      `> *ᴜsᴀɢᴇ:*\n` +
                      `> ${prefixe}gitclone <ɢɪᴛʜᴜʙ ᴜʀʟ>\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}gitclone https://github.com/user/repo\n` +
                      `> ${prefixe}gitclone https://github.com/user/repo.git`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        // GitHub URL regex
        const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
        
        if (!regex.test(text)) {
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ɪɴᴠᴀʟɪᴅ ᴜʀʟ!* ♱\n\n` +
                      `> *ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɢɪᴛʜᴜʙ ᴜʀʟ*\n\n` +
                      `> *ᴇxᴀᴍᴘʟᴇ:*\n` +
                      `> ${prefixe}gitclone https://github.com/user/repo`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }

        try {
            // Send processing message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *ғᴇᴛᴄʜɪɴɢ ɢɪᴛʜᴜʙ ʀᴇᴘᴏsɪᴛᴏʀʏ...* ♱\n> ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            // Extract user and repo from URL
            let [, user, repo] = text.match(regex) || [];
            repo = repo.replace(/\.git$/, '');
            
            let url = `https://api.github.com/repos/${user}/${repo}/zipball`;

            // Check if repo exists
            let res = await fetch(url, {
                method: 'HEAD'
            });
            
            if (!res.ok) {
                throw new Error('Repository not found');
            }

            // Get filename from content-disposition header
            let cd = res.headers.get('content-disposition');
            let filename = cd && cd.match(/attachment; filename="?([^"]+)"?/) ? 
                cd.match(/attachment; filename="?([^"]+)"?/)[1] : 
                `${repo}.zip`;

            // Build buttons
            const buttons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 ᴄᴏᴘʏ ʀᴇᴘᴏ ᴜʀʟ',
                        copy_code: text
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 ᴏᴘᴇɴ ɪɴ ɢɪᴛʜᴜʙ',
                        url: text
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📦 ᴅᴏᴡɴʟᴏᴀᴅ ᴢɪᴘ',
                        url: url
                    })
                }
            ];

            // Build caption text
            const captionText = `> ♱ 👻 *ɢɪᴛʜᴜʙ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* ♱\n\n` +
                               `> 👤 *ᴜsᴇʀ:* ${user}\n` +
                               `> 📁 *ʀᴇᴘᴏ:* ${repo}\n` +
                               `> 📦 *ғɪʟᴇ:* ${filename}\n\n` +
                               `> 🔗 *sᴏᴜʀᴄᴇ:*\n> ${text}`;

            // Send document with buttons
            await sendButtons(conn, from, {
                document: {
                    url: url
                },
                mimetype: 'application/zip',
                fileName: filename,
                text: captionText,
                footer: `> ♱ 👻 ${botIdentity.botName} ♱`,
                buttons: buttons
            }, { quoted: ms });

        } catch (err) {
            console.error("Gitclone Error:", err);
            return await conn.sendMessage(from, {
                text: `> ♱ 👻 *ᴇʀʀᴏʀ!* ♱\n> ${err.message || 'ʀᴇᴘᴏsɪᴛᴏʀʏ ɴᴏᴛ ғᴏᴜɴᴅ ᴏʀ ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

module.exports = gitcloneCommand;
