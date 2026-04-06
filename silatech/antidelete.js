// silatech/antidelete.js - OPTIONAL (command already in index.js)
module.exports = {
    silacmd: "antidelete",
    category: "owner",
    description: "Toggle antidelete on/off",
    owner: true,
    async function(from, conn, params) {
        const { args, repondre, prefixe } = params;
        const { setAnti, getAnti } = require('../data-json');
        
        const status = args[0]?.toLowerCase();
        if (status === 'on' || status === 'off') {
            const success = await setAnti(status === 'on');
            if (success) {
                return repondre(`♱ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ɪs ɴᴏᴡ ${status.toUpperCase()} ♱`);
            }
        } else {
            const currentStatus = await getAnti();
            return repondre(`ᴄᴜʀʀᴇɴᴛ: ${currentStatus ? 'ON' : 'OFF'}\nᴜsᴇ: ${prefixe}ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴏɴ/ᴏғғ`);
        }
    }
};