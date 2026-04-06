// silatech/setsymbol.js
module.exports = {
    silacmd: "setsymbol",
    alias: ["botsymbol", "changesymbol"],
    category: "owner",
    description: "Change bot symbols (main, secondary, accent)",
    usage: "setsymbol <main> <secondary> <accent>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        if (args.length < 3) {
            const current = silaConfig.getBotConfig();
            return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ sʏᴍʙᴏʟs:
> ♱ ᴍᴀɪɴ: ${current.mainSymbol}
> ♱ sᴇᴄᴏɴᴅᴀʀʏ: ${current.secondarySymbol}
> ♱ ᴀᴄᴄᴇɴᴛ: ${current.accentSymbol}

> ♱ ᴜsᴀɢᴇ: ${prefixe}setsymbol ♱ 🌑 💀`);
        }
        
        const main = args[0];
        const secondary = args[1];
        const accent = args[2];
        
        const success = silaConfig.updateSymbols(main, secondary, accent);
        
        if (success) {
            return repondre(`> ♱ sʏᴍʙᴏʟs ᴜᴘᴅᴀᴛᴇᴅ!
> ♱ ᴍᴀɪɴ: ${main}
> ♱ sᴇᴄᴏɴᴅᴀʀʏ: ${secondary}
> ♱ ᴀᴄᴄᴇɴᴛ: ${accent}
> 🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ`);
        } else {
            return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ sʏᴍʙᴏʟs`);
        }
    }
};