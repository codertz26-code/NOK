// ==================== REPO COMMAND (Fixed Version) ====================
// Weka hii file katika silatech/repo.js

const { sendButtons } = require('gifted-btns');

const repoCommand = {
    silacmd: "repo2",
    alias: ["sila2", "silamd", "silarepo", "sila-md"],
    category: "info",
    description: "Show SILA-MD GitHub repository info with fork & star",
    usage: ".repo",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            prefixe,
            silaConfig 
        } = params;

        const botIdentity = silaConfig.getBotConfig();

        const repoUrl = "https://github.com/Sila-Md/SILA-MD";
        const forkUrl = "https://github.com/Sila-Md/SILA-MD/fork";
        const zipUrl = "https://api.github.com/repos/Sila-Md/SILA-MD/zipball";

        try {
            // === Processing Message (kama ulivyotaka) ===
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *SILA-MD REPO* ♱\n\n> Fetching repository information...\n> Please wait a moment...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            // Static data (ili kuepuka API error)
            const captionText = `> ♱ 👻 *SILA-MD REPOSITORY* ♱\n\n` +
                               `> 📛 *Repo:* Sila-Md/SILA-MD\n` +
                               `> 📝 *Description:*\n> Powerful WhatsApp Bot with Multi-Device Support\n\n` +
                               `> ⭐ *Stars:* 53+\n` +
                               `> 🍴 *Forks:* 83+\n` +
                               `> 💻 *Language:* JavaScript\n\n` +
                               `> 🔗 *Repo Link:*\n> ${repoUrl}\n\n` +
                               `> *Tap buttons below to Star, Fork or Download*`;

            const buttons = [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⭐ Star Repo',
                        url: repoUrl
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🍴 Fork Repo',
                        url: forkUrl
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📦 Download as ZIP',
                        url: zipUrl
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 Copy Repo URL',
                        copy_code: repoUrl
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 Open GitHub',
                        url: repoUrl
                    })
                }
            ];

            await sendButtons(conn, from, {
                document: { url: zipUrl },
                mimetype: 'application/zip',
                fileName: 'SILA-MD.zip',
                text: captionText,
                footer: `> ♱ 👻 ${botIdentity.botName} ♱`,
                buttons: buttons
            }, { quoted: ms });

        } catch (err) {
            console.error("Repo Command Error:", err);
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *Error Occurred!* ♱\n\n> ${err.message || 'Something went wrong while fetching repo.'}\n\n> Jaribu tena baadaye au tumia:\n> ${prefixe}gitclone https://github.com/Sila-Md/SILA-MD`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

module.exports = repoCommand;