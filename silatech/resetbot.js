// silatech/resetbot.js
// Command to reset bot to default settings

const silaConfig = require('../silamd/sila.js');

module.exports = {
    silacmd: "resetbot",
    alias: ["botreset", "defaultbot"],
    category: "owner",
    description: "Reset bot to default settings",
    usage: "resetbot",
    owner: true,
    
    async function(from, conn, { repondre, ms, silaConfig: sila }) {
        const success = sila.resetToDefault();
        
        if (success) {
            const config = sila.getBotConfig();
            return repondre(`♱ ${config.botSymbol} ʙᴏᴛ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ sᴜᴄᴄᴇssғᴜʟʟʏ! ${config.botSymbol}\n\n📛 ʙᴏᴛ ɴᴀᴍᴇ: ${config.botName}\n👤 ᴄʀᴇᴀᴛᴏʀ: ${config.creatorName}\n🔄 ʀᴇsᴛᴀʀᴛ ʙᴏᴛ ғᴏʀ ᴄʜᴀɴɢᴇs`);
        } else {
            return repondre(`♱ ❌ ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇsᴇᴛ ʙᴏᴛ`);
        }
    }
};