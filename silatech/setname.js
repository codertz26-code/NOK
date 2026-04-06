// silatech/setname.js
module.exports = {
    silacmd: "setname",
    alias: ["setbotname", "changename", "botname"],
    category: "owner",
    description: "Change bot name",
    usage: "setname <new name>",
    owner: true,
    
    async function(from, conn, { repondre, args, silaConfig, prefixe }) {
        if (!args.length) {
            const current = silaConfig.getBotConfig();
            return repondre(`♱ ᴄᴜʀʀᴇɴᴛ ʙᴏᴛ ɴᴀᴍᴇ: ${current.botName}\n\n♱ usage: ${prefixe}setname <ɴᴇᴡ ɴᴀᴍᴇ>`);
        }
        
        const newName = args.join(" ");
        const success = silaConfig.updateBotName(newName);
        
        if (success) {
            const config = silaConfig.getBotConfig();
            return repondre(`♱ ${config.mainSymbol} ʙᴏᴛ ɴᴀᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ! ${config.mainSymbol}\n\n✨ ${newName}\n🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ`);
        } else {
            return repondre(`♱ ❌ ғᴀɪʟᴇᴅ ♱`);
        }
    }
};