// silatech/uptime.js
module.exports = {
    silacmd: "uptime",
    alias: ["up", "runtime", "run"],
    category: "general",
    description: "Check bot uptime",
    usage: "uptime",
    function: async (from, sila, { ms, repondre, args, prefixe, botName }) => {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        let uptimeString = "";
        if (days > 0) uptimeString += `${days}d `;
        if (hours > 0) uptimeString += `${hours}h `;
        if (minutes > 0) uptimeString += `${minutes}m `;
        uptimeString += `${seconds}s`;
        
        await repondre(`⏱️ *Bot Uptime*\n\n🟢 ${botName} has been running for:\n\n✨ ${uptimeString}`);
    }
};