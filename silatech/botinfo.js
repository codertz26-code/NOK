// silatech/botinfo.js
// Command to view bot information

const os = require('os');

module.exports = {
    silacmd: "botinfo",
    alias: ["info", "about", "status"],
    category: "general",
    description: "View bot information",
    usage: "botinfo",
    
    async function(from, conn, { repondre, ms, silaConfig: sila, prefixe }) {
        const config = sila.getBotConfig();
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);
        
        const infoText = `♱ ${config.botSymbol} ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ ${config.botSymbol} ♱
        
📛 ʙᴏᴛ ɴᴀᴍᴇ: ${config.botName}
🔰 ᴠᴇʀsɪᴏɴ: ${config.version}
📅 ʀᴇʟᴇᴀsᴇ: ${config.releaseDate}

👤 ᴄʀᴇᴀᴛᴏʀ: ${config.creatorName}
📱 ᴄʀᴇᴀᴛᴏʀ ᴛᴀɢ: ${config.creatorTag}
💬 ᴘʀᴇғɪx: ${prefixe}

📡 ᴜᴘᴛɪᴍᴇ: ${days}d ${hours}h ${minutes}m ${seconds}s
💻 ᴘʟᴀᴛғᴏʀᴍ: ${os.platform()}
🧠 ʀᴀᴍ: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

♱ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.creatorName} ♱`;

        return repondre(infoText);
    }
};