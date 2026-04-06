const config = require('../config');

module.exports = {
    silacmd: "ping",
    function: async (dest, sila, { repondre }) => {
        // Inachukua jina moja kwa moja kutoka silamd/sila.js kupitia config
        await repondre(`ʙᴏᴛ ɴᴀᴍᴇ: ${config.botName}\n\nsᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ 🚀`);
    }
};
