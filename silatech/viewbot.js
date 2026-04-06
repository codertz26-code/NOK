// silatech/viewbot.js
module.exports = {
    silacmd: "viewbot",
    alias: ["botconfig", "showbot"],
    category: "owner",
    description: "View current bot configuration",
    usage: "viewbot",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        const config = silaConfig.getBotConfig();
        
        const response = `> ♱ ʙᴏᴛ ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ
> 
> ♱ ɴᴀᴍᴇ: ${config.botName}
> ♱ ᴠᴇʀsɪᴏɴ: ${config.version}
> ♱ ᴄʀᴇᴀᴛᴏʀ: ${config.creatorName} (${config.creatorNumber})
> ♱ sʏᴍʙᴏʟs: ${config.mainSymbol} | ${config.secondarySymbol} | ${config.accentSymbol}
> ♱ ᴇᴍᴏᴊɪs: ✅${config.successEmoji} 👻${config.errorEmoji} ⚠️${config.warningEmoji}
> ♱ ғᴏᴏᴛᴇʀ: ${config.footer}
> ♱ sᴛᴀᴛᴜs: ${config.status}
> ♱ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: ${config.description}
> ♱ ɴᴇᴡsʟᴇᴛᴛᴇʀ: ${config.newsletterName} (${config.newsletterJid})
> 
> 🔄 ᴜsᴇ ${prefixe}setname, ${prefixe}setsymbol, ${prefixe}setcreator ᴇᴛᴄ ᴛᴏ ᴄʜᴀɴɢᴇ`;
        
        return repondre(response);
    }
};