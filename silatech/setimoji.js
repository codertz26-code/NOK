// silatech/setemoji.js
module.exports = {
    silacmd: "setemoji",
    alias: ["botemoji", "changeemoji"],
    category: "owner",
    description: "Change bot emojis (success, error, warning)",
    usage: "setemoji <success> <error> <warning>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        if (args.length < 3) {
            const current = silaConfig.getBotConfig();
            return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ ᴇᴍᴏᴊɪs:
> ✅ sᴜᴄᴄᴇss: ${current.successEmoji}
> 👻 ᴇʀʀᴏʀ: ${current.errorEmoji}
> ⚠️ ᴡᴀʀɴɪɴɢ: ${current.warningEmoji}

> ♱ ᴜsᴀɢᴇ: ${prefixe}setemoji ✅ 👻 ⚠️`);
        }
        
        const success = args[0];
        const error = args[1];
        const warning = args[2];
        
        const result = silaConfig.updateEmojis(success, error, warning);
        
        if (result) {
            return repondre(`> ♱ ᴇᴍᴏᴊɪs ᴜᴘᴅᴀᴛᴇᴅ!
> ✅ sᴜᴄᴄᴇss: ${success}
> 👻 ᴇʀʀᴏʀ: ${error}
> ⚠️ ᴡᴀʀɴɪɴɢ: ${warning}
> 🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ`);
        } else {
            return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ᴇᴍᴏᴊɪs`);
        }
    }
};