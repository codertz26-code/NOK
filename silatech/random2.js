// ==================== RANDOM ANIME/NSFW COMMANDS ====================
// File: silatech/random.js
// Commands: .nsfw | .cosplay | .waifu

const fetch = require('node-fetch');
const { sendButtons } = require('gifted-btns');

const randomCommand = {
    silacmd: "nsfw",
    alias: ["cosplay", "waifu"],
    category: "nsfw",
    description: "Send random NSFW/Cosplay/Waifu image from Skyzopedia API",
    usage: ".nsfw\n.cosplay\n.waifu",
    premium: false,
    sudo: false,
    owner: false,
    
    function: async (from, conn, params) => {
        const { 
            ms, 
            prefixe,
            silaConfig,
            command   // Hii inachukua command iliyotumika (nsfw, cosplay au waifu)
        } = params;

        const botIdentity = silaConfig.getBotConfig();

        // Chagua API kulingana na command
        let apiUrl = "";
        let title = "";

        switch (command.toLowerCase()) {
            case "nsfw":
                apiUrl = "https://api.skyzopedia.web.id/random/nsfw?apikey=skyy";
                title = "🔥 Random NSFW";
                break;
            case "cosplay":
                apiUrl = "https://api.skyzopedia.web.id/random/cosplay?apikey=skyy";
                title = "🎭 Random Cosplay";
                break;
            case "waifu":
                apiUrl = "https://api.skyzopedia.web.id/random/waifu?apikey=skyy";
                title = "💖 Random Waifu";
                break;
            default:
                apiUrl = "https://api.skyzopedia.web.id/random/nsfw?apikey=skyy";
                title = "🔥 Random NSFW";
        }

        try {
            // Processing Message
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *Fetching ${title}...* ♱\n> Please wait a moment...`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });

            // Fetch image kama buffer (sio json)
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const buffer = await response.buffer();

            const captionText = `> ♱ 👻 *${title}* ♱\n\n` +
                               `> ✨ Hapa ni picha yako\n` +
                               `> 📡 Powered by Skyzopedia API\n\n` +
                               `> Tumia command tena kupata nyingine`;

            const buttons = [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔄 Next ' + command.toUpperCase(),
                        id: `\( {prefixe} \){command}`
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

            // Tuma picha
            await conn.sendMessage(from, {
                image: buffer,
                caption: captionText,
                footer: `> ♱ 👻 ${botIdentity.botName} ♱`,
                buttons: buttons
            }, { quoted: ms });

        } catch (err) {
            console.error(`${command.toUpperCase()} Command Error:`, err);
            await conn.sendMessage(from, {
                text: `> ♱ 👻 *Error!* ♱\n\n> Failed to fetch ${title.toLowerCase()}.\n> ${err.message || 'Jaribu tena baadaye.'}`,
                contextInfo: silaConfig.getContextInfo(ms.key.participant || ms.key.remoteJid, botIdentity)
            }, { quoted: ms });
        }
    }
};

module.exports = randomCommand;