// silatech/setcreator.js
module.exports = {
    silacmd: "setcreator",
    alias: ["changecreator", "botcreator"],
    category: "owner",
    description: "Change bot creator name and number",
    usage: "setcreator <name> <number>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        if (args.length < 2) {
            const current = silaConfig.getBotConfig();
            return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ ᴄʀᴇᴀᴛᴏʀ:
> ♱ ɴᴀᴍᴇ: ${current.creatorName}
> ♱ ɴᴜᴍʙᴇʀ: ${current.creatorNumber}

> ♱ ᴜsᴀɢᴇ: ${prefixe}setcreator SilaTech 255637351031`);
        }
        
        const newName = args[0];
        const newNumber = args[1];
        
        const success = silaConfig.updateCreator(newName, newNumber);
        
        if (success) {
            return repondre(`> ♱ ᴄʀᴇᴀᴛᴏʀ ᴜᴘᴅᴀᴛᴇᴅ!
> ✨ ɴᴀᴍᴇ: ${newName}
> 📞 ɴᴜᴍʙᴇʀ: ${newNumber}
> 🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ`);
        } else {
            return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ᴄʀᴇᴀᴛᴏʀ`);
        }
    }
};