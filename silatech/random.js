// ==================== NSFW RANDOM COMMAND (Fixed) ====================
// File: silatech/nsfw.js  au  silatech/random.js

const fetch = require('node-fetch');
const { sendButtons } = require('gifted-btns');

const nsfwCommand = {
    silacmd: "nsfw2",
    alias: ["randnsfw", "randomnsfw", "hentai"],
    category: "nsfw",
    description: "Send random NSFW image from Skyzopedia API",
    usage: ".nsfw",
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
        const apiUrl = "https://api.skyzopedia.web.id/random/nsfw?apikey=skyy";

        try {
            // Processing message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *Fetching Random NSFW...* ♱\n> Please wait a moment...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            // Fetch image as buffer (sio .json)
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const buffer = await response.buffer();   // Hii ndiyo fix kuu

            const captionText = `> ♱ 👻 *Random NSFW Image* ♱\n\n` +
                               `> 🔥 Enjoy your image\n` +
                               `> 📡 *Powered by:* Skyzopedia API\n\n` +
                               `> Tumia *.nsfw* tena kupata nyingine`;

            const buttons = [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔄 Next NSFW',
                        id: `${prefixe}nsfw`
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 Copy Image URL',
                        copy_code: apiUrl
                    })
                }
            ];

            // Send as Image
            await conn.sendMessage(from, {
                image: buffer,
                caption: captionText,
                footer: `> ♱ 👻 ${botIdentity.botName} ♱`,
                buttons: buttons
            }, { quoted: ms });

        } catch (err) {
            console.error("NSFW Command Error:", err);
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *Error!* ♱\n\n> Failed to fetch NSFW image.\n> ${err.message || 'Jaribu tena baadaye.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

module.exports = nsfwCommand;