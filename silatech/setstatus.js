// silatech/setstatus.js
module.exports = {
    silacmd: "setstatus",
    alias: ["botstatus", "changestatus"],
    category: "owner",
    description: "Change bot status and description",
    usage: "setstatus <status> <description>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        if (args.length < 2) {
            const current = silaConfig.getBotConfig();
            return repondre(`> ♱ ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴜs:
> 📡 sᴛᴀᴛᴜs: ${current.status}
> 📝 ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: ${current.description}

> ♱ ᴜsᴀɢᴇ: ${prefixe}setstatus online "Best WhatsApp Bot"`);
        }
        
        const newStatus = args[0];
        const newDescription = args.slice(1).join(" ");
        
        const success = silaConfig.updateStatus(newStatus, newDescription);
        
        if (success) {
            return repondre(`> ♱ sᴛᴀᴛᴜs ᴜᴘᴅᴀᴛᴇᴅ!
> 📡 sᴛᴀᴛᴜs: ${newStatus}
> 📝 ᴅᴇsᴄʀɪᴘᴛɪᴏɴ: ${newDescription}
> 🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ`);
        } else {
            return repondre(`👻 ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ sᴛᴀᴛᴜs`);
        }
    }
};