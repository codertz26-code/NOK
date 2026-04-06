// silatech/ping.js
// Ping command with context info

module.exports = {
    silacmd: "ping2",
    alias: ["pong", "latency", "speed"],
    category: "general",
    description: "Check bot response time",
    usage: "ping",
    
    async function(from, conn, { repondre, ms, silaConfig, prefixe }) {
        const start = Date.now();
        const config = silaConfig.getBotConfig();
        
        // Send initial message
        const initialMsg = await conn.sendMessage(from, {
            text: `${config.mainSymbol} ${config.secondarySymbol} ᴍᴇᴀsᴜʀɪɴɢ ʟᴀᴛᴇɴᴄʏ... ${config.secondarySymbol} ${config.mainSymbol}`,
            contextInfo: silaConfig.getContextInfo(ms.sender, config)
        }, { quoted: ms });
        
        const end = Date.now();
        const latency = end - start;
        
        let status = "";
        let emoji = "";
        if (latency < 100) {
            status = "ᴇxᴄᴇʟʟᴇɴᴛ";
            emoji = "🚀";
        } else if (latency < 300) {
            status = "ɢᴏᴏᴅ";
            emoji = "⚡";
        } else if (latency < 600) {
            status = "ғᴀɪʀ";
            emoji = "🟡";
        } else {
            status = "sʟᴏᴡ";
            emoji = "🔴";
        }
        
        const pingText = `${config.mainSymbol} ${config.secondarySymbol} ᴘᴏɴɢ! ${config.secondarySymbol} ${config.mainSymbol}

${emoji} ʟᴀᴛᴇɴᴄʏ: *${latency}ms*
📊 sᴛᴀᴛᴜs: *${status}*
⏰ ᴛɪᴍᴇ: ${new Date().toLocaleTimeString()}

${config.mainSymbol} ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.creatorName} ${config.mainSymbol}`;

        // Update message with final result
        await conn.sendMessage(from, {
            text: pingText,
            contextInfo: silaConfig.getContextInfo(ms.sender, config),
            edit: initialMsg.key
        });
    }
};